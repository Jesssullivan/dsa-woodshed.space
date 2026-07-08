import { loadRawSource } from '$lib/docs/content';
import { extractHeadings } from '$lib/docs/markdown';
import { getEntry } from '$lib/docs/registry';
import type { PageServerLoad } from './$types';

// This route is the one guide entry on the mdsvex (.svx) lane; the compiled
// <Content> component (imported directly in +page.svelte) still does the real
// rendering. The raw source loaded here is used ONLY to extract a table of
// contents (mdsvex does not stamp heading ids itself — see
// $lib/actions/slugify-headings.ts). A SERVER load so $lib/docs/markdown
// (whose module graph reaches Shiki) never enters the client bundle.
export const prerender = true;

export const load: PageServerLoad = async () => {
	const entry = getEntry('guide', 'interview-practice-evidence');
	const raw = entry ? await loadRawSource(entry.out) : undefined;
	return { headings: extractHeadings(raw ?? '') };
};
