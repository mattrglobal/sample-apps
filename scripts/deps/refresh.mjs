#!/usr/bin/env node
// Weekly in-range dependency refresh across every JS app in the repo.
//
// Usage: node scripts/deps/refresh.mjs [--report <path>] [--only <app-dir>[,<app-dir>]]
//
// For each app: re-resolve the whole lockfile to the newest versions its package.json
// ranges allow (package.json is never changed), then report what changed and look ahead
// at what is still pending: direct dependencies whose latest release is outside their
// range, and advisories the refreshed lockfile still carries.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	compareVersions,
	diffVersions,
	directAncestors,
	isMajorBump,
	parseNpmLock,
	parseYarnLock,
	pruneYarnLock,
	resolvedDirect,
} from "./lockfile.mjs";

// Matches the 3-day npmMinimalAgeGate in each app's .yarnrc.yml.
const MIN_AGE_DAYS = 3;

// Upgraded deliberately alongside the Learn tutorials, never by automation.
const MANUAL_UPGRADE = [/^expo$/, /^expo-/, /^@expo\//, /^react-native$/, /^react$/, /^react-dom$/, /^@mattrglobal\//];

const args = parseArgs(process.argv.slice(2));
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const latestCache = new Map();

const apps = discoverApps().filter((a) => !args.only || args.only.includes(a.dir));
const results = [];
for (const app of apps) {
	console.log(`\n== ${app.dir} (${app.pm})`);
	results.push(await processApp(app));
}

const report = renderReport(results);
writeFileSync(args.report, report);
const changed = results.some((r) => r.changes.length);
if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`, { flag: "a" });
console.log(`\nReport written to ${args.report} (lockfiles changed: ${changed})`);

async function processApp(app) {
	const cwd = join(root, app.dir);
	const lockPath = join(cwd, app.lockfile);
	const pkgPath = join(cwd, "package.json");
	const pkgBefore = readFileSync(pkgPath, "utf8");
	const lockBefore = readFileSync(lockPath, "utf8");
	const pkg = JSON.parse(pkgBefore);
	const held = patchedPackages(cwd);
	const result = { ...app, changes: [], directChanges: [], pending: [], advisories: [], notes: [] };

	const refresh = app.pm === "npm" ? refreshNpm(cwd) : refreshYarn(cwd, lockPath, lockBefore, held);
	if (readFileSync(pkgPath, "utf8") !== pkgBefore) writeFileSync(pkgPath, pkgBefore);
	if (!refresh.ok) {
		writeFileSync(lockPath, lockBefore);
		result.notes.push(`Refresh failed, lockfile left unchanged:\n\n\`\`\`\n${tail(refresh.output)}\n\`\`\``);
	}

	let lockAfter = readFileSync(lockPath, "utf8");
	const parse = app.pm === "npm" ? parseNpmLock : parseYarnLock;
	const moved = [...held].filter(([name, version]) => !parse(lockAfter).get(name)?.has(version));
	if (moved.length) {
		writeFileSync(lockPath, lockBefore);
		lockAfter = lockBefore;
		const list = moved.map(([n, v]) => `\`${n}@${v}\``).join(", ");
		result.notes.push(
			`Refresh reverted: it would move ${list}, which \`patches/\` pins. Regenerate the patch against the new version to unblock this app.`,
		);
	}

	const direct = { ...pkg.dependencies, ...pkg.devDependencies };
	result.changes = diffVersions(parse(lockBefore), parse(lockAfter));
	result.directChanges = result.changes.filter((c) => c.name in direct);
	result.pending = await outOfRange(app, lockAfter, direct);
	const advisories = app.pm === "npm" ? auditNpm(cwd) : auditYarn(cwd);
	const directNames = new Set(Object.keys(direct));
	result.advisories = advisories.map((a) => ({
		...a,
		fix: describeFix(a.fix, a.fix?.name && resolvedDirect(app.pm, lockAfter, a.fix.name, direct[a.fix.name] ?? "")),
		via: directNames.has(a.name) ? "direct" : directAncestors(app.pm, lockAfter, a.name, directNames).join(", ") || "unknown",
	}));
	return result;
}

function refreshNpm(cwd) {
	const before = new Date(Date.now() - MIN_AGE_DAYS * 86_400_000).toISOString();
	return run("npm", ["update", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund", `--before=${before}`], cwd);
}

function refreshYarn(cwd, lockPath, lockText, held) {
	writeFileSync(lockPath, pruneYarnLock(lockText, new Set(held.keys())));
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

async function outOfRange(app, lockText, direct) {
	const pending = [];
	for (const [name, range] of Object.entries(direct)) {
		const current = resolvedDirect(app.pm, lockText, name, range);
		const latest = await latestVersion(name);
		if (!current || !latest || compareVersions(latest, current) <= 0) continue;
		const manual = app.reactNative && MANUAL_UPGRADE.some((re) => re.test(name));
		const owner = manual
			? "Manual (Expo or MATTR SDK upgrade)"
			: isMajorBump(current, latest)
				? "Dependabot major PR"
				: isPinned(range, current, latest)
					? "Range is pinned, widen by hand"
					: `Next refresh (released under ${MIN_AGE_DAYS} days ago)`;
		pending.push({ name, range, current, latest, owner });
	}
	return pending;
}

// Exact pins and tilde ranges that exclude a newer minor. Caret ranges always allow non-major bumps.
function isPinned(range, current, latest) {
	if (/^\d+\.\d+\.\d+$/.test(range)) return true;
	return range.startsWith("~") && current.split(".")[1] !== latest.split(".")[1];
}

async function latestVersion(name) {
	if (!latestCache.has(name)) {
		const { ok, stdout } = run("npm", ["view", name, "dist-tags.latest", "--json"], root, {}, false);
		latestCache.set(name, ok ? JSON.parse(stdout.trim() || "null") : undefined);
	}
	return latestCache.get(name);
}

function auditNpm(cwd) {
	const { output } = run("npm", ["audit", "--package-lock-only", "--json"], cwd);
	let vulns;
	try {
		vulns = JSON.parse(output).vulnerabilities ?? {};
	} catch {
		return [{ name: "(audit failed)", severity: "unknown", fix: tail(output, 1) }];
	}
	return Object.values(vulns)
		.filter((v) => v.via.some((x) => typeof x === "object"))
		.map((v) => ({ name: v.name, severity: v.severity, fix: v.fixAvailable }));
}

function describeFix(fix, current) {
	if (typeof fix === "string") return fix;
	if (fix === true) return "fixable in range";
	if (!fix) return "none via `npm audit fix`";
	if (current && compareVersions(fix.version, current) < 0) return `no upstream fix yet (npm would downgrade ${fix.name} to ${fix.version})`;
	return `needs ${fix.name}@${fix.version}${fix.isSemVerMajor ? " (major)" : ""}`;
}

function auditYarn(cwd) {
	const { output } = run("corepack", ["yarn", "npm", "audit", "--all", "--recursive", "--json"], cwd);
	const advisories = [];
	for (const line of output.split("\n")) {
		if (!line.startsWith("{")) continue;
		try {
			const { value, children } = JSON.parse(line);
			advisories.push({
				name: value,
				severity: children?.Severity ?? "unknown",
				fix: children?.["Vulnerable Versions"] ? `vulnerable ${children["Vulnerable Versions"]}` : "",
			});
		} catch {}
	}
	if (!advisories.length && /YN0001|Error/.test(output)) {
		return [{ name: "(audit failed)", severity: "unknown", fix: tail(output, 1) }];
	}
	return advisories;
}

function renderReport(results) {
	const out = [
		"Weekly in-range refresh: every lockfile is re-resolved to the newest versions its `package.json` ranges allow. No `package.json` changes.",
		"",
		"| App | Direct | Transitive | Still pending after merge | Open advisories |",
		"| --- | --- | --- | --- | --- |",
	];
	for (const r of results) {
		const transitive = r.changes.length - r.directChanges.length;
		const flag = r.notes.length ? " (see notes)" : "";
		out.push(`| \`${r.dir}\`${flag} | ${r.directChanges.length} | ${transitive} | ${r.pending.length} | ${r.advisories.length} |`);
	}
	out.push("", "## Look-ahead: what still needs a human or a Dependabot PR", "");
	const pending = results.flatMap((r) => r.pending.map((p) => ({ ...p, dir: r.dir })));
	if (pending.length) {
		out.push("| App | Package | Range | Locked | Latest | Who moves it |", "| --- | --- | --- | --- | --- | --- |");
		for (const p of pending) out.push(`| \`${p.dir}\` | \`${p.name}\` | \`${p.range}\` | ${p.current} | ${p.latest} | ${p.owner} |`);
	} else {
		out.push("Every direct dependency is on its latest release.");
	}
	out.push("", "### Advisories the refreshed lockfiles still carry", "");
	const advisories = results.flatMap((r) => r.advisories.map((a) => ({ ...a, dir: r.dir })));
	if (advisories.length) {
		out.push("| App | Package | Severity | Pulled in by | Fix |", "| --- | --- | --- | --- | --- |");
		for (const a of advisories) out.push(`| \`${a.dir}\` | \`${a.name}\` | ${a.severity} | ${esc(a.via)} | ${esc(a.fix)} |`);
	} else {
		out.push("None.");
	}
	out.push("", "## Changes per app", "");
	for (const r of results) {
		if (!r.changes.length && !r.notes.length) continue;
		out.push(`### \`${r.dir}\``, "", ...r.notes.flatMap((n) => [`> ${n.replaceAll("\n", "\n> ")}`, ""]));
		for (const c of r.directChanges) out.push(`- \`${c.name}\` ${c.from.join(", ") || "(new)"} → ${c.to.join(", ") || "(removed)"}`);
		const transitive = r.changes.filter((c) => !r.directChanges.includes(c));
		if (transitive.length) {
			out.push("", `<details><summary>${transitive.length} transitive</summary>`, "");
			for (const c of transitive) out.push(`- \`${c.name}\` ${c.from.join(", ") || "(new)"} → ${c.to.join(", ") || "(removed)"}`);
			out.push("", "</details>");
		}
		out.push("");
	}
	return `${out.join("\n")}\n`;
}

function discoverApps() {
	const files = execFileSync("git", ["ls-files", "*package.json"], { cwd: root, encoding: "utf8" }).split("\n");
	return files
		.filter((f) => f.endsWith("package.json"))
		.map((f) => f.slice(0, -"/package.json".length))
		.filter((dir) => dir && !dir.includes("node_modules"))
		.flatMap((dir) => {
			const lockfile = ["package-lock.json", "yarn.lock"].find((l) => existsSync(join(root, dir, l)));
			if (!lockfile) return [];
			const pm = lockfile === "yarn.lock" ? "yarn" : "npm";
			return [{ dir, lockfile, pm, reactNative: dir.startsWith("react-native-") }];
		})
		.sort((a, b) => a.dir.localeCompare(b.dir));
}

function run(cmd, cmdArgs, cwd, env = {}, log = true) {
	if (log) console.log(`$ ${cmd} ${cmdArgs.join(" ")}`);
	const res = spawnSync(cmd, cmdArgs, { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: { ...process.env, ...env } });
	return { ok: res.status === 0, output: `${res.stdout ?? ""}${res.stderr ?? ""}`, stdout: res.stdout ?? "" };
}

function esc(cell) {
	return String(cell).replaceAll("|", "\\|");
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
