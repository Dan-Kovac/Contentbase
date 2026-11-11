# Homestand build plan

A simple plan to take Homestand from brand to pilot. The detail lives in [pid.md](pid.md). Requirement IDs are the unit of work, and every commit and PR names them.

## Where we are (11 November 2026)

- **Brand guidelines**: second version (homestand. wordmark, black, white and grey with the Pitch gradient, client customisation rules). Tokens, type, voice, ad standards and 11 components are in the [Homestand design system](https://claude.ai/artifact/CaZaHa7oNM8mt5GvUohXPV), with the same tokens as a shadcn theme in [`brand/globals.css`](brand/globals.css).
- **Screens**: inventory written ([screens.md](screens.md)), designs not started.
- **Code**: the repo was empty, so this is a fresh build. No earlier code to audit.

## Proposed stack (needs your approval)

| Layer | Choice | Why |
| --- | --- | --- |
| Monorepo | pnpm workspaces + Turborepo | One repo for web, UI kit and services (PID, Section 15) |
| Web app | Next.js (App Router, RSC), TypeScript strict | Server-rendered channels for SEO; one app for channels, studio and admin |
| UI | shadcn/ui on Tailwind v4, Lucide icons | Your call; the design system tokens map 1:1 onto shadcn variables |
| Database | Postgres on Neon (Sydney) with Drizzle ORM and row-level security | Relational tenancy, RLS per organisation |
| Auth | Better Auth (creators and viewers, magic link, Google, Apple) | Self-hosted, so the network-wide viewer identity stays in our database |
| Video | Mux | Upload, HLS, thumbnails and clipping without running video infrastructure |
| Transcription | Deepgram | Word timings, speaker labels, Australian English |
| LLM | Claude API | Drafts, rewrites, compliance pre-check |
| Jobs | Inngest | Durable imports, retries and fan-out without managing queues |
| Payments | Stripe Billing | GST invoices, trials |
| Analytics | First-party events into Tinybird | Fast dashboards with no third-party trackers |
| Hosting | Vercel (Sydney functions) + Cloudflare R2 for files | Edge-cached channel pages, data kept in Australia |

Every provider sits behind an interface with a fake for tests.

## Repo layout

```
apps/web            Next.js: marketing, channels (by host), studio, admin, account
packages/ui         shadcn components + Homestand components (AdSlot, VideoCard…)
packages/db         Drizzle schema, migrations, RLS policies
packages/ads        Ad decision service: slot rules, triple lock, evidence writer
packages/pipeline   Inngest functions: imports, video, transcripts, drafts
packages/providers  Interfaces and fakes: video, speech, LLM, age assurance, payments
docs/               PID, brand, screens, this plan, module READMEs
```

## Milestones

Each milestone ends with something you can click through on staging.

| # | Milestone | Requirement IDs | Done when | Target |
| --- | --- | --- | --- | --- |
| 0 | Brand and screens | CHN-02 (design) | Brand signed off; every screen in screens.md designed on the canvas | Dec 2026 |
| 1 | Foundations | — | Monorepo, CI, dev/staging/prod in Sydney, creator auth, organisations and channels with RLS, audit log, shadcn theme from the design system | Early Jan 2027 |
| 2 | Channel rendering | CHN-01–05, CHN-07, SEO-01–07 | A seeded channel renders home, video, article, short, section, search and about in the Editorial template; Lighthouse SEO ≥ 95 | Late Jan |
| 3 | Upload to published | ING-01–11, EDT-01–06 | Upload a 30-minute video, get an article draft, chapters, SEO fields and shorts in under 10 minutes, edit and publish | Late Feb |
| 4 | Migration | MIG-01–08 | Import a YouTube channel and a WordPress site with 301s and a clean crawl report | Mid Mar |
| 5 | Viewers | AUD-01–04 | One viewer account across channels; follow, digest, exclusive gate, account centre | Late Mar |
| 6 | Ads and triple lock | ADS-01–09, TLK-01–10, CHN-06 | Slots, direct campaigns, AdSense in slots; wagering ads only with all three locks, failing closed, with evidence logged and exportable | Mid Apr |
| 7 | Money, numbers, admin | BIL-01–02, ANL-01–04, ADM-01–05 | Stripe tiers and trial; creator, advertiser and pilot dashboards; admin console | Late Apr |
| 8 | Hardening | CHN-02 (other templates), NFRs | Broadcast and Minimal templates, accessibility and Core Web Vitals pass, external compliance audit, penetration test | 30 Apr 2027 |

Pilot starts 3 May 2027 (Gate 1).

## How we build the website and platform together

There is one Next.js app and the hostname decides the surface:

- `homestand.com.au` serves the marketing site and sign-up.
- `studio.homestand.com.au` serves the creator studio, and `admin.` the admin console.
- `<channel>.homestand.com.au`, or a custom domain, serves the channel.

All four share `packages/ui`, so a design change to a component lands everywhere at once.

## Decisions needed before the relevant milestone

| Decision | Blocks | Owner |
| --- | --- | --- |
| Approve the stack above | Milestone 1 | Dan |
| Final product name and domain (Homestand is a placeholder) | Launch only; the code keeps the name in one config value | Dan |
| Age-assurance provider shortlist | Milestone 6 (TLK-02) | Dan + counsel |
| Evidence retention period (12 months minimum, 7 years recommended) | Milestone 6 (TLK-05) | Counsel |
| Wagering CPC allowed? | Milestone 6 (ADS-05) | Counsel |
| Ad density caps (1 per 600 words, 3 a page) | Milestone 6 (ADS-02) | Dan |
| Trial needs a card or not | Milestone 7 (BIL-02) | Dan |
| Pricing tiers | Milestone 7 (BIL-01) | Dan |
| Pilot channel list | Pilot | Dan |

## Hard rules (from the PID)

- Never serve a wagering ad without all three locks. Fail closed on any error.
- Never price anything on sign-ups, deposits or bets.
- Never let a creator contract directly with a wagering advertiser through the platform.
- Never auto-publish AI-generated content.
- Never store identity documents.
