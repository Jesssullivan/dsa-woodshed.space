// Dependency-free CommonMark-subset renderer for the operator-docs surface.
//
// PROVENANCE: lifted verbatim from greatfallstoolbus.org/src/lib/docs/markdown.ts.
// Zero new dependencies. In The DSA Woodshed it renders the code-heavy DSA
// reference sheets (fenced Python full of braces / angle-brackets) that mdsvex
// would misparse as Svelte syntax — the exact case this renderer exists for.
//
// WHY THIS EXISTS (and is NOT a new dependency):
//   The house markdown pipeline is mdsvex (.svx, see svelte.config.js plus
//   $lib/data/cells.ts). mdsvex is reused verbatim for the tool-inventory tree.
//   It is the WRONG tool for rendering the operator docs under docs/**/*.md, for
//   two hard reasons:
//     1. mdsvex compiles markdown AS a Svelte component, so every brace and every
//        <tag> in prose is interpreted as Svelte syntax. The operator docs are
//        full of angle-placeholders and brace tokens (CI-SCHEMA, apex-flip, ...).
//     2. mdsvex 0.12 ships NO GFM table support (that needs remark-gfm, a
//        forbidden new dependency per house-stack-contract.test.ts), and the
//        operator docs are heavily table-driven.
//   So we render the REAL docs/**/*.md files (SSOT, zero drift) as raw strings
//   through this tiny, self-contained renderer. It adds ZERO packages. Output is
//   plain semantic HTML dropped into the existing .prose block in src/app.css
//   (which already styles headings, lists, blockquotes, code, and TABLES with a
//   contained horizontal scroll), so it inherits the full house treatment,
//   dark/light plus print plus AA, for free.
//
// SAFETY: every text run is HTML-escaped before emission and only a fixed, known
// tag set is produced, so angle-placeholders and brace tokens render literally
// and the output is safe for {@html}. Link hrefs are scheme-checked (http/https/
// mailto/anchor/relative only) so no javascript:/data: URL can ride through.
//
// SYNTAX HIGHLIGHTING: fenced code is highlighted with Shiki's dual-theme output
// (see the `pre.shiki` cascade in src/app.css). `renderMarkdown` is async so the
// Shiki highlighter (whose grammar/theme JSON loads lazily) can be awaited ONCE
// per call; the highlighter's own `codeToHtml` is synchronous, so the block
// renderer below stays synchronous — it just receives a ready `highlight`
// closure. Highlighting runs at LOAD/BUILD time (the reference pages are
// prerendered), so the static output ships highlighted HTML and NO Shiki grammar
// or theme JSON reaches the client. Shiki is imported dynamically so it lands in
// its own (vendor-shiki) chunk and is never part of the eager client graph.

import type { Highlighter } from 'shiki';

// Shared with svelte.config.js's mdsvex rehype heading-id plugin (see the
// header comment in ./slugify.js); re-exported so existing importers keep
// reaching it through this module.
import { slugify } from './slugify.js';
export { slugify };

// Build-time Mermaid → SVG rendering (see mermaid.ts's header for the full
// rationale and its failure-mode contract: it never throws, only resolves to
// `null` per diagram on any failure).
import { renderMermaidDiagrams } from './mermaid';

export interface MarkdownOptions {
	/**
	 * Resolve a relative (non-http, non-anchor, non-mailto) link href, e.g. a
	 * `../decisions/0002.md` cross-reference, to an absolute URL (typically the
	 * canonical GitHub blob). Anchors, absolute URLs, and mailto are left as-is.
	 */
	resolveLink?: (href: string) => string;
}

/** Highlight one fenced-code run; returns null when the language is unsupported. */
type HighlightFn = (code: string, lang: string) => string | null;

/**
 * Internal render context: the public {@link MarkdownOptions} plus the resolved
 * (synchronous) Shiki highlight closure, threaded through the block renderer so
 * fenced code — including code nested in lists or blockquotes — is highlighted.
 */
interface RenderContext extends MarkdownOptions {
	highlight?: HighlightFn;
	/**
	 * Heading ids already emitted this render: repeats get a -1/-2 suffix so
	 * anchors stay unique. Same policy as the svx lane's rehype plugin in
	 * svelte.config.js and extractHeadings below — all three must agree or a
	 * TOC link can silently scroll to the wrong heading.
	 */
	seenIds?: Set<string>;
	/**
	 * Set once the first h1 of the document has been emitted; every later h1
	 * demotes to h2 (the print-oriented sheets repeat `# Title (Page N of M)`
	 * per printed page, but a web page gets exactly one h1). Mutable per-render
	 * state: renderMarkdown builds a fresh context per call and the same object
	 * threads through every recursive renderBlocks call.
	 */
	seenH1?: boolean;
}

// Fenced languages we ship grammars for. Anything else falls back to a plain,
// escaped <pre><code> (renderMarkdown never throws on an unknown fence language).
const SHIKI_LANGS = ['python', 'bash', 'json', 'yaml'] as const;
// Dual-theme keys MUST be `light` / `dark`: with `defaultColor: false` Shiki
// emits per-token `--shiki-light` / `--shiki-dark` (+ `-bg`) CSS variables named
// after these keys, which is exactly what the `pre.shiki` cascade in app.css
// reads. github-light / github-dark is a legible, high-contrast AA pair.
const SHIKI_THEMES = { light: 'github-light', dark: 'github-dark' } as const;
// Normalize common fence aliases to a loaded grammar id.
const SHIKI_LANG_BY_ALIAS: Record<string, (typeof SHIKI_LANGS)[number]> = {
	python: 'python',
	py: 'python',
	bash: 'bash',
	sh: 'bash',
	shell: 'bash',
	zsh: 'bash',
	json: 'json',
	yaml: 'yaml',
	yml: 'yaml',
};

// Cached highlighter singleton. Shiki is imported DYNAMICALLY so it — and all of
// its `@shikijs/*` grammar/theme/engine subpackages — lands in a lazy
// `vendor-shiki` chunk (see the manualChunks split in vite.config.ts) rather than
// the eager client runtime chunk. It loads only if this code actually runs; on
// prerendered pages it runs at BUILD, so nothing ships to the client. Only the
// four requested grammars + two themes are ever instantiated.
let highlighterPromise: Promise<Highlighter> | null = null;
function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = import('shiki').then(({ createHighlighter }) =>
			createHighlighter({ themes: [SHIKI_THEMES.light, SHIKI_THEMES.dark], langs: [...SHIKI_LANGS] }),
		);
	}
	return highlighterPromise;
}

/**
 * Resolve the synchronous per-block highlight closure. If Shiki cannot load (or a
 * block trips it), the closure returns null and the caller emits a plain escaped
 * <pre><code> — highlighting is best-effort and never blocks a render.
 */
async function resolveHighlight(): Promise<HighlightFn | undefined> {
	let highlighter: Highlighter;
	try {
		highlighter = await getHighlighter();
	} catch {
		return undefined;
	}
	return (code, rawLang) => {
		const lang = SHIKI_LANG_BY_ALIAS[(rawLang ?? '').trim().toLowerCase()];
		if (!lang) return null;
		try {
			return highlighter.codeToHtml(code, { lang, themes: SHIKI_THEMES, defaultColor: false });
		} catch {
			return null;
		}
	};
}

const ESCAPE_MAP: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

function escapeHtml(input: string): string {
	return input.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

function escapeAttr(input: string): string {
	return input.replace(/[&<>"]/g, (ch) => ESCAPE_MAP[ch]);
}

const SAFE_SCHEME = /^(https?:|mailto:)/i;
const BLOCKED_SCHEME = /^\s*(javascript|data|vbscript):/i;

function resolveHref(raw: string, options: MarkdownOptions): string | null {
	const href = raw.trim();
	if (!href || BLOCKED_SCHEME.test(href)) return null;
	if (href.startsWith('#')) return href;
	if (SAFE_SCHEME.test(href)) return href;
	if (href.startsWith('//')) return `https:${href}`;
	// Relative or root-absolute repo link: hand to the resolver (GitHub blob).
	return options.resolveLink ? options.resolveLink(href) : href;
}

interface InlineStores {
	code: string[];
	links: string[];
}

// Unicode noncharacters are reserved for internal processing and cannot occur
// in authored interchange text. Keep sentinels out of ordinary prose so score
// tokens such as "C2" and layer labels such as "L2" never become store lookups.
// Both markers are restored before rendered HTML leaves this module.
const SENTINEL_OPEN = '\uFDD0';
const SENTINEL_CLOSE = '\uFDD1';
const CODE_SENTINEL = (i: number) => `${SENTINEL_OPEN}C${i}${SENTINEL_CLOSE}`;
const LINK_SENTINEL = (i: number) => `${SENTINEL_OPEN}L${i}${SENTINEL_CLOSE}`;

// CommonMark 6.1 code spans: a run of N backticks opens a span closed by the
// NEXT run of exactly N backticks; shorter/longer runs in between stay literal
// (so ``a `b` c`` is ONE span — the docstring-style ``dp[mask][i]`` idiom the
// synced sheets use). A span whose content starts AND ends with a space, and is
// not only spaces, has one space stripped from each end (`` `x` `` → `x`).
// A run with no matching closer stays literal text.
function protectCodeSpans(text: string, stores: InlineStores): string {
	let out = '';
	let i = 0;
	while (i < text.length) {
		if (text[i] !== '`') {
			out += text[i];
			i++;
			continue;
		}
		let open = i + 1;
		while (open < text.length && text[open] === '`') open++;
		const runLen = open - i;
		// Find the next backtick run of EXACTLY the opener's length.
		let close = -1;
		for (let j = open; j < text.length; j++) {
			if (text[j] !== '`') continue;
			let end = j + 1;
			while (end < text.length && text[end] === '`') end++;
			if (end - j === runLen) {
				close = j;
				break;
			}
			j = end - 1;
		}
		if (close === -1) {
			out += text.slice(i, open);
			i = open;
			continue;
		}
		let code = text.slice(open, close);
		if (/^ .* $/.test(code) && code.trim() !== '') code = code.slice(1, -1);
		out += CODE_SENTINEL(stores.code.push(escapeHtml(code)) - 1);
		i = close + runLen;
	}
	return out;
}

// Protect-and-format one text run against a SHARED store, leaving code and link
// sentinels unresolved so a link label's own code span resolves against the same
// store at the single top-level restore (never a fresh, empty one).
function formatInto(text: string, options: MarkdownOptions, stores: InlineStores): string {
	// 1. Protect inline code first (content escaped, never re-parsed).
	let out = protectCodeSpans(text, stores);

	// 2. Protect links, building the anchor now (label recursively formatted with
	//    the SAME store so a bolded or code-span label works).
	out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, target: string) => {
		const url = resolveHref(target.trim().split(/\s+/)[0], options);
		const labelHtml = formatInto(label, options, stores);
		if (url === null) return LINK_SENTINEL(stores.links.push(labelHtml) - 1);
		const rel = /^https?:/i.test(url) ? ' rel="noopener external"' : '';
		return LINK_SENTINEL(stores.links.push(`<a href="${escapeAttr(url)}"${rel}>${labelHtml}</a>`) - 1);
	});

	// 3. mkdocs-material debris this renderer has no use for: icon shortcodes
	//    (:material-*:, :octicons-*:, ...) and attr_list suffixes ({ .md-button },
	//    { .lg .middle }) are styling hints for material's own pipeline — strip
	//    them so they never surface as literal prose. Runs after link/code
	//    protection so a shortcode inside a code span stays verbatim.
	out = out.replace(/:(?:material|octicons|fontawesome|simple)-[a-z0-9-]+:\s?/g, '');
	out = out.replace(/\{ \.[a-zA-Z][^}\n]*\}/g, '');

	// 4. Escape whatever prose is left (sentinels survive: they hold no metachars).
	out = escapeHtml(out);

	// 5. Emphasis on the escaped prose. Bold before italic.
	out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	out = out.replace(/(^|[^\w*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
	out = out.replace(/(^|[^\w_])_([^_\n]+)_/g, '$1<em>$2</em>');
	return out;
}

// Inline pass: code spans, links, bold, italic, HTML-escaping every text run.
function renderInline(text: string, options: MarkdownOptions): string {
	const stores: InlineStores = { code: [], links: [] };
	let out = formatInto(text, options, stores);
	// Restore links (labels may still carry code sentinels) THEN code, so every
	// sentinel resolves against the one shared store.
	out = out.replace(/\uFDD0L(\d+)\uFDD1/g, (_m, i: string) => stores.links[Number(i)]);
	out = out.replace(/\uFDD0C(\d+)\uFDD1/g, (_m, i: string) => `<code>${stores.code[Number(i)]}</code>`);
	return out;
}

/**
 * The labelled-source fallback figure for a mermaid diagram: used both when a
 * fence-level render call fails (see renderMermaidDiagrams in ./mermaid.ts)
 * and as the synchronous safety net in renderBlocks below for any mermaid
 * fence the build-time extraction in renderMarkdown didn't catch (e.g. one
 * indented inside a list or admonition body — out of scope for the synced
 * content today, but the renderer must still never lose the diagram text).
 */
function mermaidFallbackFigure(code: string): string {
	const plain = `<pre><code class="language-mermaid">${escapeHtml(code)}\n</code></pre>`;
	return `<figure class="diagram-fallback"><figcaption class="diagram-note">Diagram — rendered as source; see the source page for the visual.</figcaption>${plain}</figure>`;
}

/**
 * Mermaid emits `width="100%"` plus an intrinsic max-width, which lets a wide
 * diagram scale down to the prose column until it is unreadable (the packet's
 * decision tree is thousands of pixels wide). Pin the SVG to its intrinsic
 * viewBox width instead; figure.diagram's overflow-x pans anything wider than
 * the column while narrow diagrams still center at natural size.
 */
function diagramAtNaturalSize(svg: string): string {
	const viewBox = /viewBox="([\d.eE+-]+)[ ,]+([\d.eE+-]+)[ ,]+([\d.eE+-]+)[ ,]+([\d.eE+-]+)"/.exec(svg);
	if (!viewBox) return svg;
	const width = Math.ceil(Number(viewBox[3]));
	if (!Number.isFinite(width) || width <= 0) return svg;
	return svg.replace(/<svg([^>]*)>/, (_full, attrs: string) => {
		const cleaned = attrs.replace(/\s+width="[^"]*"/, '').replace(/\s+style="[^"]*"/, '');
		return `<svg${cleaned} style="width:${width}px;max-width:none;height:auto">`;
	});
}

/** A successfully build-time-rendered mermaid diagram, as inline SVG. */
function mermaidFigure(svg: string): string {
	return `<figure class="diagram">${diagramAtNaturalSize(svg)}</figure>`;
}

const FENCE_RE = /^(```|~~~)\s*([\w-]*)\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const HR_RE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const BLOCKQUOTE_RE = /^\s*>\s?(.*)$/;
// mkdocs pymdownx constructs the packet guides rely on: '!!! type "Title"'
// admonitions, '???'/'???+' collapsible details, '=== "Title"' content tabs.
// Each has a 4-space-indented body that is dedented and re-rendered through
// renderBlocks, so nested fences/tables get the full treatment (Shiki included).
const ADMONITION_RE = /^(!!!|\?\?\?\+?)\s+(\w+)(?:\s+"([^"]*)")?\s*$/;
const CONTENT_TAB_RE = /^===\s+"([^"]+)"\s*$/;

/**
 * Consume the indented body of a pymdownx block starting at `start`: blank
 * lines pass through, and every non-blank line dedents by one level (4 spaces
 * or a tab — deeper indentation keeps its remainder, so nested fences land at
 * column 0 and nested lists keep their relative depth). The body ends at the
 * first non-blank line indented less than one level.
 */
function collectIndentedBody(lines: string[], start: number): { body: string[]; next: number } {
	const body: string[] = [];
	let i = start;
	while (i < lines.length) {
		const l = lines[i];
		if (/^\s*$/.test(l)) {
			body.push('');
		} else if (/^(?: {4}|\t)/.test(l)) {
			body.push(l.replace(/^(?: {4}|\t)/, ''));
		} else {
			break;
		}
		i++;
	}
	return { body, next: i };
}

/** A table needs a header row with a pipe and a dash-separator row underneath. */
function isTableSeparator(line: string): boolean {
	return /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/.test(line) && line.includes('-');
}

function splitTableRow(line: string): string[] {
	let s = line.trim();
	if (s.startsWith('|')) s = s.slice(1);
	if (s.endsWith('|')) s = s.slice(0, -1);
	// Split on unescaped pipes.
	return s.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, '|').trim());
}

function renderTable(headerLine: string, sepLine: string, bodyLines: string[], options: MarkdownOptions): string {
	const headers = splitTableRow(headerLine);
	const aligns = splitTableRow(sepLine).map((spec) => {
		const left = spec.startsWith(':');
		const right = spec.endsWith(':');
		if (left && right) return 'center';
		if (right) return 'right';
		if (left) return 'left';
		return '';
	});
	const alignAttr = (i: number) => (aligns[i] ? ` style="text-align:${aligns[i]}"` : '');
	const head = headers.map((h, i) => `<th${alignAttr(i)}>${renderInline(h, options)}</th>`).join('');
	const body = bodyLines
		.map((row) => {
			const cells = splitTableRow(row);
			const tds = headers.map((_h, i) => `<td${alignAttr(i)}>${renderInline(cells[i] ?? '', options)}</td>`).join('');
			return `<tr>${tds}</tr>`;
		})
		.join('');
	return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

interface ListItem {
	indent: number;
	ordered: boolean;
	content: string[];
}

function renderListItemContent(lines: string[], options: RenderContext): string {
	// Task-list checkbox on the first line.
	const first = lines[0] ?? '';
	const task = first.match(/^\[([ xX])\]\s+(.*)$/);
	let checkbox = '';
	if (task) {
		const checked = task[1].toLowerCase() === 'x';
		checkbox = `<input type="checkbox" disabled${checked ? ' checked' : ''} class="doc-task"> `;
		lines = [task[2], ...lines.slice(1)];
	}
	// Render the item body as blocks (so a nested list, code block, or extra
	// paragraph works), then unwrap the common single-paragraph case so simple
	// items stay li-text instead of li-p-text.
	const inner = renderBlocks(lines, options).trim();
	const single = inner.match(/^<p>([\s\S]*?)<\/p>$/);
	const body = single && !single[1].includes('<p>') ? single[1] : inner;
	return checkbox + body;
}

/** Build a possibly-nested list from a run of list lines. */
function renderList(items: ListItem[], options: RenderContext): string {
	let html = '';
	let i = 0;
	while (i < items.length) {
		const item = items[i];
		// Gather children (deeper indent) that immediately follow this item.
		let j = i + 1;
		const children: ListItem[] = [];
		while (j < items.length && items[j].indent > item.indent) {
			children.push(items[j]);
			j++;
		}
		let li = renderListItemContent(item.content, options);
		if (children.length) li += renderList(children, options);
		html += `<li>${li}</li>`;
		i = j;
	}
	const tag = items[0]?.ordered ? 'ol' : 'ul';
	return `<${tag}>${html}</${tag}>`;
}

/** Top-level block renderer. */
function renderBlocks(lines: string[], options: RenderContext): string {
	const out: string[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// Blank line.
		if (/^\s*$/.test(line)) {
			i++;
			continue;
		}

		// Fenced code block.
		const fence = line.match(FENCE_RE);
		if (fence) {
			const marker = fence[1];
			const lang = fence[2];
			const buf: string[] = [];
			i++;
			while (i < lines.length && !lines[i].startsWith(marker)) {
				buf.push(lines[i]);
				i++;
			}
			i++; // skip closing fence
			const code = buf.join('\n');
			// Highlight known languages via Shiki (pre.shiki dual-theme output);
			// fall back to a plain, escaped <pre><code> for unknown/absent langs so
			// an unfamiliar fence never throws and braces/angle-brackets stay literal.
			const highlighted = options.highlight?.(code, lang);
			if (highlighted) {
				out.push(highlighted);
				continue;
			}
			if (lang === 'mermaid') {
				// Reached only for a mermaid fence the build-time extraction in
				// renderMarkdown did not lift out (see MERMAID_FENCE_RE below — it
				// only matches column-0 fences); fall back to the labelled source so
				// the diagram is never silently dropped.
				out.push(mermaidFallbackFigure(code));
			} else {
				const cls = lang ? ` class="language-${escapeAttr(lang)}"` : '';
				out.push(`<pre><code${cls}>${escapeHtml(code)}\n</code></pre>`);
			}
			continue;
		}

		// pymdownx admonition ('!!! type "Title"') or collapsible details
		// ('??? type "Title"', '???+' starts open). Untitled admonitions fall
		// back to the capitalized type, matching pymdownx.
		const adm = line.match(ADMONITION_RE);
		if (adm) {
			const kind = adm[1];
			const type = adm[2].toLowerCase();
			const title = adm[3] || type.charAt(0).toUpperCase() + type.slice(1);
			const { body, next } = collectIndentedBody(lines, i + 1);
			i = next;
			const inner = renderBlocks(body, options);
			if (kind === '!!!') {
				out.push(
					`<aside class="admonition ${type}"><p class="admonition-title">${renderInline(title, options)}</p>${inner}</aside>`,
				);
			} else {
				out.push(
					`<details class="admonition ${type}"${kind === '???+' ? ' open' : ''}><summary>${renderInline(title, options)}</summary>${inner}</details>`,
				);
			}
			continue;
		}

		// pymdownx content tab ('=== "Title"'). This surface ships zero client
		// JS for docs, so consecutive sibling tabs render STACKED — each a
		// labelled section with every alternative visible — not as a tab strip.
		const tab = line.match(CONTENT_TAB_RE);
		if (tab) {
			const { body, next } = collectIndentedBody(lines, i + 1);
			i = next;
			out.push(
				`<section class="content-tab"><p class="content-tab-title">${renderInline(tab[1], options)}</p>${renderBlocks(body, options)}</section>`,
			);
			continue;
		}

		// Heading. Only the document's FIRST h1 keeps its level; repeats demote
		// to h2 (see RenderContext.seenH1). The id stays slugified from the raw
		// text either way, so anchors like #…-page-2-of-4 keep resolving, and
		// extractHeadings applies the same rule so TOC depths match.
		const heading = line.match(HEADING_RE);
		if (heading) {
			let level = heading[1].length;
			if (level === 1) {
				if (options.seenH1) level = 2;
				else options.seenH1 = true;
			}
			const text = heading[2];
			const seenIds = (options.seenIds ??= new Set());
			const base = slugify(text);
			let id = base;
			for (let n = 1; seenIds.has(id); n++) id = `${base}-${n}`;
			seenIds.add(id);
			out.push(`<h${level} id="${id}">${renderInline(text, options)}</h${level}>`);
			i++;
			continue;
		}

		// Table (header plus separator plus rows).
		if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
			const header = line;
			const sep = lines[i + 1];
			const body: string[] = [];
			i += 2;
			while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) {
				body.push(lines[i]);
				i++;
			}
			out.push(renderTable(header, sep, body, options));
			continue;
		}

		// Horizontal rule.
		if (HR_RE.test(line)) {
			out.push('<hr>');
			i++;
			continue;
		}

		// Blockquote (consecutive marker lines).
		if (BLOCKQUOTE_RE.test(line)) {
			const buf: string[] = [];
			while (i < lines.length && BLOCKQUOTE_RE.test(lines[i])) {
				buf.push((lines[i].match(BLOCKQUOTE_RE) as RegExpMatchArray)[1]);
				i++;
			}
			out.push(`<blockquote>${renderBlocks(buf, options)}</blockquote>`);
			continue;
		}

		// List (unordered or ordered, indentation-nested).
		if (LIST_RE.test(line)) {
			const items: ListItem[] = [];
			while (i < lines.length) {
				const m = lines[i].match(LIST_RE);
				if (m) {
					const indent = m[1].replace(/\t/g, '  ').length;
					const ordered = /\d/.test(m[2]);
					items.push({ indent, ordered, content: [m[3]] });
					i++;
				} else if (/^\s+\S/.test(lines[i]) && items.length) {
					// Continuation / lazy line belonging to the last item.
					items[items.length - 1].content.push(lines[i].replace(/^\s{1,4}/, ''));
					i++;
				} else if (/^\s*$/.test(lines[i])) {
					// A single blank line may separate loose items; peek ahead.
					if (i + 1 < lines.length && (LIST_RE.test(lines[i + 1]) || /^\s+\S/.test(lines[i + 1]))) {
						i++;
					} else {
						break;
					}
				} else {
					break;
				}
			}
			out.push(renderList(items, options));
			continue;
		}

		// Paragraph: gather until a blank line or a block starter.
		const para: string[] = [];
		while (i < lines.length && !/^\s*$/.test(lines[i])) {
			const l = lines[i];
			if (
				FENCE_RE.test(l) ||
				HEADING_RE.test(l) ||
				HR_RE.test(l) ||
				BLOCKQUOTE_RE.test(l) ||
				LIST_RE.test(l) ||
				ADMONITION_RE.test(l) ||
				CONTENT_TAB_RE.test(l) ||
				(l.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
			) {
				break;
			}
			para.push(l);
			i++;
		}
		if (para.length) {
			out.push(`<p>${renderInline(para.join(' '), options)}</p>`);
		}
	}

	return out.join('\n');
}

// Matches a top-level (column-0) ```mermaid or ~~~mermaid fence, across the
// WHOLE source (multiline, not the per-line FENCE_RE the block renderer uses),
// so it can be lifted out before renderBlocks ever sees it. Scoped to column-0
// fences: every synced doc's mermaid fence is unindented (see markdown.test.ts
// and docs/guide/when-to-use-what.md); an indented one — inside a list or
// admonition body — still renders, just via the synchronous fallback in
// renderBlocks above, never lost.
const MERMAID_FENCE_RE = /^(```|~~~)mermaid[ \t]*\r?\n([\s\S]*?)\r?\n\1[ \t]*$/gm;

interface ExtractedMermaidDiagram {
	/** Unique, HTML-metacharacter-free token standing in for the diagram in the text the block renderer sees. */
	placeholder: string;
	/** The diagram's raw Mermaid source (unescaped). */
	source: string;
}

/**
 * Lift every top-level ```mermaid fence out of the raw markdown source before
 * the (synchronous) block renderer runs, replacing each with a unique
 * placeholder line. This lets renderMarkdown render the diagrams themselves
 * ASYNCHRONOUSLY (mermaid-isomorphic drives a real browser) without making the
 * whole recursive, synchronous block renderer async. The placeholder is
 * isolated with forced blank lines so it always becomes its own paragraph
 * regardless of the surrounding markdown, which keeps the later substitution
 * in renderMarkdown a plain, unambiguous string swap.
 */
function extractMermaidDiagrams(text: string): { text: string; diagrams: ExtractedMermaidDiagram[] } {
	const diagrams: ExtractedMermaidDiagram[] = [];
	const replaced = text.replace(MERMAID_FENCE_RE, (_match, _marker: string, source: string) => {
		// Delimited with `§` (a character no synced doc's prose uses): outside
		// escapeHtml's fixed character set (&<>"'), and not part of any inline
		// construct this renderer matches (emphasis, code spans, links), so it
		// survives renderInline/renderBlocks completely inert and unambiguous.
		const placeholder = `§MERMAID-${diagrams.length}§`;
		diagrams.push({ placeholder, source });
		return `\n\n${placeholder}\n\n`;
	});
	return { text: replaced, diagrams };
}

/**
 * Render a markdown source string to safe HTML for the .prose container.
 *
 * Async because fenced code is highlighted with Shiki, whose grammar/theme JSON
 * loads lazily, AND because any mermaid fence is rendered to inline SVG via a
 * headless-browser call (see ./mermaid.ts) that resolves once per whole
 * document. Prefer calling this at LOAD/BUILD time (see the prerendered
 * reference [slug] +page.server.ts) so the highlighted, diagram-rendered HTML
 * is baked into the static output and neither Shiki nor Playwright/mermaid
 * ships to the client.
 */
export async function renderMarkdown(src: string, options: MarkdownOptions = {}): Promise<string> {
	// Normalize newlines; strip a leading YAML frontmatter block if present.
	let text = src.replace(/\r\n?/g, '\n');
	text = text.replace(/^---\n[\s\S]*?\n---\n/, '');
	// mkdocs-material "grid cards" wrapper: a raw-HTML div this renderer would
	// otherwise escape into literal paragraph text. Dropping just the wrapper
	// lines leaves the list inside to render as a normal <ul>.
	text = text.replace(/^<div class="grid cards" markdown>\s*$/gm, '').replace(/^<\/div>\s*$/gm, '');

	const { text: withPlaceholders, diagrams } = extractMermaidDiagrams(text);
	const highlight = await resolveHighlight();
	let html = renderBlocks(withPlaceholders.split('\n'), { ...options, highlight });

	if (diagrams.length) {
		// renderMermaidDiagrams's own contract is to never reject (see
		// mermaid.ts): a failure degrades every entry to `null`. This catch is
		// defense in depth ONLY — if that contract is ever violated, every
		// diagram in this document still gets its fallback figure instead of
		// failing the whole page (and the build with it).
		const rendered = await renderMermaidDiagrams(diagrams.map((d) => d.source)).catch(() => diagrams.map(() => null));
		for (const [i, diagram] of diagrams.entries()) {
			const svg = rendered[i];
			const figure = svg ? mermaidFigure(svg) : mermaidFallbackFigure(diagram.source);
			// The placeholder is almost always its own isolated paragraph (the
			// blank lines forced around it in extractMermaidDiagrams); fall back to
			// a raw swap for the one case that unwraps a lone <p>, a list item
			// whose ENTIRE content was the diagram (renderListItemContent strips a
			// single wrapping <p>) — out of scope for synced content today, but
			// still handled rather than silently dropped.
			const wrapped = `<p>${diagram.placeholder}</p>`;
			html = html.includes(wrapped) ? html.split(wrapped).join(figure) : html.split(diagram.placeholder).join(figure);
		}
	}

	return html;
}

export interface Heading {
	/** Heading level 1-6 (the number of leading `#`). */
	depth: number;
	/** Plain-text label with inline markdown markers (code/bold/italic) stripped. */
	text: string;
	/** GitHub-style slug — identical to the `id` renderMarkdown gives this same heading. */
	slug: string;
}

/**
 * Extract every ATX heading from markdown source, in document order, for
 * building a page table of contents. Shares the exact slug algorithm
 * renderBlocks uses for heading `id`s (both call `slugify` on the raw heading
 * text), so a TOC link built from this list always resolves to a real anchor.
 * Headings inside fenced code blocks (e.g. a `#` shell comment) are skipped,
 * matching renderBlocks' own fence handling — as is its demotion of every h1
 * after the first to depth 2, so TOC depths mirror the rendered levels.
 */
export function extractHeadings(src: string): Heading[] {
	let text = src.replace(/\r\n?/g, '\n');
	text = text.replace(/^---\n[\s\S]*?\n---\n/, '');
	const headings: Heading[] = [];
	let fenceMarker: string | null = null;
	let seenH1 = false;
	// Same repeat-id policy as renderBlocks and the svx rehype plugin
	// (svelte.config.js): base, base-1, base-2 — a TOC built from this list must
	// land on the id the renderer actually stamped.
	const seenIds = new Set<string>();
	for (const line of text.split('\n')) {
		if (fenceMarker) {
			if (line.startsWith(fenceMarker)) fenceMarker = null;
			continue;
		}
		const fence = line.match(FENCE_RE);
		if (fence) {
			fenceMarker = fence[1];
			continue;
		}
		const heading = line.match(HEADING_RE);
		if (heading) {
			let depth = heading[1].length;
			if (depth === 1) {
				if (seenH1) depth = 2;
				else seenH1 = true;
			}
			const base = slugify(heading[2]);
			let slug = base;
			for (let n = 1; seenIds.has(slug); n++) slug = `${base}-${n}`;
			seenIds.add(slug);
			headings.push({
				depth,
				text: heading[2].replace(/[`*_]/g, '').trim(),
				slug,
			});
		}
	}
	return headings;
}
