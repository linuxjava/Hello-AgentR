---
name: openspec-architecture-review
description: Before OpenSpec apply, review design.md against docs/architecture-decisions stack baselines. Use when design is ready, before /opsx:apply, or when the user asks for architecture review / NFR gate.
compatibility: Requires an OpenSpec change with design.md.
metadata:
  author: hello-agentr
  version: "1.0"
---

# OpenSpec Architecture Review

## Goal

Block Apply when `design.md` does not respond to applicable stack baselines in `docs/architecture-decisions/`.

## Steps

1. Resolve change name (ask if ambiguous). Read `proposal.md` + `design.md`.
2. Infer stack(s) from change prefix / proposal; load matching baseline(s) (e.g. `backend.md`).
3. Execute [references/checklist.md](references/checklist.md).
4. Output only: `PASS` or `FAIL` + failed item ids + concrete fix hints.
5. On `FAIL`: stop; do **not** start `/opsx:apply`. On `PASS`: Apply may proceed.
