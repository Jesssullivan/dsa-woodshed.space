<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import SourceLink from '$lib/components/SourceLink.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main class="mx-auto max-w-5xl px-6 py-16">
	<Breadcrumbs items={[{ label: 'The DSA Woodshed', href: '/' }, { label: data.sectionTitle }]} />
	<div class="xl:grid xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start xl:gap-10">
		<article class="min-w-0" data-pagefind-body>
			<Markdown html={data.html} />
			<SourceLink sourcePath={data.sourcePath} />
		</article>
		<aside class="hidden xl:sticky xl:top-20 xl:block" aria-label="Page sections">
			<TableOfContents headings={data.headings} />
		</aside>
	</div>
</main>
