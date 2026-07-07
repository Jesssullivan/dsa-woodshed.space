<script lang="ts">
	// PROVENANCE: adapted from greatfallstoolbus.org/src/lib/components/Markdown.svelte.
	// Renders reference-sheet markdown through the dependency-free house renderer
	// ($lib/docs/markdown.ts) into the `.prose` block in src/app.css. The renderer
	// HTML-escapes every text run and emits only a fixed tag set, so `{@html}` here
	// is safe (no raw doc HTML is trusted), and braces / angle-brackets in the
	// fenced Python render as literal text.
	import { renderMarkdown, type MarkdownOptions } from '$lib/docs/markdown';

	interface Props {
		/** Raw markdown source (a tracked reference sheet). */
		source: string;
		/** Resolve relative links to canonical URLs (see makeLinkResolver). */
		resolveLink?: MarkdownOptions['resolveLink'];
	}

	let { source, resolveLink }: Props = $props();

	const html = $derived(renderMarkdown(source, { resolveLink }));
</script>

<div class="prose max-w-none">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</div>
