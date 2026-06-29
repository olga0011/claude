# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server on localhost:3000
npm run build    # production build
npm run lint     # run ESLint
```

For Supabase local development:
```bash
supabase start   # start local Supabase stack
supabase stop    # stop local stack
supabase db push # push migrations to linked remote project
supabase migration new <name>  # create a new migration file
```

## Environment Variables

Copy `.env.local` and set:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Both legacy anon keys and new publishable keys work for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Architecture

**Next.js 15 App Router** with Supabase Auth using cookie-based sessions via `@supabase/ssr`.

### Supabase client pattern

There are two client factories — use the right one based on context:

- `lib/supabase/client.ts` — browser client (`createBrowserClient`). Use in Client Components.
- `lib/supabase/server.ts` — server client (`createServerClient`). Use in Server Components, Route Handlers, and Server Actions. **Create a new instance per function call** — never store in a module-level variable (required for Fluid compute compatibility).

### Session management

`proxy.ts` (Next.js middleware) calls `lib/supabase/proxy.ts → updateSession()` on every request. This refreshes the session cookie using `supabase.auth.getClaims()`. Any route not starting with `/`, `/login`, or `/auth` redirects unauthenticated users to `/auth/login`.

**Critical proxy rule**: never add code between `createServerClient()` and `supabase.auth.getClaims()` — this causes hard-to-debug random logouts.

### Auth flow

- `/auth/login`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/update-password` — auth pages backed by form components in `components/`
- `/auth/confirm` — Route Handler that verifies OTP tokens from email links (`verifyOtp`)
- `/auth/error` — error display page
- `/auth/sign-up-success` — post-signup confirmation page
- `/protected` — example authenticated route; uses `getClaims()` server-side and redirects if unauthenticated

### Authentication rules:
- Users can only access their own data. Enforce this with Row Level Security (RLS) policies on the database level — never rely solely on application-level checks
- Use Supabase Auth for all sign-in and session handling — never build custom auth or store passwords yourself
- Every signed-in-only page must call `supabase.auth.getUser()` on the server before rendering, which re-validates the session with the Supabase Auth server. Never use `supabase.auth.getSession()` for authorization decisions — it only reads the local/cookie data without verifying it against the server, so it can be spoofed
- Do not rely on Next.js middleware alone for protecting pages — always re-check the session in the Server Component / layout / route handler itself, since middleware can be bypassed in some routing scenarios
- Every page under /workspace requires a signed-in user; if `getUser()` returns no user, redirect to /login
- After a successful sign-in, redirect to /workspace
- After sign-out, redirect to /login

### Database

Migrations live in `supabase/migrations/`. The project is linked to a remote Supabase project (ref in `supabase/.temp/linked-project.json`). RLS is enabled on all tables — new tables must have explicit RLS policies before they are accessible via the API.

### UI

shadcn/ui components are in `components/ui/`. Styling uses Tailwind CSS. The `cn()` utility in `lib/utils.ts` merges class names (clsx + tailwind-merge).