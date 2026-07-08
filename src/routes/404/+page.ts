import type { PageLoad } from './$types';

// Head metadata for the static not-found surface (see App.PageData). GitHub
// Pages serves the prerendered build/404.html this route emits for every
// unknown URL, so it must carry a real title/description like any other page.
export const load: PageLoad = () => ({
	title: 'Page not found',
	summary: 'That page does not exist on The DSA Woodshed. Head back to the home page or browse the reference sheets.',
});
