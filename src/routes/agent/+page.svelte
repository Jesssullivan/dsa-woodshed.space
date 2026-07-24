<script lang="ts">
	import { blobUrl, REPO_URL } from '$lib/repo';

	const AGENTS_URL = blobUrl('AGENTS.md');
	const TRACK_CONTRACT_URL = blobUrl('TRACK-CONTRACT.md');
	const COPILOT_INSTRUCTIONS_URL = blobUrl('.github/copilot-instructions.md');
</script>

<main class="mx-auto max-w-5xl px-6 py-16 md:py-24" data-pagefind-body>
	<header class="max-w-4xl">
		<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">For agents</p>
		<h1 class="mt-3 max-w-3xl text-4xl leading-tight font-bold md:text-6xl">Read this first</h1>
		<p class="text-surface-700-300 mt-6 max-w-2xl text-xl leading-relaxed font-semibold">
			This site is a reading surface. The practice contract, the command surface, and the machine keys below all live in
			the content repository; this page is a flat pointer to them, not a restatement.
		</p>
	</header>

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="read-order">
		<h2 id="read-order" class="text-2xl font-bold">Read order</h2>
		<p class="text-surface-700-300 mt-3 max-w-2xl leading-relaxed">
			Landing cold on either repository, read in this order before doing anything else.
		</p>
		<ol class="mt-6 max-w-2xl list-decimal space-y-3 pl-5 text-sm">
			<li>
				<a
					href={AGENTS_URL}
					target="_blank"
					rel="noopener"
					class="editorial-link text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
					>AGENTS.md</a
				>
				<span class="text-surface-700-300">: the practice and repository contract.</span>
			</li>
			<li>
				<a
					href={TRACK_CONTRACT_URL}
					target="_blank"
					rel="noopener"
					class="editorial-link text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
					>TRACK-CONTRACT.md</a
				>
				<span class="text-surface-700-300">: per-language track requirements.</span>
			</li>
			<li><span class="text-surface-700-300">This page.</span></li>
		</ol>
	</section>

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="command-surface">
		<h2 id="command-surface" class="text-2xl font-bold">Command surface</h2>
		<p class="text-surface-700-300 mt-3 max-w-2xl leading-relaxed">
			<code>just</code> is the only front door, run inside a checkout of the content repository (typically GitHub Codespaces),
			never on this site.
		</p>
		<ul class="mt-6 max-w-2xl space-y-2 text-sm">
			<li><code>just practice-start comments|reacto|clarp|umpire</code></li>
			<li><code>just practice-next</code></li>
			<li><code>just practice-test</code></li>
			<li><code>just practice-watch</code></li>
			<li><code>just practice-repl</code></li>
			<li><code>just practice-finish "&lt;one concrete fix&gt;"</code></li>
			<li><code>just interview</code></li>
			<li><code>just catalog "&lt;their words&gt;"</code></li>
		</ul>
	</section>

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="machine-keys">
		<h2 id="machine-keys" class="text-2xl font-bold">Machine keys</h2>
		<p class="text-surface-700-300 mt-3 max-w-2xl leading-relaxed">
			Relayed verbatim between the interviewer persona and the candidate, never inferred or paraphrased.
		</p>
		<ul class="mt-6 max-w-2xl space-y-2 text-sm">
			<li>
				<code>STATE</code>, <code>START</code>, <code>QUEUE</code>, <code>MATCH</code>, <code>CHOOSE</code>,
				<code>SUGGEST</code>
				<span class="text-surface-700-300">: <code>just catalog</code> output.</span>
			</li>
			<li>
				<code>READY</code>, <code>NOT_FOUND</code>
				<span class="text-surface-700-300">: catalog resolution outcomes.</span>
			</li>
			<li>
				<code>NEXT</code>
				<span class="text-surface-700-300">: <code>just practice-next</code> progress relay.</span>
			</li>
			<li>
				<code>PRACTICE: topic/problem</code>
				<span class="text-surface-700-300">: a <code>just interview</code> draw.</span>
			</li>
		</ul>
	</section>

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="what-never-happens">
		<h2 id="what-never-happens" class="text-2xl font-bold">What never happens</h2>
		<ul class="mt-6 max-w-2xl space-y-3 text-sm">
			<li class="text-surface-700-300">Writing, editing, or solving candidate-owned source or test files.</li>
			<li class="text-surface-700-300">Reading, scoring, or logging private arrival writing.</li>
			<li class="text-surface-700-300">
				Guessing or searching the tree for a named problem instead of resolving it through <code>just catalog</code> first.
			</li>
			<li class="text-surface-700-300">
				Estate or employer coupling: both the content repository and this site stay public and company-neutral.
			</li>
		</ul>
	</section>

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="start-or-read-further">
		<h2 id="start-or-read-further" class="text-2xl font-bold">Start or read further</h2>
		<ul class="mt-6 max-w-2xl space-y-4 text-sm">
			<li>
				<a
					href="/guide/getting-started"
					class="editorial-link text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
					>Getting started</a
				>
			</li>
			<li>
				<a
					href={AGENTS_URL}
					target="_blank"
					rel="noopener"
					class="editorial-link text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
					>AGENTS.md on GitHub</a
				>
			</li>
			<li>
				<a
					href={TRACK_CONTRACT_URL}
					target="_blank"
					rel="noopener"
					class="editorial-link text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
					>TRACK-CONTRACT.md on GitHub</a
				>
			</li>
			<li>
				<a
					href={COPILOT_INSTRUCTIONS_URL}
					target="_blank"
					rel="noopener"
					class="editorial-link text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
					>copilot-instructions.md on GitHub</a
				>
			</li>
			<li>
				<a
					href={REPO_URL}
					target="_blank"
					rel="noopener"
					class="editorial-link text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
					>dsa-study-packet on GitHub</a
				>
			</li>
			<li>
				<a
					href="/llms.txt"
					class="editorial-link text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
					>llms.txt</a
				>
				<span class="text-surface-700-300"> and </span>
				<a
					href="/agent-map.md"
					class="editorial-link text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
					>agent-map.md</a
				>
			</li>
		</ul>
	</section>
</main>
