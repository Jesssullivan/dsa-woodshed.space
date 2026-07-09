# The DSA Woodshed

A static, prerendered [SvelteKit](https://svelte.dev/docs/kit) practice-room front door — a
one-click GitHub Codespaces session with a resident agent interviewer — that also renders the
**DSA study packet** library ([Jesssullivan/dsa-study-packet](https://github.com/Jesssullivan/dsa-study-packet)),
served at [dsa-woodshed.space](https://dsa-woodshed.space).

Prose and reference sheets are authored and version-controlled in the study-packet
repo — that is the content's single source of truth. Nothing is authored here:
`scripts/sync-content.mjs` pulls the needed files out of a packet checkout at build
time and writes them into `src/content/`. Every page links back to its source in the
packet ("Edit this page" / "View source"), so a reader can propose a fix and open a PR
without a local checkout of this repo at all.

## Architecture

- **SvelteKit 2 / Svelte 5 (runes) + `adapter-static`** — fully prerendered, DB-less,
  no server at runtime; Skeleton 4 (`@skeletonlabs/skeleton{,-svelte}`) shell over
  Tailwind v4.
- **Two content lanes.** mdsvex (`.svx`) renders hazard-free prose as a Svelte
  component; a dependency-free renderer (`src/lib/docs/markdown.ts`) handles the
  code-heavy reference sheets and any prose with braces, angle-tags, or mermaid that
  mdsvex would misparse as Svelte syntax.
- **Build-time Shiki, zero client payload.** Fenced code is syntax-highlighted with
  Shiki's dual-theme output while the reference pages are prerendered; the highlighter
  is imported dynamically into its own chunk, so no Shiki grammar or theme JSON ever
  reaches the client — the page ships plain highlighted HTML.
- **Pagefind** builds a static search index over the built site as a `postbuild` step;
  `scripts/verify-search-index.mjs` then asserts the index actually contains content
  from each of the three lanes (guide, reference, algorithms) and that every result
  URL resolves to a real prerendered route, so a broken index fails the build instead
  of shipping silently.
- **Registry + manifest sync contract.** `sync-content.mjs` resolves its source root
  from `WOODSHED_PACKET_PATH` (a packet checkout — the sibling `../dsa-study-packet` in
  dev, a CI-checked-out shallow clone in CI), inlines the packet's mkdocs snippet
  includes, and writes the rendered bodies into the gitignored `src/content/` plus a
  committed `src/content/.manifest.json`. `src/lib/docs/registry.ts` reads that
  manifest for each entry's title, lane, and order, so those facts come from the
  packet and are never hand-typed or allowed to drift here.
- The sync is deterministic and idempotent (no timestamps, sorted output, byte-stable)
  and reads the packet at `HEAD` only, never its working tree.

## Develop

Node 22 + pnpm 10.13.1 (see `.nvmrc` / `packageManager`). If they are not on your PATH:
`nix shell nixpkgs#nodejs nixpkgs#pnpm -c <cmd>`.

```sh
pnpm install
pnpm run sync-content   # pulls content from ../dsa-study-packet (or $WOODSHED_PACKET_PATH)
pnpm run dev
```

`just` wraps the same pnpm scripts if you'd rather not remember them:

```sh
just setup         # pnpm install --frozen-lockfile
just sync-content  # pull content from the study packet into src/content/
just dev           # sync-content, then vite dev
```

`src/content/**` is a build input, not source — it is gitignored except the manifest,
so a fresh checkout must sync before it can build. `dev`, `check`, `test`, and `build`
all run the sync first; `sync-content` is also available standalone.

## Gates

The same suite runs locally and in CI (`.github/workflows/ci.yml`, on every PR and on
push to `main`):

```sh
just check   # svelte-kit sync + svelte-check
just lint    # prettier --check + eslint
just test    # vitest unit tests
just build   # static build, then the pagefind index build + verify-search-index.mjs
just e2e     # playwright
```

CI checks out the study packet alongside this repo (via a read-only deploy key while
the packet is private) and syncs content exactly as the deploy workflow does, so a
green PR gate means the site builds against real, current packet content — not stale
or hand-edited fixtures.

## Deploy

Pushes to `main` run `.github/workflows/deploy-pages.yml`: check out this repo and a
packet checkout (again via the read-only deploy key while the packet is private),
sync content, build, and publish the static output to GitHub Pages at the custom
domain `dsa-woodshed.space` (via `static/CNAME`). Once the packet repo is public the
deploy key can be dropped in favor of the default `GITHUB_TOKEN`.

## Provenance & content SSOT

The study packet ([Jesssullivan/dsa-study-packet](https://github.com/Jesssullivan/dsa-study-packet))
is the source of truth for every reference sheet, guide, and algorithm write-up this
site renders — file an issue or PR there to change what a page says. Aspirations for
self-hosted / local practice environments beyond this site are tracked in
[dsa-study-packet#49](https://github.com/Jesssullivan/dsa-study-packet/issues/49).

This app itself was forked from a private house SvelteKit scaffold and stripped of
estate coupling (Bazel, Nix flake, private CI templates, projection/agent surfaces).
The docs markdown renderer, doc registry, `repo.ts`, `SourceLink.svelte`, and the
mdsvex wiring were adapted from a sibling site (`greatfallstoolbus.org`); see file
headers for per-file provenance.
