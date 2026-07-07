<script lang="ts">
	import { Menu } from '@lucide/svelte';
	import { page } from '$app/state';
	import BindableDrawer from '$lib/components/BindableDrawer.svelte';
	import SaturnMark from '$lib/components/SaturnMark.svelte';
	import SEOHead from '$lib/components/SEOHead.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { REPO_URL } from '$lib/repo';
	import '../app.css';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

	let { children } = $props();

	let mobileOpen = $state(false);

	// Absolute paths keep section navigation stable from any route.
	const navLinks: { href: string; label: string }[] = [
		{ href: '/', label: 'Home' },
		{ href: '/guide/interview-practice-evidence', label: 'Guide' },
		{ href: '/reference', label: 'Reference' },
	];

	const SITE_NAME = 'The DSA Woodshed';
	const SITE_URL = 'https://dsa-woodshed.space';
	const SITE_TITLE = 'The DSA Woodshed — a reading surface for the DSA study packet';
	const SITE_DESCRIPTION =
		'A calm reading surface for the DSA study packet: interview-practice evidence and copy-ready algorithm reference sheets, tracked in git.';
	const SECURITY_URL = `${REPO_URL}/security/advisories/new`;
	const OG_IMAGE = `${SITE_URL}/og-image.png`;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${SITE_URL}/#website`,
		url: SITE_URL,
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		inLanguage: 'en',
	};
</script>

<!-- House-canon SEO via the extracted <SEOHead> (TIN-2225). Per-page <title>
     blocks (e.g. +page.svelte) still override this layout-level default. -->
<SEOHead
	title={SITE_TITLE}
	description={SITE_DESCRIPTION}
	image={OG_IMAGE}
	imageAlt={SITE_TITLE}
	siteName={SITE_NAME}
	origin={SITE_URL}
	{jsonLd}
/>

<div class="relative flex min-h-screen flex-col bg-transparent">
	<a
		href="#content"
		class="focus:bg-primary-500 sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
		>Skip to content</a
	>

	<AppBar class="saturn-nav sticky top-0 z-40">
		<AppBar.Toolbar class="grid-cols-[auto_1fr_auto] px-4 py-2">
			<AppBar.Lead>
				<a
					href="/"
					class="hover:text-primary-500 font-mono text-lg font-bold tracking-tight whitespace-nowrap transition-colors inline-flex items-center gap-2"
					aria-label={SITE_NAME + ' home'}
				>
					<SaturnMark class="text-primary-500 h-[1.05em] w-[1.05em]" />{SITE_NAME}</a
				>
			</AppBar.Lead>
			<AppBar.Headline></AppBar.Headline>
			<AppBar.Trail>
				<nav class="hidden items-center gap-4 text-sm lg:flex" aria-label="Section navigation">
					{#each navLinks as { href, label } (href)}
						<a
							{href}
							class="hover:text-primary-500 transition-colors"
							aria-label={label}
							aria-current={page.url.pathname === href ? 'page' : undefined}>{label}</a
						>
					{/each}
					<!-- Placeholder: no Algorithms surface exists yet, so this is inert text
					     (not a link) rather than a route that would 404. -->
					<span class="text-surface-400 cursor-default" title="Coming soon">Algorithms</span>
					<ThemeSwitcher />
				</nav>

				<!-- Mobile drawer: reuses the house BindableDrawer + the same <SiteNav>
				     the desktop persistent sidebar renders, so mobile gets the full
				     section/entry IA instead of just the three top-level links. -->
				<button
					type="button"
					class="hover:bg-surface-200-800 rounded-sm p-2 lg:hidden"
					aria-label="Open navigation"
					onclick={() => (mobileOpen = true)}
				>
					<Menu class="h-5 w-5" />
				</button>
				<BindableDrawer bind:open={mobileOpen} title={SITE_NAME}>
					<nav aria-label="Primary" class="mb-6 space-y-0.5 text-sm">
						{#each navLinks as { href, label } (href)}
							<a
								{href}
								aria-current={page.url.pathname === href ? 'page' : undefined}
								onclick={() => (mobileOpen = false)}
								class="hover:bg-surface-200-800 block rounded-sm px-2 py-1.5">{label}</a
							>
						{/each}
						<span class="text-surface-400 block cursor-default rounded-sm px-2 py-1.5" title="Coming soon"
							>Algorithms</span
						>
					</nav>
					<SiteNav onNavigate={() => (mobileOpen = false)} />
					<div class="border-surface-200-800 mt-6 flex justify-center border-t pt-4">
						<ThemeSwitcher />
					</div>
				</BindableDrawer>
			</AppBar.Trail>
		</AppBar.Toolbar>
	</AppBar>

	<div id="content" class="flex-1">
		{@render children?.()}
	</div>

	<footer id="contact" class="border-surface-200-800 bg-surface-100-900/80 mt-16 border-t backdrop-blur-sm">
		<div class="container mx-auto flex flex-col gap-4 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between">
			<p class="text-surface-700-300">
				A reading surface for the DSA study packet. Content is tracked in git; every page links to its source.
			</p>
			<nav class="flex flex-wrap gap-4" aria-label="Footer">
				<a href={REPO_URL} target="_blank" rel="noopener" class="hover:text-primary-500 transition-colors"
					>Study packet</a
				>
				<a href={SECURITY_URL} target="_blank" rel="noopener" class="hover:text-primary-500 transition-colors"
					>Security</a
				>
			</nav>
		</div>
	</footer>
</div>
