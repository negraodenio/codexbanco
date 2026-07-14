# CodexBanco

Evidence-first banking document fraud and decision intelligence platform.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase

Create a Supabase project, copy `.env.example` to `.env.local`, fill the keys, then run the SQL in `supabase/migrations/202607140001_initial_evidence_platform.sql`.

Until Supabase is configured, the app uses local deterministic demo data and in-memory pipeline outputs.

