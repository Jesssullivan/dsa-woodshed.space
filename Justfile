# The DSA Woodshed — task runner.
#
# This is a minimal, self-contained Justfile: it wraps the pnpm scripts in
# package.json and needs no Nix devshell, Bazel, or estate tooling (all of
# which were stripped when this repo was forked from the house scaffold).
# If pnpm is not on PATH, run inside `nix shell nixpkgs#nodejs nixpkgs#pnpm`.

set shell := ["bash", "-uc"]

# List recipes.
default:
	@just --list

# Install dependencies (frozen lockfile).
setup:
	pnpm install --frozen-lockfile

# Type-check + svelte-check.
check:
	pnpm run check

# Lint (prettier --check + eslint).
lint:
	pnpm run lint

# Auto-format.
format:
	pnpm run format

# Unit tests (vitest).
test:
	pnpm run test:unit

# End-to-end tests (playwright).
e2e:
	pnpm run test:e2e

# Production static build (adapter-static -> build/). Custom-domain base="".
build:
	pnpm run build

# Preview the built site locally.
preview:
	pnpm run preview

# Dev server.
dev:
	pnpm run dev
