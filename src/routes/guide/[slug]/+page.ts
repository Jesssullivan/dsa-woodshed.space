import { error } from '@sveltejs/kit';
import { getEntry, guideMarkdownSlugs } from '$lib/docs/registry';
import { loadRawBody } from '$lib/docs/content';
import type { EntryGenerator, PageLoad } from './$types';

// Raw-lane guide pages. The one guide entry on the mdsvex (`.svx`) lane —
// interview-practice-evidence — has its own static route, which takes precedence
// over this dynamic one, and is excluded from the prerender entries below.
export const prerender = true;

export const entries: EntryGenerator = () => guideMarkdownSlugs().map((slug) => ({ slug }));

export const load: PageLoad = async ({ params }) => {
	const entry = getEntry('guide', params.slug);
	if (!entry || entry.lane !== 'markdown') throw error(404, `No guide page: ${params.slug}`);
	const raw = await loadRawBody(entry.out);
	if (raw === undefined) throw error(404, `No synced body for guide page: ${params.slug}`);
	return {
		title: entry.title,
		summary: entry.summary,
		sourcePath: entry.sourcePath,
		raw,
	};
};
