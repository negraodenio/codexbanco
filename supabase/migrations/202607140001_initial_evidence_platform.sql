create extension if not exists "pgcrypto";

create table if not exists public.loan_applications (
  id text primary key,
  applicant_name text not null,
  status text not null default 'MANUAL_REVIEW_REQUIRED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.physical_documents (
  id text primary key,
  application_id text not null references public.loan_applications(id) on delete cascade,
  original_filename text not null,
  declared_mime_type text not null,
  detected_mime_type text not null,
  file_size bigint not null,
  page_count integer not null,
  sha256 text not null,
  uploader_id text,
  source_channel text not null,
  correlation_id text not null,
  trace_id text not null,
  uploaded_at timestamptz not null,
  unique(application_id, sha256)
);

create table if not exists public.document_schemas (
  schema_id text primary key,
  name text not null,
  version text not null,
  document_type text not null,
  country text,
  status text not null check (status in ('draft', 'active', 'deprecated')),
  definition jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists public.logical_documents (
  id text primary key,
  application_id text not null references public.loan_applications(id) on delete cascade,
  parent_document_id text not null references public.physical_documents(id) on delete cascade,
  page_start integer not null,
  page_end integer not null,
  page_numbers integer[] not null,
  document_type text not null,
  subtype text,
  country text,
  classification_confidence numeric not null,
  classifier text not null,
  classifier_version text not null,
  requires_human_review boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.extracted_fields (
  id uuid primary key default gen_random_uuid(),
  application_id text not null references public.loan_applications(id) on delete cascade,
  document_id text not null references public.physical_documents(id) on delete cascade,
  logical_document_id text references public.logical_documents(id) on delete set null,
  schema_id text not null,
  field_name text not null,
  value jsonb not null,
  normalized_value jsonb,
  confidence numeric not null,
  page integer,
  bounding_box numeric[],
  extractor text not null,
  extractor_version text not null,
  extracted_at timestamptz not null
);

create table if not exists public.validation_results (
  id text primary key,
  application_id text not null references public.loan_applications(id) on delete cascade,
  document_id text references public.physical_documents(id) on delete cascade,
  rule_id text not null,
  rule_version text not null,
  category text not null,
  description text not null,
  severity text not null,
  input_fields text[] not null,
  passed boolean not null,
  evidence jsonb not null,
  created_at timestamptz not null
);

create table if not exists public.cross_document_checks (
  id uuid primary key default gen_random_uuid(),
  application_id text not null references public.loan_applications(id) on delete cascade,
  check_id text not null,
  status text not null,
  severity text not null,
  confidence numeric not null,
  left_evidence jsonb,
  right_evidence jsonb,
  explanation text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence (
  id text primary key,
  application_id text not null references public.loan_applications(id) on delete cascade,
  document_id text references public.physical_documents(id) on delete cascade,
  page integer,
  field_name text,
  value jsonb,
  location numeric[],
  detector text not null,
  detector_version text not null,
  explanation text not null,
  created_at timestamptz not null
);

create table if not exists public.red_flags (
  id text primary key,
  application_id text not null references public.loan_applications(id) on delete cascade,
  flag_type text not null,
  category text not null,
  severity text not null,
  confidence numeric not null,
  evidence jsonb not null,
  source_document_ids text[] not null,
  source_pages integer[] not null,
  detector text not null,
  detector_version text not null,
  rule_version text,
  explanation text not null,
  status text not null,
  created_at timestamptz not null
);

create table if not exists public.score_components (
  id uuid primary key default gen_random_uuid(),
  application_id text not null references public.loan_applications(id) on delete cascade,
  score_name text not null,
  score numeric not null,
  calibration text not null,
  components jsonb not null,
  weights jsonb not null,
  penalties jsonb not null,
  evidence_count integer not null,
  confidence numeric not null,
  score_engine_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.graph_nodes (
  id text not null,
  application_id text not null references public.loan_applications(id) on delete cascade,
  node_type text not null,
  label text not null,
  properties jsonb not null default '{}',
  primary key (application_id, id)
);

create table if not exists public.graph_edges (
  id text primary key,
  application_id text not null references public.loan_applications(id) on delete cascade,
  source_id text not null,
  target_id text not null,
  relationship_type text not null,
  properties jsonb not null default '{}'
);

create table if not exists public.audit_events (
  id text primary key,
  application_id text not null references public.loan_applications(id) on delete cascade,
  document_id text references public.physical_documents(id) on delete set null,
  event_type text not null,
  actor_type text not null,
  actor_id text not null,
  correlation_id text not null,
  trace_id text not null,
  metadata jsonb not null default '{}',
  pipeline_version text not null,
  created_at timestamptz not null
);

create table if not exists public.human_decisions (
  id text primary key,
  application_id text not null references public.loan_applications(id) on delete cascade,
  system_recommendation text not null,
  system_scores jsonb not null,
  human_decision text not null,
  reviewer_id text not null,
  reviewer_role text not null,
  justification text not null check (length(trim(justification)) > 0),
  override_reason text,
  model_version text not null,
  prompt_version text not null,
  rule_set_version text not null,
  score_engine_version text not null,
  pipeline_version text not null,
  created_at timestamptz not null,
  constraint override_requires_reason check (
    system_recommendation = human_decision or length(trim(coalesce(override_reason, ''))) > 0
  )
);

create table if not exists public.processing_runs (
  id text primary key,
  application_id text not null references public.loan_applications(id) on delete cascade,
  correlation_id text not null,
  trace_id text not null,
  stage text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  duration_ms integer,
  success boolean,
  retry_count integer not null default 0,
  processor text,
  model_used text,
  token_usage integer,
  estimated_cost numeric,
  error_code text
);

create table if not exists public.model_registry (
  model_id text primary key,
  provider text not null,
  model_version text not null,
  purpose text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.rule_registry (
  rule_id text not null,
  rule_version text not null,
  category text not null,
  description text not null,
  severity text not null,
  input_fields text[] not null,
  created_at timestamptz not null default now(),
  primary key (rule_id, rule_version)
);

alter table public.audit_events enable row level security;
alter table public.physical_documents enable row level security;
alter table public.logical_documents enable row level security;
alter table public.extracted_fields enable row level security;
alter table public.red_flags enable row level security;
alter table public.human_decisions enable row level security;

create index if not exists idx_physical_documents_application on public.physical_documents(application_id);
create index if not exists idx_red_flags_application on public.red_flags(application_id);
create index if not exists idx_audit_events_application_created on public.audit_events(application_id, created_at);
create index if not exists idx_extracted_fields_application_field on public.extracted_fields(application_id, field_name);

