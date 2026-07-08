<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import SourceLink from '$lib/components/SourceLink.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main class="mx-auto max-w-3xl px-6 py-16">
	<Breadcrumbs
		items={[
			{ label: 'The DSA Woodshed', href: '/' },
			{ label: 'Algorithms', href: '/algorithms' },
			{ label: data.topicTitle, href: `/algorithms/${data.topic}` },
			{ label: data.title },
		]}
	/>
	<div data-pagefind-body>
		<!-- Pre-rendered, Shiki-highlighted HTML from +page.server.ts (build time):
		     ships highlighted markup with zero client-side Shiki. -->
		<Markdown html={data.html} />
	</div>
	<SourceLink sourcePath={data.sourcePath} />
</main>
