<script lang="ts">
	import { agentMapMetadata, sourceCommit } from '$lib/docs/registry';
	import { blobUrl, REPO_URL } from '$lib/repo';

	const AGENTS_URL = blobUrl('AGENTS.md');
	const AGENT_MAP_HREF = `/${agentMapMetadata.out.replace(/^static\//, '')}`;
	const AGENT_MAP_URL = `${REPO_URL}/blob/${sourceCommit}/${agentMapMetadata.input}`;
	const TRACK_CONTRACT_URL = blobUrl('TRACK-CONTRACT.md');
	const COPILOT_INSTRUCTIONS_URL = blobUrl('.github/copilot-instructions.md');
</script>

<main class="mx-auto max-w-5xl px-6 py-16 md:py-24" data-pagefind-body>
	<header class="max-w-4xl">
		<p class="text-primary-600 text-xs font-semibold tracking-widest uppercase">For agents</p>
		<h1 class="mt-3 max-w-3xl text-4xl leading-tight font-bold md:text-6xl">Read this first</h1>
		<p class="text-surface-700-300 mt-6 max-w-2xl text-xl leading-relaxed font-semibold">
			This site is a reading surface. The practice contract, command surface, and machine keys live in the content
			repository. This page points to that source instead of restating it.
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

	<section class="mt-20 border-t border-surface-200-800 pt-12" aria-labelledby="machine-map">
		<h2 id="machine-map" class="text-2xl font-bold">Live machine map</h2>
		<p class="text-surface-700-300 mt-3 max-w-2xl leading-relaxed">
			The command inventory and machine keys change with the packet. The same-origin copy below is regenerated from
			<code>agent-map.md</code> at the exact packet commit used for each site build.
		</p>
		<div class="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
			<a
				href={AGENT_MAP_HREF}
				class="editorial-link text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
				>Open the current agent map</a
			>
			<a
				href={AGENT_MAP_URL}
				target="_blank"
				rel="noopener"
				class="editorial-link text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2"
				>View its packet source</a
			>
		</div>
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
