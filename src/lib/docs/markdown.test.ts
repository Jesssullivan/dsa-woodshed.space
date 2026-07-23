import { beforeEach, describe, expect, it, vi } from 'vitest';

// Build-time Mermaid rendering (./mermaid.ts) drives a real headless browser,
// which is slow and — outside a machine with a Playwright Chromium install —
// not guaranteed to succeed at all. The renderMarkdown ⇄ mermaid.ts CONTRACT
// (extract a fence, call renderMermaidDiagrams, substitute an SVG figure on
// success or the labelled-source figure on `null`) is what these unit tests
// pin, so it's mocked here for determinism; the real render is exercised for
// real by the production build (docs/guide/when-to-use-what.md's decision
// tree), not by this fast unit suite.
const { renderMermaidDiagramsMock } = vi.hoisted(() => ({ renderMermaidDiagramsMock: vi.fn() }));
vi.mock('./mermaid', () => ({ renderMermaidDiagrams: renderMermaidDiagramsMock }));

import { extractHeadings, renderMarkdown, slugify } from './markdown';

// Contract for the dependency-free operator-docs markdown renderer (see the
// header of markdown.ts for why mdsvex is deliberately NOT reused here). These
// assertions lock the exact features the real docs/**/*.md tree relies on:
// tables (mdsvex ships none), fenced code, nested lists, blockquotes, the
// public-safe HTML-escaping that lets `<placeholder>` / `{expr}` render as
// literal text on a public site, and Shiki syntax highlighting of fenced code.
//
// renderMarkdown is async (Shiki's highlighter loads lazily), so every case
// awaits it.

beforeEach(() => {
	renderMermaidDiagramsMock.mockReset();
});

describe('renderMarkdown', () => {
	it('renders ATX headings with GitHub-style slug ids', async () => {
		expect(await renderMarkdown('## Purpose & non-goals')).toBe(
			'<h2 id="purpose-non-goals">Purpose &amp; non-goals</h2>',
		);
	});

	it('escapes angle-bracket placeholders and braces as literal text (public-safe)', async () => {
		const html = await renderMarkdown('Use `ci/lane/<name>` and set {expr} inline.');
		expect(html).toContain('<code>ci/lane/&lt;name&gt;</code>');
		expect(html).toContain('{expr}');
		expect(html).not.toContain('<name>');
	});

	it('never lets a javascript: URL through', async () => {
		const html = await renderMarkdown('[x](javascript:alert(1))');
		expect(html).not.toContain('javascript:');
		expect(html).toContain('x');
	});

	it('renders a GFM table with header, body, and alignment', async () => {
		const src = ['| Surface | Authority |', '|---|---:|', '| lanes | This doc |'].join('\n');
		const html = await renderMarkdown(src);
		expect(html).toContain('<table>');
		expect(html).toContain('<th>Surface</th>');
		expect(html).toContain('<th style="text-align:right">Authority</th>');
		expect(html).toContain('<td>lanes</td>');
	});

	it('highlights fenced python through Shiki (pre.shiki dual-theme output)', async () => {
		const src = ['```python', 'def f(x):', '    return x + 1', '```'].join('\n');
		const html = await renderMarkdown(src);
		// Shiki emits <pre class="shiki ...">, matching the pre.shiki cascade in app.css.
		expect(html).toContain('<pre class="shiki');
		// defaultColor:false → per-token dual-theme CSS variables (light + dark),
		// consumed by the [data-mode='dark'] cascade.
		expect(html).toContain('--shiki-light:');
		expect(html).toContain('--shiki-dark:');
		// The keyword is tokenized into its own styled span (i.e. actually highlighted).
		expect(html).toMatch(/<span[^>]*>def/);
	});

	it('renders a mermaid fence to inline SVG when the build-time render succeeds', async () => {
		renderMermaidDiagramsMock.mockResolvedValue(['<svg viewBox="0 0 10 10"><text>start → end</text></svg>']);
		const src = ['```mermaid', 'graph TD', 'A["start"] --> B["end"]', '```'].join('\n');
		const html = await renderMarkdown(src);
		expect(renderMermaidDiagramsMock).toHaveBeenCalledWith(['graph TD\nA["start"] --> B["end"]']);
		expect(html).toContain('<figure class="diagram"><svg viewBox="0 0 10 10">');
		expect(html).not.toContain('diagram-fallback');
	});

	it('keeps the labelled-source fallback figure when the build-time render fails (broken diagram)', async () => {
		renderMermaidDiagramsMock.mockResolvedValue([null]);
		const src = ['```mermaid', 'this is not [valid mermaid syntax', '```'].join('\n');
		const html = await renderMarkdown(src);
		expect(html).toContain('<figure class="diagram-fallback">');
		expect(html).toContain('<figcaption class="diagram-note">Diagram');
		// The diagram source is preserved as an escaped mermaid code block, never lost.
		expect(html).toContain('<pre><code class="language-mermaid">');
		expect(html).toContain('this is not [valid mermaid syntax');
	});

	it('never fails the render when the mermaid renderer itself rejects (defense in depth)', async () => {
		renderMermaidDiagramsMock.mockRejectedValue(new Error('no browser available'));
		const src = ['```mermaid', 'graph TD', 'A --> B', '```'].join('\n');
		const html = await renderMarkdown(src);
		expect(html).toContain('<figure class="diagram-fallback">');
		expect(html).toContain('A --&gt; B');
	});

	it('highlights fenced bash, and escapes angle-brackets inside highlighted tokens', async () => {
		const src = ['```bash', 'cd <new-repo>', '```'].join('\n');
		const html = await renderMarkdown(src);
		expect(html).toContain('<pre class="shiki');
		// Even highlighted, source `<` is escaped (Shiki emits the hex entity), so
		// `<new-repo>` can never ride through as a raw tag.
		expect(html).toContain('&#x3C;');
		expect(html).not.toContain('<new-repo');
	});

	it('falls back to a plain escaped <pre><code> for an unknown fence language', async () => {
		const src = ['```rust', 'let x = foo::<Bar>();', '```'].join('\n');
		const html = await renderMarkdown(src);
		// Unknown language: no throw, no Shiki — the plain escaped fallback.
		expect(html).toContain('<pre><code class="language-rust">');
		expect(html).not.toContain('class="shiki');
		expect(html).toContain('let x = foo::&lt;Bar&gt;();');
	});

	it('falls back to a plain escaped <pre><code> for a fence with no language', async () => {
		const src = ['```', 'plain <text> here', '```'].join('\n');
		const html = await renderMarkdown(src);
		expect(html).toContain('<pre><code>');
		expect(html).not.toContain('class="shiki');
		expect(html).toContain('plain &lt;text&gt; here');
	});

	it('strips mkdocs-material icon shortcodes and attr_list suffixes from prose', async () => {
		const src =
			':material-rocket-launch:{ .lg .middle } **Start drilling**\n\n[:octicons-arrow-right-24: Algorithms](x.md)\n\n[Download](y.md){ .md-button .md-button--primary }';
		const html = await renderMarkdown(src);
		expect(html).not.toContain(':material-');
		expect(html).not.toContain(':octicons-');
		expect(html).not.toContain('{ .');
		expect(html).toContain('<strong>Start drilling</strong>');
		expect(html).toContain('>Algorithms</a>');
	});

	it('keeps icon-shortcode-shaped text inside code spans verbatim', async () => {
		const html = await renderMarkdown('use `:material-download:` literally');
		expect(html).toContain('<code>:material-download:</code>');
	});

	it('unwraps mkdocs-material grid-cards wrappers instead of escaping them', async () => {
		const src = '<div class="grid cards" markdown>\n\n- **Card one**\n- **Card two**\n\n</div>';
		const html = await renderMarkdown(src);
		expect(html).not.toContain('&lt;div');
		expect(html).not.toContain('grid cards');
		expect(html).toContain('<li><strong>Card one</strong></li>');
	});

	it('dedupes repeated heading ids with -N suffixes, matching extractHeadings', async () => {
		const src = '# Title\n\n## Complexity\n\n## Examples\n\n## Complexity';
		const html = await renderMarkdown(src);
		expect(html).toContain('id="complexity"');
		expect(html).toContain('id="complexity-1"');
		const slugs = extractHeadings(src).map((h) => h.slug);
		expect(slugs).toEqual(['title', 'complexity', 'examples', 'complexity-1']);
	});

	it('renders nested unordered lists by indentation', async () => {
		const src = ['- parent', '  - child', '- sibling'].join('\n');
		const html = await renderMarkdown(src);
		expect(html).toContain('<li>parent<ul><li>child</li></ul></li>');
		expect(html).toContain('<li>sibling</li>');
	});

	it('renders ordered lists', async () => {
		const html = await renderMarkdown(['1. first', '2. second'].join('\n'));
		expect(html).toContain('<ol><li>first</li><li>second</li></ol>');
	});

	it('renders task-list checkboxes disabled', async () => {
		const html = await renderMarkdown('- [ ] todo\n- [x] done');
		expect(html).toContain('<input type="checkbox" disabled class="doc-task">');
		expect(html).toContain('<input type="checkbox" disabled checked class="doc-task">');
	});

	it('renders blockquotes with inner blocks', async () => {
		const html = await renderMarkdown('> **Status**: Normative.');
		expect(html).toContain('<blockquote>');
		expect(html).toContain('<strong>Status</strong>');
	});

	it('renders inline emphasis and links (external gets rel)', async () => {
		const html = await renderMarkdown('See **bold** and [the site](https://greatfallstoolbus.org).');
		expect(html).toContain('<strong>bold</strong>');
		expect(html).toContain('<a href="https://greatfallstoolbus.org" rel="noopener external">the site</a>');
	});

	it('resolves relative links via the provided resolver', async () => {
		const html = await renderMarkdown('[adr](../decisions/0002.md)', {
			resolveLink: (href) => `https://github.com/o/r/blob/main/docs/${href.replace('../', '')}`,
		});
		expect(html).toContain('href="https://github.com/o/r/blob/main/docs/decisions/0002.md"');
	});

	it('renders horizontal rules', async () => {
		expect(await renderMarkdown('a\n\n---\n\nb')).toContain('<hr>');
	});

	it('strips a leading YAML frontmatter block', async () => {
		expect(await renderMarkdown('---\ntitle: x\n---\n# Body')).toBe('<h1 id="body">Body</h1>');
	});

	// CommonMark 6.1 code spans: the synced sheets carry docstring-style
	// ``dp[mask][i]`` runs in prose (dp/traveling_salesman_dp, dp/edit_distance,
	// graphs/network_delay_time), which a single-backtick-only pass garbles.
	it('treats a double-backtick run as ONE code span, leaving no literal backticks', async () => {
		const html = await renderMarkdown(
			'``dp[mask][i]`` = minimum cost to visit the cities in `mask`, ending at city i.',
		);
		expect(html).toContain('<code>dp[mask][i]</code>');
		expect(html).toContain('<code>mask</code>');
		expect(html).not.toContain('`');
		expect(html).not.toContain('<code> = minimum');
	});

	it('keeps shorter backtick runs literal inside a longer-run span', async () => {
		const html = await renderMarkdown('``a `b` c`` ends and ``times[i] = (u, v, w)`` opens.');
		expect(html).toContain('<code>a `b` c</code>');
		expect(html).toContain('<code>times[i] = (u, v, w)</code>');
	});

	it('strips one space from a span that starts AND ends with a space', async () => {
		expect(await renderMarkdown('`` `x` ``')).toContain('<code>`x`</code>');
		// A single-space span has nothing on both sides to strip; it survives as-is.
		expect(await renderMarkdown('a `` `` b')).toContain('<code> </code>');
	});

	it('leaves an unmatched backtick run literal', async () => {
		expect(await renderMarkdown('a ``b` c')).toContain('a ``b` c');
	});

	// Print-oriented reference sheets repeat '# Title (Page N of M)' per printed
	// page; the web surface keeps only the first h1 and demotes the rest to h2
	// with the SAME slug id so existing anchors keep resolving.
	it('demotes every h1 after the first to h2, keeping ids stable', async () => {
		const src = ['# Sheet (Page 1 of 2)', 'a', '# Sheet (Page 2 of 2)', 'b'].join('\n');
		const html = await renderMarkdown(src);
		expect(html).toContain('<h1 id="sheet-page-1-of-2">');
		expect(html).toContain('<h2 id="sheet-page-2-of-2">');
		expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
	});

	// pymdownx admonitions / details / content tabs (the mkdocs constructs the
	// packet guides use), lowered to static semantic HTML with the 4-space body
	// dedented and re-rendered so nested blocks get the full treatment.
	it('renders a titled admonition as an aside with a title paragraph', async () => {
		const src = ['!!! tip "The one-sentence loop"', '    Browse a pattern, then drill it.'].join('\n');
		const html = await renderMarkdown(src);
		expect(html).toContain('<aside class="admonition tip">');
		expect(html).toContain('<p class="admonition-title">The one-sentence loop</p>');
		expect(html).toContain('<p>Browse a pattern, then drill it.</p>');
	});

	it('titles an untitled admonition with the capitalized type', async () => {
		const html = await renderMarkdown('!!! note\n    body');
		expect(html).toContain('<aside class="admonition note">');
		expect(html).toContain('<p class="admonition-title">Note</p>');
	});

	it('Shiki-highlights a fence nested inside an admonition body', async () => {
		const src = [
			'!!! note "Verify the install"',
			'    ```bash',
			'    just test',
			'    ```',
			'    A green `just test` means the environment is good to go.',
		].join('\n');
		const html = await renderMarkdown(src);
		expect(html).toContain('<aside class="admonition note">');
		expect(html).toContain('<pre class="shiki');
		expect(html).toContain('just test');
		expect(html).not.toContain('<p>```');
	});

	it('renders ??? as closed details and ???+ as open details', async () => {
		const closed = await renderMarkdown(
			'??? note "Drill commands (run in order)"\n    ```bash\n    just challenge arrays two_sum\n    ```',
		);
		expect(closed).toContain('<details class="admonition note"><summary>Drill commands (run in order)</summary>');
		expect(closed).toContain('<pre class="shiki');
		const open = await renderMarkdown('???+ tip "Expanded"\n    body');
		expect(open).toContain('<details class="admonition tip" open><summary>Expanded</summary>');
	});

	it('renders consecutive === tabs as stacked sibling sections', async () => {
		const src = [
			'=== "direnv (recommended)"',
			'',
			'    ```bash',
			'    direnv allow',
			'    ```',
			'',
			'=== "uv only (no Nix)"',
			'',
			'    Run `uv sync --all-extras` yourself.',
		].join('\n');
		const html = await renderMarkdown(src);
		expect(html.match(/<section class="content-tab">/g)).toHaveLength(2);
		expect(html).toContain('<p class="content-tab-title">direnv (recommended)</p>');
		expect(html).toContain('<p class="content-tab-title">uv only (no Nix)</p>');
		expect(html).toContain('<pre class="shiki');
		// Shiki tokenizes 'direnv allow' into separate spans; compare tag-stripped text.
		expect(html.replace(/<[^>]+>/g, '')).toContain('direnv allow');
		expect(html).not.toContain('<p>===');
	});

	it('renders an indented table inside a content tab as a real table', async () => {
		const src = [
			'=== "Arrays & Hashing"',
			'',
			'    | When You See... | Use This |',
			'    |---|---|',
			'    | "Top K / most frequent" | Bucket sort or heap |',
		].join('\n');
		const html = await renderMarkdown(src);
		expect(html).toContain('<section class="content-tab">');
		expect(html).toContain('<th>When You See...</th>');
		expect(html).toContain('<td>&quot;Top K / most frequent&quot;</td>');
	});
});

describe('slugify', () => {
	it('lowercases, drops punctuation, and dashes spaces', () => {
		expect(slugify('1. Purpose & non-goals')).toBe('1-purpose-non-goals');
	});
});

describe('extractHeadings', () => {
	it('extracts headings in document order with slugs matching renderMarkdown ids', async () => {
		const src = ['# Title', 'body', '## Purpose & non-goals', 'more', '### Sub point'].join('\n');
		expect(extractHeadings(src)).toEqual([
			{ depth: 1, text: 'Title', slug: 'title' },
			{ depth: 2, text: 'Purpose & non-goals', slug: 'purpose-non-goals' },
			{ depth: 3, text: 'Sub point', slug: 'sub-point' },
		]);
		expect(await renderMarkdown('## Purpose & non-goals')).toContain('id="purpose-non-goals"');
	});

	it('ignores a heading-shaped line inside a fenced code block', () => {
		const src = ['## Real heading', '```bash', '# not a heading', '```'].join('\n');
		expect(extractHeadings(src)).toEqual([{ depth: 2, text: 'Real heading', slug: 'real-heading' }]);
	});

	it('strips a leading YAML frontmatter block before scanning', () => {
		expect(extractHeadings('---\ntitle: x\n---\n# Body')).toEqual([{ depth: 1, text: 'Body', slug: 'body' }]);
	});

	it('strips inline code/bold/italic markers from the plain-text label', () => {
		expect(extractHeadings('## The **daily** block')).toEqual([
			{ depth: 2, text: 'The daily block', slug: 'the-daily-block' },
		]);
	});

	it('demotes repeated h1s to depth 2, matching renderMarkdown output', () => {
		const src = ['# Sheet (Page 1 of 2)', 'a', '# Sheet (Page 2 of 2)'].join('\n');
		expect(extractHeadings(src)).toEqual([
			{ depth: 1, text: 'Sheet (Page 1 of 2)', slug: 'sheet-page-1-of-2' },
			{ depth: 2, text: 'Sheet (Page 2 of 2)', slug: 'sheet-page-2-of-2' },
		]);
	});
});
