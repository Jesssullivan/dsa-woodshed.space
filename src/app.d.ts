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
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
