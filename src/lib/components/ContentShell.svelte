<script lang="ts">
	// Persistent desktop left sidebar for a content section (guide/reference).
	// Used as the section-level `+layout.svelte` for every routed section so the
	// sidebar is one shared shell instead of being redeclared per page. Both
	// desktop and mobile keep the rail within the current section instead of
	// repeating the whole library tree.
	import SiteNav from './SiteNav.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-10 lg:px-8">
	<aside class="hidden lg:sticky lg:top-20 lg:block" aria-label="Site sections">
		<SiteNav currentSectionOnly />
	</aside>
	<div class="min-w-0">
		{@render children()}
	</div>
</div>
