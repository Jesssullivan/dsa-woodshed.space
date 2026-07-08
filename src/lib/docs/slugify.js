// GitHub-style heading slug, extracted to a plain-JS leaf module (JSDoc-typed)
// so BOTH lanes stamp identical heading ids from the ONE algorithm:
//   - $lib/docs/markdown.ts (raw markdown lane) re-exports it for renderBlocks /
//     extractHeadings and for existing importers,
//   - svelte.config.js (plain Node, no TS loader) imports it for the mdsvex
//     (.svx) lane's build-time rehype heading-id plugin.
// Keeping it dependency-free and leaf-shaped also means no client module ever
// has to reach through the Shiki-adjacent renderer file just for a slug.

/**
 * GitHub-style heading slug: lowercase, drop punctuation, collapse spaces to dashes.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
	return text
		.toLowerCase()
		.replace(/`/g, '')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');
}
