<script lang="ts">
	import { REPO_SLUG } from '$lib/repo';

	const CODESPACES_URL = `https://codespaces.new/${REPO_SLUG}?quickstart=1`;
	const BOOKLET_URL = '/printables';

	const steps = [
		{
			title: 'Write the thinking',
			body: 'Use ordinary comments to restate the problem, work an example, and name an approach.',
		},
		{
			title: 'Open the gate',
			body: 'Save your comments and remove the THINKING GATE yourself when you are ready to code.',
		},
		{
			title: 'Build and test',
			body: 'Implement in your private, gitignored workspace and add focused cases to your test file.',
		},
		{
			title: 'Keep one correction',
			body: 'Say /continue for the next instruction, run the focused tests, and finish with one fix.',
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
			title: 'Advanced Exercises',
			href: '/practice',
		},
	];
</script>

<main class="mx-auto max-w-5xl px-6 py-16 md:py-24" data-pagefind-body>
	<header class="max-w-4xl">
		<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">The DSA Woodshed</p>
		<h1 class="mt-3 max-w-3xl text-4xl leading-tight font-bold md:text-6xl">Practice the interview in the editor.</h1>
		<p class="text-surface-700-300 mt-6 max-w-2xl text-xl leading-relaxed font-semibold">
			Open a Codespace and work in ordinary comments, real code, and focused tests with a resident interviewer.
		</p>
		<p class="text-surface-700-300 mt-4 max-w-2xl text-lg leading-relaxed">
			You own the reasoning, solution, and tests. The interviewer uses GitHub's native Copilot harness and a
			deterministic
			<code>just</code> contract designed to stay legible to lightweight models. The current Python track includes 43 core
			drills and 72 editor targets.
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
				Open Copilot Chat and enter <code>/comments</code>. Write comments the way you would in real code. There are no
				required prefixes or labels.
			</p>
			<p class="text-surface-500 mt-4 text-sm">
				Add a problem when you want one directly, for example <code>/comments arrays two_sum</code>. If named vocabulary
				already helps you think, <code>/reacto</code>, <code>/clarp</code>, and <code>/umpire</code> start the same loop with
				optional labels.
			</p>
		</div>
	</section>

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="rep-loop">
		<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">One clean loop</p>
		<h2 id="rep-loop" class="mt-2 text-2xl font-bold">How a rep works</h2>
		<p class="text-surface-700-300 mt-3 max-w-2xl leading-relaxed">
			Open Copilot Chat in the Codespace. With no arguments, a command draws the next due problem; add a topic and
			problem, for example <code>/comments arrays two_sum</code>, to choose one directly.
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
				It opens the current files, reports the next state, runs the focused tests, and asks interview questions through
				that same <code>just</code> command contract. It does not write your solution, tests, or gate.
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
