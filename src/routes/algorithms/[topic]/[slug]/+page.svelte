<script lang="ts">
	import Markdown from '$lib/components/Markdown.svelte';
	import SourceLink from '$lib/components/SourceLink.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.title} — {data.topicTitle} — The DSA Woodshed</title>
	<meta name="description" content={data.summary || `${data.title} — from the DSA study packet.`} />
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-16">
	<nav class="text-surface-500 mb-6 text-sm">
		<a class="hover:text-primary-500 underline-offset-2 hover:underline" href="/algorithms">Algorithms</a>
		<span aria-hidden="true"> / </span>
		<a class="hover:text-primary-500 underline-offset-2 hover:underline" href="/algorithms/{data.topic}"
			>{data.topicTitle}</a
		>
	</nav>
	<div data-pagefind-body>
		<!-- Pre-rendered, Shiki-highlighted HTML from +page.server.ts (build time):
		     ships highlighted markup with zero client-side Shiki. -->
		<Markdown html={data.html} />
	</div>
	<SourceLink sourcePath={data.sourcePath} />
</main>
