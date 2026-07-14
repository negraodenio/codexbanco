# Database Changes

## Migration Added

`supabase/migrations/202607140001_initial_evidence_platform.sql`

## Main Tables

- `loan_applications`
- `physical_documents`
- `document_schemas`
- `logical_documents`
- `extracted_fields`
- `validation_results`
- `cross_document_checks`
- `evidence`
- `red_flags`
- `score_components`
- `graph_nodes`
- `graph_edges`
- `audit_events`
- `human_decisions`
- `processing_runs`
- `model_registry`
- `rule_registry`

## Compatibility

The repository had no previous migrations or tables, so no destructive database changes were made.

## Reversibility

The migration uses `create table if not exists`. A production rollback should drop tables in reverse dependency order only after preserving regulated audit records according to retention policy.

