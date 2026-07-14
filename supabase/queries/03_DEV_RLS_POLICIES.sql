-- 03_DEV_RLS_POLICIES.sql
-- Development-only RLS policies.
-- This allows anon/authenticated access so the app can be wired quickly.
-- Replace with tenant/reviewer scoped policies before production data.

alter table public.loan_applications enable row level security;
alter table public.physical_documents enable row level security;
alter table public.document_schemas enable row level security;
alter table public.logical_documents enable row level security;
alter table public.extracted_fields enable row level security;
alter table public.validation_results enable row level security;
alter table public.cross_document_checks enable row level security;
alter table public.evidence enable row level security;
alter table public.red_flags enable row level security;
alter table public.score_components enable row level security;
alter table public.graph_nodes enable row level security;
alter table public.graph_edges enable row level security;
alter table public.audit_events enable row level security;
alter table public.human_decisions enable row level security;
alter table public.processing_runs enable row level security;
alter table public.model_registry enable row level security;
alter table public.rule_registry enable row level security;

drop policy if exists dev_all on public.loan_applications;
create policy dev_all on public.loan_applications for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.physical_documents;
create policy dev_all on public.physical_documents for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.document_schemas;
create policy dev_all on public.document_schemas for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.logical_documents;
create policy dev_all on public.logical_documents for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.extracted_fields;
create policy dev_all on public.extracted_fields for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.validation_results;
create policy dev_all on public.validation_results for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.cross_document_checks;
create policy dev_all on public.cross_document_checks for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.evidence;
create policy dev_all on public.evidence for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.red_flags;
create policy dev_all on public.red_flags for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.score_components;
create policy dev_all on public.score_components for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.graph_nodes;
create policy dev_all on public.graph_nodes for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.graph_edges;
create policy dev_all on public.graph_edges for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.audit_events;
create policy dev_all on public.audit_events for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.human_decisions;
create policy dev_all on public.human_decisions for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.processing_runs;
create policy dev_all on public.processing_runs for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.model_registry;
create policy dev_all on public.model_registry for all to anon, authenticated using (true) with check (true);

drop policy if exists dev_all on public.rule_registry;
create policy dev_all on public.rule_registry for all to anon, authenticated using (true) with check (true);

