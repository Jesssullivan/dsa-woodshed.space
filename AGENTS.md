# AGENTS.md — The DSA Woodshed

Guidance for AI agents and contributors working in this repo.

## What this is

A static SvelteKit reading surface for the DSA study packet. Prose and reference
sheets are authored in `Jesssullivan/dsa-study-packet`; this repo renders a
curated subset. It was forked from a private house scaffold and deliberately
stripped of estate coupling (Bazel, Nix flake, private `@tummycrypt` chrome,
private CI templates, projection/agent surfaces).

## Ground rules

- **No estate coupling.** Do not re-introduce Bazel (`BUILD.bazel`,
  `MODULE.bazel`), a Nix `flake.nix`, private CI templates, or private-registry
  packages. The retained `@tummycrypt/vite-plugin-a11y` and
  `@tummycrypt/vite-plugin-skeleton-colors` are published on the public npm
  registry and are the a11y / Skeleton-color build lane.
- **Stack pins are a contract.** `src/lib/house-stack-contract.test.ts` asserts
  Skeleton 4.15.2, TypeScript 6.0.x, pnpm 10.13.1, scoped `@lucide/svelte`, no
  direct `@zag-js`, Node 22. Change the pin and the test in the same commit.
- **Two content lanes** (see `README.md`): mdsvex `.svx` for prose,
  `src/lib/docs/markdown.ts` for code-heavy reference sheets. Do not run the
  reference sheets through mdsvex — their fenced Python breaks it.
- **Source-of-truth for content is the study-packet repo.** To change a
  reference sheet's text, edit it there; here you only re-copy it into
  `src/content/` and register it in `src/lib/docs/registry.ts`.
- **Security:** static site, no secrets. Never commit credentials.

## Commands

`just setup | dev | check | lint | test | e2e | build` (thin wrappers over the
`package.json` pnpm scripts). Use `nix shell nixpkgs#nodejs nixpkgs#pnpm -c ...`
if node/pnpm are not on PATH.
