import { loadRawSource } from '$lib/docs/content';
import { extractHeadings } from '$lib/docs/markdown';
import { getEntry } from '$lib/docs/registry';
import type { PageServerLoad } from './$types';

// This route is the one guide entry on the mdsvex (.svx) lane; the compiled
// <Content> component (imported directly in +page.svelte) still does the real
// rendering. The raw source loaded here is used ONLY to extract a table of
// contents whose fragment hrefs match the heading ids the mdsvex rehype plugin
// stamps at build time (same slugify — see svelte.config.js). A SERVER load so
// $lib/docs/markdown (whose module graph reaches Shiki) never enters the client
// bundle. title/summary mirror the shape every other content load returns, for
// the layout-level per-page SEO head.
export const prerender = true;

export const load: PageServerLoad = async () => {
	const entry = getEntry('guide', 'interview-practice-evidence');
	const raw = entry ? await loadRawSource(entry.out) : undefined;
	return {
		title: entry?.title,
		summary: entry?.summary,
		headings: extractHeadings(raw ?? ''),
	};
};
