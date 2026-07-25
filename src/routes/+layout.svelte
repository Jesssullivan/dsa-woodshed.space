<script lang="ts">
	import { Menu } from '@lucide/svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import BindableDrawer from '$lib/components/BindableDrawer.svelte';
	import SaturnMark from '$lib/components/SaturnMark.svelte';
	import SEOHead from '$lib/components/SEOHead.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import { TinyVectors } from '@tummycrypt/tinyvectors';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { REPO_SLUG, REPO_URL } from '$lib/repo';
	import '../app.css';
	import SearchDialog from '$lib/components/SearchDialog.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import { buildSha, buildShaShort } from '$lib/build-info';
	import { SITE_REPO_URL } from '$lib/site-repo';
	import { PRIMARY_NAV_LINKS, SOURCE_OF_TRUTH_ROUTE, isPathInSection, primaryNavState } from '$lib/navigation';

	let { children } = $props();

	let mobileOpen = $state(false);

	const isCurrentSection = (sections: string[]) =>
		sections.some((section) => isPathInSection(page.url.pathname, section));
	const showMobileSectionNav = $derived(
		page.url.pathname !== SOURCE_OF_TRUTH_ROUTE && isCurrentSection(['/guide', '/reference', '/algorithms']),
	);

	const SITE_NAME = 'The DSA Woodshed';
	const SITE_URL = 'https://dsa-woodshed.space';
	const SITE_TITLE = 'The DSA Woodshed | Editor-first technical interview practice';
	const SITE_DESCRIPTION =
		'A practice room for technical interviews. Reason in ordinary comments and docstrings in real code, with a resident interviewer in one-click GitHub Codespaces.';
	const SECURITY_URL = `${REPO_URL}/security/advisories/new`;
	const OG_IMAGE = `${SITE_URL}/og-image.png`;
	const CODESPACES_URL = `https://codespaces.new/${REPO_SLUG}?quickstart=1`;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${SITE_URL}/#website`,
		url: SITE_URL,
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		inLanguage: 'en',
	};

	// Per-page SEO: routes expose `title` / `summary` from their load functions
	// (see App.PageData); this ONE layout-level <SEOHead> derives its head values
	// from them, so every prerendered page carries exactly one title/description
	// and matching og:/twitter: pairs, with the site generics only as the
	// fallback (home page, error surface).
	const headTitle = $derived(page.data.title ? `${page.data.title} | ${SITE_NAME}` : SITE_TITLE);
	const headDescription = $derived(page.data.summary || SITE_DESCRIPTION);

	// Ambient background: the canonical @tummycrypt/tinyvectors component,
	// resolved from the tinyland bazel-registry source seam (see
	// scripts/build-tinyvectors.mjs), replacing the hand-rolled VectorBlobs.
	//
	// Palette is read at runtime from the omux theme's own CSS custom
	// properties (getComputedStyle), so a theme or color-mode switch cascades
	// into the blob colors without this layout knowing theme names; a
	// MutationObserver watches the attributes the theme store flips
	// (data-mode / data-theme on <html>) and re-reads the palette when they
	// change. prefers-reduced-motion renders nothing at all: the component's
	// own shouldLoad gate keeps its entire subtree out of the DOM (same for
	// the first render, before colors resolve — TinyVectors renders nothing
	// while `colors` is empty).
	const BLOB_PALETTE_VARS = [
		'--color-primary-500',
		'--color-secondary-500',
		'--color-tertiary-500',
		'--color-surface-400',
		'--color-surface-600',
	] as const;
	// Muted neutrals; only used if the theme vars above aren't resolvable yet
	// (e.g. a render before the stylesheet has applied).
	const BLOB_FALLBACK_PALETTE = ['#a8785a', '#6b8a94', '#8a6b94', '#8a8378', '#5a544a'];

	let blobColors = $state<string[]>([]);
	let reduceMotion = $state(true);

	function readBlobPalette(): string[] {
		const styles = getComputedStyle(document.documentElement);
		const values = BLOB_PALETTE_VARS.map((name) => styles.getPropertyValue(name).trim());
		return values.every((value) => value.length > 0) ? values : BLOB_FALLBACK_PALETTE;
	}

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduceMotion = motionQuery.matches;
		const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
			reduceMotion = event.matches;
		};
		motionQuery.addEventListener('change', onMotionPreferenceChange);

		blobColors = readBlobPalette();
		const paletteObserver = new MutationObserver(() => {
			blobColors = readBlobPalette();
		});
		paletteObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-mode', 'data-theme'],
		});

		return () => {
			motionQuery.removeEventListener('change', onMotionPreferenceChange);
			paletteObserver.disconnect();
		};
	});
</script>

<!-- House-canon SEO via the extracted <SEOHead> (TIN-2225). The single head
     block for every route. Pages contribute via load data, never their own
     <svelte:head> meta, so built pages cannot stack duplicate descriptions. -->
<SEOHead
	title={headTitle}
	description={headDescription}
	image={OG_IMAGE}
	imageAlt={headTitle}
	siteName={SITE_NAME}
	origin={SITE_URL}
	noindex={page.data.noindex ?? false}
	{jsonLd}
/>

<div class="relative flex min-h-screen flex-col bg-transparent">
	<!-- Browser-only: TinyVectors touches window/navigator and must not run
	     during prerender. Fixed full-viewport, behind everything, inert. -->
	{#if browser}
		<div
			class="pointer-events-none fixed inset-0 -z-10"
			style="overflow: hidden"
			aria-hidden="true"
			data-testid="vector-blobs-bg"
		>
			<TinyVectors
				theme="custom"
				colors={blobColors}
				opacity={0.1}
				blobCount={5}
				enableScrollPhysics={true}
				enableDeviceMotion={false}
				shouldLoad={!reduceMotion}
			/>
		</div>
	{/if}
	<a
		href="#content"
		class="focus:bg-primary-500 sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
		>Skip to content</a
	>

	<AppBar class="saturn-nav sticky top-0 z-40" data-pagefind-ignore>
		<AppBar.Toolbar class="grid-cols-[auto_1fr_auto] px-4 py-2 max-[374px]:gap-0 max-[374px]:px-0">
			<AppBar.Lead>
				<a
					href="/"
					class="hover:text-primary-500 inline-flex min-h-11 items-center gap-2 font-mono text-lg font-bold tracking-tight whitespace-nowrap transition-colors"
					aria-label={SITE_NAME + ' home'}
				>
					<SaturnMark class="text-primary-500 h-[1.05em] w-[1.05em]" />{SITE_NAME}</a
				>
			</AppBar.Lead>
			<AppBar.Headline></AppBar.Headline>
			<AppBar.Trail class="max-[374px]:gap-0">
				<nav class="hidden items-center gap-4 text-sm lg:flex" aria-label="Section navigation">
					{#each PRIMARY_NAV_LINKS as link (link.href)}
						{@const current = primaryNavState(page.url.pathname, link)}
						<a
							href={link.href}
							class="inline-flex min-h-11 items-center rounded-sm px-2 py-2 transition-colors {current
								? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
								: 'hover:text-primary-500'}"
							aria-label={link.label}
							aria-current={current}>{link.label}</a
						>
					{/each}
					<a
						href={CODESPACES_URL}
						target="_blank"
						rel="noopener"
						class="bg-primary-500 hover:bg-primary-600 inline-flex min-h-11 items-center rounded-md px-3 py-1.5 text-sm font-semibold text-white transition-colors"
						aria-label="Start a practice rep in GitHub Codespaces">Start</a
					>
					<ThemeSwitcher />
				</nav>

				<!-- One SearchDialog subtree, always in the document (no display-class
				     toggling). AppBar.Trail is a flex row (see [data-part='trail'] in
				     @skeletonlabs/skeleton-common), so this single instance naturally
				     sits at the right edge next to ThemeSwitcher on lg (the `nav` above
				     collapses to zero width below lg) and next to the hamburger below
				     lg — no forked trigger/content halves needed. -->
				<SearchDialog />

				<!-- Mobile keeps the primary IA short. On content routes, SiteNav adds
				     only the current section's entries instead of repeating the entire
				     library tree inside every drawer. -->
				<button
					type="button"
					class="hover:bg-surface-200-800 inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm p-2 lg:hidden"
					aria-label="Open navigation"
					onclick={() => (mobileOpen = true)}
				>
					<Menu class="h-5 w-5" />
				</button>
				<BindableDrawer bind:open={mobileOpen} title={SITE_NAME}>
					<nav aria-label="Primary" class="mb-6 space-y-0.5 text-sm">
						{#each PRIMARY_NAV_LINKS as link (link.href)}
							{@const current = primaryNavState(page.url.pathname, link)}
							<a
								href={link.href}
								aria-current={current}
								onclick={() => (mobileOpen = false)}
								class="flex min-h-11 items-center rounded-sm px-2 py-1.5 {current
									? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
									: 'hover:bg-surface-200-800'}">{link.label}</a
							>
						{/each}
						<a
							href={CODESPACES_URL}
							target="_blank"
							rel="noopener"
							onclick={() => (mobileOpen = false)}
							class="bg-primary-500 hover:bg-primary-600 mt-1 inline-flex min-h-11 w-fit items-center rounded-md px-3 py-1.5 font-semibold text-white transition-colors"
							aria-label="Start a practice rep in GitHub Codespaces">Start</a
						>
					</nav>
					{#if showMobileSectionNav}
						<div class="border-surface-200-800 border-t pt-5">
							<SiteNav currentSectionOnly onNavigate={() => (mobileOpen = false)} />
						</div>
					{/if}
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

	<footer
		id="contact"
		class="border-surface-200-800 bg-surface-100-900/80 mt-16 border-t backdrop-blur-sm"
		data-pagefind-ignore
	>
		<div class="container mx-auto flex flex-col gap-4 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between">
			<div>
				<p class="text-surface-700-300">
					Editor-first interview practice. Content is tracked in git, and every packet page links to its source.
				</p>
				<!-- Build provenance: only rendered when the build actually knows its
				     own commit (CI, or a local build run from a git checkout) — see
				     $lib/build-info's fail-quiet contract. Degrades to nothing rather
				     than a broken link on a build that can't resolve a sha. -->
				{#if buildShaShort}
					<p class="text-surface-500 mt-2 text-xs">
						built from
						<a
							href={`${SITE_REPO_URL}/commit/${buildSha}`}
							target="_blank"
							rel="noopener"
							class="hover:text-primary-500 inline-flex min-h-11 items-center font-mono transition-colors"
							aria-label={`source commit ${buildShaShort} on GitHub`}>{buildShaShort}</a
						>
					</p>
				{/if}
			</div>
			<nav class="flex flex-wrap gap-4" aria-label="Footer">
				<a
					href={REPO_URL}
					target="_blank"
					rel="noopener"
					class="hover:text-primary-500 inline-flex min-h-11 items-center transition-colors">Study packet</a
				>
				<a
					href={SECURITY_URL}
					target="_blank"
					rel="noopener"
					class="hover:text-primary-500 inline-flex min-h-11 items-center transition-colors">Security</a
				>
			</nav>
		</div>
	</footer>
</div>
