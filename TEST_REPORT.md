# Test Report

## Baseline Before Implementation

- Test command: unavailable.
- Test count: 0.
- Build command: unavailable.
- TypeScript status: not applicable.

## After Implementation

Commands run:

- `npm run typecheck`: passed.
- `npm test`: passed.
- `npm run build`: passed.
- `npm audit --audit-level=moderate`: failed due to dependency advisories.

Test result:

- Test files: 5 passed.
- Tests: 8 passed.

Coverage areas:

- Portuguese NIF validation.
- IBAN MOD-97 validation.
- Date and salary validation.
- Schema selection.
- Schema validation for required fields.
- Decomposable scoring.
- Evidence-backed cross-document contradiction.
- Document prompt-injection detection.

## Build Result

Next.js production build completed successfully for:

- `/`
- `/kpi`
- API routes for KPI, loan detail, evidence, graph, audit, and analyze.

## Known Test Gaps

- Real OCR integration tests.
- Supabase persistence integration tests.
- Authentication/RLS tests.
- Browser interaction tests for the reviewer workspace.
- Large/malformed PDF adversarial fixture tests.

