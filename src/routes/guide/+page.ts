import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Redirect-only stub: /guide has no index page of its own (content lives at
// /guide/<slug>), so without this leaf the static host would fall through to a
// directory listing. Prerendered, adapter-static emits a meta-refresh page.
export const prerender = true;

export const load: PageLoad = () => {
	throw redirect(308, '/guide/getting-started');
};
