<script lang="ts">
	// Wraps every /reference/* page (the index and the [slug] detail route) in
	// the shared persistent-sidebar shell. See $lib/components/ContentShell.svelte.
	import ContentShell from '$lib/components/ContentShell.svelte';
	let { children } = $props();
</script>

<ContentShell>
	{@render children()}
</ContentShell>
