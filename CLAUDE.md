# CLAUDE.md

See `AGENTS.md` for the full working guidance. In short: this is a static
SvelteKit reading surface for the DSA study packet, forked from a house scaffold
and stripped of estate coupling (Nix/private CI/private registries). Keep it
local and dependency-honest; everything must resolve unauthenticated from
public infrastructure. `MODULE.bazel` is a version-parity proof surface for the
`@tummycrypt/*` pins (see `AGENTS.md`), not a build system.
