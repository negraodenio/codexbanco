-- 04_VERIFY_INSTALL.sql
-- Quick sanity checks after running 00, 01, 02, and optionally 03.

select
  'document_schemas' as table_name,
  count(*) as rows
from public.document_schemas
union all
select
  'rule_registry' as table_name,
  count(*) as rows
from public.rule_registry
union all
select
  'model_registry' as table_name,
  count(*) as rows
from public.model_registry;

select
  table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

