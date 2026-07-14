# Architecture

## Overview

CodexBanco is now a Next.js/TypeScript evidence-first fraud investigation platform. The implementation separates extraction, validation, consistency checks, graph construction, scoring, and human governance.

## Layers

1. Intake and provenance: `src/lib/fraud/intake`
2. Classification and logical splitting: `src/lib/fraud/documents`
3. Schema registry and validation: `src/lib/fraud/schemas`
4. Processor routing: `src/lib/fraud/routing`
5. Field extraction with provenance: `src/lib/fraud/extraction`
6. Deterministic rules: `src/lib/fraud/validators` and `src/lib/fraud/rules`
7. Cross-document consistency: `src/lib/fraud/consistency`
8. Evidence graph: `src/lib/fraud/graph`
9. Semantic category analysis: `src/lib/fraud/analysis`
10. Red flags and scores: `src/lib/fraud/redflags`, `src/lib/fraud/scoring`
11. Governance and audit: `src/lib/fraud/governance`, `src/lib/fraud/audit`
12. Observability: `src/lib/fraud/observability`

## Runtime

- Local demo data runs through the same fraud pipeline used by `/api/loan/analyze`.
- Supabase integration is prepared with a client helper and SQL migration.
- No final decision is produced directly by AI. Scores are heuristic and decomposable.

## API Surface

- `POST /api/loan/analyze`
- `GET /api/loan/detail?id={id}`
- `GET /api/loan/{id}/evidence`
- `GET /api/loan/{id}/graph`
- `GET /api/loan/{id}/audit`
- `GET /api/kpi`

