#!/usr/bin/env node
// Weekly in-range dependency refresh across every JS app in the repo.
//
// Usage: node scripts/deps/refresh.mjs [--report <path>] [--only <app-dir>[,<app-dir>]]
//
// For each app, re-resolve the whole lockfile (transitive dependencies included) to the
// newest versions its package.json ranges allow. package.json is never changed.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { diffVersions, parseNpmLock, parseYarnLock, pruneYarnLock } from "./lockfile.mjs";

// Matches the 3-day npmMinimalAgeGate in each Yarn app's .yarnrc.yml.
const MIN_AGE_DAYS = 3;

const args = parseArgs(process.argv.slice(2));
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

const results = discoverApps()
	.filter((a) => !args.only || args.only.includes(a.dir))
	.map((app) => {
		console.log(`\n== ${app.dir} (${app.pm})`);
		return processApp(app);
	});

writeFileSync(args.report, renderReport(results));
const changed = results.some((r) => r.changes.length);
if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`, { flag: "a" });
console.log(`\nReport written to ${args.report} (lockfiles changed: ${changed})`);

function processApp(app) {
	const cwd = join(root, app.dir);
	const lockPath = join(cwd, app.lockfile);
	const pkgPath = join(cwd, "package.json");
	const pkgBefore = readFileSync(pkgPath, "utf8");
	const lockBefore = readFileSync(lockPath, "utf8");
	const parse = app.pm === "npm" ? parseNpmLock : parseYarnLock;
	const held = patchedPackages(cwd);
	const notes = [];

	const refresh = app.pm === "npm" ? refreshNpm(cwd) : refreshYarn(cwd, lockPath, lockBefore, held);
	if (readFileSync(pkgPath, "utf8") !== pkgBefore) writeFileSync(pkgPath, pkgBefore);
	if (!refresh.ok) {
		writeFileSync(lockPath, lockBefore);
		notes.push(`Refresh failed, lockfile left unchanged:\n\n\`\`\`\n${tail(refresh.output)}\n\`\`\``);
	}

	const moved = [...held].filter(([name, version]) => !parse(readFileSync(lockPath, "utf8")).get(name)?.has(version));
	if (moved.length) {
		writeFileSync(lockPath, lockBefore);
		const list = moved.map(([n, v]) => `\`${n}@${v}\``).join(", ");
		notes.push(`Refresh reverted: it would move ${list}, which \`patches/\` pins. Regenerate the patch against the new version to unblock this app.`);
	}

	const pkg = JSON.parse(pkgBefore);
	const direct = { ...pkg.dependencies, ...pkg.devDependencies };
	const changes = diffVersions(parse(lockBefore), parse(readFileSync(lockPath, "utf8")));
	return { ...app, changes, directChanges: changes.filter((c) => c.name in direct), notes };
}

function refreshNpm(cwd) {
	const before = new Date(Date.now() - MIN_AGE_DAYS * 86_400_000).toISOString();
	return run("npm", ["update", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund", `--before=${before}`], cwd);
}

// Lock entries for MATTR's private SDK packages are kept as they are, so the refresh
// needs no registry credentials. SDK upgrades are made deliberately with the tutorials.
function refreshYarn(cwd, lockPath, lockText, held) {
	const keep = (name) => held.has(name) || name.startsWith("@mattrglobal/");
	writeFileSync(lockPath, pruneYarnLock(lockText, keep));
	return run("corepack", ["yarn", "install", "--mode=update-lockfile"], cwd, { YARN_ENABLE_IMMUTABLE_INSTALLS: "false" });
}

// patch-package patches are named <name>+<version>.patch, with "/" in scoped names as "+".
function patchedPackages(cwd) {
	const dir = join(cwd, "patches");
	const held = new Map();
	if (!existsSync(dir)) return held;
	for (const file of readdirSync(dir)) {
		const match = file.match(/^(.+)\+([^+]+)\.patch$/);
		if (match) held.set(match[1].replace("+", "/"), match[2]);
	}
	return held;
}

function renderReport(results) {
	const line = (c) => `- \`${c.name}\` ${c.from.join(", ") || "(new)"} → ${c.to.join(", ") || "(removed)"}`;
	const out = [
		"Weekly in-range refresh: every lockfile is re-resolved to the newest versions its `package.json` ranges allow, transitive dependencies included. No `package.json` changes.",
		"",
		"| App | Direct | Transitive |",
		"| --- | --- | --- |",
	];
	for (const r of results) {
		const flag = r.notes.length ? " (see notes)" : "";
		out.push(`| \`${r.dir}\`${flag} | ${r.directChanges.length} | ${r.changes.length - r.directChanges.length} |`);
	}
	out.push("");
	for (const r of results) {
		if (!r.changes.length && !r.notes.length) continue;
		out.push(`### \`${r.dir}\``, "", ...r.notes.flatMap((n) => [`> ${n.replaceAll("\n", "\n> ")}`, ""]));
		out.push(...r.directChanges.map(line));
		const transitive = r.changes.filter((c) => !r.directChanges.includes(c));
		if (transitive.length) {
			out.push("", `<details><summary>${transitive.length} transitive</summary>`, "", ...transitive.map(line), "", "</details>");
		}
		out.push("");
	}
	return `${out.join("\n")}\n`;
}

function discoverApps() {
	const files = execFileSync("git", ["ls-files", "*package.json"], { cwd: root, encoding: "utf8" }).split("\n");
	return files
		.filter((f) => f.endsWith("/package.json"))
		.map((f) => f.slice(0, -"/package.json".length))
		.flatMap((dir) => {
			const lockfile = ["package-lock.json", "yarn.lock"].find((l) => existsSync(join(root, dir, l)));
			return lockfile ? [{ dir, lockfile, pm: lockfile === "yarn.lock" ? "yarn" : "npm" }] : [];
		})
		.sort((a, b) => a.dir.localeCompare(b.dir));
}

function run(cmd, cmdArgs, cwd, env = {}) {
	console.log(`$ ${cmd} ${cmdArgs.join(" ")}`);
	const res = spawnSync(cmd, cmdArgs, { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: { ...process.env, ...env } });
	return { ok: res.status === 0, output: `${res.stdout ?? ""}${res.stderr ?? ""}` };
}

function tail(text, lines = 15) {
	return text
		.trim()
		.split("\n")
		.filter((l) => !/^\s+at /.test(l))
		.slice(-lines)
		.join("\n");
}

function parseArgs(argv) {
	const parsed = { report: "deps-report.md", only: undefined };
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === "--report") parsed.report = argv[++i];
		else if (argv[i] === "--only") parsed.only = argv[++i].split(",");
	}
	return parsed;
}
