// Build-time Mermaid → SVG rendering for the raw markdown lane ($lib/docs/markdown.ts).
//
// WHY THIS EXISTS
//   The reference/guide sheets synced from the DSA study packet occasionally
//   embed a ```mermaid fence (currently: docs/guide/when-to-use-what.md's
//   decision tree). markdown.ts has no client-side diagram engine (a
//   zero-dependency constraint on the hand-rolled renderer itself — see its
//   header comment), so historically a mermaid fence rendered as its own
//   labelled source instead of a picture. This module renders the diagram to
//   an inline SVG at BUILD time via `mermaid-isomorphic` (which drives a real
//   Mermaid instance in a headless Playwright browser), so the shipped HTML
//   carries a real diagram and the client bundle gains zero new JS.
//
// SERVER/BUILD-ONLY
//   Every caller of this module is a `+page.server.ts` load (see the reference
//   and guide `[slug]` routes), which SvelteKit only ever executes on the
//   server / at prerender time. `mermaid-isomorphic` and `playwright` are
//   imported dynamically (mirroring the Shiki highlighter below in
//   markdown.ts) so neither — nor the headless Chromium they drive — is ever
//   part of the client module graph.
//
// FAILURE MODE
//   Rendering a diagram needs a Playwright Chromium binary on disk
//   (`pnpm exec playwright install chromium`; CI's runner image pre-bakes it).
//   If the package can't be imported, the browser can't launch, or a single
//   diagram's Mermaid syntax is invalid, this module NEVER throws past its own
//   boundary — every failure resolves to `null` for the affected diagram(s) so
//   the caller can fall back to the existing labelled-source figure. A bad or
//   unrenderable diagram must never fail the site build.

/** One Mermaid render outcome: the inline SVG markup, or `null` on any failure. */
export type MermaidRenderOutcome = string | null;

// Lazily created, reused across every diagram rendered in this build (the
// renderer's own browser instance is created on first use and closed again
// once its in-flight call count returns to zero — see mermaid-isomorphic's
// `createMermaidRenderer`). Held at module scope so multiple pages in the same
// prerender each pay the Chromium launch cost only if they truly overlap.
let rendererPromise: Promise<(diagrams: string[]) => Promise<PromiseSettledResult<{ svg: string }>[]>> | null = null;

function getRenderer() {
	rendererPromise ??= import('mermaid-isomorphic').then(({ createMermaidRenderer }) =>
		createMermaidRenderer({ launchOptions: { args: ['--no-sandbox'] } }),
	);
	return rendererPromise;
}

/**
 * Render a batch of Mermaid diagram sources to inline SVG. The returned array
 * has exactly one entry per input, in the same order; an entry is `null` when
 * that diagram could not be rendered (bad syntax, no browser available, or any
 * other failure) so the caller renders its existing fallback figure instead.
 *
 * Never rejects: a failure that would prevent rendering ANY diagram (e.g. the
 * package or browser is unavailable) degrades every entry to `null` rather
 * than throwing, so a doc with a mermaid fence never fails the site build.
 */
export async function renderMermaidDiagrams(diagrams: string[]): Promise<MermaidRenderOutcome[]> {
	if (diagrams.length === 0) return [];
	try {
		const render = await getRenderer();
		const results = await render(diagrams);
		return results.map((result) => (result.status === 'fulfilled' ? result.value.svg : null));
	} catch {
		return diagrams.map(() => null);
	}
}
