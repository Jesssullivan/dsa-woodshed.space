// Ensures every heading (h1-h6) inside the given element has an `id`, using
// the SAME GitHub-style slug algorithm as the raw markdown lane's renderer
// ($lib/docs/markdown `slugify`). A page's table of contents is built from
// `extractHeadings`, which computes slugs with that same function, so a TOC
// link always resolves to a real anchor — including on the mdsvex (`.svx`)
// lane, which does not stamp heading ids itself (no rehype-slug plugin; a
// deliberate zero-new-dependency choice, see markdown.ts's header comment).
// Idempotent: a heading that already carries an id (the markdown raw lane
// always does) is left untouched, so applying this action there is a no-op.
import { slugify } from '$lib/docs/markdown';

export function slugifyHeadings(node: HTMLElement) {
	const seen = new Set<string>();
	for (const heading of node.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
		if (heading.id) {
			seen.add(heading.id);
			continue;
		}
		const base = slugify(heading.textContent ?? '');
		if (!base) continue;
		let id = base;
		let n = 1;
		while (seen.has(id) || node.ownerDocument.getElementById(id)) {
			id = `${base}-${n++}`;
		}
		heading.id = id;
		seen.add(id);
	}
}
