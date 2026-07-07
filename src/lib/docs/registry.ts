// Curated registry for the on-site reference-sheet surface (/reference).
//
// PROVENANCE: adapted from greatfallstoolbus.org/src/lib/docs/registry.ts. Two
// changes from the original:
//   1. The doc bodies are the DSA study packet's REAL reference sheets, copied
//      into src/content/reference/ and imported as raw strings, then rendered by
//      $lib/docs/markdown.ts. (The originals live in Jesssullivan/dsa-study-packet
//      under reference-sheets/; see makeLinkResolver + repo.ts for edit/view URLs.)
//   2. The link resolver reads repo identity from $lib/repo.ts instead of the
//      estate-generated $lib/generated/source-map.json, dropping that coupling.
//
// SECURITY INVARIANT (carried over from the source): this list MUST enumerate
// exactly the ENTRIES files below. `import.meta.glob` with explicit literals
// keeps the public client bundle equal to the curated registry — no adjacent
// doc's raw text is ever bundled just by living in the folder.
import { REPO_URL, REPO_DEFAULT_BRANCH } from '$lib/repo';

const rawModules = {
	...import.meta.glob(
		['/src/content/reference/03-algorithm-templates.md', '/src/content/reference/05-common-patterns.md'],
		{ query: '?raw', import: 'default', eager: true },
	),
} as Record<string, string>;

export interface ReferenceSheet {
	/** URL slug under /reference. */
	slug: string;
	/** Source path in the CONTENT repo, e.g. `reference-sheets/03-algorithm-templates.md`. */
	sourcePath: string;
	title: string;
	summary: string;
	order: number;
	/** Raw markdown source (SSOT: the tracked reference sheet). */
	raw: string;
}

interface RegistryEntry {
	/** Path of the copied raw file in THIS repo (for the glob key). */
	file: string;
	/** Path of the canonical sheet in the CONTENT repo (for edit/view links). */
	sourcePath: string;
	slug: string;
	title: string;
	summary: string;
	order: number;
}

const ENTRIES: RegistryEntry[] = [
	{
		file: '/src/content/reference/03-algorithm-templates.md',
		sourcePath: 'reference-sheets/03-algorithm-templates.md',
		slug: 'algorithm-templates',
		title: 'Algorithm templates',
		summary:
			'Copy-paste-ready templates for binary search, two pointers, sliding window, BFS/DFS, and the other patterns that recur across interview problems.',
		order: 3,
	},
	{
		file: '/src/content/reference/05-common-patterns.md',
		sourcePath: 'reference-sheets/05-common-patterns.md',
		slug: 'common-patterns',
		title: 'Common patterns',
		summary: 'The recurring shapes of interview problems and the data structures and moves that solve each one.',
		order: 5,
	},
];

export const referenceSheets: ReferenceSheet[] = ENTRIES.map((entry) => {
	const raw = rawModules[entry.file];
	if (raw === undefined) {
		throw new Error(`reference registry: no raw source globbed for ${entry.file}`);
	}
	return {
		slug: entry.slug,
		sourcePath: entry.sourcePath,
		title: entry.title,
		summary: entry.summary,
		order: entry.order,
		raw,
	};
});

const bySlug = new Map(referenceSheets.map((sheet) => [sheet.slug, sheet]));

export function getSheet(slug: string): ReferenceSheet | undefined {
	return bySlug.get(slug);
}

export function sheetSlugs(): string[] {
	return referenceSheets.map((sheet) => sheet.slug);
}

/** Sheets in display order. */
export function sheetsInOrder(): ReferenceSheet[] {
	return [...referenceSheets].sort((a, b) => a.order - b.order);
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
 * Build a link resolver for one sheet: turns its relative markdown links into
 * canonical GitHub blob URLs in the CONTENT repo (anchors and absolute URLs are
 * handled upstream in markdown.ts and never reach here). Repo URL and branch
 * come from $lib/repo.ts, so no org/repo string is hardcoded here.
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
