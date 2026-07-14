-- 00_RESET_PUBLIC_SCHEMA.sql
-- DESTRUCTIVE: removes every object in the public schema.
-- Safe for a broken/throwaway project. Do not run on production data.

drop schema if exists public cascade;

create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public
grant all on tables to postgres, anon, authenticated, service_role;

alter default privileges in schema public
grant all on routines to postgres, anon, authenticated, service_role;

alter default privileges in schema public
grant all on sequences to postgres, anon, authenticated, service_role;

