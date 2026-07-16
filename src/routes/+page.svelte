<script lang="ts">
	import { REPO_SLUG } from '$lib/repo';

	const CODESPACES_URL = `https://codespaces.new/${REPO_SLUG}?quickstart=1`;

	const modes = [
		{
			command: '/reacto',
			labels: 'Repeat, Examples, Approach, Code, Test, Optimize',
		},
		{
			command: '/clarp',
			labels: 'Clarify, Lay out, Attack, Run, Polish',
		},
		{
			command: '/umpire',
			labels: 'Understand, Match, Plan, Implement, Review, Evaluate',
		},
		{
			command: '/comments',
			labels: 'Restate, Example, Invariant, Approach, Tests, Complexity',
		},
	];

	const steps = [
		{
			title: 'Choose a comment format',
			body: 'Enter one slash command. With no arguments, it draws the next due problem.',
		},
		{
			title: 'Show the thinking',
			body: 'Fill the reasoning comments, save, and remove the THINKING GATE yourself.',
		},
		{
			title: 'Build and test',
			body: 'Implement in your private workspace and add focused cases in your test file.',
		},
		{
			title: 'Keep one correction',
			body: 'Use /continue for the next instruction, run the focused tests, and finish with one fix.',
		},
	];

	const library = [
		{
			title: 'Algorithm Library',
			href: '/algorithms',
			body: 'Complete implementations and complexity notes to review after a rep.',
		},
		{
			title: 'Reference Sheets',
			href: '/reference',
			body: 'Compact lookups for Python, patterns, data structures, and interview method.',
		},
		{
			title: 'Advanced Exercises',
			href: '/practice',
			body: 'Code-reading and decomposition practice for practical engineering rounds.',
		},
		{
			title: 'Printables',
			href: '/printables',
			body: 'The booklet and individual sheets for offline review.',
		},
	];
</script>

<main class="mx-auto max-w-5xl px-6 py-16 md:py-24" data-pagefind-body>
	<header class="max-w-4xl">
		<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">Editor-first interview practice</p>
		<h1 class="mt-3 max-w-3xl text-4xl leading-tight font-bold md:text-6xl">
			Think in comments. Build in code. Prove it with tests.
		</h1>
		<p class="text-surface-700-300 mt-6 max-w-2xl text-lg leading-relaxed">
			The DSA Woodshed turns each technical interview problem into a focused editor rep. A resident interviewer keeps
			the session moving, but the reasoning, implementation, and tests stay yours.
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
				href="/challenges"
				class="border-surface-200-800 hover:border-primary-500 hover:text-primary-600 inline-flex w-fit items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold transition-colors"
			>
				Browse Practice Drills
			</a>
			<a
				href="/guide/getting-started"
				class="text-primary-600 hover:text-primary-700 inline-flex w-fit px-2 py-3 text-sm font-semibold underline-offset-2 hover:underline"
			>
				Read the method
			</a>
		</div>
		<p class="text-surface-500 mt-3 text-sm">No separate agent CLI or repository API key is required.</p>
	</header>

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="choose-mode">
		<div class="max-w-2xl">
			<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">Your first choice</p>
			<h2 id="choose-mode" class="mt-2 text-2xl font-bold">Pick the labels that help you think</h2>
			<p class="text-surface-700-300 mt-3 leading-relaxed">
				Open Copilot Chat and enter one command. All four commands run the same practice loop with different comment
				headings.
			</p>
		</div>
		<dl class="border-surface-200-800 mt-8 divide-y divide-surface-200-800 border-y">
			{#each modes as mode (mode.command)}
				<div class="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-6">
					<dt class="text-primary-600 font-mono font-semibold">{mode.command}</dt>
					<dd class="text-surface-700-300 text-sm leading-relaxed">{mode.labels}</dd>
				</div>
			{/each}
		</dl>
		<p class="text-surface-500 mt-4 text-sm">
			Add a problem when you want one directly, for example <code>/reacto arrays two_sum</code>.
		</p>
	</section>

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="rep-loop">
		<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">One clean loop</p>
		<h2 id="rep-loop" class="mt-2 text-2xl font-bold">How a rep works</h2>
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
			<p class="font-semibold">The agent conducts; you do the work.</p>
			<p class="text-surface-700-300 mt-2">
				It can open the current files, report the next state, run the focused tests, and ask interview questions. It
				does not write your solution, tests, or gate. Your workspace stays gitignored.
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
		<div class="mt-8 grid gap-4 md:grid-cols-2">
			{#each library as item (item.href)}
				<a
					href={item.href}
					class="border-surface-200-800 bg-surface-50-950/75 hover:border-primary-500 block rounded-lg border p-5 transition-colors"
				>
					<h3 class="font-semibold">{item.title}</h3>
					<p class="text-surface-700-300 mt-2 text-sm leading-relaxed">{item.body}</p>
				</a>
			{/each}
		</div>
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
