// Plain JS on the slugify.js precedent: one implementation shared by the
// TS/Svelte lane (SearchDialog) and the plain-Node postbuild gate
// (scripts/verify-search-index.mjs), so the verifier can never drift from
// what the dialog actually navigates.

/**
 * Pagefind indexes the flat prerendered files, so result URLs carry a `.html`
 * suffix (/algorithms/arrays/two_sum.html). The SvelteKit client router
 * intercepts same-origin clicks and only the clean route was prerendered
 * (…/two_sum/__data.json exists; …/two_sum.html__data.json does not), so
 * navigating the raw URL lands on the 404 shell. Strip the suffix — preserving
 * any ?query/#hash tail — so SPA navigation hits the real route; '/' (home)
 * has no suffix and passes through untouched.
 *
 * @param {string} url Pagefind result URL.
 * @returns {string} Clean route the client router can resolve.
 */
export function routeUrl(url) {
	return url.replace(/\.html(?=$|[?#])/, '');
}
