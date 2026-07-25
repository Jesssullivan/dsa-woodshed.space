// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			/** Per-page head title; the root layout's <SEOHead> appends the site name and falls back to the site title. */
			title?: string;
			/** Per-page meta description; falls back to the site description. */
			summary?: string;
			/** Ask crawlers not to index this page (the 404 surface). */
			noindex?: boolean;
		}
		// interface PageState {}
		// interface Platform {}
	}

	// Build-time constants from vite.config.ts's `define` block (resolveCommitHash /
	// buildInfo). Consumed by $lib/build-info.ts for the footer's build provenance
	// line; declared here so svelte-check/tsc recognize the globals the bundler
	// inlines at build time.
	const __VERSION__: string;
	const __COMMIT_HASH__: string;
	const __COMMIT_SHORT__: string;
}

export {};
