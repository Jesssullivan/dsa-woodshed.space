<script lang="ts">
	import { sheetsInOrder } from '$lib/docs/registry';

	const brand = {
		domain: 'The DSA Woodshed',
		tagline: 'Woodshedding for the whiteboard',
		blurb:
			'A calm reading surface for the DSA study packet: the evidence behind a good practice block, and copy-ready algorithm reference sheets. Every page is tracked in git and links back to its source so you can propose an edit.',
		tier: 'A reading surface for the DSA study packet',
	};

	const surfaces = [
		{
			title: 'Interview practice evidence',
			body: 'Why the daily loop is built from cold retrieval, think-aloud reps, observation stress, tape review, and short targeted refreshers — not passive video.',
			href: '/guide/interview-practice-evidence',
		},
		{
			title: 'Reference sheets',
			body: 'Copy-ready templates and the recurring shapes of interview problems, rendered from the study packet reference sheets.',
			href: '/reference',
		},
	];

	const sheets = sheetsInOrder();
</script>

<svelte:head>
	<title>The DSA Woodshed — a reading surface for the DSA study packet</title>
	<meta name="description" content={brand.blurb} />
</svelte:head>

<main class="mx-auto max-w-5xl px-6 py-16 md:py-24">
	<header class="max-w-3xl space-y-4">
		<p class="text-surface-500 text-xs tracking-widest uppercase">{brand.tier}</p>
		<h1 class="text-4xl leading-tight font-bold md:text-5xl">{brand.domain}</h1>
		<p class="text-primary-600 text-xl">{brand.tagline}</p>
		<p class="text-surface-700 dark:text-surface-300 text-lg leading-relaxed">
			{brand.blurb}
		</p>
	</header>

	<section class="mt-12 grid gap-3 md:grid-cols-2" aria-label="Reading surfaces">
		{#each surfaces as surface (surface.title)}
			<a
				class="border-surface-200-800 bg-surface-50-950/75 hover:border-primary-500 block rounded-lg border p-5 transition-colors"
				href={surface.href}
				aria-label={surface.title}
			>
				<h2 class="text-lg font-semibold">{surface.title}</h2>
				<p class="text-surface-700-300 mt-3 text-sm leading-relaxed">{surface.body}</p>
			</a>
		{/each}
	</section>

	<section class="mt-12 border-y border-surface-200-800 py-8" aria-label="Reference sheets">
		<h2 class="text-surface-500 text-xs tracking-widest uppercase">Reference sheets</h2>
		<ul class="mt-4 grid gap-3 md:grid-cols-2">
			{#each sheets as sheet (sheet.slug)}
				<li>
					<a
						class="hover:text-primary-500 font-medium underline-offset-2 hover:underline"
						href="/reference/{sheet.slug}">{sheet.title}</a
					>
					<p class="text-surface-600-400 mt-1 text-sm leading-relaxed">{sheet.summary}</p>
				</li>
			{/each}
		</ul>
	</section>

	<footer class="text-surface-500 pt-12 text-sm">
		The prose and reference sheets are authored in the DSA study packet repository and rendered here as a static site.
	</footer>
</main>
