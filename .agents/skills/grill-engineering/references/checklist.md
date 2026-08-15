# Engineering grill checklist

Authority: `docs/architecture-decisions/<stack>.md`. If the file is missing, still grill chapter themes; note baseline TODO.

## Stack route

| Prefix | Baseline |
| ------ | -------- |
| `backend-` | `docs/architecture-decisions/backend.md` (A–G) |
| `frontAdm-` | `docs/architecture-decisions/react-admin.md` when present |
| `front-` | `docs/architecture-decisions/react-web.md` when present |
| `mobile-` | `docs/architecture-decisions/flutter.md` when present |

## Always

1. Which layers/modules own this change? Any dependency bypassing existing ports/shared packages?
2. Caller-visible failure? Half-success left behind? How observed?
3. Performance/async/caching explicitly out-of-scope this slice?

## backend- (A–G)

Ask only touched chapters; map answers to the baseline design template.

- **A** feature package, Controller vs Service, `fw-base` reuse, config/secrets
- **B** payload I/O, multi-pass reads, size limits, pagination/N+1, request-thread work
- **C** transaction boundary, multi-resource order/compensation, idempotency, concurrency, DDL scripts
- **D** authz, sensitive outbound fields, validation/MIME authority, ownership
- **E** `R<T>` / error codes, port exception mapping
- **F** failure logs, half-success visibility, deferred metrics
- **G** which failure paths get tests this change

## Other stacks (baseline missing)

Always + short probes: data fetching/state, list performance, error/offline UX, sensitive storage — record in design until baseline exists.

## Exit

- Each item: decision or `out-of-scope + why`
- Hard-to-reverse system choice → offer `docs/adr/` via domain-modeling rules
- One-page summary ready for OpenSpec `design.md`
