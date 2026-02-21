# Supabase Setup

## 1) Create `.env`

From the project root:

```bash
cp .env.example .env
```

Set these values in `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

You can find both in Supabase Dashboard:

- `Project Settings` -> `API` -> `Project URL`
- `Project Settings` -> `API` -> `Project API keys` -> `anon` `public`

## 2) Enable Email Auth

In Supabase Dashboard:

- `Authentication` -> `Providers` -> enable `Email`

For local testing, if you want immediate sign-in without email confirmation:

- `Authentication` -> `Providers` -> `Email` -> disable `Confirm email`

## 3) Run SQL schema

In Supabase SQL Editor, run these files in order:

1. `supabase/phase1.sql`
2. `supabase/phase1_templates.sql`
3. `supabase/phase2.sql`

## 4) Start app

```bash
npm run dev
```

Then open:

- `http://localhost:5173/login`

Create an account or sign in, then go to `/app`.
