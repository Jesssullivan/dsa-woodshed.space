<script lang="ts">
	// Wraps every /guide/* page (both the raw-lane [slug] route and the static
	// mdsvex interview-practice-evidence route) in the shared persistent-sidebar
	// shell. See $lib/components/ContentShell.svelte.
	import ContentShell from '$lib/components/ContentShell.svelte';
	let { children } = $props();
</script>

<ContentShell>
	{@render children()}
</ContentShell>
