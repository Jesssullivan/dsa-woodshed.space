import { error } from '@sveltejs/kit';
import { getSheet, sheetSlugs } from '$lib/docs/registry';
import type { EntryGenerator, PageLoad } from './$types';

// Prerender every registered sheet slug (adapter-static).
export const prerender = true;

export const entries: EntryGenerator = () => sheetSlugs().map((slug) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const sheet = getSheet(params.slug);
	if (!sheet) throw error(404, `No reference sheet: ${params.slug}`);
	// Return the raw source; rendering (and link resolution) happens in the
	// component via <Markdown>, so no function needs to cross the load boundary.
	return {
		title: sheet.title,
		summary: sheet.summary,
		sourcePath: sheet.sourcePath,
		raw: sheet.raw,
	};
};
