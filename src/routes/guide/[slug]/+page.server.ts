import { error } from '@sveltejs/kit';
import { getEntry, guideMarkdownSlugs, makeLinkResolver } from '$lib/docs/registry';
import { loadRawBody } from '$lib/docs/content';
import { extractHeadings, renderMarkdown } from '$lib/docs/markdown';
import type { EntryGenerator, PageServerLoad } from './$types';

// Raw-lane guide pages. The one guide entry on the mdsvex (`.svx`) lane —
// interview-practice-evidence — has its own static route, which takes precedence
// over this dynamic one, and is excluded from the prerender entries below.
export const prerender = true;

export const entries: EntryGenerator = () => guideMarkdownSlugs().map((slug) => ({ slug }));

// A SERVER load so the Shiki-rendering pipeline ($lib/docs/markdown) runs at
// build time only and never enters the client module graph — see the reference
// [slug] +page.server.ts for the full rationale.
export const load: PageServerLoad = async ({ params }) => {
	const entry = getEntry('guide', params.slug);
	if (!entry || entry.lane !== 'markdown') throw error(404, `No guide page: ${params.slug}`);
	const raw = await loadRawBody(entry.out);
	if (raw === undefined) throw error(404, `No synced body for guide page: ${params.slug}`);
	const html = await renderMarkdown(raw, { resolveLink: makeLinkResolver(entry.sourcePath) });
	return {
		slug: entry.slug,
		title: entry.title,
		summary: entry.summary,
		sourcePath: entry.sourcePath,
		html,
		headings: extractHeadings(raw),
	};
};
