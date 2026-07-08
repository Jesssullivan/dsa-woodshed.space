import { error } from '@sveltejs/kit';
import { getAlgorithmTopic, algorithmTopicSlugs } from '$lib/docs/registry';
import type { EntryGenerator, PageLoad } from './$types';

// Prerender every registered topic slug (adapter-static).
export const entries: EntryGenerator = () => algorithmTopicSlugs().map((topic) => ({ topic }));

export const load: PageLoad = async ({ params }) => {
	const group = getAlgorithmTopic(params.topic);
	if (!group) throw error(404, `No algorithm topic: ${params.topic}`);
	return {
		topic: group.topic,
		title: group.title,
		// Meta description for the layout <SEOHead> (see App.PageData).
		summary: `${group.title} implementations from the DSA study packet.`,
		entries: group.entries,
	};
};
