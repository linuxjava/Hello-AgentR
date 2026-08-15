---
name: grill-engineering
description: Stack-aware engineering interview against docs/architecture-decisions baselines (I/O, consistency, security, observability). Use after domain grilling / grill-with-docs, before OpenSpec propose, or when the user asks for grill-engineering.
---

# Grill Engineering

## Goal

After domain grilling, force stack architecture/performance trade-offs into explicit answers for later `design.md` — do not invent them at Apply time.

## Steps

1. Infer stack(s) from intended change prefix (`backend-` / `frontAdm-` / `front-` / `mobile-`). Cross-surface → grill each affected stack.
2. Load [references/checklist.md](references/checklist.md) and the matching `docs/architecture-decisions/<stack>.md` (if present).
3. Ask **one question at a time**; skip with `N/A + why`.
4. Pure copy/layout, no new API: may skip entirely; record skip reason for proposal.
5. Output a one-page engineering summary mapped to the baseline design template (e.g. backend A–G).

## Hand-off

Answers MUST be copied into OpenSpec `design.md` citing the baseline file. This skill does not replace `grill-with-docs` (domain/glossary).
