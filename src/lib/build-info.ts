// Build provenance for the footer's "built from <shortsha>" line.
//
// Resolution happens in vite.config.ts's resolveCommitHash(): CI's GITHUB_SHA
// (set automatically by GitHub Actions on every job, no workflow plumbing
// needed) wins, then a local `git rev-parse HEAD` for dev/preview builds run
// outside CI, else the literal 'unknown'. That value is threaded into the
// client bundle at build time via Vite's `define` (__COMMIT_HASH__ /
// __COMMIT_SHORT__), not through a runtime env var — this build has no
// server runtime to read `process.env` from once deployed as a static site.
//
// Same fail-quiet contract either way: normalizeSha rejects anything that
// isn't a plausible hex commit sha (in particular the literal 'unknown'), so
// the footer renders no line at all rather than a broken commit link.

/**
 * Normalize a raw build-sha value to a trustworthy commit hash, or '' when
 * absent/untrustworthy. Returns the lowercased hex sha (7 to 64 chars), else ''.
 */
export function normalizeSha(raw: unknown): string {
	if (typeof raw !== 'string') return '';
	const value = raw.trim().toLowerCase();
	if (!/^[0-9a-f]{7,64}$/.test(value)) return '';
	return value;
}

/** Full commit sha this build was built from, or '' when unknown / local without git. */
export const buildSha: string = normalizeSha(__COMMIT_HASH__);

/** 7-char short sha for display, or '' when unknown / local without git. */
export const buildShaShort: string = buildSha ? buildSha.slice(0, 7) : '';
