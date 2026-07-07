import { error } from '@sveltejs/kit';
import { getSheet, sheetSlugs } from '$lib/docs/registry';
import { loadRawBody } from '$lib/docs/content';
import type { EntryGenerator, PageLoad } from './$types';

// Prerender every registered sheet slug (adapter-static).
export const prerender = true;

export const entries: EntryGenerator = () => sheetSlugs().map((slug) => ({ slug }));

export const load: PageLoad = async ({ params }) => {
	const sheet = getSheet(params.slug);
	if (!sheet) throw error(404, `No reference sheet: ${params.slug}`);
	// The raw body is loaded lazily (not carried on the registry), so importing the
	// registry elsewhere never pulls sheet text into that page's bundle. Rendering
	// and link resolution happen in the component via <Markdown>.
	const raw = await loadRawBody(sheet.out);
	if (raw === undefined) throw error(404, `No synced body for reference sheet: ${params.slug}`);
	return {
		title: sheet.title,
		summary: sheet.summary,
		sourcePath: sheet.sourcePath,
		raw,
	};
};
