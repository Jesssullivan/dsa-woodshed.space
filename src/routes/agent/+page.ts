import type { PageLoad } from './$types';

// Head metadata only (see App.PageData — consumed by the root layout's
// <SEOHead>); the page copy itself lives in +page.svelte.
export const load: PageLoad = () => ({
	title: 'For agents',
	summary:
		'A flat read order, command surface summary, and machine-key list for an agent landing on the DSA Woodshed or its content repository cold.',
});
