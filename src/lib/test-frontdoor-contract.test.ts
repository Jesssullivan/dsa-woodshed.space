import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const justfile = readFileSync(path.join(repoRoot, 'Justfile'), 'utf8');
const ci = readFileSync(path.join(repoRoot, '.github/workflows/ci.yml'), 'utf8');

describe('cold-checkout test front door', () => {
	it('generates SvelteKit metadata before running unit tests', () => {
		const recipe = justfile.match(/^test: sync-content\n((?:\t.*\n)+)/m)?.[1];
		const commands = recipe
			?.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);

		expect(commands).toEqual(['pnpm exec svelte-kit sync', 'pnpm run test:unit']);
	});

	it('exercises the public test front door before CI type-checking', () => {
		const setupJust = ci.indexOf('extractions/setup-just@53165ef7e734c5c07cb06b3c8e7b647c5aa16db3');
		const pinnedJust = ci.indexOf("just-version: '1.57.0'");
		const test = ci.indexOf('          just test');
		const check = ci.indexOf('run: pnpm run check');

		expect(setupJust).toBeGreaterThan(-1);
		expect(pinnedJust).toBeGreaterThan(setupJust);
		expect(test).toBeGreaterThan(pinnedJust);
		expect(test).toBeGreaterThan(-1);
		expect(check).toBeGreaterThan(test);
		expect(ci).not.toContain('run: pnpm run test:unit');
		expect(ci).toContain('test ! -e .svelte-kit/tsconfig.json');
		expect(ci).toContain('WOODSHED_PACKET_PATH: ${{ github.workspace }}/dsa-study-packet');
	});
});
