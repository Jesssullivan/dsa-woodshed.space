import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (relative: string) => readFileSync(path.join(repoRoot, relative), 'utf8');
const sha256 = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex');

describe('public product surface', () => {
	it('leads with ordinary comments and keeps named frameworks optional', () => {
		const home = read('src/routes/+page.svelte');
		expect(home).toContain('Start with ordinary comments');
		expect(home).toMatch(/There are no\s+required prefixes or labels\./);
		expect(home).toMatch(/the same\s+loop\s+with\s+optional\s+labels/);
		expect(home).not.toContain('Pick the labels that help you think');
	});

	it('keeps the homepage library compact with a direct Printables path', () => {
		const home = read('src/routes/+page.svelte');
		expect(home).toContain('aria-label="Library shortcuts"');
		expect(home).toContain("title: 'Printables'");
		expect(home).not.toContain('mt-8 grid gap-4 md:grid-cols-2');
	});

	it('keeps study separate from a rep and runs tests only on request', () => {
		const home = read('src/routes/+page.svelte');
		expect(home).toContain('runs focused tests when you ask');
		expect(home).toMatch(/Study a committed solution and its reference tests before a rep/);
		expect(home).toMatch(/open without starting a rep/);
		expect(home).not.toContain('runs the focused tests');
	});

	it('serves the packet agent map without restating its evolving command surface', () => {
		const page = read('src/routes/agent/+page.svelte');
		const agentMap = read('static/agent-map.md');
		const manifest = JSON.parse(read('src/content/.manifest.json')) as {
			agentMap: { input: string; out: string; sha256: string };
		};

		expect(page).toContain('agentMapMetadata.out');
		expect(page).toContain('agentMapMetadata.input');
		expect(page).not.toContain('just practice-start comments|reacto|clarp|umpire');
		expect(manifest.agentMap).toEqual({
			input: 'agent-map.md',
			out: 'static/agent-map.md',
			sha256: sha256(agentMap),
		});
	});

	it('keeps Project in the documented information architecture', () => {
		const readme = read('README.md');
		const sitemap = read('src/routes/sitemap.xml/+server.ts');
		expect(readme).toContain('**Project** is a concise public landing that links the source-of-truth');
		expect(sitemap).toContain('PROJECT_ROUTE');
	});

	it('does not use an em dash in visible not-found copy', () => {
		expect(read('src/routes/404/+page.svelte')).not.toContain('Nothing lives at this address —');
		expect(read('src/routes/+error.svelte')).not.toContain('Nothing lives at this address —');
	});
});
