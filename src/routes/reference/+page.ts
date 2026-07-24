import type { PageLoad } from './$types';

// Head metadata only (see App.PageData — consumed by the root layout's
// <SEOHead>); the sheet list itself is registry-driven in +page.svelte.
export const load: PageLoad = () => ({
	title: 'Reference Sheets',
	summary: 'Copy-ready algorithm reference sheets from the DSA study packet.',
});
