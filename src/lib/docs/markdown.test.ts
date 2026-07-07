import { describe, expect, it } from 'vitest';
import { renderMarkdown, slugify } from './markdown';

// Contract for the dependency-free operator-docs markdown renderer (see the
// header of markdown.ts for why mdsvex is deliberately NOT reused here). These
// assertions lock the exact features the real docs/**/*.md tree relies on:
// tables (mdsvex ships none), fenced code, nested lists, blockquotes, the
// public-safe HTML-escaping that lets `<placeholder>` / `{expr}` render as
// literal text on a public site, and Shiki syntax highlighting of fenced code.
//
// renderMarkdown is async (Shiki's highlighter loads lazily), so every case
// awaits it.

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
});

describe('slugify', () => {
	it('lowercases, drops punctuation, and dashes spaces', () => {
		expect(slugify('1. Purpose & non-goals')).toBe('1-purpose-non-goals');
	});
});
