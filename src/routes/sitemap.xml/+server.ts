// M3.3 sitemap.xml endpoint. Prerendered at build time by adapter-static so the
// XML lives at build/sitemap.xml. Add additional routes here as M5 lands them.
import { guideMarkdownSlugs, sheetSlugs } from '$lib/docs/registry';
import type { RequestHandler } from './$types';

const SITE = 'https://dsa-woodshed.space';
// Enumerate exactly the routed pages. Reference + guide are driven by the content
// registry so new synced entries appear here without a hand edit.
const PAGES: string[] = [
	'/',
	'/reference',
	...sheetSlugs().map((s) => `/reference/${s}`),
	'/guide/interview-practice-evidence',
	...guideMarkdownSlugs().map((s) => `/guide/${s}`),
];

export const prerender = true;

export const GET: RequestHandler = () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join('\n')}
</urlset>
`;
	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
		},
	});
};
