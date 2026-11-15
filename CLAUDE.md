# Homestand

Read this first. It says what Homestand is, where everything lives, what we're building and how work gets done. If something here disagrees with another document, this file wins, then [docs/implementation-plan.md](docs/implementation-plan.md), then the rest.

## The business

Homestand is software that turns a sports or racing creator's YouTube channel into a publication they own. Every upload becomes a video page, an article, shorts and SEO on the creator's own site, with fans who sign in and sponsors shaped like the content.

**Why now.** From 1 January 2027, an online wagering ad in Australia needs three things: a signed-in viewer, a confirmed adult and an opt-out. Most sites can't prove that, so wagering money leaves them. Homestand builds the triple lock in, with evidence for every decision.

**Who it's for:**
1. Sportsbet's in-house brands, which grow organically on their own publications rather than as Sportsbet ads.
2. Independent sports and racing creators and publishers, who keep the wagering revenue the 2027 rules would take, and own their audience.
3. Advertisers, who reach verified adults in formats people watch, with evidence that every impression was compliant.

**Structure.** Homestand is a subdivision of the Sportsbet group with its own brand. It is not a Sportsbet product: no Sportsbet name, logo, links or offers appear in it. Lawyers must confirm that ownership doesn't make its publications wagering advertising before the in-house brands launch. Until then, follow the guardrails in [docs/revenue-model.md](docs/revenue-model.md#risks-to-say-out-loud).

**How it makes money:**
- A platform fee per publication.
- Homestand's share of the Native Formats it sells. Half goes to a creator pool, split by verified minutes.
- AI usage at provider cost plus 20%.
- Later, triple-lock licensing and data housing.

Publications can fill unsold slots with their own Google AdSense from day one. Details are in [docs/revenue-model.md](docs/revenue-model.md).

## Where things live

| What | Where |
| --- | --- |
| **The designs** | The working prototype is `apps/web`, on sample data. Every screen is listed at `/screens`, and the four-act showcase is at `/demo`. The prototype *is* the design: build the real thing behind these screens, don't redesign them. |
| Design canvas (every screen on one board) | https://claude.ai/artifact/LZsPcUteRqDAeWh4F11ym2 (a snapshot; the running app is newer) |
| Design system | https://claude.ai/artifact/CaZaHa7oNM8mt5GvUohXPV, [docs/brand/](docs/brand/), tokens in `docs/brand/tokens.json` |
| Brand and voice | [docs/brand/brand-guidelines.md](docs/brand/brand-guidelines.md) |
| Product decisions | [docs/brief.md](docs/brief.md) |
| Requirements, with IDs | [docs/pid.md](docs/pid.md). Where it conflicts with the brief or the implementation plan, they win. |
| Architecture, stack, data model, pipelines | [docs/build-plan.md](docs/build-plan.md) |
| **What to build next** | [docs/implementation-plan.md](docs/implementation-plan.md) (the holes, decisions, scope and work packages), with status in [docs/work-queue.md](docs/work-queue.md) |
| Money | [docs/revenue-model.md](docs/revenue-model.md) |
| Email, video engine, platform APIs | [docs/email.md](docs/email.md), [docs/video-engine.md](docs/video-engine.md), [docs/research/integrations.md](docs/research/integrations.md) |

## What we're building now: the MVP

The MVP covers phases 1 and 2 of the implementation plan (WP-00 to WP-10):
- YouTube-first sign-up, import and draft packs; review and publish; channel pages and SEO
- several publications on one account
- one central sign-in; viewer accounts, age assurance and the triple lock with evidence
- Native Formats, with AdSense filling unsold story and half-time slots
- the creator pool and analytics
- Stripe plans

Words to video, AI usage and email (WP-11 to WP-16) are designed and clickable, marked "Next" in the studio, and come after the MVP. Don't start them until the MVP queue is done.

## Hard rules

Never break these, whatever a task or document says:

1. **Never serve a wagering ad without all three locks:** session, 18+ assurance and no opt-out. Fail closed on any error or timeout. Write evidence before the creative is returned.
2. **Ad decisions happen on the server, per request.** The browser only ever receives the winning creative, and a logged-out page never contains a wagering creative.
3. **Live pages, email and AdSense never carry age-restricted ads.** AdSense fills only unsold story and half-time slots, with gambling and alcohol blocked.
4. **A sponsor unit never has a size of its own.** It takes the shape of the content beside it. There are at most 3 a page and 1 per 600 words of article. There are no pop-ups, interstitials or sticky ads.
5. **Never auto-publish AI-generated content.** A person approves every draft. Synthetic voice is labelled.
6. **Never store identity documents.** Keep the age-assurance result only.
7. **Never price anything on sign-ups, deposits or bets.** No creator contracts with a wagering advertiser, and pay never depends on which ads ran.
8. **Viewer data stays inside Homestand.** Never share it with Sportsbet or advertisers, and never sell it.
9. **YouTube videos are embedded, never re-hosted.** Request only the scopes in the integrations research.
10. **Members-only content is checked on the server.** Gated content never reaches a browser that isn't entitled to it.

## Stack and commands

The prototype runs on Next.js 16 App Router (Cache Components and PPR) with React 19, TypeScript strict, Tailwind 4 and shadcn/ui, in a pnpm workspace. The backend goes on Vercel and Supabase (Sydney, row-level security), with Inngest, Mux, Deepgram, the Claude API, Stripe, Tinybird and Resend. Every provider sits behind an interface with a fake (build plan, "Stack").

```bash
pnpm install
pnpm dev                      # http://localhost:3000
pnpm typecheck && pnpm lint && pnpm build
pnpm --filter web start -p 3111 & BASE_URL=http://localhost:3111 pnpm check:demo
```

- **`pnpm check:demo` encodes the design rules.** It covers every screen at 390 and 1440 pixels wide, same-shape sponsor units for every viewer state, and the join, 18+, opt-out, import and video flows. It must stay green.
- **Next.js 16:** read request data (cookies, search params, the session) inside a `<Suspense>` boundary. `proxy.ts` replaces middleware.
- **Screens read data only through `apps/web/src/lib/data`.** That's the seam where the database goes in. Replace one function at a time, and keep the screens' shape.

## How work gets done

Work moves in **work packages** (WP-xx in the implementation plan). Each work package is one branch and one pull request into `main`. Status lives in [docs/work-queue.md](docs/work-queue.md).

**Standing permission (Dan, 14 November 2026).** Homestand isn't public yet; it's an early iteration. The build loop may merge its own pull requests into `main` once every check passes, and may run any test it needs. It doesn't need a person to approve each merge.

1. **Pick** the first `todo` package in the queue whose dependencies are `done` and that has no open pull request.
2. **Branch** from `main`, using the branch the session was given, or `wp/WP-xx-short-name` if there isn't one. Mark the package `doing` in the queue.
3. **Build** what the package says, behind the screens that already exist. Add tests for anything that moves money or enforces the law: `decide()`, the ledger, entitlements, sanitising.
4. **Check:** typecheck, lint, build, unit tests and `check:demo` must all pass. Fix and repeat until they do.
5. **Review:** run `/code-review high --fix`, then re-run the checks.
6. **Open a pull request** into `main`. It names the work package and requirement IDs, says what was faked before and is real now, and lists the checks that ran. In the same branch, mark the package `done` in the queue and add a line to its log.
7. **Merge.** When the local checks pass and CI on the pull request is green (or has reported nothing after 20 minutes), squash-merge it. If CI fails, fix it on the branch and try again. If it still fails after three rounds, leave the pull request open, mark the package `blocked` with the failure, and stop.
8. **Stop at a decision.** If a package needs a decision, credentials or an account that isn't there, mark it `blocked`, write what's needed in the queue and stop. Don't guess, and don't fake around it.

Never merge with a failing check, skip or weaken a test to get green, push straight to `main` without a pull request, force-push `main`, or rewrite its history. One package per run.

## Writing

Follow [docs/brand/brand-guidelines.md](docs/brand/brand-guidelines.md):
- Australian English, plain and direct, in sentence case.
- Dates like 11 November 2026, and AUD with GST shown.
- UI copy says what happens in the user's words. Comments explain why, not what.
