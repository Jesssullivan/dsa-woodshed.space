// e2e-lite check for the Pagefind search index (see package.json `postbuild`).
//
// This is intentionally NOT a browser test: it does not spin up a page and
// drive pagefind.js's search() API, it just asserts the build artifact the
// runtime search UI (SearchDialog.svelte) depends on actually exists and
// actually contains indexable content. That is enough to catch the three ways
// this pipeline silently breaks:
//   1. `pagefind --site build` didn't run / errored quietly -> no pagefind.js.
//   2. `data-pagefind-body` attributes drifted off a content wrapper (e.g.
//      during the ia-nav layout merge — see SearchDialog.svelte / route
//      comments) -> pagefind.js exists, but a whole content lane vanishes
//      from the index. A single shared canary term can't see this (terms like
//      "two pointer" occur in every lane), so each lane is asserted
//      separately by fragment URL prefix.
//   3. Result URLs stop being navigable: Pagefind emits flat-file URLs
//      (/reference/big-o-complexity.html) and SearchDialog strips `.html` to
//      reach the clean prerendered route, so every fragment URL — after the
//      same strip — must map to a real file in build/, or clicks land on the
//      404 shell.
//
// Fragment files (build/pagefind/fragment/*.pf_fragment) are gzip-compressed
// JSON with a `pagefind_dcd` prefix before the `{`. Decompressing and slicing
// from the first `{` is the cheapest reliable way to read each page's url and
// content without reimplementing pagefind's binary index format or the WASM
// query engine here.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
// The SAME implementation SearchDialog navigates with — imported, not
// mirrored, so this gate cannot drift from the dialog's behavior.
import { routeUrl } from '../src/lib/search/route-url.js';

const BUILD_DIR = 'build';
const PAGEFIND_DIR = join(BUILD_DIR, 'pagefind');
const PAGEFIND_JS = join(PAGEFIND_DIR, 'pagefind.js');
const FRAGMENT_DIR = join(PAGEFIND_DIR, 'fragment');

// Present in the "two-pointer" reference sheet, which is always synced —
// a stable canary for "the index has real reference-sheet content in it".
const KNOWN_TERM = 'two pointer';

// One prefix per data-pagefind-body lane (leaf routes; the /reference index
// page and home are indexed too, but the leaf lanes are what drift).
const LANES = ['/reference/', '/guide/', '/algorithms/'];

function fail(message) {
	console.error(`verify-search-index: ${message}`);
	process.exitCode = 1;
}

// A clean route is navigable iff the static host can serve it on a hard
// load AND the prerender emitted it: adapter-static writes either the flat
// file (reference/big-o-complexity.html) or a directory index.
function routeIsPrerendered(route) {
	const path = route.replace(/[?#].*$/, '').replace(/^\//, '');
	if (path === '') return existsSync(join(BUILD_DIR, 'index.html'));
	return existsSync(join(BUILD_DIR, `${path}.html`)) || existsSync(join(BUILD_DIR, path, 'index.html'));
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

let termFound = false;
const urls = [];
for (const file of fragmentFiles) {
	const raw = gunzipSync(readFileSync(join(FRAGMENT_DIR, file))).toString('utf8');
	if (raw.toLowerCase().includes(KNOWN_TERM)) termFound = true;
	const fragment = JSON.parse(raw.slice(raw.indexOf('{')));
	if (typeof fragment.url !== 'string' || fragment.url === '') {
		fail(`fragment ${file} has no url — pagefind output format changed?`);
	} else {
		urls.push(fragment.url);
	}
}

if (!termFound) {
	fail(
		`indexed ${fragmentFiles.length} fragment(s) but none contain "${KNOWN_TERM}" — ` +
			'check data-pagefind-body placement on the content wrapper (see route comments).',
	);
}

for (const lane of LANES) {
	if (!urls.some((url) => routeUrl(url).startsWith(lane))) {
		fail(
			`no indexed page under ${lane} — did data-pagefind-body drift off that ` +
				'lane’s content wrapper? (see route comments)',
		);
	}
}

const deadUrls = urls.filter((url) => !routeIsPrerendered(routeUrl(url)));
if (deadUrls.length > 0) {
	fail(
		`${deadUrls.length} fragment URL(s) do not map to a prerendered route after ` +
			`stripping ".html" (SearchDialog clicks would 404): ${deadUrls.slice(0, 5).join(', ')}` +
			(deadUrls.length > 5 ? ', …' : ''),
	);
}

if (process.exitCode) process.exit(process.exitCode);

console.log(
	`verify-search-index: OK — ${PAGEFIND_JS} exists, ${fragmentFiles.length} fragment(s) indexed, ` +
		`"${KNOWN_TERM}" found, all lanes (${LANES.join(' ')}) present, all result URLs navigable.`,
);
