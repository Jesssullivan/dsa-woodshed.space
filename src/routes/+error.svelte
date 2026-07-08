<script lang="ts">
	// Client-side error surface (bad in-app navigation, load failures). The
	// hard-404 path on GitHub Pages is the prerendered src/routes/404 page;
	// this boundary keeps the same branded shape for router-level misses.
	import { page } from '$app/state';

	const notFound = $derived(page.status === 404);
</script>

<main class="mx-auto max-w-3xl px-6 py-16">
	<p class="text-surface-500 text-xs tracking-widest uppercase">{page.status}</p>
	<h1 class="mt-2 text-3xl font-bold">{notFound ? 'Page not found' : 'Something went wrong'}</h1>
	<p class="text-surface-700 dark:text-surface-300 mt-3 leading-relaxed">
		{#if notFound}
			Nothing lives at this address — the link may be stale, or the page may have moved when content was reorganized.
		{:else}
			{page.error?.message ?? 'An unexpected error occurred.'}
		{/if}
	</p>
	<p class="mt-8 text-sm">
		<a class="hover:text-primary-500 font-medium underline-offset-2 hover:underline" href="/">Back to the home page</a>
	</p>
</main>
