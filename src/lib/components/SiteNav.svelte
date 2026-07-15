<script lang="ts">
	// Shared IA nav content: the section/entry tree from the content registry,
	// current-page highlighted. Rendered in the persistent desktop sidebar
	// (see ContentShell.svelte) AND inside the mobile drawer (+layout.svelte).
	// one source of truth so the two surfaces cannot drift.
	import { page } from '$app/state';
	import { algorithmTopics, entryHref, ROUTED_SECTIONS, sections } from '$lib/docs/registry';

	interface Props {
		/** Called after a link is activated. The mobile drawer uses this to close itself. */
		onNavigate?: () => void;
		/** Limit the mobile drawer to links in the route's current content section. */
		currentSectionOnly?: boolean;
	}
	let { onNavigate, currentSectionOnly = false }: Props = $props();
	const currentSection = $derived(page.url.pathname.split('/')[1]);

	// Every routed section from the registry. The algorithms
	// lane lists its 17 topic-index pages, not all ~70 problems, so the sidebar
	// stays scannable; problems are one click away on the topic index.
	const navSections = $derived(
		sections()
			.filter((s) => ROUTED_SECTIONS.has(s.id))
			.filter((s) => !currentSectionOnly || s.id === currentSection)
			.map((s) => ({
				id: s.id,
				title: s.title,
				links:
					s.id === 'algorithms'
						? algorithmTopics().map((t) => ({ href: `/algorithms/${t.topic}`, label: t.title }))
						: s.entries.map((e) => ({ href: entryHref(e), label: e.title })),
			})),
	);
</script>

<nav aria-label="Sections" class="space-y-6 text-sm">
	{#each navSections as section (section.id)}
		<div>
			<p class="text-surface-500 mb-2 text-xs font-semibold tracking-widest uppercase">{section.title}</p>
			<ul class="space-y-0.5">
				{#each section.links as { href, label } (href)}
					{@const current =
						page.url.pathname === href ? 'page' : page.url.pathname.startsWith(`${href}/`) ? 'location' : undefined}
					<li>
						<a
							{href}
							aria-current={current}
							onclick={onNavigate}
							class="flex min-h-11 items-center rounded-sm px-2 py-1 leading-snug transition-colors {current
								? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
								: 'text-surface-700-300 hover:bg-surface-200-800'}"
						>
							{label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>
