# Supabase SQL Editor Queries

Run these files in order in the Supabase SQL Editor.

1. `00_RESET_PUBLIC_SCHEMA.sql`
   - Destructive reset of the `public` schema.
   - Use only on the broken/throwaway Supabase project.

2. `01_CREATE_INITIAL_EVIDENCE_PLATFORM.sql`
   - Creates the CodexBanco evidence platform tables and indexes.

3. `02_SEED_REGISTRIES.sql`
   - Seeds document schemas, rule registry, and model registry.

4. `03_DEV_RLS_POLICIES.sql`
   - Optional development-only permissive RLS.
   - Do not use as-is for production banking data.

5. `04_VERIFY_INSTALL.sql`
   - Verifies table creation and seed counts.

After this, copy `.env.example` to `.env.local` and fill:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

