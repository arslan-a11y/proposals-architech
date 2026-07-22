# ArchiTech Proposals — Custom Node.js App

Custom web application for the Digital Proposal Management and Generation System, replacing the earlier monday-native build (deleted per CEO direction, 2026-07-22). Fully independent Postgres database; monday.com is no longer the source of truth.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** with ArchiTech design tokens extracted from Figma (see `src/app/globals.css`)
- **Prisma 7** ORM with the **pg driver adapter** → **PostgreSQL**
- **Recharts** for dashboard visualizations, **lucide-react** for icons
- Font: **Inter** (Latin). Hebrew running text uses Almoni per the design system (add the licensed font file to enable).

## Design language

Tokens pulled directly from the ArchiTech Design System Figma file:
`--at-ink #0C1218`, `--at-lime #C7E402`, indigo scale `#38368A / #4D54F5 / #ABC2FF`, surface `#F8F6F6`, alert `#FF0000`, success `#00C853`.

## Status — what's built vs. pending

**Done and verified (app builds, dev server returns 200, pages render):**
- Full Prisma schema: Company, Contact, Opportunity, Proposal, ProposalVersion, PricingLineItem, Template, Comment, Signature, ActivityEvent, OnboardingSubmission, User — covering the whole EPIC data model.
- Dashboard (`/`): stat cards (total, pipeline value, pending approval, opened-not-signed), status pie, conversion funnel, recent-proposals table with status badges.
- Proposals list (`/proposals`), Templates (`/templates`) and CRM (`/crm`) route stubs, app shell with sidebar nav, all styled in the Figma design language.
- Graceful fallback: with no DB connected yet, the UI serves sample data (banner shown) instead of crashing.
- monday→Postgres migration script (`scripts/migrate-from-monday.ts`) — **written, not yet executed** (needs a live DB + `MONDAY_API_TOKEN`).

**Also built & verified live against Supabase:**
- Proposal **detail view** (`/proposals/[id]`) — CRM links, contacts, activity, versions.
- **Pricing engine** — editable line items (product from איפיון/פרויקט/דיסקברי + free unit price, qty, VAT), live per-line and grand totals; server recalculates the stored proposal amount on every add/delete. Locked once the proposal leaves Draft/Pending-Corrections.
- **Proposal creation** (`/proposals/new`) — pick opportunity (auto-fills company) + template, auto-generated `Q-YYYY-####` number.
- **Status workflow actions** — Submit → Approve / Return-for-Corrections → Send, each writing an ActivityEvent (server actions in `src/lib/actions.ts`).
- **CRM** and **Templates** pages reading real DB data.

Verification note: all read/render paths were confirmed live in the browser against Supabase. The mutation paths (create + status transitions) compile cleanly and are wired as standard Next server actions, but were not click-tested end-to-end because the in-app browser pane was lagging navigations this session.

**Block editor & PDF (built & verified):**
- **Block-based content editor** (`/proposals/[id]/edit`, editable only in Draft/Pending-Corrections) — block types: heading, paragraph, bulleted list, divider, image, signature section; add / reorder / delete; inline edit; **debounced autosave** to `Proposal.contentJson` via server action; automatic RTL for Hebrew text. Read-only render of the same content on the detail page.
- **PDF generation** (`/proposals/[id]/pdf`) — server route using `@react-pdf/renderer`, branded A4 layout (ink header, lime accent, page numbers/footer), renders content blocks + the pricing table with VAT totals. Uses bundled **Rubik** (OFL) so both Latin and Hebrew render. Verified: valid PDF, and output grows correctly when Hebrew content blocks are added (glyphs embed).

Known PDF limitation: `@react-pdf/renderer` has limited bidi reordering, so *mixed* LTR/RTL within a single line may not order perfectly; pure-Hebrew and pure-Latin blocks render fine. A block's direction can be pinned via the block's `dir` field.

**Signature capture (built & verified end-to-end):**
- Standalone **customer-facing signing page** (`/sign/[id]`, no internal sidebar — app routes now live under an `(app)` route group so the customer view is clean). Shows the read-only proposal + pricing, then a signing panel.
- **Draw** (HTML canvas) **or Type** signature; typed names are rendered to a PNG so an image is always stored. Signer name/role/company/email/phone + terms-acceptance checkbox.
- `submitSignature` server action: **captures IP server-side** (`x-forwarded-for`), writes the Signature row, **freezes an immutable ProposalVersion snapshot**, sets status + signatureStatus to SIGNED (locking the proposal), logs a SIGNED ActivityEvent, → thank-you page.
- Detail page shows captured signatures (image, signer, order, IP, version) and, before signing, the shareable `/sign/[id]` link. The **PDF includes a signed-by block** once signatures exist.
- Verified live: filled + submitted the form, then confirmed in the DB that the proposal locked to SIGNED, the signature (incl. IP + image) was recorded, a version was frozen, and the audit event was written.

Known limitations: signing is keyed by proposal id, not yet a **cryptographically random token** (add one before exposing publicly); multi-signer is recorded with a signing order but **order is not yet enforced** (any signer can sign); no auth/roles yet.

**Still not built (remaining scope):**
- AI writing assistant, tokenized/secured public links, multi-signer order enforcement, onboarding flow, authentication/roles enforcement.

## Database — Supabase (provisioned & seeded)

A dedicated Supabase project is live: **ArchiTech Proposals** (ref `wivgnndcrlfbazuvwggx`, region ap-south-1, Postgres 17, free tier — $0/mo). It is separate from the existing LinkedIn-pipeline Supabase project, so the two never collide.

- Schema applied via migration `init_proposal_system` (all 14 tables).
- Seeded with 3 sample proposals + companies/opportunities/users so the app shows real DB rows immediately.

**One step remains to connect the running app** (the DB password is not retrievable via tooling, by design):
1. In `.env`, replace `[PASSWORD]` in `DATABASE_URL` with the project's DB password — copy the full string from Supabase Dashboard → Project Settings → Database → Connection string → **Transaction** pooler.
2. `npm run dev` — the dashboard now reads live Supabase data (the "sample data" banner disappears).

To pull real CRM data out of monday later: set `MONDAY_API_TOKEN` in `.env`, then
`npx tsx scripts/migrate-from-monday.ts` (board ids for the archi-tech-bunch account are hardcoded in the script).

### ⚠️ Security: Row Level Security is disabled

Supabase created the tables with RLS **off**. The app is safe as-is because it connects server-side via Prisma with the direct Postgres role (not the anon key). But do **not** use the public anon key against these tables from a browser until you enable RLS + policies. Remediation SQL is available in the Supabase advisor; enable deliberately (enabling without policies blocks all access).

## Run

```bash
cd app
npm run dev      # http://localhost:3000
npm run build    # production build
```
