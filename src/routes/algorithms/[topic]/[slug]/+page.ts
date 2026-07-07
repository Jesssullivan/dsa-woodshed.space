import { error } from '@sveltejs/kit';
import { getAlgorithm, algorithmParams } from '$lib/docs/registry';
import { loadRawBody } from '$lib/docs/content';
import type { EntryGenerator, PageLoad } from './$types';

// Prerender every registered (topic, slug) pair (adapter-static).
export const entries: EntryGenerator = () => algorithmParams();

export const load: PageLoad = async ({ params }) => {
	const entry = getAlgorithm(params.topic, params.slug);
	if (!entry) throw error(404, `No algorithm: ${params.topic}/${params.slug}`);
	// The raw body is loaded lazily (not carried on the registry), so importing the
	// registry elsewhere never pulls the ~70 problems' full source into that page's
	// bundle. Rendering and link resolution happen in the component via <Markdown>.
	const raw = await loadRawBody(entry.out);
	if (raw === undefined) throw error(404, `No synced body for algorithm: ${params.topic}/${params.slug}`);
	return {
		topic: entry.topic,
		topicTitle: entry.topicTitle,
		title: entry.title,
		summary: entry.summary,
		sourcePath: entry.sourcePath,
		raw,
	};
};
