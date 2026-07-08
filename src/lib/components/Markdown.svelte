<script lang="ts">
	// PROVENANCE: adapted from greatfallstoolbus.org/src/lib/components/Markdown.svelte.
	// Presentational sink for reference-sheet markdown: it renders HTML that was
	// already produced (and Shiki-highlighted) by the house renderer
	// ($lib/docs/markdown.ts) at BUILD time in the reference [slug] +page.server.ts.
	//
	// It deliberately does NOT import the renderer: renderMarkdown pulls in Shiki
	// (grammar/theme/wasm), and importing it from a client component would drag
	// that ~10 MB bundle into the browser. Keeping this component a pure `{@html}`
	// wrapper is what lets the prerendered pages ship highlighted HTML with ZERO
	// client-side Shiki. Do the highlighting in a server load, pass the HTML here.
	//
	// The renderer HTML-escapes every text run and emits only a fixed tag set
	// (Shiki's token spans included), so `{@html}` here is safe — no raw doc HTML
	// is trusted, and braces / angle-brackets in fenced code render as literal
	// text.

	interface Props {
		/** Pre-rendered, Shiki-highlighted HTML for the `.prose` container. */
		html: string;
	}

	let { html }: Props = $props();
</script>

<div class="prose max-w-none">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</div>
