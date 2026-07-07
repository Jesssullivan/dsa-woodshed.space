import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

// mdsvex wiring, adapted from greatfallstoolbus.org/svelte.config.js:5-16.
// `.svx` content is compiled AS a Svelte component, so it is the right lane for
// prose pages authored specifically for this site (see src/content/guide). The
// code-heavy DSA reference sheets are rendered through the dependency-free
// $lib/docs/markdown.ts raw lane instead, because their fenced Python (braces,
// angle-brackets) would be misparsed as Svelte syntax by mdsvex.
const mdsvexPreprocess = mdsvex({ extensions: ['.svx'] });
const modernMdsvexPreprocess = {
	...mdsvexPreprocess,
	async markup(options) {
		const transformed = await mdsvexPreprocess.markup?.(options);
		if (!transformed?.code) return transformed;
		return {
			...transformed,
			code: transformed.code.replace(/<script\s+context=(["'])module\1>/g, '<script module>'),
		};
	},
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: [vitePreprocess(), modernMdsvexPreprocess],
	compilerOptions: {
		runes: true,
	},
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: true,
			strict: false,
		}),
		alias: {
			// Authored content (mdsvex .svx pages + raw reference sheets) lives
			// under src/content, outside $lib.
			$content: 'src/content',
		},
		paths: {
			// The DSA Woodshed ships on a custom domain (dsa-woodshed.space) via
			// static/CNAME, so base="" is the default — matching the adapter-static
			// custom-domain pattern in greatfallstoolbus.org/svelte.config.js:49-70.
			// A project-path GitHub Pages preview can still set BASE_PATH="/<repo>".
			base: process.env.BASE_PATH ?? '',
		},
		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn',
		},
	},
};

export default config;
