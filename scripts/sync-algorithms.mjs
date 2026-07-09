// Algorithms lane: emit one markdown doc per packet implementation.
//
// WHAT THIS IS
//   Companion to scripts/sync-content.mjs (which it is imported by and run from).
//   The packet ships ~70 Python implementations under src/algo/<topic>/<problem>.py,
//   each with a structured module docstring (Problem / Approach / When to use /
//   Complexity). This module turns every one of those into a markdown doc under
//   src/content/algorithms/<topic>/<problem>.md — title, docstring sections, then
//   the full source in a fenced python block — and returns the manifest entries
//   that describe them (section: 'algorithms'), so sync-content.mjs can fold them
//   into the one committed manifest that drives the on-site registry.
//
// WHY GIT SHOW, NOT THE WORKING TREE
//   A packet checkout can have working-tree-local session state (a file stripped
//   to a scaffold for practice) that must never leak into the synced site. Every
//   file this module reads — both the directory listing and each file's content —
//   comes from `git show HEAD:<path>` / `git ls-tree HEAD`, never a working-tree
//   read, so a stripped practice file in the packet checkout can't bleed through.
//
// PARSING
//   Deliberately dumb and dependency-free: the docstring is the first triple-quoted
//   block (or the packet's own gen_algo_pages.py, read-only reference), parsed with
//   the same four-header convention (Problem / Approach / When to use /
//   Complexity). No Python AST — that's overkill for a stable, hand-authored
//   docstring shape.
//
// PLAIN NODE. No dependencies, no bundler.

import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';

// ── Title-casing (mirrors the packet's scripts/gen_algo_pages.py) ──────────────

// Filenames whose naive "replace underscores, title-case each word" rendering
// would be wrong (acronyms, symbols, hyphenation). Ported verbatim from
// gen_algo_pages.py's `_title_from_filename` (entries irrelevant to this packet's
// current file set, e.g. "dp", are dropped).
const FILENAME_TITLE_OVERRIDES = {
	a_star_search: 'A* Search',
	kd_tree: 'KD-Tree',
	lru_cache: 'LRU Cache',
	traveling_salesman_dp: 'Traveling Salesman DP',
	validate_bst: 'Validate BST',
};

// Topic directory names whose naive rendering would be wrong. Ported from
// gen_algo_pages.py's `_topic_title`.
const TOPIC_TITLE_OVERRIDES = {
	dp: 'Dynamic Programming',
	stacks_queues: 'Stacks & Queues',
	linked_lists: 'Linked Lists',
	bit_manipulation: 'Bit Manipulation',
	sliding_window: 'Sliding Window',
	two_pointers: 'Two Pointers',
};

/** Python-`str.title()`-alike: capitalize the first letter of each space-separated word. */
function pyTitleCase(words) {
	return words
		.split(' ')
		.map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
		.join(' ');
}

function titleFromFilename(stem) {
	return FILENAME_TITLE_OVERRIDES[stem] ?? pyTitleCase(stem.replace(/_/g, ' '));
}

function titleFromTopic(topic) {
	return TOPIC_TITLE_OVERRIDES[topic] ?? pyTitleCase(topic.replace(/_/g, ' '));
}

// ── Docstring parsing ───────────────────────────────────────────────────────────

const SECTION_HEADER_RE = /^(Problem|Approach|When to use|Complexity):\s*$/;

/**
 * Extract the module docstring's structured sections. Mirrors
 * gen_algo_pages.py's `_parse_docstring`: title is the docstring's first line
 * (trailing period dropped); Problem / Approach / When to use / Complexity are
 * header-delimited blocks, dedented by one 4-space indent level; Complexity is
 * further split into `time` / `space` from its `Time:` / `Space:` lines. The
 * raw Complexity body is kept too — some docstrings label per-operation costs
 * (`Kruskal: O(E log E)`) instead of Time/Space, and the section must not be
 * dropped for those.
 */
function parseDocstring(source) {
	const result = { title: '', problem: '', approach: '', whenToUse: '', time: '', space: '', complexityRaw: '' };

	let m = source.match(/^"""([\s\S]*?)"""/);
	if (!m) m = source.match(/^'''([\s\S]*?)'''/);
	if (!m) return result;

	const docLines = m[1].split('\n');
	const trimmed = m[1].trim();
	if (trimmed) result.title = trimmed.split('\n')[0].trim().replace(/\.$/, '');

	const headers = [];
	docLines.forEach((line, i) => {
		const hm = line.match(SECTION_HEADER_RE);
		if (hm) headers.push({ name: hm[1], at: i });
	});

	const sections = {};
	for (let i = 0; i < headers.length; i++) {
		const { name, at } = headers[i];
		const end = i + 1 < headers.length ? headers[i + 1].at : docLines.length;
		const body = docLines.slice(at + 1, end).map((l) => (l.startsWith('    ') ? l.slice(4) : l));
		while (body.length && body[0].trim() === '') body.shift();
		while (body.length && body[body.length - 1].trim() === '') body.pop();
		sections[name] = body.join('\n');
	}

	result.problem = sections['Problem'] ?? '';
	result.approach = sections['Approach'] ?? '';
	result.whenToUse = sections['When to use'] ?? '';

	result.complexityRaw = sections['Complexity'] ?? '';

	for (const line of result.complexityRaw.split('\n')) {
		const t = line.trim();
		if (/^time:/i.test(t)) result.time = t.replace(/^time:/i, '').trim();
		else if (/^space:/i.test(t)) result.space = t.replace(/^space:/i, '').trim();
	}

	return result;
}

// ── Markdown emission ────────────────────────────────────────────────────────────

// A raw `|` inside table-cell content splits the row at render time — the
// house markdown renderer's splitTableRow honors `\|` escapes, so cell text
// (docstring notation like `|word_list|`) must escape pipes on the way in.
function tableCell(text) {
	return text.replace(/\|/g, '\\|');
}

function renderProblemDoc(title, info, source) {
	const lines = [`# ${title}`, ''];

	if (info.problem) lines.push('## Problem', '', info.problem, '');
	if (info.approach) lines.push('## Approach', '', info.approach, '');
	if (info.whenToUse) lines.push('## When to Use', '', info.whenToUse, '');
	if (info.time || info.space) {
		lines.push(
			'## Complexity',
			'',
			'| | |',
			'|---|---|',
			`| **Time** | \`${tableCell(info.time || '—')}\` |`,
			`| **Space** | \`${tableCell(info.space || '—')}\` |`,
			'',
		);
	} else if (info.complexityRaw.trim()) {
		// Non-conforming Complexity block (per-operation labels, e.g.
		// `Kruskal: O(E log E)`): render each `Label: value` line as its own row
		// rather than dropping the section.
		const rows = info.complexityRaw
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean)
			.map((l) => {
				const at = l.indexOf(':');
				const label = at === -1 ? '—' : l.slice(0, at).trim();
				const value = (at === -1 ? l : l.slice(at + 1)).trim().replace(/\s+/g, ' ');
				return `| **${tableCell(label)}** | \`${tableCell(value)}\` |`;
			});
		lines.push('## Complexity', '', '| | |', '|---|---|', ...rows, '');
	}

	lines.push('## Source', '', '```python', source.replace(/\n+$/, ''), '```', '');

	return lines.join('\n');
}

// ── Git-only reads (never the working tree; see file header) ────────────────────

function listAlgoFiles(packetPath) {
	const out = execFileSync('git', ['-C', packetPath, 'ls-tree', '-r', '--name-only', 'HEAD', '--', 'src/algo'], {
		encoding: 'utf8',
	});
	return out
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l.endsWith('.py') && !l.endsWith('/__init__.py'));
}

function readAtHead(packetPath, relPath) {
	return execFileSync('git', ['-C', packetPath, 'show', `HEAD:${relPath}`], { encoding: 'utf8' });
}

function writeFileDeep(mkdirSync, writeFileSync, absPath, text) {
	mkdirSync(dirname(absPath), { recursive: true });
	writeFileSync(absPath, text);
}

// ── Public entry point ────────────────────────────────────────────────────────────

/**
 * Sync every packet algorithm implementation into src/content/algorithms/ and
 * return the manifest entries describing them (section: 'algorithms'), for the
 * caller to fold into the single committed manifest.
 *
 * @param {{
 *   packetPath: string,
 *   contentDir: string,
 *   mkdirSync: typeof import('node:fs').mkdirSync,
 *   writeFileSync: typeof import('node:fs').writeFileSync,
 *   sha256: (text: string) => string,
 * }} args
 */
export function syncAlgorithms({ packetPath, contentDir, mkdirSync, writeFileSync, sha256 }) {
	const files = listAlgoFiles(packetPath).sort();

	// Group by topic first so each topic's problems get a stable, alphabetical
	// display order (an explicit integer, matching the other lanes' convention).
	const byTopic = new Map();
	for (const relPath of files) {
		const parts = relPath.split('/'); // src / algo / <topic> / <problem>.py
		const topic = parts[2];
		const problem = parts[3].replace(/\.py$/, '');
		if (!byTopic.has(topic)) byTopic.set(topic, []);
		byTopic.get(topic).push({ relPath, problem });
	}

	const entries = [];
	for (const topic of [...byTopic.keys()].sort()) {
		const topicTitle = titleFromTopic(topic);
		const problems = byTopic.get(topic).sort((a, b) => a.problem.localeCompare(b.problem));

		problems.forEach(({ relPath, problem }, i) => {
			const source = readAtHead(packetPath, relPath);
			const info = parseDocstring(source);
			const title = titleFromFilename(problem);
			const out = `algorithms/${topic}/${problem}.md`;

			const body = renderProblemDoc(title, info, source);
			writeFileDeep(mkdirSync, writeFileSync, join(contentDir, out), body);

			entries.push({
				section: 'algorithms',
				slug: problem,
				topic,
				topicTitle,
				title,
				summary: info.title,
				lane: 'markdown',
				order: i + 1,
				out,
				sourcePath: relPath,
				// docs/algorithms/** is mkdocs gen-files output, gitignored in the
				// packet — a blob URL for it is always a 404. Registering the alias
				// keeps cross-references (learning-paths links every drill this way)
				// on the live on-site route instead.
				inputs: [relPath, `docs/algorithms/${topic}/${problem}.md`],
				sha256: sha256(body),
			});
		});
	}

	return entries;
}
