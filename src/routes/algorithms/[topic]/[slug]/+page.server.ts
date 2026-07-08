import { error } from '@sveltejs/kit';
import { getAlgorithm, algorithmParams, makeLinkResolver } from '$lib/docs/registry';
import { loadRawBody } from '$lib/docs/content';
import { renderMarkdown } from '$lib/docs/markdown';
import type { EntryGenerator, PageServerLoad } from './$types';

// Prerender every registered (topic, slug) pair (adapter-static).
export const prerender = true;

export const entries: EntryGenerator = () => algorithmParams();

// A SERVER load so the Shiki-rendering pipeline ($lib/docs/markdown) runs at
// build time only and never enters the client module graph — see the reference
// [slug] +page.server.ts for the full rationale. That matters most on THIS
// lane: ~90 code-heavy problem pages, each full of fenced Python.
export const load: PageServerLoad = async ({ params }) => {
	const entry = getAlgorithm(params.topic, params.slug);
	if (!entry) throw error(404, `No algorithm: ${params.topic}/${params.slug}`);
	const raw = await loadRawBody(entry.out);
	if (raw === undefined) throw error(404, `No synced body for algorithm: ${params.topic}/${params.slug}`);
	const html = await renderMarkdown(raw, { resolveLink: makeLinkResolver(entry.sourcePath) });
	return {
		topic: entry.topic,
		topicTitle: entry.topicTitle,
		title: entry.title,
		summary: entry.summary,
		sourcePath: entry.sourcePath,
		html,
	};
};
