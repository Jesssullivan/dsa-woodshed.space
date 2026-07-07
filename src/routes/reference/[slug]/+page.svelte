<script lang="ts">
	import Markdown from '$lib/components/Markdown.svelte';
	import SourceLink from '$lib/components/SourceLink.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.title} — The DSA Woodshed</title>
	<meta name="description" content={data.summary} />
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-16">
	<nav class="text-surface-500 mb-6 text-sm">
		<a class="hover:text-primary-500 underline-offset-2 hover:underline" href="/reference">Reference sheets</a>
	</nav>
	<!-- Pre-rendered, Shiki-highlighted HTML from +page.server.ts (build time):
	     ships highlighted markup with zero client-side Shiki. -->
	<Markdown html={data.html} />
	<SourceLink sourcePath={data.sourcePath} />
</main>
