// Cross-repo content sync: copy the DSA study packet's docs into src/content/.
//
// WHAT THIS IS
//   The DSA Woodshed is a *reading surface*. Its prose and reference sheets are
//   authored and version-controlled in a SEPARATE repo — the DSA study packet
//   (Jesssullivan/dsa-study-packet) — which is the single source of truth. This
//   script pulls the needed files out of a packet checkout, resolves the mkdocs
//   snippet includes the packet uses, and writes plain markdown / mdsvex files
//   into src/content/ that the SvelteKit build renders.
//
//   Synced files are BUILD INPUTS, not source. They are gitignored (see
//   .gitignore) EXCEPT the manifest below, mirroring the packet's own
//   generated-artifacts discipline. A fresh checkout must run this once
//   (`pnpm run sync-content`, or `just build` which calls it) before building.
//
// GUARANTEES
//   - Deterministic: no timestamps, entries sorted, byte-stable output.
//   - Idempotent: running twice produces an identical tree and manifest.
//   - Recorded: src/content/.manifest.json pins the packet commit and lists
//     every entry (its source inputs, resolved output, lane, and a content hash)
//     so the on-site registry can read titles/lanes/order without hand-typing
//     and drift is auditable.
//
// PLAIN NODE. No dependencies, no bundler — runs under `node scripts/sync-content.mjs`.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncAlgorithms } from './sync-algorithms.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const CONTENT_DIR = join(REPO_ROOT, 'src', 'content');
const MANIFEST_PATH = join(CONTENT_DIR, '.manifest.json');

// Source root: dev uses the sibling packet checkout; CI resolves a shallow clone
// and passes its path through WOODSHED_PACKET_PATH.
const PACKET_PATH = resolve(REPO_ROOT, process.env.WOODSHED_PACKET_PATH ?? '../dsa-study-packet');

const SOURCE_REPO = 'Jesssullivan/dsa-study-packet';
const MAX_SNIPPET_DEPTH = 10;

// ── Content plan (the SSOT of WHAT to sync) ────────────────────────────────────
// Each entry: which packet file to read (`input`), where it lands under
// src/content (`out`), which render lane the site uses, the packet-relative path
// the "edit this page" affordance points at (`sourcePath` — the file a human
// actually edits), and its section + display order.
//
//   lane: 'markdown' → rendered by $lib/docs/markdown.ts (raw lane). Safe for the
//                      code-heavy sheets and for prose with braces / angle-tags /
//                      mermaid that mdsvex would misparse.
//   lane: 'svx'      → compiled AS a Svelte component by mdsvex. Only hazard-free
//                      prose (no braces, angle-tags, or mermaid) goes here.
//
// Reference entries read the mkdocs STUB under docs/reference/, whose body is a
// `--8<--` snippet include of the real sheet under reference-sheets/. The sync
// resolves that include, so `sourcePath` points at the sheet (the real prose),
// not the one-line stub.
const REFERENCE_SHEETS = [
	['01-python-stdlib', 'python-stdlib'],
	['02-data-structures', 'data-structures'],
	['03-algorithm-templates', 'algorithm-templates'],
	['04-big-o-complexity', 'big-o-complexity'],
	['05-common-patterns', 'common-patterns'],
	['06-system-design', 'system-design'],
	['07-interview-day-guide', 'interview-day-guide'],
	['08-cross-reference-guide', 'cross-reference-guide'],
	['09-python-314-and-modern-patterns', 'python-314-and-modern-patterns'],
	['10-whiteboard-performance-protocol', 'whiteboard-performance-protocol'],
	['11-14-day-whiteboard-ramp', '14-day-whiteboard-ramp'],
];

const PLAN = [
	...REFERENCE_SHEETS.map(([stem, slug], i) => ({
		section: 'reference',
		slug,
		lane: 'markdown',
		order: i + 1,
		input: `docs/reference/${stem}.md`,
		sourcePath: `reference-sheets/${stem}.md`,
		out: `reference/${slug}.md`,
	})),

	// Guide — hazard-free prose on the mdsvex lane, everything else raw.
	{
		section: 'guide',
		slug: 'interview-practice-evidence',
		lane: 'svx',
		order: 1,
		input: 'docs/guide/interview-practice-evidence.md',
		sourcePath: 'docs/guide/interview-practice-evidence.md',
		out: 'guide/interview-practice-evidence.svx',
	},
	{
		section: 'guide',
		slug: 'getting-started',
		lane: 'markdown',
		order: 2,
		input: 'docs/guide/getting-started.md',
		sourcePath: 'docs/guide/getting-started.md',
		out: 'guide/getting-started.md',
	},
	{
		section: 'guide',
		slug: 'when-to-use-what',
		lane: 'markdown',
		order: 3,
		input: 'docs/guide/when-to-use-what.md',
		sourcePath: 'docs/guide/when-to-use-what.md',
		out: 'guide/when-to-use-what.md',
	},
	{
		section: 'guide',
		slug: 'learning-paths',
		lane: 'markdown',
		order: 4,
		input: 'docs/guide/learning-paths.md',
		sourcePath: 'docs/guide/learning-paths.md',
		out: 'guide/learning-paths.md',
	},
	{
		section: 'guide',
		slug: 'source-of-truth',
		lane: 'markdown',
		order: 5,
		input: 'docs/guide/source-of-truth.md',
		sourcePath: 'docs/guide/source-of-truth.md',
		out: 'guide/source-of-truth.md',
	},

	// Single-page prose sections (prose, not macro-dependent — migrated raw).
	{
		section: 'printables',
		slug: 'printables',
		lane: 'markdown',
		order: 1,
		input: 'docs/printables.md',
		sourcePath: 'docs/printables.md',
		out: 'printables/printables.md',
	},
	{
		section: 'practice',
		slug: 'index',
		lane: 'markdown',
		order: 1,
		input: 'docs/practice/index.md',
		sourcePath: 'docs/practice/index.md',
		out: 'practice/index.md',
	},
	{
		section: 'challenges',
		slug: 'index',
		lane: 'markdown',
		order: 1,
		input: 'docs/challenges/index.md',
		sourcePath: 'docs/challenges/index.md',
		out: 'challenges/index.md',
	},
];

// ── Snippet resolution ─────────────────────────────────────────────────────────
// The packet's docs/reference/*.md stubs pull in the real sheet with pymdownx
// snippets. mkdocs.yml sets `base_path: ["."]`, so a snippet path is resolved
// against the packet ROOT. Only the quoted single-file form is present in the
// repo (verified with grep); we support exactly that, recurse into nested
// includes, cap the depth, and detect cycles.
const SNIPPET_RE = /^(\s*)--8<--\s+"([^"]+)"\s*$/;

/**
 * @param {string} content raw file text
 * @param {string[]} inputs accumulator of packet-relative files that fed this entry
 * @param {number} depth current recursion depth
 * @param {string[]} stack include chain, for cycle detection (packet-relative)
 * @returns {string}
 */
function resolveSnippets(content, inputs, depth, stack) {
	return content
		.split('\n')
		.map((line) => {
			const m = line.match(SNIPPET_RE);
			if (!m) return line;
			const [, indent, rel] = m;
			if (depth >= MAX_SNIPPET_DEPTH) {
				throw new Error(
					`snippet include depth cap (${MAX_SNIPPET_DEPTH}) exceeded at "${rel}" (chain: ${stack.join(' -> ')})`,
				);
			}
			if (stack.includes(rel)) {
				throw new Error(`snippet include cycle: ${[...stack, rel].join(' -> ')}`);
			}
			const abs = resolve(PACKET_PATH, rel);
			if (!existsSync(abs)) {
				throw new Error(`snippet include not found: "${rel}" (resolved to ${abs})`);
			}
			if (!inputs.includes(rel)) inputs.push(rel);
			const included = readFileSync(abs, 'utf8').replace(/\n$/, '');
			const resolved = resolveSnippets(included, inputs, depth + 1, [...stack, rel]);
			// Preserve the include line's indentation on every included line so an
			// indented `--8<--` (e.g. inside a code block) stays inside it.
			return indent
				? resolved
						.split('\n')
						.map((l) => (l ? indent + l : l))
						.join('\n')
				: resolved;
		})
		.join('\n');
}

// ── Metadata extraction ────────────────────────────────────────────────────────
function stripFrontmatter(text) {
	const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
	return { frontmatter: m ? m[1] : '', body: m ? text.slice(m[0].length) : text };
}

/** Title = frontmatter `title:` if declared, else the first H1, else the slug. */
function extractTitle(text, fallback) {
	const { frontmatter, body } = stripFrontmatter(text);
	const fm = frontmatter.match(/^title:\s*(.+?)\s*$/m);
	if (fm) return fm[1].replace(/^["']|["']$/g, '');
	const h1 = body.match(/^#\s+(.+?)\s*#*\s*$/m);
	if (h1) return h1[1].trim();
	return fallback;
}

function sha256(text) {
	return createHash('sha256').update(text, 'utf8').digest('hex');
}

// ── Filesystem helpers ─────────────────────────────────────────────────────────
/** Remove every generated file under src/content, keeping the dir itself. */
function cleanContentDir() {
	if (!existsSync(CONTENT_DIR)) return;
	for (const name of readdirSync(CONTENT_DIR)) {
		if (name === '.manifest.json') continue;
		rmSync(join(CONTENT_DIR, name), { recursive: true, force: true });
	}
}

function writeFileDeep(absPath, text) {
	mkdirSync(dirname(absPath), { recursive: true });
	writeFileSync(absPath, text);
}

function packetCommit() {
	try {
		return execFileSync('git', ['-C', PACKET_PATH, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
	} catch {
		return 'unknown';
	}
}

// ── Main ───────────────────────────────────────────────────────────────────────
function main() {
	if (!existsSync(PACKET_PATH) || !statSync(PACKET_PATH).isDirectory()) {
		console.error(`sync-content: packet checkout not found at ${PACKET_PATH}`);
		console.error('  Set WOODSHED_PACKET_PATH, or place the packet at ../dsa-study-packet.');
		process.exit(1);
	}

	cleanContentDir();

	const entries = [];
	for (const item of PLAN) {
		const inputAbs = resolve(PACKET_PATH, item.input);
		if (!existsSync(inputAbs)) {
			throw new Error(`sync-content: planned input missing: ${item.input}`);
		}
		const inputs = [item.input];
		const raw = readFileSync(inputAbs, 'utf8');
		// Resolve snippet includes, then normalize to exactly one trailing newline.
		const resolved = resolveSnippets(raw, inputs, 0, [item.input]).replace(/\n*$/, '\n');

		writeFileDeep(join(CONTENT_DIR, item.out), resolved);

		entries.push({
			section: item.section,
			slug: item.slug,
			title: extractTitle(resolved, item.slug),
			lane: item.lane,
			order: item.order,
			out: item.out,
			sourcePath: item.sourcePath,
			inputs: inputs.slice().sort(),
			sha256: sha256(resolved),
		});
	}

	// Algorithms lane: one markdown doc per packet src/algo/<topic>/<problem>.py
	// implementation. A dedicated module (scripts/sync-algorithms.mjs) owns the
	// docstring parsing and per-problem doc rendering; every file it reads comes
	// from `git show HEAD:...`, never the working tree (see that file's header),
	// so a stripped practice file in the packet checkout never leaks into the site.
	entries.push(
		...syncAlgorithms({ packetPath: PACKET_PATH, contentDir: CONTENT_DIR, mkdirSync, writeFileSync, sha256 }),
	);

	// Deterministic ordering: section, then display order, then slug.
	entries.sort((a, b) => a.section.localeCompare(b.section) || a.order - b.order || a.slug.localeCompare(b.slug));

	const manifest = {
		note: 'Generated by scripts/sync-content.mjs. Do not edit by hand — run `pnpm run sync-content`.',
		sourceRepo: SOURCE_REPO,
		sourceCommit: packetCommit(),
		entries,
	};
	writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, '\t') + '\n');

	const rel = (p) => relative(REPO_ROOT, p);
	console.log(
		`sync-content: wrote ${entries.length} entries to ${rel(CONTENT_DIR)}/ from ${SOURCE_REPO}@${manifest.sourceCommit.slice(0, 12)}`,
	);
}

main();
