<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { algorithmTopics } from '$lib/docs/registry';

	const topics = algorithmTopics();
	const total = topics.reduce((sum, t) => sum + t.entries.length, 0);
</script>

<!-- No data-pagefind-body — deliberate: this hub (and each topic index) is
     just links whose titles are fully indexed on the leaf problem pages;
     indexing it would rank the hub above the actual content for every topic
     query. Contrast /reference, whose index carries editorial summaries. -->
<main class="mx-auto max-w-3xl px-6 py-16">
	<Breadcrumbs items={[{ label: 'The DSA Woodshed', href: '/' }, { label: 'Algorithms' }]} />
	<h1 class="text-3xl font-bold">Algorithms</h1>
	<p class="text-surface-700 dark:text-surface-300 mt-3 leading-relaxed">
		{total} implementations from the study packet, each with its problem statement, approach, complexity, and full source.
	</p>
	<ul class="mt-8 space-y-6">
		{#each topics as group (group.topic)}
			<li class="border-surface-200-800 border-b pb-6 last:border-b-0">
				<a
					class="hover:text-primary-500 text-xl font-semibold underline-offset-2 hover:underline"
					href="/algorithms/{group.topic}">{group.title}</a
				>
				<p class="text-surface-600-400 mt-2 text-sm">
					{group.entries.length}
					{group.entries.length === 1 ? 'problem' : 'problems'}
				</p>
			</li>
		{/each}
	</ul>
</main>
