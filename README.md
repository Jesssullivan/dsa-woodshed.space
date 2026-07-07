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
  - **mdsvex** (`.svx`) for prose pages authored for this site
    (`src/content/guide`, rendered at `/guide/...`)
  - a dependency-free markdown renderer (`src/lib/docs/markdown.ts`) for the
    code-heavy reference sheets (`src/content/reference`, rendered at
    `/reference/...`), whose fenced Python would otherwise be misparsed by mdsvex

## Develop

Node 22 + pnpm 10.13.1 (see `.nvmrc` / `packageManager`). If they are not on
your PATH: `nix shell nixpkgs#nodejs nixpkgs#pnpm -c <cmd>`.

```sh
just setup     # pnpm install --frozen-lockfile
just dev       # vite dev
just check     # svelte-check
just lint      # prettier --check + eslint
just test      # vitest
just build     # static build -> build/
```

(`just` is a thin wrapper over the `package.json` scripts; use `pnpm run <x>`
directly if you prefer.)

## Provenance

Forked from a private house SvelteKit scaffold and stripped of estate coupling
(Bazel, Nix flake, private CI templates, projection/agent chrome). The docs
markdown renderer, doc registry, `repo.ts`, `SourceLink.svelte`, and the mdsvex
wiring were adapted from a sibling site (`greatfallstoolbus.org`); see the file
headers for per-file provenance.
