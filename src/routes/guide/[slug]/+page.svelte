<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import PrevNext from '$lib/components/PrevNext.svelte';
	import SourceLink from '$lib/components/SourceLink.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import { entryHref, neighbors } from '$lib/docs/registry';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const isSourceOfTruth = $derived(data.slug === 'source-of-truth');
	const adjacent = $derived(neighbors('guide', data.slug));
</script>

<main class="mx-auto max-w-5xl py-16">
	<Breadcrumbs
		items={isSourceOfTruth
			? [{ label: 'The DSA Woodshed', href: '/' }, { label: data.title }]
			: [
					{ label: 'The DSA Woodshed', href: '/' },
					{ label: 'Method', href: '/guide/getting-started' },
					{ label: data.title },
				]}
	/>
	<div class="xl:grid xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start xl:gap-10">
		<article class="min-w-0" data-pagefind-body>
			<!-- Pre-rendered, Shiki-highlighted HTML from +page.server.ts (build time):
			     ships highlighted markup with zero client-side Shiki. -->
			<Markdown html={data.html} />
			<SourceLink sourcePath={data.sourcePath} />
			{#if !isSourceOfTruth}
				<PrevNext
					prev={adjacent.prev && { title: adjacent.prev.title, href: entryHref(adjacent.prev) }}
					next={adjacent.next && { title: adjacent.next.title, href: entryHref(adjacent.next) }}
				/>
			{/if}
		</article>
		<aside class="hidden xl:sticky xl:top-20 xl:block" aria-label="Page sections">
			<TableOfContents headings={data.headings} />
		</aside>
	</div>
</main>
