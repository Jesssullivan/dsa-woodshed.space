import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cacheKeyFor, renderWithCache } from './mermaid';

// renderWithCache is the cache + bounded-retry core behind renderMermaidDiagrams
// (see mermaid.ts's module header), with the renderer loader and cache
// directory injected so this suite can pin cache keying/read/write and retry
// classification against a throwaway temp directory — no real browser, no
// real repo-root .mermaid-cache/ involved.

let cacheDir: string;

beforeEach(() => {
	cacheDir = mkdtempSync(join(tmpdir(), 'mermaid-cache-test-'));
});

afterEach(() => {
	rmSync(cacheDir, { recursive: true, force: true });
});

function fulfilled(svg: string): PromiseSettledResult<{ svg: string }> {
	return { status: 'fulfilled', value: { svg } };
}

function rejected(reason: unknown): PromiseSettledResult<{ svg: string }> {
	return { status: 'rejected', reason };
}

describe('cacheKeyFor', () => {
	it('is stable sha256(trimmed source), first 16 hex characters', () => {
		const key = cacheKeyFor('graph TD\nA --> B');
		expect(key).toMatch(/^[0-9a-f]{16}$/);
		// Leading/trailing whitespace around the same source must not change the key.
		expect(cacheKeyFor('  graph TD\nA --> B  \n')).toBe(key);
	});

	it('differs for different diagram sources', () => {
		expect(cacheKeyFor('graph TD\nA --> B')).not.toBe(cacheKeyFor('graph TD\nA --> C'));
	});
});

describe('renderWithCache: cache read/write', () => {
	it('renders and writes a cache entry on a miss, keyed by the diagram source hash', async () => {
		const render = vi.fn().mockResolvedValue([fulfilled('<svg>one</svg>')]);
		const source = 'graph TD\nA --> B';

		const outcomes = await renderWithCache([source], () => Promise.resolve(render), cacheDir);

		expect(outcomes).toEqual(['<svg>one</svg>']);
		expect(render).toHaveBeenCalledTimes(1);

		const key = cacheKeyFor(source);
		const cachePath = join(cacheDir, `${key}.svg`);
		expect(existsSync(cachePath)).toBe(true);
		expect(readFileSync(cachePath, 'utf-8')).toBe('<svg>one</svg>');
	});

	it('returns the cached SVG on a hit without invoking the renderer', async () => {
		const render = vi.fn().mockResolvedValue([fulfilled('<svg>fresh</svg>')]);
		const source = 'graph TD\nA --> B';
		const loadRenderer = () => Promise.resolve(render);

		// First call: miss, renders and populates the cache.
		await renderWithCache([source], loadRenderer, cacheDir);
		expect(render).toHaveBeenCalledTimes(1);

		// Second call, same source: cache hit, renderer never called again.
		const outcomes = await renderWithCache([source], loadRenderer, cacheDir);
		expect(outcomes).toEqual(['<svg>fresh</svg>']);
		expect(render).toHaveBeenCalledTimes(1);
	});

	it('only re-renders the cache-miss subset of a mixed batch', async () => {
		const cached = 'graph TD\nA --> B';
		const uncached = 'graph TD\nC --> D';
		const render = vi.fn().mockResolvedValue([fulfilled('<svg>cached</svg>')]);
		await renderWithCache([cached], () => Promise.resolve(render), cacheDir);
		render.mockClear();

		const render2 = vi.fn().mockResolvedValue([fulfilled('<svg>new</svg>')]);
		const outcomes = await renderWithCache([cached, uncached], () => Promise.resolve(render2), cacheDir);

		expect(outcomes).toEqual(['<svg>cached</svg>', '<svg>new</svg>']);
		// Only the miss ('C --> D') is sent to the renderer, not the cached one.
		expect(render2).toHaveBeenCalledWith([uncached]);
	});

	it('never throws when the cache directory cannot be written to', async () => {
		const render = vi.fn().mockResolvedValue([fulfilled('<svg>ok</svg>')]);
		// A file, not a directory, at the "cache dir" path: mkdirSync/writeFileSync will fail.
		const unwritable = join(cacheDir, 'not-a-directory');
		const { writeFileSync } = await import('node:fs');
		writeFileSync(unwritable, 'not a directory');

		const outcomes = await renderWithCache(['graph TD\nA --> B'], () => Promise.resolve(render), unwritable);
		// The render itself still succeeds even though persisting the cache entry failed.
		expect(outcomes).toEqual(['<svg>ok</svg>']);
	});
});

describe('renderWithCache: bounded retry', () => {
	it('retries a transient batch-level failure and succeeds within 3 attempts', async () => {
		const render = vi
			.fn()
			.mockRejectedValueOnce(new Error('Target closed'))
			.mockRejectedValueOnce(new Error('Protocol error: Connection closed'))
			.mockResolvedValueOnce([fulfilled('<svg>recovered</svg>')]);

		const outcomes = await renderWithCache(['graph TD\nA --> B'], () => Promise.resolve(render), cacheDir);

		expect(outcomes).toEqual(['<svg>recovered</svg>']);
		expect(render).toHaveBeenCalledTimes(3);
	});

	it('gives up after 3 attempts of transient failures, degrading to null', async () => {
		const render = vi.fn().mockRejectedValue(new Error('Target closed'));

		const outcomes = await renderWithCache(['graph TD\nA --> B'], () => Promise.resolve(render), cacheDir);

		expect(outcomes).toEqual([null]);
		expect(render).toHaveBeenCalledTimes(3);
	});

	it('does not retry a terminal failure (missing browser binary)', async () => {
		const render = vi.fn().mockRejectedValue(new Error('Could not find Chrome (ver. 12345)'));

		const outcomes = await renderWithCache(['graph TD\nA --> B'], () => Promise.resolve(render), cacheDir);

		expect(outcomes).toEqual([null]);
		expect(render).toHaveBeenCalledTimes(1);
	});

	it('treats a per-diagram rejection in an otherwise-successful batch as terminal, not retried', async () => {
		// The batch call itself succeeds (settles); only one diagram's own promise
		// rejects (invalid Mermaid syntax). That rejection must not be retried —
		// the render call is invoked exactly once.
		const render = vi
			.fn()
			.mockResolvedValue([fulfilled('<svg>good</svg>'), rejected(new Error('Parse error on line 1'))]);

		const outcomes = await renderWithCache(
			['graph TD\nA --> B', 'this is not valid mermaid'],
			() => Promise.resolve(render),
			cacheDir,
		);

		expect(outcomes).toEqual(['<svg>good</svg>', null]);
		expect(render).toHaveBeenCalledTimes(1);
	});

	it('never rejects even when the renderer loader itself always fails', async () => {
		const loadRenderer = () => Promise.reject(new Error('no browser available'));

		const outcomes = await renderWithCache(['graph TD\nA --> B'], loadRenderer, cacheDir);

		expect(outcomes).toEqual([null]);
	});
});
