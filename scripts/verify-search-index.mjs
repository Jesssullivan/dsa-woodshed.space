// e2e-lite check for the Pagefind search index (see package.json `postbuild`).
//
// This is intentionally NOT a browser test: it does not spin up a page and
// drive pagefind.js's search() API, it just asserts the build artifact the
// runtime search UI (SearchDialog.svelte) depends on actually exists and
// actually contains indexable content. That is enough to catch the two ways
// this pipeline silently breaks:
//   1. `pagefind --site build` didn't run / errored quietly -> no pagefind.js.
//   2. `data-pagefind-body` attributes drifted off the content wrapper (e.g.
//      during the ia-nav layout merge — see SearchDialog.svelte / route
//      comments) -> pagefind.js exists, but the index is empty or missing an
//      expected, known term.
//
// Fragment files (build/pagefind/fragment/*.pf_fragment) are gzip-compressed
// JSON with a `pagefind_dcd` prefix before the `{`. Decompressing and
// grep-equivalent string search is the cheapest reliable way to assert a term
// made it into the index without reimplementing pagefind's binary index
// format or the WASM query engine here.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';

const BUILD_DIR = 'build';
const PAGEFIND_DIR = join(BUILD_DIR, 'pagefind');
const PAGEFIND_JS = join(PAGEFIND_DIR, 'pagefind.js');
const FRAGMENT_DIR = join(PAGEFIND_DIR, 'fragment');

// Present in the "two-pointer" reference sheet, which is always synced —
// a stable canary for "the index has real reference-sheet content in it".
const KNOWN_TERM = 'two pointer';

function fail(message) {
	console.error(`verify-search-index: ${message}`);
	process.exitCode = 1;
}

if (!existsSync(PAGEFIND_JS)) {
	fail(`missing ${PAGEFIND_JS} — did the postbuild "pagefind --site ${BUILD_DIR}" step run?`);
	process.exit(1);
}

if (!existsSync(FRAGMENT_DIR)) {
	fail(`missing ${FRAGMENT_DIR} — pagefind produced no fragments (empty index?)`);
	process.exit(1);
}

const fragmentFiles = readdirSync(FRAGMENT_DIR).filter((f) => f.endsWith('.pf_fragment'));
if (fragmentFiles.length === 0) {
	fail(`${FRAGMENT_DIR} contains no .pf_fragment files — index is empty`);
	process.exit(1);
}

let found = false;
for (const file of fragmentFiles) {
	const raw = gunzipSync(readFileSync(join(FRAGMENT_DIR, file)));
	if (raw.toString('utf8').toLowerCase().includes(KNOWN_TERM)) {
		found = true;
		break;
	}
}

if (!found) {
	fail(
		`indexed ${fragmentFiles.length} fragment(s) but none contain "${KNOWN_TERM}" — ` +
			'check data-pagefind-body placement on the content wrapper (see route comments).',
	);
	process.exit(1);
}

console.log(
	`verify-search-index: OK — ${PAGEFIND_JS} exists, ${fragmentFiles.length} fragment(s) indexed, "${KNOWN_TERM}" found.`,
);
