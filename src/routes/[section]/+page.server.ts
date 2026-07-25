import { error } from '@sveltejs/kit';
import { bookletMetadata } from '$lib/docs/booklet';
import { loadRawBody } from '$lib/docs/content';
import { extractHeadings, renderMarkdown } from '$lib/docs/markdown';
import { splitPrintableMarkdown } from '$lib/docs/printables';
import { getSinglePageEntry, makeLinkResolver, SINGLE_PAGE_SECTIONS } from '$lib/docs/registry';
import type { EntryGenerator, PageServerLoad } from './$types';

const SECTION_TITLES: Record<(typeof SINGLE_PAGE_SECTIONS)[number], string> = {
	challenges: 'Practice Problems',
	printables: 'Printables',
};

export const prerender = true;

export const entries: EntryGenerator = () => SINGLE_PAGE_SECTIONS.map((section) => ({ section }));

export const load: PageServerLoad = async ({ params }) => {
	const entry = getSinglePageEntry(params.section);
	if (!entry) throw error(404, `No content section: ${params.section}`);
	const raw = await loadRawBody(entry.out);
	if (raw === undefined) throw error(404, `No synced body for content section: ${params.section}`);
	const resolveLink = makeLinkResolver(entry.sourcePath);
	const printableParts = entry.section === 'printables' ? splitPrintableMarkdown(raw) : undefined;
	const html = printableParts ? '' : await renderMarkdown(raw, { resolveLink });
	const beforeReaderHtml = printableParts
		? await renderMarkdown(printableParts.beforeReader, {
				resolveLink,
				diagramIdScope: 'printables-before-reader',
			})
		: undefined;
	const afterReaderHtml = printableParts
		? await renderMarkdown(printableParts.afterReader, {
				resolveLink,
				diagramIdScope: 'printables-after-reader',
			})
		: undefined;
	return {
		section: entry.section,
		sectionTitle: SECTION_TITLES[entry.section as keyof typeof SECTION_TITLES],
		title: entry.title,
		summary: entry.summary,
		sourcePath: entry.sourcePath,
		html,
		beforeReaderHtml,
		afterReaderHtml,
		booklet: printableParts ? bookletMetadata : undefined,
		headings: extractHeadings(raw),
	};
};
