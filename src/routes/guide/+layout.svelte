<script lang="ts">
	// Wraps every /guide/* page (both the raw-lane [slug] route and the static
	// mdsvex interview-practice-evidence route) in the shared persistent-sidebar
	// shell. See $lib/components/ContentShell.svelte.
	import { page } from '$app/state';
	import ContentShell from '$lib/components/ContentShell.svelte';
	import { PROJECT_ROUTE } from '$lib/navigation';
	let { children } = $props();
	const isProject = $derived(page.url.pathname === PROJECT_ROUTE);
</script>

{#if isProject}
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		{@render children()}
	</div>
{:else}
	<ContentShell>
		{@render children()}
	</ContentShell>
{/if}
