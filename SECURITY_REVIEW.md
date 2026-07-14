# Security Review

## Implemented

- SHA-256 hashing before document transformation.
- MIME detection independent of declared MIME type.
- Maximum upload size of 10MB in the analyze API.
- Prompt-injection detection for instruction-like document content.
- No raw document body is written to normal audit events.
- Human override requires justification.
- Audit events are append-only in the application layer.
- Supabase RLS is enabled on sensitive tables in the initial migration.

## Sensitive Data

NIF, IBAN, identity numbers, and document text should not be emitted into application logs. Evidence payloads may contain sensitive values and must be access controlled.

## Supabase Requirements

After creating Supabase:

- Apply RLS policies tied to authenticated reviewers and tenant/application access.
- Store documents in private buckets.
- Use short-lived signed URLs.
- Keep service role key server-only.
- Add retention and deletion policies.
- Add malware scanning before processing production uploads.

## Dependency Risk

`npm audit` currently reports 7 vulnerabilities in transitive dependencies. The suggested fix uses breaking changes, so remediation should be performed deliberately with a dependency upgrade pass.

