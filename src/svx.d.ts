// Ambient module shape for mdsvex-compiled .svx content (see svelte.config.js).
// Lifted verbatim from greatfallstoolbus.org/src/svx.d.ts.
// `metadata` is the parsed YAML frontmatter; the default export is the
// rendered body as a Svelte component.
declare module '*.svx' {
	import type { Component } from 'svelte';

	export const metadata: Record<string, unknown>;
	const component: Component;
	export default component;
}
