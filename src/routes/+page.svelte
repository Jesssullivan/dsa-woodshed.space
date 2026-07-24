<script lang="ts">
	import { REPO_SLUG } from '$lib/repo';

	const CODESPACES_URL = `https://codespaces.new/${REPO_SLUG}?quickstart=1`;
	const BOOKLET_URL = '/printables';

	const steps = [
		{
			title: 'Write the thinking',
			body: "Restate the problem, work an example, and name an approach in comments or the function's docstring.",
		},
		{
			title: 'Build and test',
			body: 'Implement in your private, gitignored workspace and add focused cases to your test file.',
		},
		{
			title: 'Reconcile the receipt',
			body: 'Run the focused tests; a failed, stale, or missing run asks you to trace, revise, and rerun.',
		},
		{
			title: 'Keep one correction',
			body: 'Say /continue for the next instruction and finish with one fix.',
		},
	];

	const libraryLinks = [
		{
			title: 'Printables',
			href: '/printables',
		},
		{
			title: 'Algorithm Library',
			href: '/algorithms',
		},
		{
			title: 'Reference Sheets',
			href: '/reference',
		},
		{
			title: 'Extended problems',
			href: '/challenges#extended-problems',
		},
	];
</script>

<main class="mx-auto max-w-5xl px-6 py-16 md:py-24" data-pagefind-body>
	<header class="max-w-4xl">
		<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">The DSA Woodshed</p>
		<h1 class="mt-3 max-w-3xl text-4xl leading-tight font-bold md:text-6xl">Woodshedding for the whiteboard.</h1>
		<p class="text-surface-700-300 mt-6 max-w-2xl text-xl leading-relaxed font-semibold">
			Musicians woodshed: practice the hard passages alone until the performance holds under pressure. This is that room
			for technical interviews: real problems, real code, and a resident interviewer, one click from the browser.
		</p>
		<p class="text-surface-700-300 mt-4 max-w-2xl text-lg leading-relaxed">
			You reason in ordinary <code>#</code> comments and docstrings, in the file you are solving. The interviewer checks
			visible work through a deterministic <code>just</code> contract: it reads what you wrote, requires no format, and never
			writes your solution or tests. The Python track ships 43 core problems, a printable booklet, and reference sheets.
		</p>

		<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
			<a
				href={CODESPACES_URL}
				target="_blank"
				rel="noopener"
				class="bg-primary-500 hover:bg-primary-600 inline-flex w-fit items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-white transition-colors"
			>
				Start in Codespaces
			</a>
			<a
				href={BOOKLET_URL}
				class="border-surface-200-800 hover:border-primary-500 hover:text-primary-600 inline-flex w-fit items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold transition-colors"
			>
				Read the booklet
			</a>
			<a
				href="/guide/getting-started"
				class="text-primary-600 hover:text-primary-700 inline-flex w-fit px-2 py-3 text-sm font-semibold underline-offset-2 hover:underline"
			>
				How it works
			</a>
		</div>
		<p class="text-surface-500 mt-3 text-sm">No separate agent CLI or repository API key is required.</p>
	</header>

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="choose-mode">
		<div class="max-w-2xl">
			<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">The default</p>
			<h2 id="choose-mode" class="mt-2 text-2xl font-bold">Start with ordinary comments</h2>
			<p class="text-surface-700-300 mt-3 leading-relaxed">
				Enter <code>/comments</code> in Copilot Chat to start a rep, then write your reasoning in the source file:
				<code>#</code> comments and docstrings, the way you would write them anyway. There are no required prefixes or labels.
				The interviewer reads and understands what you wrote; you never format comments for its sake.
			</p>
			<p class="text-surface-500 mt-4 text-sm">
				Name a problem and its source and test files open at once, for example <code>/comments arrays two_sum</code>. If
				named vocabulary helps you think, <code>/reacto</code>, <code>/clarp</code>, and <code>/umpire</code> start the same
				loop with optional labels.
			</p>
		</div>
	</section>

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="rep-loop">
		<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">One clean loop</p>
		<h2 id="rep-loop" class="mt-2 text-2xl font-bold">How a rep works</h2>
		<p class="text-surface-700-300 mt-3 max-w-2xl leading-relaxed">
			With nothing named, the interviewer draws the next due problem. Either way, every rep is the same four movements.
		</p>
		<ol
			class="border-surface-200-800 mt-8 list-decimal divide-y divide-surface-200-800 border-y pl-8 marker:font-mono marker:font-semibold marker:text-primary-600"
		>
			{#each steps as step (step.title)}
				<li class="py-5 pl-2">
					<h3 class="text-lg font-semibold">{step.title}</h3>
					<p class="text-surface-700-300 mt-2 text-sm leading-relaxed">{step.body}</p>
				</li>
			{/each}
		</ol>
		<div class="bg-surface-100-900 mt-6 rounded-lg p-5 text-sm leading-relaxed">
			<p class="font-semibold">The interviewer conducts; you do the work.</p>
			<p class="text-surface-700-300 mt-2">
				It opens the problem's files, reports the next state, runs the focused tests, and asks interview questions
				through the same <code>just</code> contract. It does not write your solution or tests.
			</p>
		</div>
	</section>

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="why-woodshed">
		<div class="max-w-2xl">
			<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">The point</p>
			<h2 id="why-woodshed" class="mt-2 text-2xl font-bold">Practice the performance, not just the algorithms</h2>
			<p class="text-surface-700-300 mt-3 leading-relaxed">
				An interview is a performance under observation: a clock, a stranger, a whiteboard, no compiler. Most
				preparation repeats the material and leaves the performing untrained, so panic gets the first word in the room.
			</p>
			<p class="text-surface-700-300 mt-4 leading-relaxed">
				There is no whiteboard in a Codespace; your comments are the whiteboard. Narrating your reasoning as you code,
				in a room where nothing is at stake, builds the habit that holds when everything is. It is also simply good
				engineering: clear, succinct, accurate comments, written while you work. The ritual is arcane; your engineering
				is the music. The Woodshed exists so the music comes through.
			</p>
		</div>
	</section>

	<section id="library" class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="library-heading">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">Review with a purpose</p>
				<h2 id="library-heading" class="mt-2 text-2xl font-bold">Library</h2>
			</div>
			<a href="/library" class="text-primary-600 text-sm font-semibold underline-offset-2 hover:underline"
				>See the full library</a
			>
		</div>
		<p class="text-surface-700-300 mt-4 max-w-2xl leading-relaxed">
			Review complete solutions only after a rep exposes a gap, or take a printable sheet away from the screen.
		</p>
		<nav class="mt-5 flex flex-wrap gap-x-6 gap-y-1" aria-label="Library shortcuts">
			{#each libraryLinks as item (item.href)}
				<a
					href={item.href}
					class="editorial-link text-primary-600 hover:text-primary-700 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-2"
				>
					{item.title}
				</a>
			{/each}
		</nav>
	</section>

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="other-surfaces">
		<h2 id="other-surfaces" class="text-2xl font-bold">Match the surface to the skill</h2>
		<p class="text-surface-700-300 mt-3 max-w-2xl leading-relaxed">
			Editor reps are the default. Ask for an untimed conversation when you need to slow down and form a plan. Choose a
			timed board-style rep when narration under a clock is the skill you intend to train.
		</p>
		<p class="text-surface-500 mt-4 text-sm">
			Prefer local VS Code or no agent at all? The same workflow runs through the documented
			<a href="/guide/local-practice" class="editorial-link hover:text-primary-600 underline underline-offset-2"
				>just recipes</a
			>.
		</p>
	</section>
</main>
