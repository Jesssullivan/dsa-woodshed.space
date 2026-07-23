import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (relative: string) => readFileSync(path.join(repoRoot, relative), 'utf8');

describe('public product surface', () => {
	it('leads with ordinary comments and keeps named frameworks optional', () => {
		const home = read('src/routes/+page.svelte');
		expect(home).toContain('Start with ordinary comments');
		expect(home).toMatch(/There are no\s+required prefixes or labels\./);
		expect(home).toContain('Optional vocabulary');
		expect(home).not.toContain('Pick the labels that help you think');
	});

	it('keeps the homepage library compact with a direct Printables path', () => {
		const home = read('src/routes/+page.svelte');
		expect(home).toContain('aria-label="Library shortcuts"');
		expect(home).toContain("title: 'Printables'");
		expect(home).not.toContain('mt-8 grid gap-4 md:grid-cols-2');
	});

	it('keeps Project in the documented information architecture', () => {
		const readme = read('README.md');
		const sitemap = read('src/routes/sitemap.xml/+server.ts');
		expect(readme).toContain('**Project** explains the source-of-truth');
		expect(sitemap).toContain('PROJECT_ROUTE');
	});

	it('does not use an em dash in visible not-found copy', () => {
		expect(read('src/routes/404/+page.svelte')).not.toContain('Nothing lives at this address —');
		expect(read('src/routes/+error.svelte')).not.toContain('Nothing lives at this address —');
	});
});
