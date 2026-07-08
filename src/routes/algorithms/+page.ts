import type { PageLoad } from './$types';

// Head metadata only (see App.PageData — consumed by the root layout's
// <SEOHead>); the topic list itself is registry-driven in +page.svelte.
export const load: PageLoad = () => ({
	title: 'Algorithms',
	summary: 'Every implementation in the DSA study packet, one page per problem, grouped by topic.',
});
