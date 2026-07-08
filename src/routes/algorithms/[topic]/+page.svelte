<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main class="mx-auto max-w-3xl px-6 py-16">
	<Breadcrumbs
		items={[
			{ label: 'The DSA Woodshed', href: '/' },
			{ label: 'Algorithms', href: '/algorithms' },
			{ label: data.title },
		]}
	/>
	<h1 class="text-3xl font-bold">{data.title}</h1>
	<ul class="mt-8 space-y-6">
		{#each data.entries as entry (entry.slug)}
			<li class="border-surface-200-800 border-b pb-6 last:border-b-0">
				<a
					class="hover:text-primary-500 text-lg font-semibold underline-offset-2 hover:underline"
					href="/algorithms/{data.topic}/{entry.slug}">{entry.title}</a
				>
				{#if entry.summary}
					<p class="text-surface-600-400 mt-2 leading-relaxed">{entry.summary}</p>
				{/if}
			</li>
		{/each}
	</ul>
</main>
