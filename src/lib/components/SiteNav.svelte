<script lang="ts">
	// Shared IA nav content: the section/entry tree from the content registry,
	// current-page highlighted. Rendered in the persistent desktop sidebar
	// (see ContentShell.svelte) AND inside the mobile drawer (+layout.svelte) —
	// one source of truth so the two surfaces cannot drift.
	import { page } from '$app/state';
	import { entryHref, sections } from '$lib/docs/registry';

	interface Props {
		/** Called after a link is activated — the mobile drawer uses this to close itself. */
		onNavigate?: () => void;
	}
	let { onNavigate }: Props = $props();

	// Only sections with a live page route today. `sections()` also carries
	// practice/challenges/printables (registered content with no route yet — a
	// follow-up content stream); omit them here rather than ship dead links.
	const ROUTED_SECTIONS = new Set(['guide', 'reference']);
	const navSections = $derived(sections().filter((s) => ROUTED_SECTIONS.has(s.id)));
</script>

<nav aria-label="Sections" class="space-y-6 text-sm">
	{#each navSections as section (section.id)}
		<div>
			<p class="text-surface-500 mb-2 text-xs font-semibold tracking-widest uppercase">{section.title}</p>
			<ul class="space-y-0.5">
				{#each section.entries as entry (entry.slug)}
					{@const href = entryHref(entry)}
					{@const current = page.url.pathname === href}
					<li>
						<a
							{href}
							aria-current={current ? 'page' : undefined}
							onclick={onNavigate}
							class="block rounded-sm px-2 py-1 leading-snug transition-colors {current
								? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
								: 'text-surface-700-300 hover:bg-surface-200-800'}"
						>
							{entry.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>
