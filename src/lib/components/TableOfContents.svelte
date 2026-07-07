<script lang="ts">
	// Per-page "on this page" rail, built from the headings extracted at render
	// time by $lib/docs/markdown.ts `extractHeadings` (or, on the mdsvex lane,
	// from the raw .svx source read purely for this — see loadRawSource). Only
	// shown once there's more than one heading to jump to.
	import type { Heading } from '$lib/docs/markdown';

	interface Props {
		headings: Heading[];
	}
	let { headings }: Props = $props();

	// h2/h3 only: h1 duplicates the page title, and deeper levels would
	// overwhelm a short rail.
	const items = $derived(headings.filter((h) => h.depth >= 2 && h.depth <= 3));
</script>

{#if items.length > 1}
	<nav aria-label="On this page" class="text-sm">
		<p class="text-surface-500 mb-2 text-xs font-semibold tracking-widest uppercase">On this page</p>
		<ul class="space-y-1">
			{#each items as item (item.slug)}
				<li style="padding-left: {(item.depth - 2) * 0.75}rem">
					<a
						href="#{item.slug}"
						class="text-surface-600-400 hover:text-primary-500 block leading-snug transition-colors"
					>
						{item.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
