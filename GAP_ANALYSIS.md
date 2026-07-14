# Gap Analysis

## Main Gap

The repository had no application code. The full banking document fraud platform described in the master prompt needed to be created from scratch.

## Implemented First-Version Scope

This first implementation focuses on an evidence-first, auditable foundation:

- Document intake provenance with SHA-256 hashing.
- MIME detection and lightweight metadata/forensics extraction.
- Document taxonomy and classification.
- Logical document splitting support.
- Versioned schema registry and schema validation.
- Deterministic validators for Portuguese NIF, IBAN, dates, financial arithmetic, hashes, and required fields.
- Rule registry with evidence-backed validation results.
- Cross-document consistency checks.
- Evidence graph nodes and edges.
- Evidence-first red flag generation.
- Multi-score risk engine.
- Semantic category analysis constrained by available evidence.
- Append-only audit trail.
- Human decision logging with mandatory override justification.
- Pipeline observability.
- Next.js APIs and investigation/KPI UI.
- Supabase-ready migration SQL.

## Known Gaps Remaining

- Real OCR/PDF rendering and bounding boxes require provider integration and document storage.
- PDF digital signature and deep image forensic checks are represented as integration-ready indicators, not certified forensic conclusions.
- Fraud scores are heuristic and uncalibrated until labelled outcomes exist.
- Authentication and authorization are scaffolded conceptually but need the real Supabase project and RLS policies connected.
- Malware scanning is an integration point, not active scanning.
- Production document storage and signed URLs require Supabase Storage configuration.

