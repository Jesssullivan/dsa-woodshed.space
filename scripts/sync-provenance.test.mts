import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { syncAlgorithms } from './sync-algorithms.mjs';
import {
	publishTrackedOutputs,
	readPacketFileAtCommit,
	resolvePacketCommit,
	resolveSnippetsAtCommit,
} from './sync-content.mjs';
import { verifyContentSync } from './verify-content-sync.mjs';

const temporaryRoots: string[] = [];

const git = (cwd: string, args: string[]) =>
	execFileSync('git', ['-C', cwd, '-c', 'commit.gpgsign=false', ...args], {
		encoding: 'utf8',
		env: {
			...process.env,
			GIT_CONFIG_GLOBAL: '/dev/null',
			GIT_CONFIG_SYSTEM: '/dev/null',
		},
		stdio: ['ignore', 'pipe', 'pipe'],
	}).trim();

const write = (root: string, relative: string, text: string) => {
	const target = path.join(root, relative);
	mkdirSync(path.dirname(target), { recursive: true });
	writeFileSync(target, text);
};

const makePacketFixture = () => {
	const root = mkdtempSync(path.join(tmpdir(), 'woodshed-packet-fixture-'));
	temporaryRoots.push(root);
	git(root, ['init', '--quiet']);
	git(root, ['config', 'user.name', 'Woodshed Test']);
	git(root, ['config', 'user.email', 'woodshed@example.invalid']);
	write(root, 'agent-map.md', '# Agent map A\n');
	write(root, 'docs/root.md', '# Root\n\n--8<-- "docs/include.md"\n');
	write(root, 'docs/include.md', 'included from A\n');
	write(
		root,
		'src/algo/arrays/example.py',
		`"""Example.

Problem:
    Demonstrate immutable packet reads.

Approach:
    Return the input.

When to use:
    Provenance tests.

Complexity:
    Time: O(1)
    Space: O(1)
"""

def example(value):
    return value
`,
	);
	git(root, ['add', '.']);
	git(root, ['commit', '--quiet', '-m', 'fixture A']);
	return root;
};

afterEach(() => {
	for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('packet sync provenance', () => {
	it('keeps map, snippet, and algorithm reads on one full commit despite dirty files and a moving HEAD', () => {
		const packet = makePacketFixture();
		const commitA = resolvePacketCommit(packet);
		expect(commitA).toMatch(/^[0-9a-f]{40}$/);

		write(packet, 'agent-map.md', '# dirty working tree\n');
		expect(readPacketFileAtCommit(packet, commitA, 'agent-map.md')).toBe('# Agent map A\n');

		write(packet, 'agent-map.md', '# Agent map B\n');
		write(packet, 'docs/include.md', 'included from B\n');
		git(packet, ['add', 'agent-map.md', 'docs/include.md']);
		git(packet, ['commit', '--quiet', '-m', 'fixture B']);
		expect(resolvePacketCommit(packet)).not.toBe(commitA);
		expect(readPacketFileAtCommit(packet, commitA, 'agent-map.md')).toBe('# Agent map A\n');
		const inputs = ['docs/root.md'];
		expect(
			resolveSnippetsAtCommit(
				readPacketFileAtCommit(packet, commitA, 'docs/root.md'),
				inputs,
				0,
				['docs/root.md'],
				packet,
				commitA,
			),
		).toContain('included from A');
		expect(inputs).toEqual(['docs/root.md', 'docs/include.md']);

		const outputA = mkdtempSync(path.join(tmpdir(), 'woodshed-algorithms-a-'));
		const outputB = mkdtempSync(path.join(tmpdir(), 'woodshed-algorithms-b-'));
		temporaryRoots.push(outputA, outputB);
		const sha256 = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex');
		const args = { packetPath: packet, sourceCommit: commitA, mkdirSync, writeFileSync, sha256 };
		const first = syncAlgorithms({ ...args, contentDir: outputA });
		const second = syncAlgorithms({ ...args, contentDir: outputB });

		expect(second).toEqual(first);
		expect(readFileSync(path.join(outputB, 'algorithms/arrays/example.md'), 'utf8')).toBe(
			readFileSync(path.join(outputA, 'algorithms/arrays/example.md'), 'utf8'),
		);
	});

	it('restores both tracked outputs when the second replacement fails', () => {
		const root = mkdtempSync(path.join(tmpdir(), 'woodshed-publish-fixture-'));
		temporaryRoots.push(root);
		const agentMapPath = path.join(root, 'static/agent-map.md');
		const manifestPath = path.join(root, 'src/content/.manifest.json');
		write(root, 'static/agent-map.md', 'old map\n');
		write(root, 'src/content/.manifest.json', '{"old":true}\n');

		let replacements = 0;
		const failSecondReplacement = (from: string, to: string) => {
			replacements += 1;
			if (replacements === 2) throw new Error('injected manifest replacement failure');
			renameSync(from, to);
		};

		expect(() =>
			publishTrackedOutputs({
				agentMapPath,
				manifestPath,
				agentMap: 'new map\n',
				manifestText: '{"new":true}\n',
				replaceFile: failSecondReplacement,
			}),
		).toThrow('injected manifest replacement failure');
		expect(readFileSync(agentMapPath, 'utf8')).toBe('old map\n');
		expect(readFileSync(manifestPath, 'utf8')).toBe('{"old":true}\n');
		expect(readdirSync(path.dirname(agentMapPath))).toEqual(['agent-map.md']);
		expect(readdirSync(path.dirname(manifestPath))).toEqual(['.manifest.json']);

		publishTrackedOutputs({
			agentMapPath,
			manifestPath,
			agentMap: 'new map\n',
			manifestText: '{"new":true}\n',
		});
		expect(readFileSync(agentMapPath, 'utf8')).toBe('new map\n');
		expect(readFileSync(manifestPath, 'utf8')).toBe('{"new":true}\n');
	});

	it('keeps prior or absent outputs when the first or second replacement fails', () => {
		const root = mkdtempSync(path.join(tmpdir(), 'woodshed-publish-branches-'));
		temporaryRoots.push(root);
		const agentMapPath = path.join(root, 'static/agent-map.md');
		const manifestPath = path.join(root, 'src/content/.manifest.json');
		write(root, 'static/agent-map.md', 'old map\n');
		write(root, 'src/content/.manifest.json', '{"old":true}\n');

		expect(() =>
			publishTrackedOutputs({
				agentMapPath,
				manifestPath,
				agentMap: 'new map\n',
				manifestText: '{"new":true}\n',
				replaceFile: () => {
					throw new Error('injected first replacement failure');
				},
			}),
		).toThrow('injected first replacement failure');
		expect(readFileSync(agentMapPath, 'utf8')).toBe('old map\n');
		expect(readFileSync(manifestPath, 'utf8')).toBe('{"old":true}\n');

		const freshRoot = mkdtempSync(path.join(tmpdir(), 'woodshed-publish-fresh-'));
		temporaryRoots.push(freshRoot);
		const freshMap = path.join(freshRoot, 'static/agent-map.md');
		const freshManifest = path.join(freshRoot, 'src/content/.manifest.json');
		let replacements = 0;
		expect(() =>
			publishTrackedOutputs({
				agentMapPath: freshMap,
				manifestPath: freshManifest,
				agentMap: 'new map\n',
				manifestText: '{"new":true}\n',
				replaceFile: (from, to) => {
					replacements += 1;
					if (replacements === 2) throw new Error('injected fresh manifest failure');
					renameSync(from, to);
				},
			}),
		).toThrow('injected fresh manifest failure');
		expect(() => readFileSync(freshMap, 'utf8')).toThrow();
		expect(() => readFileSync(freshManifest, 'utf8')).toThrow();
	});

	it('rejects a generated body or map that no longer matches the manifest', () => {
		const root = mkdtempSync(path.join(tmpdir(), 'woodshed-verifier-fixture-'));
		temporaryRoots.push(root);
		const body = '# Generated body\n';
		const agentMap = '# Agent map\n';
		const digest = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex');
		write(root, 'src/content/guide/example.md', body);
		write(root, 'static/agent-map.md', agentMap);
		write(
			root,
			'src/content/.manifest.json',
			JSON.stringify({
				sourceCommit: 'a'.repeat(40),
				agentMap: {
					input: 'agent-map.md',
					out: 'static/agent-map.md',
					sha256: digest(agentMap),
				},
				entries: [{ out: 'guide/example.md', sha256: digest(body) }],
			}),
		);

		expect(verifyContentSync(root)).toEqual({
			sourceCommit: 'a'.repeat(40),
			entries: 1,
			agentMap: 'static/agent-map.md',
		});
		write(root, 'src/content/guide/example.md', '# interrupted sync\n');
		expect(() => verifyContentSync(root)).toThrow('digest mismatch for src/content/guide/example.md');
	});
});
