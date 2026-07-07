<script lang="ts">
	// mdsvex .svx lane: the content page is compiled to a Svelte component at
	// build time (see svelte.config.js). `metadata` is its YAML frontmatter.
	import SourceLink from '$lib/components/SourceLink.svelte';
	import Content, { metadata } from '$content/guide/interview-practice-evidence.svx';

	// The canonical source lives in the content repo (Jesssullivan/dsa-study-packet).
	const sourcePath = 'docs/guide/interview-practice-evidence.md';
	const title = (metadata.title as string) ?? 'Interview practice evidence';
</script>

<svelte:head>
	<title>{title} — The DSA Woodshed</title>
	<meta
		name="description"
		content="Why a good practice block is built from cold retrieval, think-aloud reps, observation stress, and tape review."
	/>
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-16">
	<article class="prose max-w-none">
		<Content />
	</article>
	<SourceLink {sourcePath} />
</main>
