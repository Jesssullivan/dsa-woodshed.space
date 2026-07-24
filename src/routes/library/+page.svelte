<script lang="ts">
	const shelves = [
		{
			title: 'Algorithms',
			href: '/algorithms',
			body: 'Complete implementations grouped by pattern, with complexity notes and tests.',
		},
		{
			title: 'Reference Sheets',
			href: '/reference',
			body: 'Compact lookups for Python, data structures, patterns, complexity, and interview method.',
		},
		{
			title: 'Extended problems',
			href: '/challenges#extended-problems',
			body: 'Code-reading and decomposition exercises for practical engineering rounds.',
		},
		{
			title: 'Printables',
			href: '/printables',
			body: 'The booklet and individual sheets for offline review and board-style practice.',
		},
	];
</script>

<main class="mx-auto max-w-4xl px-6 py-16" data-pagefind-body>
	<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">Targeted review</p>
	<h1 class="mt-2 text-3xl font-bold">Library</h1>
	<p class="text-surface-700-300 mt-3 max-w-2xl leading-relaxed">
		Use the library after a rep exposes a gap. Complete solutions are references, not a substitute for writing the
		reasoning, code, and tests yourself.
	</p>

	<div class="mt-10 grid gap-4 sm:grid-cols-2">
		{#each shelves as shelf (shelf.href)}
			<a
				href={shelf.href}
				class="border-surface-200-800 bg-surface-50-950/75 hover:border-primary-500 block rounded-lg border p-6 transition-colors"
			>
				<h2 class="text-lg font-semibold">{shelf.title}</h2>
				<p class="text-surface-700-300 mt-2 text-sm leading-relaxed">{shelf.body}</p>
			</a>
		{/each}
	</div>
</main>
