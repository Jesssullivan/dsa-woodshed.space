import type { PageLoad } from './$types';

// Head metadata only (see App.PageData — consumed by the root layout's
// <SEOHead>); the landing copy itself lives in +page.svelte.
export const load: PageLoad = () => ({
	title: 'Project',
	summary:
		"The DSA Woodshed is a public, company-neutral interview-practice product: a packet repository of drills, tests, and print material, plus this reading site, which re-syncs the packet's content on every deploy.",
});
