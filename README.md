# The DSA Woodshed

[The DSA Woodshed](https://dsa-woodshed.space) is a static SvelteKit front door
for editor-first technical interview practice. A visitor can start a GitHub
Codespace, choose a native Copilot slash command, write reasoning as comments,
implement a solution, and run focused tests. No separate agent CLI or repository
API key is required.

The public information architecture is deliberately small:

- **Start** explains the editor practice loop and opens Codespaces.
- **Practice** presents the core Practice Drills.
- **Library** groups algorithms, reference sheets, Advanced Exercises, and
  Printables.
- **Method** explains how and why to practice.
- **Project** is a concise public landing that links the source-of-truth and
  public-boundary contract.

Search covers the landing routes at `/library`, `/challenges`, `/practice`, and
`/printables`, plus their detailed content.

## Content contract

The public
[DSA study packet](https://github.com/Jesssullivan/dsa-study-packet) is the
source of truth for guides, reference sheets, algorithms, and printable source
material. This repository owns the site shell, navigation, route copy, and
rendering code.

`scripts/sync-content.mjs` reads a packet checkout at
`WOODSHED_PACKET_PATH`, or `../dsa-study-packet` by default, and writes build
inputs under the gitignored `src/content/`. It also updates the committed
`src/content/.manifest.json`. The source sync reads the packet at `HEAD`, is
deterministic, and does not use the packet working tree.

The same command resolves the packet's latest stable GitHub release, downloads
its single `booklet.pdf`, and verifies the release size, SHA-256 digest, and PDF
signature before accepting it. Generated metadata lives at the gitignored
`src/content/.booklet.json`; the PDF uses a digest-addressed path under
`static/generated/`. This step requires outbound access to the public GitHub API
and release asset. It fails closed on a timeout, ambiguous asset, oversized
asset, or verification mismatch.

The packet is public. Local builds and GitHub Actions use the normal read-only
checkout path and require no deploy key or repository secret. Each rendered
content page links back to its packet source.

Two rendering lanes keep the build predictable:

- mdsvex renders prose stored as `.svx`.
- `src/lib/docs/markdown.ts` renders code-heavy reference sheets whose Python,
  braces, and angle brackets are unsafe for mdsvex.

The site is fully prerendered with SvelteKit 2, Svelte 5, Skeleton 4, and
`adapter-static`. Pagefind builds the static search index after the site build;
`scripts/verify-search-index.mjs` checks the detailed content lanes, the
required landing routes, and every result URL.

## Develop

Use Node 22 and pnpm 10.13.1, as pinned by `.nvmrc` and `packageManager`.

```sh
pnpm install --frozen-lockfile
pnpm run sync-content
pnpm run dev
```

`just` is the shorter front door:

```sh
just setup
just dev
just check
just lint
just test
just build
just verify-booklet
just e2e
```

`dev`, `check`, `test`, and `build` sync packet content first. The underlying
`pnpm run check`, `pnpm run lint`, and `pnpm run test:unit` commands can validate
site code against content that is already present. `just verify-booklet` checks
the already-synced static PDF against its generated metadata without fetching it
again.

## Deploy

Pushes to `main` and a daily scheduled refresh run
`.github/workflows/deploy-pages.yml`. The workflow checks out this repository
and the public packet, syncs content, builds the static site, and publishes
`build/` to GitHub Pages at `dsa-woodshed.space`. CI runs the same check, lint,
unit, build, and browser gates on pull requests.

The app began as a private house SvelteKit scaffold. Estate coupling was
removed: there are no Bazel files, Nix flake, private CI templates,
private-registry packages, or agent projection surfaces here.
