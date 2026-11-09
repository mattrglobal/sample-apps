#!/usr/bin/env node
// Publishes the weekly refresh: commits the changed lockfiles to the refresh branch and
// opens (or updates) a tracking issue with a one-click link to open the PR.
//
// Usage: node scripts/deps/publish.mjs --report <path> --changed <true|false>
//
// The org doesn't let GITHUB_TOKEN open PRs, so a person opens it from the issue link.
// Env: GITHUB_TOKEN, GITHUB_REPOSITORY, and optionally REFRESH_ASSIGNEES and
// REFRESH_MENTIONS (space-separated GitHub logins / @org/team handles).

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const BRANCH = "deps/weekly-refresh";
export const BASE = "master";
export const TITLE = "Weekly dependency refresh ready for review";
export const PR_TITLE = "build(deps): weekly in-range dependency refresh";
// GitHub rejects issue bodies over 65,536 characters.
const MAX_BODY = 60_000;

export function prLink(repo, issueNumber) {
	const params = new URLSearchParams({ expand: "1", title: PR_TITLE, body: `Closes #${issueNumber}` });
	return `https://github.com/${repo}/compare/${BASE}...${BRANCH}?${params}`;
}

export function renderIssueBody({ mentions, action, report }) {
	const head = [
		mentions ? `${mentions}: the weekly dependency refresh has updates.` : "The weekly dependency refresh has updates.",
		"",
		`**${action}**`,
		"",
		"---",
		"",
	].join("\n");
	const room = MAX_BODY - head.length;
	const body = report.length > room ? `${report.slice(0, room)}\n\n_Report truncated._\n` : report;
	return head + body;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const repo = requireEnv("GITHUB_REPOSITORY");
	const api = client(requireEnv("GITHUB_TOKEN"), repo);
	const assignees = (process.env.REFRESH_ASSIGNEES ?? "").split(/\s+/).filter(Boolean);
	const mentions = (process.env.REFRESH_MENTIONS ?? "").trim();

	const existing = (await api("GET", `/issues?state=open&creator=${encodeURIComponent("github-actions[bot]")}&per_page=100`)).find(
		(i) => i.title === TITLE && !i.pull_request,
	);

	if (!args.changed) {
		if (existing) {
			await api("POST", `/issues/${existing.number}/comments`, { body: "No in-range updates this week, so closing this." });
			await api("PATCH", `/issues/${existing.number}`, { state: "closed", state_reason: "completed" });
		}
		console.log("No lockfile changes.");
		return;
	}

	const sha = await commitLockfiles(api);
	console.log(`Committed ${sha} to ${BRANCH}.`);

	const [owner] = repo.split("/");
	const [openPr] = await api("GET", `/pulls?state=open&head=${owner}:${encodeURIComponent(BRANCH)}`);
	// Pushes made with GITHUB_TOKEN don't trigger pull_request workflows, so restart the
	// app checks when an already-open PR picks up the new commit.
	if (openPr) await api("POST", "/actions/workflows/ci-apps.yml/dispatches", { ref: BRANCH });

	const issue = existing ?? (await api("POST", "/issues", { title: TITLE, body: "Preparing the refresh report…", assignees }));
	const action = openPr
		? `The open PR #${openPr.number} now has this week's refresh. Review and merge it.`
		: `[Open the pull request](${prLink(repo, issue.number)}), then review and merge it. Merging closes this issue.`;
	await api("PATCH", `/issues/${issue.number}`, {
		body: renderIssueBody({ mentions, action, report: readFileSync(args.report, "utf8") }),
	});
	if (existing) {
		await api("POST", `/issues/${issue.number}/comments`, {
			body: `${mentions ? `${mentions}: ` : ""}the refresh ran again and the report above is updated.`,
		});
	}
	console.log(`Issue #${issue.number}: ${issue.html_url}`);
}

// Commits made through the API with GITHUB_TOKEN are signed by GitHub.
async function commitLockfiles(api) {
	const head = git("rev-parse", "HEAD");
	const files = git("diff", "--name-only", "HEAD", "--", "*package-lock.json", "*yarn.lock").split("\n").filter(Boolean);
	const tree = [];
	for (const path of files) {
		const blob = await api("POST", "/git/blobs", { content: readFileSync(path).toString("base64"), encoding: "base64" });
		tree.push({ path, mode: "100644", type: "blob", sha: blob.sha });
	}
	const baseTree = (await api("GET", `/git/commits/${head}`)).tree.sha;
	const newTree = await api("POST", "/git/trees", { base_tree: baseTree, tree });
	const commit = await api("POST", "/git/commits", { message: PR_TITLE, tree: newTree.sha, parents: [head] });
	try {
		await api("PATCH", `/git/refs/heads/${BRANCH}`, { sha: commit.sha, force: true });
	} catch (err) {
		if (err.status !== 422) throw err;
		await api("POST", "/git/refs", { ref: `refs/heads/${BRANCH}`, sha: commit.sha });
	}
	return commit.sha;
}

function client(token, repo) {
	return async (method, path, body) => {
		const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
			method,
			headers: {
				Accept: "application/vnd.github+json",
				Authorization: `Bearer ${token}`,
				"X-GitHub-Api-Version": "2022-11-28",
			},
			body: body ? JSON.stringify(body) : undefined,
		});
		if (!res.ok) {
			const err = new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
			err.status = res.status;
			throw err;
		}
		return res.status === 204 ? null : res.json();
	};
}

function git(...gitArgs) {
	return execFileSync("git", gitArgs, { encoding: "utf8" }).trim();
}

function requireEnv(name) {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is not set`);
	return value;
}

function parseArgs(argv) {
	const out = { report: undefined, changed: false };
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === "--report") out.report = argv[++i];
		else if (argv[i] === "--changed") out.changed = argv[++i] === "true";
		else throw new Error(`Unknown argument: ${argv[i]}`);
	}
	if (!out.report) throw new Error("--report is required");
	return out;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((err) => {
		console.error(err.message);
		process.exit(1);
	});
}
