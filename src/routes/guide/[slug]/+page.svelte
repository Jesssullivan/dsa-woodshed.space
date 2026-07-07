<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import PrevNext from '$lib/components/PrevNext.svelte';
	import SourceLink from '$lib/components/SourceLink.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import { extractHeadings } from '$lib/docs/markdown';
	import { entryHref, makeLinkResolver, neighbors } from '$lib/docs/registry';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const resolveLink = $derived(makeLinkResolver(data.sourcePath));
	const headings = $derived(extractHeadings(data.raw));
	const adjacent = $derived(neighbors('guide', data.slug));
</script>

<svelte:head>
	<title>{data.title} — The DSA Woodshed</title>
	{#if data.summary}<meta name="description" content={data.summary} />{/if}
</svelte:head>

<main class="mx-auto max-w-5xl py-16">
	<Breadcrumbs items={[{ label: 'The DSA Woodshed', href: '/' }, { label: 'Guide' }, { label: data.title }]} />
	<div class="xl:grid xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start xl:gap-10">
		<article class="min-w-0">
			<Markdown source={data.raw} {resolveLink} />
			<SourceLink sourcePath={data.sourcePath} />
			<PrevNext
				prev={adjacent.prev && { title: adjacent.prev.title, href: entryHref(adjacent.prev) }}
				next={adjacent.next && { title: adjacent.next.title, href: entryHref(adjacent.next) }}
			/>
		</article>
		<aside class="hidden xl:sticky xl:top-20 xl:block" aria-label="Page sections">
			<TableOfContents {headings} />
		</aside>
	</div>
</main>
