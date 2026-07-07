import { error } from '@sveltejs/kit';
import { getSheet, makeLinkResolver, sheetSlugs } from '$lib/docs/registry';
import { renderMarkdown } from '$lib/docs/markdown';
import type { EntryGenerator, PageServerLoad } from './$types';

// Prerender every registered sheet slug (adapter-static).
export const prerender = true;

export const entries: EntryGenerator = () => sheetSlugs().map((slug) => ({ slug }));

// A SERVER load (not a universal +page.ts) on purpose: rendering pulls in Shiki
// (its grammar/theme/wasm bundle), and a universal load's module graph ships to
// the client — which would drag the highlighter into the browser bundle. A
// server load runs ONLY at build time for these prerendered pages, so the
// highlighted HTML is baked into the static output and NO Shiki reaches the
// client. Link resolution also happens here, so no resolver crosses the boundary.
export const load: PageServerLoad = async ({ params }) => {
	const sheet = getSheet(params.slug);
	if (!sheet) throw error(404, `No reference sheet: ${params.slug}`);
	const html = await renderMarkdown(sheet.raw, { resolveLink: makeLinkResolver(sheet.sourcePath) });
	return {
		title: sheet.title,
		summary: sheet.summary,
		sourcePath: sheet.sourcePath,
		html,
	};
};
