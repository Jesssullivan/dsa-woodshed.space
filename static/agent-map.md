# DSA Woodshed Agent Map

A flat cheat sheet for an agent landing cold. This site is a reading surface;
the command surface below runs in the content repository checkout, not here.

## Read Order

1. Packet `AGENTS.md`: the practice and repository contract
2. Packet `TRACK-CONTRACT.md`: per-language track requirements
3. This site's `/agent` route

Packet repo: https://github.com/Jesssullivan/dsa-study-packet

## Just Command Surface (packet repo)

- `just practice-start comments|reacto|clarp|umpire`
- `just practice-next`
- `just practice-test`
- `just practice-watch`
- `just practice-repl`
- `just practice-finish "<one concrete fix>"`
- `just interview`
- `just catalog "<their words>"`

## Machine Keys

Relayed verbatim between the interviewer persona and the candidate, never
inferred:

- `STATE`, `START`, `QUEUE`, `MATCH`, `CHOOSE`, `SUGGEST`: `just catalog` output
- `READY`, `NOT_FOUND`: catalog resolution outcomes
- `NEXT`: `just practice-next` progress relay
- `PRACTICE: topic/problem`: a `just interview` draw

## Prohibited

- Never write, edit, or solve candidate-owned source or test files.
- Never read, score, or log private arrival writing.
- Never guess or search the tree for a named problem; resolve it through
  `just catalog` first.
- No estate or employer coupling: both the packet repository and this site
  stay public and company-neutral.
