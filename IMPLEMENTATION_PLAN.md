# Implementation Plan

## Phase 0 - Audit

- Record empty-repository baseline.
- Document missing architecture and initial technical choices.

## Phase 1 - Trust Foundation

- Create a typed fraud domain model.
- Implement document provenance, hashing, MIME detection, and metadata extraction.
- Add schema registry, schema selector, schema validator.
- Add NIF, IBAN, date, financial, and duplicate validators.
- Add version registry.

## Phase 2 - Document Intelligence

- Implement document classification taxonomy.
- Add boundary detection and logical document packet processing.
- Add multi-model routing records for native, OCR, visual, deterministic, and forensic processors.

## Phase 3 - Evidence Intelligence

- Add extracted fields with field-level provenance.
- Add cross-document consistency checks.
- Add claim extraction and evidence graph builder.

## Phase 4 - Risk Intelligence

- Add semantic fraud categories with evidence references.
- Add evidence-first red flag engine.
- Add decomposable multi-score engine.

## Phase 5 - Governance

- Add append-only audit trail.
- Add human decision and override logging.
- Add pipeline observability records.

## Phase 6 - Experience and Management

- Create investigation workspace.
- Create KPI dashboard.
- Add typed API routes.
- Add Supabase-ready database migration and setup notes.

