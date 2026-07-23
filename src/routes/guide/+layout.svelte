<script lang="ts">
	// Wraps every /guide/* page (both the raw-lane [slug] route and the static
	// mdsvex interview-practice-evidence route) in the shared persistent-sidebar
	// shell. See $lib/components/ContentShell.svelte.
	import { page } from '$app/state';
	import ContentShell from '$lib/components/ContentShell.svelte';
	import { SOURCE_OF_TRUTH_ROUTE } from '$lib/navigation';
	let { children } = $props();
	const isSourceOfTruth = $derived(page.url.pathname === SOURCE_OF_TRUTH_ROUTE);
</script>

{#if isSourceOfTruth}
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		{@render children()}
	</div>
{:else}
	<ContentShell>
		{@render children()}
	</ContentShell>
{/if}
