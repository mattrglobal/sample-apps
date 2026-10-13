// Lockfile parsing for npm (lockfileVersion 3) and Yarn Berry (__metadata version 10).
// Each parser returns Map<packageName, Set<version>>.

export function parseNpmLock(text) {
	const lock = JSON.parse(text);
	const versions = new Map();
	for (const [path, entry] of Object.entries(lock.packages ?? {})) {
		if (!path || !entry.version || entry.link) continue;
		const name = entry.name ?? path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length);
		add(versions, name, entry.version);
	}
	return versions;
}

export function parseYarnLock(text) {
	const versions = new Map();
	for (const block of yarnBlocks(text)) {
		if (block.key === "__metadata" || !block.version) continue;
		const name = descriptorName(block.descriptors[0]);
		if (block.descriptors[0].includes("@workspace:")) continue;
		add(versions, name, block.version);
	}
	return versions;
}

// Drop every Yarn lock entry except __metadata and the named packages, so the next
// `yarn install` re-resolves everything else to the newest version its range allows.
export function pruneYarnLock(text, keep) {
	const lines = text.split("\n");
	const header = [];
	for (const line of lines) {
		if (line && !line.startsWith("#")) break;
		header.push(line);
	}
	const kept = yarnBlocks(text)
		.filter((b) => b.key === "__metadata" || keep(descriptorName(b.descriptors[0])))
		.map((b) => b.raw);
	return `${header.join("\n")}\n${kept.join("\n\n")}\n`;
}

export function diffVersions(before, after) {
	const changed = [];
	for (const name of new Set([...before.keys(), ...after.keys()])) {
		const from = [...(before.get(name) ?? [])].sort(compareVersions);
		const to = [...(after.get(name) ?? [])].sort(compareVersions);
		if (from.join() !== to.join()) changed.push({ name, from, to });
	}
	return changed.sort((a, b) => a.name.localeCompare(b.name));
}

function compareVersions(a, b) {
	const pa = parseVersion(a);
	const pb = parseVersion(b);
	for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
	return 0;
}

function parseVersion(v) {
	return String(v)
		.split("-")[0]
		.split(".")
		.map((n) => Number.parseInt(n, 10) || 0);
}

function add(map, name, version) {
	if (!map.has(name)) map.set(name, new Set());
	map.get(name).add(version);
}

function descriptorName(descriptor) {
	const at = descriptor.indexOf("@", 1);
	return at === -1 ? descriptor : descriptor.slice(0, at);
}

function yarnBlocks(text) {
	const blocks = [];
	for (const raw of text.split(/\n\s*\n/)) {
		const lines = raw.split("\n").filter((l) => l && !l.startsWith("#"));
		if (!lines.length || lines[0].startsWith(" ")) continue;
		const key = lines[0].replace(/:$/, "");
		const descriptors = key
			.replace(/^"|"$/g, "")
			.split(/",\s*"|,\s*/)
			.map((d) => d.trim());
		const version = lines.find((l) => l.startsWith("  version:"))?.split(":")[1].trim();
		blocks.push({ key, descriptors, version, raw: lines.join("\n") });
	}
	return blocks;
}
