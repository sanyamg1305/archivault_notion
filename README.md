# team.archivault.in

Internal tool for the Archivault team: a shared lead tracker, company wiki, and
FAQ cheat-sheet for cold calls, plus a password-gated Founder Mode with
per-rep commission tracking and private founder notes.

No individual logins — `/team/*` is open to anyone with the link, and
`/founder/*` is gated by one shared passphrase.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- PostgreSQL (hosted on Supabase) via Prisma 7

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in real values, see below
npx prisma migrate dev       # creates tables
npm run db:seed              # seeds starter Wiki + FAQ content
npm run dev
```

### Environment variables

See [.env.example](.env.example). You need:

- `DATABASE_URL` / `DIRECT_URL` — from Supabase: Project Settings > Database >
  Connect > Connection string. Use the pooled ("Transaction", port 6543)
  string for `DATABASE_URL` and the direct (port 5432) string for
  `DIRECT_URL`. This isn't optional on Vercel — Supabase's direct connection
  host is IPv6-only, and Vercel's serverless functions are IPv4-only, so
  `DATABASE_URL` must use the pooler or every request will fail to connect.
- `FOUNDER_PASSPHRASE_HASH` — bcrypt hash of the Founder Mode passphrase.
  Generate with `node -e "console.log(require('bcryptjs').hashSync('your-passphrase', 10))"`.
  **In `.env*` files, escape every `$` as `\$`** (Next.js expands `$VAR` in env
  files, which corrupts bcrypt hashes). Paste the raw, unescaped hash when
  setting this in the Vercel dashboard instead.
- `FOUNDER_SESSION_SECRET` — random secret for signing the founder-unlock
  cookie. Generate with `openssl rand -base64 32`.

## Data model

Defined in [prisma/schema.prisma](prisma/schema.prisma):

- `Lead` — shared lead list. `repName` is a free-text label (not an account)
  so the founder tracker can total sales per person without any login.
- `RepCommission` — per-rep commission type/rate, keyed by the same
  free-text `repName`.
- `FounderNote` — a single shared private notes doc, visible only in
  Founder Mode.
- `WikiPage`, `FaqItem` — company wiki and cold-call FAQ, editable by anyone
  in `/team/*`.

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Set the environment variables above in the Vercel project settings
   (Production + Preview).
3. Point the `team.archivault.in` subdomain at Vercel with a CNAME record:
   `team.archivault.in` → `cname.vercel-dns.com`
   (Vercel will confirm the exact target when you add the domain in
   Project Settings > Domains — use that value if it differs.)
4. Run `npx prisma migrate deploy` (and `npm run db:seed` once) against the
   production database before the first real visit.
