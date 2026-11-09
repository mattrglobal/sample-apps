import assert from "node:assert/strict";
import { test } from "node:test";
import { prLink, renderIssueBody } from "./publish.mjs";

test("prLink opens a prefilled PR that closes the tracking issue", () => {
	const url = new URL(prLink("mattrglobal/sample-apps", 42));
	assert.equal(url.pathname, "/mattrglobal/sample-apps/compare/master...deps/weekly-refresh");
	assert.equal(url.searchParams.get("expand"), "1");
	assert.equal(url.searchParams.get("title"), "build(deps): weekly in-range dependency refresh");
	assert.equal(url.searchParams.get("body"), "Closes #42");
});

test("renderIssueBody puts mentions and the action above the report", () => {
	const body = renderIssueBody({ mentions: "@someone @org/team", action: "Open it", report: "| App |\n" });
	assert.ok(body.startsWith("@someone @org/team: the weekly dependency refresh has updates."));
	assert.ok(body.indexOf("**Open it**") < body.indexOf("| App |"));
});

test("renderIssueBody truncates reports that would exceed GitHub's body limit", () => {
	const body = renderIssueBody({ mentions: "", action: "Open it", report: "x".repeat(100_000) });
	assert.ok(body.length < 65_536);
	assert.ok(body.endsWith("_Report truncated._\n"));
});
