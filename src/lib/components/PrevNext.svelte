<script lang="ts">
	// Footer prev/next nav within a section, driven by $lib/docs/registry.ts
	// `neighbors()` (display order), so it always matches the section's sidebar.
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';

	interface NeighborLink {
		title: string;
		href: string;
	}
	interface Props {
		prev?: NeighborLink;
		next?: NeighborLink;
	}
	let { prev, next }: Props = $props();
</script>

{#if prev || next}
	<nav
		aria-label="Section pages"
		class="border-surface-200-800 mt-10 grid grid-cols-1 gap-3 border-t pt-6 sm:grid-cols-2"
	>
		{#if prev}
			<a
				href={prev.href}
				class="border-surface-200-800 hover:border-primary-500 group rounded-lg border p-3 transition-colors"
			>
				<span class="text-surface-500 flex items-center gap-1 text-xs tracking-wide uppercase">
					<ArrowLeft class="h-3.5 w-3.5" aria-hidden="true" />Previous
				</span>
				<span class="group-hover:text-primary-500 mt-1 block font-medium">{prev.title}</span>
			</a>
		{:else}
			<span aria-hidden="true"></span>
		{/if}
		{#if next}
			<a
				href={next.href}
				class="border-surface-200-800 hover:border-primary-500 group rounded-lg border p-3 text-right transition-colors"
			>
				<span class="text-surface-500 flex items-center justify-end gap-1 text-xs tracking-wide uppercase">
					Next<ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
				</span>
				<span class="group-hover:text-primary-500 mt-1 block font-medium">{next.title}</span>
			</a>
		{/if}
	</nav>
{/if}
