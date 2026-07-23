<!-- The static not-found surface: prerendered to build/404.html (no adapter
     fallback shell — see svelte.config.js), which GitHub Pages serves for any
     unknown URL. Full HTML with the site layout, so it reads without JS.
     Client-side navigation misses render src/routes/+error.svelte instead. -->

<main class="mx-auto max-w-3xl px-6 py-16">
	<p class="text-surface-500 text-xs tracking-widest uppercase">404</p>
	<h1 class="mt-2 text-3xl font-bold">Page not found</h1>
	<p class="text-surface-700 dark:text-surface-300 mt-3 leading-relaxed">
		Nothing lives at this address. The link may be stale, or the page may have moved when content was reorganized.
	</p>
	<ul class="mt-8 space-y-3 text-sm">
		<li>
			<a class="hover:text-primary-500 font-medium underline-offset-2 hover:underline" href="/">Back to the home page</a
			>
		</li>
		<li>
			<a class="hover:text-primary-500 font-medium underline-offset-2 hover:underline" href="/reference"
				>Browse the reference sheets</a
			>
		</li>
		<li>
			<a class="hover:text-primary-500 font-medium underline-offset-2 hover:underline" href="/algorithms"
				>Browse the algorithms</a
			>
		</li>
	</ul>
</main>
