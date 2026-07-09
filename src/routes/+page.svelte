<script lang="ts">
	import { REPO_SLUG, REPO_URL } from '$lib/repo';

	const brand = {
		eyebrow: 'Practice interviews with a resident agent interviewer',
		domain: 'The DSA Woodshed',
		tagline: 'Woodshedding for the whiteboard',
	};

	// Every outbound URL here targets the CONTENT repo (Jesssullivan/dsa-study-packet)
	// — the Codespace, the booklet release, and the self-hosting thread all live
	// there — so they derive from $lib/repo.ts instead of hand-inlining the org/repo
	// string three more times.
	const CODESPACES_URL = `https://codespaces.new/${REPO_SLUG}`;
	const BOOKLET_URL = `${REPO_URL}/releases/latest/download/booklet.pdf`;
	const SELF_HOSTING_ISSUE_URL = `${REPO_URL}/issues/49`;

	const ctas = [
		{
			label: 'Start a practice session',
			href: CODESPACES_URL,
			caption: 'Opens GitHub Codespaces — the free tier works; the interviewer greets you in the terminal.',
			variant: 'primary' as const,
			external: true,
		},
		{
			label: 'Print the booklet',
			href: BOOKLET_URL,
			caption: 'The bound PDF: every reference sheet, made for paper.',
			variant: 'outline' as const,
			external: true,
		},
		{
			label: 'Why this works',
			href: '/guide/interview-practice-evidence',
			caption: 'The evidence behind the practice loop.',
			variant: 'link' as const,
			external: false,
		},
	];

	const regulationCards = [
		{
			title: 'A racing heart is preparation',
			body: "That surge is your body delivering oxygen for thinking — it's preparation, not danger. Naming it that way, out loud, measurably improves performance under pressure.",
		},
		{
			title: 'Four sighs, thirty seconds',
			body: 'The arrival reset: a double inhale through the nose, then a long exhale, four times. The fastest known lever on a stressed nervous system — offered once per session, and "no" is always accepted without comment.',
		},
		{
			title: 'Narrated stuck beats silent stuck',
			body: 'In a timed rep, a stuck moment you narrate passes — "I\'m blanking for a second" is a passing answer. Going silent is the only failure, and your interviewer will prompt you back before it counts.',
		},
	];

	const transcript = [
		{
			speaker: 'interviewer',
			text: 'Where do you want to work today — talk a problem through with no clock, write your reasoning as comments in the editor, or a timed board-style rep?',
		},
		{ speaker: 'you', text: "No clock. It's my first time here." },
		{
			speaker: 'interviewer',
			text: 'Good call. Two Sum, no code required — just tell me what the problem is asking in your own words.',
		},
		{
			speaker: 'you',
			text: "Find two numbers in an array that add to a target… I think I'd check every pair? That's O(n²) and it feels wrong—",
		},
		{
			speaker: 'interviewer',
			text: "It's not wrong, it's a baseline. Say it like that: \"brute force is n squared, and here's what I'd trade to beat it.\"",
		},
		{ speaker: 'you', text: 'Okay — a hash map. One pass, check for the complement as I go.' },
		{
			speaker: 'interviewer',
			text: "That's the whole move. Walk me through [3, 1, 4] with target 5, and we're done for today — one clean rep is the win.",
		},
	];

	const firstTenMinutes = [
		'Click Start. The container builds in about two minutes — no account setup beyond GitHub, no secrets required.',
		'Say the line: "Start my first practice rep." The interviewer is already in your terminal (or one command away — the welcome banner shows exactly which).',
		'Answer one placement question. No menu, no clock unless you ask for one. First sessions always start conversational.',
		"Talk, don't grind. Stop clean: one thing that worked, one fix, done. Tomorrow's draw is already queued.",
	];

	const library = [
		{
			title: 'Guide',
			href: '/guide/interview-practice-evidence',
			body: 'The evidence, getting started, learning paths, and practicing locally.',
		},
		{
			title: 'Reference sheets',
			href: '/reference',
			body: 'Eleven copy-ready sheets, from Big-O to the 14-day ramp.',
		},
		{
			title: 'Algorithms',
			href: '/algorithms',
			body: 'Seventy worked implementations with complexity walkthroughs.',
		},
	];

	const ctaClasses = {
		primary:
			'bg-primary-500 hover:bg-primary-600 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors',
		outline:
			'border-surface-200-800 hover:border-primary-500 hover:text-primary-600 inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors',
		link: 'text-primary-600 hover:text-primary-700 inline-flex items-center py-2.5 text-sm font-semibold underline-offset-2 hover:underline',
	} as const;
</script>

<main class="mx-auto max-w-5xl px-6 py-16 md:py-24" data-pagefind-body>
	<header class="max-w-3xl space-y-4">
		<p class="text-surface-500 text-xs tracking-widest uppercase">{brand.eyebrow}</p>
		<h1 class="text-4xl leading-tight font-bold md:text-5xl">{brand.domain}</h1>
		<p class="text-primary-600 text-xl">{brand.tagline}</p>
		<div class="text-surface-700 dark:text-surface-300 space-y-4 text-lg leading-relaxed">
			<p>
				A musician doesn't get better by playing more songs — they take the one bar that keeps falling apart into the
				woodshed, slow it down, and repeat it until it's clean. This is that room for technical interviews: a resident
				interviewer — kind, exacting, real-world-accurate — helps you isolate the one weak passage and drill it at the
				tempo your nerves can hold.
			</p>
			<p>
				It trains one thing: confident, non-panicked reasoning out loud under observation. Your interviewer checks that
				you showed your work — never that you were a genius.
			</p>
		</div>

		<div class="flex flex-col flex-wrap gap-6 pt-2 sm:flex-row sm:items-start">
			{#each ctas as cta (cta.label)}
				<div class="max-w-[22rem]">
					<a
						href={cta.href}
						class={ctaClasses[cta.variant]}
						target={cta.external ? '_blank' : undefined}
						rel={cta.external ? 'noopener' : undefined}>{cta.label}</a
					>
					<p class="text-surface-500 mt-2 text-xs leading-relaxed">{cta.caption}</p>
				</div>
			{/each}
		</div>
	</header>

	<section id="how-not-to-panic" class="mt-16 border-t border-surface-200-800 pt-12" aria-label="How not to panic">
		<h2 class="text-2xl font-bold">How not to panic</h2>
		<p class="text-surface-700-300 mt-3 max-w-2xl text-base leading-relaxed">
			The first thing your interviewer offers is not a problem — it's regulation. None of it is ever scored, streaked,
			or logged.
		</p>
		<div class="mt-8 grid gap-4 md:grid-cols-3">
			{#each regulationCards as card (card.title)}
				<div class="border-surface-200-800 bg-surface-50-950/75 rounded-lg border p-5">
					<h3 class="text-base font-semibold">{card.title}</h3>
					<p class="text-surface-700-300 mt-2 text-sm leading-relaxed">{card.body}</p>
				</div>
			{/each}
		</div>
		<p class="text-surface-500 mt-6 text-sm leading-relaxed">
			No streaks. No badges. No solve counts. Nobody reads your worry-dump. Taking a hint is engagement, not failure.
		</p>
	</section>

	<section
		id="first-session"
		class="mt-16 border-t border-surface-200-800 pt-12"
		aria-label="What a first session sounds like"
	>
		<h2 class="text-2xl font-bold">What a first session sounds like</h2>
		<div class="border-surface-200-800 bg-surface-100-900 mt-6 rounded-lg border p-5 md:p-6">
			<p class="text-surface-500 mb-4 text-xs tracking-wide uppercase">Illustrative — the interviewer adapts to you.</p>
			<div class="space-y-3 font-mono text-sm leading-relaxed md:text-[0.9rem]">
				{#each transcript as line, i (i)}
					<p>
						<span
							class={line.speaker === 'interviewer'
								? 'text-primary-600 dark:text-primary-400 font-semibold'
								: 'text-secondary-600 dark:text-secondary-400 font-semibold'}>{line.speaker}:</span
						>
						<span class="text-surface-800-200">{line.text}</span>
					</p>
				{/each}
			</div>
		</div>
	</section>

	<section
		id="first-ten-minutes"
		class="mt-16 border-t border-surface-200-800 pt-12"
		aria-label="Your first ten minutes"
	>
		<h2 class="text-2xl font-bold">Your first ten minutes</h2>
		<ol class="text-surface-700-300 mt-6 max-w-2xl list-decimal space-y-3 pl-5 text-base leading-relaxed">
			{#each firstTenMinutes as step, i (i)}
				<li>{step}</li>
			{/each}
		</ol>
		<p class="text-surface-500 mt-6 text-sm leading-relaxed">
			Paper at your side helps — <a href={BOOKLET_URL} class="hover:text-primary-600 underline underline-offset-2"
				>print the booklet</a
			> before you start.
		</p>
	</section>

	<section id="library" class="mt-16 border-t border-surface-200-800 pt-12" aria-label="The library">
		<h2 class="text-2xl font-bold">The library</h2>
		<p class="text-surface-700-300 mt-3 max-w-2xl text-base leading-relaxed">
			Everything the interviewer draws on is readable and searchable here — and every page links back to its source in
			git.
		</p>
		<div class="mt-8 grid gap-3 md:grid-cols-3">
			{#each library as item (item.title)}
				<a
					class="border-surface-200-800 bg-surface-50-950/75 hover:border-primary-500 block rounded-lg border p-5 transition-colors"
					href={item.href}
					aria-label={item.title}
				>
					<h3 class="text-base font-semibold">{item.title}</h3>
					<p class="text-surface-700-300 mt-2 text-sm leading-relaxed">{item.body}</p>
				</a>
			{/each}
		</div>
	</section>

	<section id="portability" class="mt-16 border-t border-surface-200-800 pt-12" aria-label="Anywhere a terminal lives">
		<h2 class="text-2xl font-bold">Anywhere a terminal lives</h2>
		<p class="text-surface-700-300 mt-3 max-w-2xl text-base leading-relaxed">
			The interviewer is a CLI in a real shell, never an IDE-extension lock-in — which means the same session runs in
			GitHub Codespaces today, in local VS Code or a bare clone right now, and in self-hosted environments as they land.
			That includes models you host yourself: terminal agents take endpoint overrides out of the box.
		</p>
		<div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
			<a href="/guide/local-practice" class="hover:text-primary-600 font-medium underline-offset-2 hover:underline"
				>Practice locally</a
			>
			<a
				href={SELF_HOSTING_ISSUE_URL}
				class="hover:text-primary-600 font-medium underline-offset-2 hover:underline"
				target="_blank"
				rel="noopener">The self-hosting thread</a
			>
		</div>
	</section>

	<footer class="text-surface-500 mt-16 border-t border-surface-200-800 pt-8 text-sm">
		The interviewer's persona, the sheets, and this site are generated from one public source tree — propose an edit
		from any page.
	</footer>
</main>
