// The on-site content registry: the SSOT for what content exists, in what
// section, on which render lane, in what order, and under which title.
//
// PROVENANCE / SHAPE
//   The bodies this registry describes are authored in a SEPARATE repo — the DSA
//   study packet (Jesssullivan/dsa-study-packet) — and pulled in by
//   scripts/sync-content.mjs, which writes src/content/** (gitignored build
//   input) plus a committed manifest, src/content/.manifest.json. This registry
//   reads that manifest for the per-entry facts derived from the source
//   (title from the doc's frontmatter/H1, sourcePath, lane, order), so those
//   never drift from the packet and are never hand-typed here. The one thing the
//   packet has no home for — a short on-site SUMMARY per entry — is curated below.
//
//   Bodies are NOT imported here: the raw text is loaded lazily by detail routes
//   via $lib/docs/content.ts, so importing this registry (homepage, section
//   indexes, sitemap) never pulls sheet text into their bundles.
//
//   DEEP NAV / SIDEBAR is deliberately out of scope for this module — a follow-up
//   IA stream consumes the exported `sections()` / `allEntries()` shape to build
//   navigation. Keep this file about content identity, not layout.
import { REPO_URL, REPO_DEFAULT_BRANCH } from '$lib/repo';
import manifestJson from '$content/.manifest.json';

export type Lane = 'markdown' | 'svx';
export type SectionId = 'guide' | 'reference' | 'printables' | 'practice' | 'challenges';

export interface ContentEntry {
	/** Section this entry belongs to. */
	section: SectionId;
	/** URL slug, unique within its section. */
	slug: string;
	/** Display title, sourced from the packet doc (frontmatter title, else first H1). */
	title: string;
	/** Short on-site summary (curated here; the packet has no field for it). */
	summary: string;
	/** Packet-relative path the "edit this page" affordance points at. */
	sourcePath: string;
	/** Render lane: `markdown` (raw lane) or `svx` (mdsvex component). */
	lane: Lane;
	/** Display order within the section. */
	order: number;
	/** Path under src/content — the key $lib/docs/content.ts loads a raw body by. */
	out: string;
}

interface ManifestEntry {
	section: string;
	slug: string;
	title: string;
	lane: string;
	order: number;
	out: string;
	sourcePath: string;
	inputs: string[];
	sha256: string;
}

interface Manifest {
	sourceRepo: string;
	sourceCommit: string;
	entries: ManifestEntry[];
}

const manifest = manifestJson as Manifest;

/** The packet commit the current src/content was synced from (for provenance UIs). */
export const sourceCommit = manifest.sourceCommit;

// Curated on-site summaries, keyed `${section}/${slug}`. Editorial copy — the one
// piece of display metadata the packet does not carry.
const SUMMARIES: Record<string, string> = {
	'reference/python-stdlib':
		'`collections`, `itertools`, `functools`, `bisect`, and `heapq` — the built-ins to reach for first, with the calls that matter.',
	'reference/data-structures': 'Operations and Big-O for every Python built-in type, plus trees, graphs, and heaps.',
	'reference/algorithm-templates':
		'Copy-ready templates for binary search, two pointers, sliding window, BFS/DFS, backtracking, and DP.',
	'reference/big-o-complexity': 'Time complexities ranked, input-size rules of thumb, and amortized analysis.',
	'reference/common-patterns': 'The recurring shapes of interview problems and the move that solves each one.',
	'reference/system-design': 'Load balancing, caching, message queues, database scaling, and API design.',
	'reference/interview-day-guide':
		'Day-of logistics, a communication framework, timing strategy, and what to keep open.',
	'reference/cross-reference-guide':
		'Master lookup: problem description to implementation, a decision tree, and a keyword cheat sheet.',
	'reference/python-314-and-modern-patterns':
		'PEP 750 t-strings, PEP 649 lazy annotations, PEP 695 type syntax, Hypothesis, and advanced typing.',
	'reference/whiteboard-performance-protocol':
		"What's actually scored, the CLARP loop, panic first-aid, and collaboration scripts.",
	'reference/14-day-whiteboard-ramp': 'A day-by-day schedule: which drills to run and which sheets to keep open.',
	'guide/interview-practice-evidence':
		'Why the daily loop is built from cold retrieval, think-aloud reps, observation stress, and tape review — not passive video.',
	'guide/getting-started': 'Clone, install, and run your first drill: the shortest path from zero to a green test.',
	'guide/when-to-use-what': 'A decision tree mapping a new problem to the pattern that solves it.',
	'guide/learning-paths': 'Ordered routes through the packet for different timelines and goals.',
	'guide/source-of-truth': 'How the packet, booklet, and sheets are generated and kept reproducible.',
	'printables/printables': 'The booklet and reference sheets meant to leave the screen and land on paper.',
	'practice/index': 'Code-reading and decomposition exercises for practical, analyze-this-code rounds.',
	'challenges/index': 'The core drill set: strip each solution to its signature and re-implement from scratch.',
};

export interface Section {
	id: SectionId;
	/** Section display title. */
	title: string;
	/** Section display order. */
	order: number;
	entries: ContentEntry[];
}

// Section display metadata. Order here is a sane default; the IA stream owns the
// final navigation shape.
const SECTION_META: Record<SectionId, { title: string; order: number }> = {
	guide: { title: 'Guide', order: 1 },
	reference: { title: 'Reference sheets', order: 2 },
	practice: { title: 'Practice', order: 3 },
	challenges: { title: 'Challenges', order: 4 },
	printables: { title: 'Printables', order: 5 },
};

const LANES = new Set<Lane>(['markdown', 'svx']);

function toEntry(m: ManifestEntry): ContentEntry {
	if (!(m.section in SECTION_META)) throw new Error(`content registry: unknown section "${m.section}" for ${m.out}`);
	if (!LANES.has(m.lane as Lane)) throw new Error(`content registry: unknown lane "${m.lane}" for ${m.out}`);
	const key = `${m.section}/${m.slug}`;
	return {
		section: m.section as SectionId,
		slug: m.slug,
		title: m.title,
		summary: SUMMARIES[key] ?? '',
		sourcePath: m.sourcePath,
		lane: m.lane as Lane,
		order: m.order,
		out: m.out,
	};
}

/** Every content entry, in a stable (section order, then entry order, then slug) sort. */
export const contentEntries: ContentEntry[] = manifest.entries
	.map(toEntry)
	.sort(
		(a, b) =>
			SECTION_META[a.section].order - SECTION_META[b.section].order ||
			a.order - b.order ||
			a.slug.localeCompare(b.slug),
	);

export function allEntries(): ContentEntry[] {
	return contentEntries;
}

/** Entries in one section, in display order. */
export function entriesInSection(section: SectionId): ContentEntry[] {
	return contentEntries.filter((e) => e.section === section);
}

/** Sections in display order, each with its ordered entries. */
export function sections(): Section[] {
	return (Object.keys(SECTION_META) as SectionId[])
		.map((id) => ({ id, title: SECTION_META[id].title, order: SECTION_META[id].order, entries: entriesInSection(id) }))
		.filter((s) => s.entries.length > 0)
		.sort((a, b) => a.order - b.order);
}

export function getEntry(section: SectionId, slug: string): ContentEntry | undefined {
	return contentEntries.find((e) => e.section === section && e.slug === slug);
}

// ── Reference-sheet helpers (kept stable for existing /reference routes) ────────
/** Reference sheets in display order. */
export function sheetsInOrder(): ContentEntry[] {
	return entriesInSection('reference');
}

export function getSheet(slug: string): ContentEntry | undefined {
	return getEntry('reference', slug);
}

export function sheetSlugs(): string[] {
	return sheetsInOrder().map((s) => s.slug);
}

// ── Guide-lane helpers ──────────────────────────────────────────────────────────
/** Raw-lane guide slugs (the `.svx` guide entry has its own dedicated route). */
export function guideMarkdownSlugs(): string[] {
	return entriesInSection('guide')
		.filter((e) => e.lane === 'markdown')
		.map((e) => e.slug);
}

function normalizeJoin(dirSegments: string[], relative: string): string {
	const segments = relative.startsWith('/') ? [] : [...dirSegments];
	for (const part of relative.split('/')) {
		if (part === '' || part === '.') continue;
		if (part === '..') segments.pop();
		else segments.push(part);
	}
	return segments.join('/');
}

/**
 * Build a link resolver for one entry: turns its relative markdown links into
 * canonical GitHub blob URLs in the CONTENT repo (anchors and absolute URLs are
 * handled upstream in markdown.ts and never reach here). Repo URL and branch come
 * from $lib/repo.ts, so no org/repo string is hardcoded here.
 */
export function makeLinkResolver(sourcePath: string): (href: string) => string {
	const dirSegments = sourcePath.split('/').slice(0, -1);
	return (href: string) => {
		const hashIndex = href.indexOf('#');
		const pathPart = hashIndex === -1 ? href : href.slice(0, hashIndex);
		const hash = hashIndex === -1 ? '' : href.slice(hashIndex);
		const resolved = normalizeJoin(dirSegments, pathPart);
		return `${REPO_URL}/blob/${REPO_DEFAULT_BRANCH}/${resolved}${hash}`;
	};
}
