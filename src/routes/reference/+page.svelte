<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { sheetsInOrder } from '$lib/docs/registry';

	const sheets = sheetsInOrder();
</script>

<main class="mx-auto max-w-3xl py-16">
	<Breadcrumbs items={[{ label: 'The DSA Woodshed', href: '/' }, { label: 'Reference sheets' }]} />
	<h1 class="text-3xl font-bold">Reference sheets</h1>
	<p class="text-surface-700 dark:text-surface-300 mt-3 leading-relaxed">
		Copy-ready templates and problem patterns, rendered from the study packet's reference sheets.
	</p>
	<ul class="mt-8 space-y-6">
		{#each sheets as sheet (sheet.slug)}
			<li class="border-surface-200-800 border-b pb-6 last:border-b-0">
				<a
					class="hover:text-primary-500 text-xl font-semibold underline-offset-2 hover:underline"
					href="/reference/{sheet.slug}">{sheet.title}</a
				>
				<p class="text-surface-600-400 mt-2 leading-relaxed">{sheet.summary}</p>
			</li>
		{/each}
	</ul>
</main>
