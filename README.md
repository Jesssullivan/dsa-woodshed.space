# The DSA Woodshed

A static [SvelteKit](https://svelte.dev/docs/kit) reading surface for the
**DSA study packet** ([Jesssullivan/dsa-study-packet](https://github.com/Jesssullivan/dsa-study-packet)).

The prose and reference sheets are authored and tracked in the study-packet
repository; this repo renders a curated subset of them as a fast, prerendered
static site. Every page links back to its source there ("Edit this page" / "View
source"), so a reader can propose a fix and open a PR without a local checkout.

## Stack

- pnpm + Vite + SvelteKit 2 / Svelte 5 (runes)
- Skeleton 4 (`@skeletonlabs/skeleton{,-svelte}`) shell + Zag-backed components
- Tailwind v4
- `adapter-static` — fully prerendered, DB-less, deployed to a custom domain
  (`dsa-woodshed.space`) via `static/CNAME`
- Two content lanes:
  - **mdsvex** (`.svx`) for hazard-free prose authored for this site
    (rendered as a Svelte component)
  - a dependency-free markdown renderer (`src/lib/docs/markdown.ts`) — the "raw
    lane" — for the code-heavy reference sheets and any prose containing braces,
    angle-tags, or mermaid, whose fenced Python would otherwise be misparsed by
    mdsvex

## Content pipeline

The site's prose and reference sheets are **not authored here** — their single
source of truth is the study packet. `scripts/sync-content.mjs` (plain Node, no
dependencies) copies the needed files out of a packet checkout into
`src/content/`, resolving the packet's mkdocs snippet includes as it goes.

```sh
just sync-content          # or: pnpm run sync-content
```

- **Source root** resolves from `WOODSHED_PACKET_PATH`, defaulting to the sibling
  `../dsa-study-packet` (dev). CI resolves a shallow clone and passes its path.
- **Snippet includes.** The packet's `docs/reference/*.md` are thin mkdocs stubs
  whose body is a `--8<-- "reference-sheets/NN-….md"` include. The sync inlines
  the referenced sheet (recursively, with a depth cap + cycle detection), so the
  rendered page is the full sheet and its "edit this page" link points at the
  real sheet, not the stub.
- **Render lanes** are decided per file: the reference sheets and the guide docs
  with mdsvex hazards (braces / angle-tags / mermaid) take the raw lane; the one
  hazard-free guide doc (`interview-practice-evidence`) is emitted as `.svx`.
  Mermaid blocks render as labelled source (this surface ships no client diagram
  engine) — see the `when-to-use-what` guide page.
- **Deterministic + idempotent.** No timestamps; entries are sorted and output is
  byte-stable, so running the sync twice yields an identical tree and manifest.

### Synced files are build inputs (gitignored)

`src/content/**` is **gitignored except `src/content/.manifest.json`**, mirroring
the packet's own generated-artifacts discipline: the rendered bodies are derived,
so they are not committed, but the manifest is. The manifest pins the source
commit and records every entry (its packet inputs, output path, lane, order,
title, and a content hash); `src/lib/docs/registry.ts` reads it so titles / lanes
/ order come from the packet and never drift or get hand-typed here. Because the
bodies are gitignored, **a fresh checkout must sync before it can build** — the
`just build` / `check` / `test` / `dev` recipes run the sync first, and
`pnpm run sync-content` is available standalone.

The three original proof pages (`/reference/algorithm-templates`,
`/reference/common-patterns`, `/guide/interview-practice-evidence`) are now
produced entirely by this pipeline — the previously hand-copied files were
removed in favour of synced output.

## Develop

Node 22 + pnpm 10.13.1 (see `.nvmrc` / `packageManager`). If they are not on
your PATH: `nix shell nixpkgs#nodejs nixpkgs#pnpm -c <cmd>`.

```sh
just setup         # pnpm install --frozen-lockfile
just sync-content  # pull content from the study packet into src/content/
just dev           # sync-content, then vite dev
just check         # sync-content, then svelte-check
just lint          # prettier --check + eslint
just test          # sync-content, then vitest
just build         # sync-content, then static build -> build/
```

(`just` is a thin wrapper over the `package.json` scripts; use `pnpm run <x>`
directly if you prefer.)

## Provenance

Forked from a private house SvelteKit scaffold and stripped of estate coupling
(Bazel, Nix flake, private CI templates, projection/agent chrome). The docs
markdown renderer, doc registry, `repo.ts`, `SourceLink.svelte`, and the mdsvex
wiring were adapted from a sibling site (`greatfallstoolbus.org`); see the file
headers for per-file provenance.
