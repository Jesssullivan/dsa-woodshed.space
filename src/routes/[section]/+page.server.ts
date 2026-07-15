import { error } from '@sveltejs/kit';
import { loadRawBody } from '$lib/docs/content';
import { extractHeadings, renderMarkdown } from '$lib/docs/markdown';
import { getSinglePageEntry, makeLinkResolver, SINGLE_PAGE_SECTIONS } from '$lib/docs/registry';
import type { EntryGenerator, PageServerLoad } from './$types';

const SECTION_TITLES: Record<(typeof SINGLE_PAGE_SECTIONS)[number], string> = {
	challenges: 'Practice Drills',
	practice: 'Advanced Exercises',
	printables: 'Printables',
};

export const prerender = true;

export const entries: EntryGenerator = () => SINGLE_PAGE_SECTIONS.map((section) => ({ section }));

export const load: PageServerLoad = async ({ params }) => {
	const entry = getSinglePageEntry(params.section);
	if (!entry) throw error(404, `No content section: ${params.section}`);
	const raw = await loadRawBody(entry.out);
	if (raw === undefined) throw error(404, `No synced body for content section: ${params.section}`);
	const html = await renderMarkdown(raw, { resolveLink: makeLinkResolver(entry.sourcePath) });
	return {
		section: entry.section,
		sectionTitle: SECTION_TITLES[entry.section as keyof typeof SECTION_TITLES],
		title: entry.title,
		summary: entry.summary,
		sourcePath: entry.sourcePath,
		html,
		headings: extractHeadings(raw),
	};
};
