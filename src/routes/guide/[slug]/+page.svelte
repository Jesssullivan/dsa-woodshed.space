<script lang="ts">
	import Markdown from '$lib/components/Markdown.svelte';
	import SourceLink from '$lib/components/SourceLink.svelte';
	import { makeLinkResolver } from '$lib/docs/registry';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const resolveLink = $derived(makeLinkResolver(data.sourcePath));
</script>

<svelte:head>
	<title>{data.title} — The DSA Woodshed</title>
	{#if data.summary}<meta name="description" content={data.summary} />{/if}
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-16">
	<nav class="text-surface-500 mb-6 text-sm" data-pagefind-ignore>
		<a class="hover:text-primary-500 underline-offset-2 hover:underline" href="/">The DSA Woodshed</a>
	</nav>
	<div data-pagefind-body>
		<Markdown source={data.raw} {resolveLink} />
	</div>
	<SourceLink sourcePath={data.sourcePath} />
</main>
