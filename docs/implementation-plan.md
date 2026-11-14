# Homestand: gaps and implementation plan

Written 14 November 2026. This is the handover from the clickable prototype (`apps/web`, every screen at `/screens`) to a working product. It lists what the design still gets wrong or leaves open, cuts the scope, and breaks the build into work packages small enough to ship one per pull request.

Read with the [build plan](build-plan.md), which keeps the architecture, stack, pipelines and milestones 0–8. This document adds what the build plan predates: multiple publications per account, words to video with AI credits, email, the same-shape sponsor rule and the channel calls to action. Where the two disagree, this document wins.

## Decided on 14 November 2026

These settle open questions below. Where a row in section 1 or 8 says otherwise, this list wins.

| Decision | What it means |
| --- | --- |
| **Strip back to an MVP** for the showcase | The MVP is phases 1 and 2: Publish and Earn, plus several publications on one account. Words to video and email are designed, clickable and marked "Next" in the studio, and are built after the MVP. The showcase script is at `/demo`. |
| **Google AdSense is back**, as fill | A publication can connect its own AdSense account. It fills only story and half-time slots that Homestand hasn't sold, inside the same box (responsive in-feed and in-article units, Auto ads off), with gambling and alcohol blocked in the AdSense account. Google pays the publisher directly. It never fills shorts, chapters, Presented by credits or live pages. |
| **One central sign-in, separate records** | One login at the central accounts host. The person's creator record (publications, team, billing) and reader record (follows, newsletters, 18+ result, opt-outs) are separate tables, both keyed to that login, so moving between the studio and reading is a link, not another sign-in (B1, B2). |
| **Imported subscribers get a welcome sign-in email** | An import creates a waiting reader account for each address. The first email is a sign-in link to see members-only content, with no password and a one-click unsubscribe (B3). |
| **Payouts: the pool** | Half of net Native Format revenue goes into a monthly pool, split by verified minutes. Signed-in minutes count in full; logged-out minutes count a fifth. Pay never depends on which ads ran (B5). |
| **Video engine** | Remotion on AWS Lambda, Azure Neural TTS (Australian voices), Pexels and Pixabay imagery, and Claude for the script. Generative video comes later (B7, [video-engine.md](video-engine.md)). |
| **Structure: a Sportsbet subdivision, not a Sportsbet product** | Homestand is owned within the Sportsbet group but carries its own brand: no Sportsbet name, logo or links in the product. Branding alone doesn't settle the regulatory question below, so the guardrails in the [revenue model](revenue-model.md#risks-to-say-out-loud) apply from day one. |
| **AI at provider cost plus 20%, on a ledger** | AI usage is a dollar balance shared by the account. Every line is the provider's price plus 20% (`MARGIN` in `lib/credits.ts`). Renders hold, then charge or release. The balance is the sum of the ledger (B9). |

## How to use this document

1. Settle the decisions in [section 8](#8-decisions-needed) that block your work package. Most are one line.
2. Pick the next work package in [section 6](#6-work-packages). Each one names the screens that already exist, what they fake today, what to build and how to know it's done.
3. Replace one function in `apps/web/src/lib/data` at a time. Screens read only through that seam, so a work package is done when its screens show real data and nothing on them changed shape.
4. Keep `pnpm check:demo` green (see [section 9](#9-checks-that-keep-the-design-honest)). It encodes the design rules, such as sponsor units matching their neighbours and no wagering sponsor for a logged-out viewer.

## 1. The holes, ranked

### A. Fix before a real viewer sees the product

These are fine in a demo and wrong in production. Each has a work package.

| # | Hole | Where it is | Why it matters | Fix (work package) |
| --- | --- | --- | --- | --- |
| A1 | **Every viewer state's sponsor ships to the browser.** `slotOptions()` sends one sponsor per viewer state, and the browser picks one. A logged-out page carries the wagering creative in its payload | `components/channel/lib.ts`, `viewer.tsx` (`SponsorSlot`) | It isn't the triple lock. The decision has to happen on the server, per request, with evidence written before the creative is returned (build plan, "Ad decision") | Server-side decision per slot inside a Suspense hole; the browser only gets the winner (WP-07) |
| A2 | **Members-only content is in the payload.** `MembersOnly` swaps on the client, so the gated video and article are sent to everyone | `components/channel/channel-cta.tsx` | Anyone can read it in the page source | Read the session on the server and fetch the gated body only for members (WP-06) |
| A3 | **The viewer is whoever the browser says.** Viewer state lives in localStorage and `?as=` | `viewer.tsx`, `DemoBar` | No session, no age assurance and no opt-out record means no lock | Supabase session, with age assurance and opt-out read on the server (WP-05, WP-07) |
| A4 | **The YouTube player is ours.** For YouTube-sourced videos the page draws its own controls, and the chapter sponsor credit is synced to YouTube playback | `video-player.tsx`, `video-client.tsx` | YouTube's API policies limit changes to the embedded player and sponsorships tied to YouTube content. The pre-roll is already uploads-only | Get a policy read before milestone 4. Fallback: standard YouTube controls, with chapter sponsors on uploads only (WP-09) |
| A5 | **Nothing checks the plan.** "Add a publication" goes straight to sign-up; credits, sends and video hours have no caps on the server | `studio/publications`, `publication-switcher.tsx` | Starter would get unlimited publications, and a runaway render loop would bill the customer | One `entitlements(org)` function used by every server action (WP-03) |
| A6 | **Pasted email HTML isn't cleaned.** The builder accepts raw HTML | `components/studio/email/builder.tsx` | Script injection in the studio preview, and phishing sent from a trusted domain | Sanitise on save with an allowlist; render previews in a sandboxed iframe (WP-12) |
| A7 | **Unsubscribe doesn't exist.** Emails promise "manage your newsletters" but there's no one-click unsubscribe or preference page | `docs/email.md`, the email footer block | The Spam Act requires a working unsubscribe. Gmail and Yahoo bulk-sender rules require one-click `List-Unsubscribe`, DMARC and a spam rate under 0.3% | Signed one-click endpoint plus a preference page at `/c/[channel]/newsletters` (WP-12) |

### B. Design gaps: decided nowhere yet

| # | Gap | Recommendation |
| --- | --- | --- |
| B1 | **Decided.** **One sign-in across custom domains.** Cookies are per domain. A viewer signed in on `footyfix.com.au` isn't signed in on `trackside.homestand.au`, yet the promise is one account everywhere | A central `accounts.homestand.au` with a redirect handshake that sets a first-party session on each channel host. Age assurance and opt-out stay on the central account (WP-05) |
| B2 | **Decided.** **Creators and viewers are separate tables** (`users`, `viewers`), so a creator who watches is two people | Keep both tables, both keyed to the one Supabase auth identity. The studio's account menu links to the reader account, and the reader account links back to the studio when the person runs publications |
| B3 | **Decided.** **Imported subscribers aren't members**, but newsletters are "signed-in members only" | An import creates unclaimed viewer accounts (email only) subscribed to the streams they consented to. The first email carries a claim link. Imports without recorded consent get a confirmation email first (double opt-in) and nothing else until they confirm |
| B4 | **Follow digests and newsletters overlap** (`follows.digest` vs email streams) | Following a channel subscribes to its default stream. Drop `follows.digest` |
| B5 | **Decided.** **Two payout models.** PID BIL-03 pools ad revenue by verified minutes; the studio shows earnings per sponsor | Keep the pool: it's simpler to explain, and it keeps creators away from wagering deals (a hard rule). The studio shows the pool share plus which formats ran, not money per sponsor |
| B6 | **Team roles.** Publisher promises team roles; the build plan has owners only. In-house brands (Sportsbet) need people limited to some publications | MVP: org-level owner and editor. Next: per-publication access (`memberships.channel_ids[]`) |
| B7 | **Decided.** **The video engine.** "Higgsfield" is generative video. Vox-style explainers are voiceover, charts, tables and licensed imagery, which is programmatic | Remotion (rendered on Lambda) for templates, charts and tables; a text-to-speech provider for voice; licensed stock imagery. Generative clips (Higgsfield or similar) are an optional scene type behind the same interface. Remotion needs a company licence |
| B8 | **Where generated videos go.** Publishing to YouTube needs the `youtube.upload` scope, which means another round of Google verification | MVP: generated videos live on the channel (Mux) and can be downloaded. Push to YouTube comes later |
| B9 | **Decided.** **Credits have no ledger.** There are no holds, refunds on failed renders, expiry or per-publication caps | An append-only ledger: hold on start, capture on success, release on failure. The balance is a sum, not a stored number |
| B10 | **Template marketplace.** It needs submissions, review, licensing and payouts to designers | MVP: three included templates plus first-party paid ones. The marketplace waits for Stripe Connect |
| B11 | **Data housing and triple-lock licensing have no product.** They're revenue lines with no screens | Sales-led. Don't build until a design partner signs. Evidence export (ADM-03) is the seed of both |
| B12 | **Synthetic media disclosure.** The design says synthetic voice is disclosed, but no screen shows it | A "Voiced with AI" label under the player and in the video's structured data, set automatically on generated videos |
| B13 | **Email sponsors.** Email says "no age-restricted sponsors", but no review covers email creative | Email sponsor blocks draw only from approved non-wagering creative. The builder can't insert anything else |

### C. Documents that contradict each other

The brief decided two channel modes (Standard and Age-verified). On 14 November, AdSense came back as fill for unsold slots, and the brief now says so. Older documents still say otherwise in places. Fix them in WP-00 so nobody builds the old version.

| Document | Says | Change to |
| --- | --- | --- |
| `pid.md` lines 17, 107, 243 (ADS-08), 342, 372, 458, 562 | AdSense in slots, in the stack, on Publisher and as a pilot criterion | Keep, narrowed: the publication's own AdSense fills unsold story and half-time slots only, gambling and alcohol blocked |
| `pid.md` lines 181 (CHN-06), 225 (TLK-07), 228 (TLK-10), 292 | Racing-only mode, and AdSense in the lock-off block | Two modes; racing-only is parked pending legal advice |
| `pid.md` line 254 (BIL-03) | Pool payout | Keep, and add that the studio shows pool share (B5) |
| `screens.md` D17 | AdSense on/off, Racing-only | Keep AdSense (as fill); drop Racing-only |
| `build-plan.md` | `channels.adsense_enabled`, "AdSense in slots" in milestone 7 | Replace with `channels.adsense` (publisher ID, fill on or off, categories confirmed); add the tables in [section 4](#4-data-model-additions) |

## 2. Scope: the MVP

The MVP proves three things: our in-house brands (and any publisher) grow on their own publications with less work, verified viewers sign up, and advertisers pay for evidence. Everything else waits.

| In the MVP | Narrowed | After the MVP |
| --- | --- | --- |
| YouTube-first sign-up, import and draft packs | Multiple publications: switcher and the All publications view, org-level roles only | Per-publication roles |
| Review, publish, channel pages, SEO | Members-only content (free membership) | Paid memberships |
| One central sign-in; viewer accounts, age assurance, triple lock, evidence | AdSense as fill for unsold story and half-time slots | Homestand-run Ad Manager for publications without AdSense |
| Native Formats, creative review, same-shape rule, the creator pool | Analytics and earnings per publication | Data housing, triple-lock licensing |
| Stripe plans and trial | | Words to video and AI usage (WP-14 to WP-16); email (WP-11 to WP-13); site migration |

## 3. Phases

Four phases, each one usable on its own. They map onto the build plan's milestones, with two milestones added.

| Phase | What a customer can do at the end | Build plan milestones | Work packages | Target |
| --- | --- | --- | --- | --- |
| 1. **Publish** | Sign up with YouTube, get a channel, review and publish draft packs, run several publications | 0–6 | WP-00 to WP-04, WP-08 to WP-10 | 2 Apr 2027 |
| 2. **Earn** | Viewers join, confirm 18+ and opt out; Native Formats serve with evidence; members-only content | 7 | WP-05 to WP-07 | 23 Apr 2027 |
| 3. **Grow** (after the MVP) | Members choose newsletters; the publisher builds and sends them from their own domain; imports get a welcome sign-in email | 9 (new) | WP-11 to WP-13 | June 2027 |
| 4. **Create** (after the MVP) | Turn an article into a video using brand kit, voice and a template, at provider cost plus 20% | 10 (new) | WP-14 to WP-16 | July 2027 |

Milestone 8 (billing, analytics, admin and hardening) finishes the MVP. Phases 3 and 4 follow the pilot start.

## 4. Data model additions

These add to the build plan's tables. All carry `org_id` and the same RLS policy unless noted.

| Table | Key columns | Notes |
| --- | --- | --- |
| `viewers` | user_id (auth uid), email, display_name, claimed_at, created_at | The reader record, separate from the creator record (`users`), both keyed to the one login (B2). `claimed_at` is empty for imported addresses until they sign in |
| `memberships` | org_id, user_id, role (owner, editor), channel_ids[] (null means all) | Adds `channel_ids` for per-publication access later (B6) |
| `brand_kits` | channel_id, colours jsonb, fonts, logo_ref, voice_id, tone, banned_words[] | Shared by channel design, video templates and email |
| `credit_ledger` | id, org_id, channel_id, kind (allowance, topup, hold, charge, release), provider, provider_cost, amount, ref_type, ref_id, at | AUD. Append-only (INSERT and SELECT only). `amount` = provider cost × 1.2 for charges. Balance = sum |
| `credit_caps` | channel_id, monthly_cap, alert_pct, alerted_at | Checked before every hold |
| `video_templates` | id, owner (homestand, org), name, formats[], price_cents, spec jsonb, version, status | `spec` is the Remotion composition id plus slots |
| `template_licences` | org_id, template_id, source (included, purchase), stripe_ref | One purchase covers every brand on the account |
| `video_jobs` | id, channel_id, source_content_id, template_id, format (long, short, in_app), script jsonb, scenes jsonb, status, credits_held, credits_used, provider_refs jsonb, output_asset_id, error | Output becomes a `content` row with `generated = true` |
| `content` | adds generated, ai_disclosure, members_only | `members_only` replaces the prototype's `exclusive` |
| `email_streams` | id, channel_id, name, kind (weekly, news, summary, custom), cadence, default_on | Following subscribes to `default_on` streams (B4) |
| `email_subscriptions` | user_id, stream_id, status (subscribed, pending, unsubscribed, bounced, complained), source (join, import, preference), consent jsonb, updated_at | `consent` records how and when. Global per viewer |
| `email_campaigns` | id, stream_id, subject, preheader, blocks jsonb, html, status (draft, scheduled, sending, sent), scheduled_for, sent_at, stats jsonb | `html` is generated from blocks, or sanitised paste |
| `email_suppressions` | email_hash, channel_id (null means global), reason (unsubscribe, bounce, complaint), at | Checked before every send |
| `sending_domains` | channel_id, domain, provider_domain_id, dns_records jsonb, status, verified_at | Shared `mail.homestand.au` until verified |
| `subscriber_imports` | id, channel_id, file_ref, consent_basis, counts jsonb, status | The file is deleted after processing |
| `channels` | adds adsense jsonb (publisher_id, fill_unsold, categories_confirmed_at) | AdSense fill. We publish the publisher's ads.txt on the channel's host |
| `entitlements` | none, it's code | `lib/plans.ts` maps a plan to its limits; every server action calls `entitlements(org)` |

## 5. Provider interfaces

The build plan's `packages/providers` gets four more interfaces, each with a fake for tests. The prototype's simulations become those fakes, so the demo keeps working.

| Interface | Methods | First provider | The fake today |
| --- | --- | --- | --- |
| `EmailSender` | `addDomain`, `verifyDomain`, `sendBatch`, `parseWebhook` | Resend | `studio/email/sending` (simulated DNS), the builder's send |
| `VideoRenderer` | `render(spec, scenes) → job`, `status(job)`, `cancel(job)` | Remotion on Lambda | `components/studio/video/composer.tsx` timer |
| `VoiceOver` | `voices()`, `synthesise(text, voiceId) → audio` | A TTS provider chosen in the milestone 0 spike | Static voice list in `lib/data/sample.ts` |
| `StockMedia` | `search(query, licence)`, `licence(id)` | A licensed stock API | Sample posters |
| `GenerativeClip` (optional) | `generate(prompt, style) → clip` | Higgsfield or similar | None. Off by default |
| `AdDecision` | `decide(ctx) → { creative, evidence }` | In-house (`packages/ads`) | `slotOptions()` (A1) |
| `Session` | `viewer(request) → { id, ageAssured, optedOut } \| null` | Supabase Auth plus the central accounts host | `ViewerProvider` with localStorage and `?as=` |

## 6. Work packages

Each work package is about one pull request, with tests. "Faked today" names what to replace; everything else on those screens is already built.

### Phase 1: Publish

**WP-00 Clean-up before code (1 day)**
- Fix the documents in [section 1C](#c-documents-that-contradict-each-other).
- Add `lib/plans.ts` with every plan's limits, and point pricing, billing and the switcher at it.
- Done when: no document mentions Racing-only as current, AdSense is described only as fill for unsold story and half-time slots, and the plan limits exist in one file.

**WP-01 Foundations** (build plan milestone 1)
- Supabase in Sydney, migrations for the build plan's tables plus [section 4](#4-data-model-additions), RLS on every tenant table, staging and production, and CI running typecheck, lint, unit tests and `check:demo` against a preview.
- Done when: `lib/data` reads seed data from Postgres and every screen looks the same as today.

**WP-02 Creator sign-up and YouTube import** (milestone 2)
- Screens: `/signup`, `/signup/channel`, `/signup/name`, `/signup/importing`, `/signin`.
- Faked today: `provider-button.tsx`, `import-live.tsx`, `name-form.tsx`.
- Done when: a creator signs in with Google, picks a channel, and the subdomain is live in under a minute with imports streaming in.

**WP-03 Multiple publications and entitlements**
- Screens: `/studio/publications`, `publication-switcher.tsx`, `studio-sidebar.tsx`.
- Faked today: the publication list comes from sample data. `lib/publication.ts` trusts the `hs-pub` cookie.
- Build: validate `hs-pub` against memberships on every request, and fall back to the first publication. "Add a publication" checks `entitlements(org).publications` and offers an upgrade when it's full.
- Done when: a Starter account can't add a second publication, and a forged cookie can't open someone else's studio.

**WP-04 Draft packs** (milestone 3): as in the build plan. Screens `/studio/review/*` already exist.

**WP-08 Publish and channel pages** (milestone 4)
- Channel pages stay statically cached by tag (PPR); sponsor slots and member content are the only per-request holes.
- Done when: publishing revalidates the page in under 5 minutes, Lighthouse SEO is 95 or more, and `check:demo` passes on real data.

**WP-09 Video player compliance**
- Get a read on YouTube's API policies for custom controls and sponsor credits on YouTube-sourced videos (A4).
- If it's a no: YouTube-sourced videos use YouTube's standard controls, and chapter credits show only on uploads.
- Done when: the decision is recorded and the player matches it.

**WP-10 Uploads, shorts and migration** (milestones 5–6): as in the build plan.

### Phase 2: Earn

**WP-05 Viewer accounts and one sign-in**
- Screens: `/c/[channel]/join`, `/account/*`, `HeaderActions`, `JoinForm`.
- Faked today: `storeViewer`, `ViewerProvider`, `check-email.tsx`, `verify-age-flow.tsx`.
- Build: Supabase Auth on the central accounts host, with the cross-domain handshake (B1), the `Session` interface, and the age-assurance provider behind `AgeAssurance`.
- Done when: joining on one channel signs you in on another channel on a custom domain, and the 18+ result is stored without documents.

**WP-06 Members-only content**
- Faked today: `MembersOnly` in `channel-cta.tsx`.
- Build: the page reads the session inside Suspense; the gated body is fetched only when there's a member.
- Done when: the page source for a logged-out request contains the gate and none of the gated text.

**WP-07 Ad decisions and evidence** (milestone 7)
- Faked today: `slotOptions()`, `SponsorSlot`'s client-side pick, `/admin/evidence` sample rows.
- Build: `packages/ads` `decide()` runs on the server per slot, fails closed, and writes evidence in the same transaction before returning. `SponsorSlot` keeps its props (`kind`, the neighbour's shape) but receives one creative. Opt-out posts to `/api/ads/optout` and re-renders the slot.
- AdSense: when no sold creative wins a story or half-time slot and the channel has AdSense on, return an AdSense unit sized to the slot (responsive in-feed or in-article, Auto ads off). Serve `ads.txt` per channel host. Record the publisher's confirmation that gambling and alcohol are blocked, and show AdSense nowhere else.
- Done when: a logged-out payload never contains a wagering creative; every wagering impression has an evidence row; AdSense appears only in unsold story and half-time slots; `check:demo` flows pass on real sessions.

### Phase 3: Grow

**WP-11 Newsletters for members**
- Screens: `/c/[channel]/newsletters`, `newsletters.tsx`, the account centre.
- Build: `email_streams` and `email_subscriptions`; following subscribes to the default streams (B4).
- Done when: a member's choices persist and show on the preference page from any email.

**WP-12 Sending, safely**
- Screens: `/studio/email`, `/studio/email/new`, `/studio/email/sending`.
- Faked today: the builder's send, simulated DNS and stats.
- Build: `EmailSender` (Resend); blocks to HTML on the server; sanitised paste (A6); a one-click `List-Unsubscribe` header with a signed endpoint and a preference link (A7); suppression checks; sends spread through Inngest; webhooks for bounces and complaints; sends drawn from credits beyond the plan.
- Done when: a test send passes SPF, DKIM and DMARC from a custom domain, unsubscribe works in one click, and a complaint suppresses the address on every stream.

**WP-13 Subscriber import**
- Screen: `/studio/email/subscribers`. Faked today: `subscriber-import.tsx`.
- Build: CSV upload to a private bucket; record the consent basis; create unclaimed members (B3); send a confirmation email to anyone without proof of consent; delete the file once processed.
- Done when: imported addresses never get a newsletter before consent is recorded or confirmed.

### Phase 4: Create

**WP-14 AI usage**
- Screens: `/studio/credits` (AI usage), `credits-panel.tsx`, billing.
- Faked today: `CreditAccount` sample data and `TOP_UPS`. The rate card in `lib/credits.ts` is real (provider cost plus `MARGIN`).
- Build: `credit_ledger` and `credit_caps`; each provider adapter reports its actual cost per job, and the charge is that cost plus 20%; top-ups through Stripe Checkout; the plan's monthly allowance via Inngest cron; an 80% alert email.
- Done when: a failed render releases its hold, a cap blocks the next job with a clear message, and the balance always equals the ledger sum.

**WP-15 Brand kit and templates**
- Screens: `/studio/video/templates`, `/studio/settings/design`, `/studio/settings/voice`.
- Build: `brand_kits`, `video_templates` and `template_licences`; the Explainer template as a Remotion composition (title, voiceover line, bar chart, table, image, quote, end card) reading the brand kit.
- Done when: the same template renders differently for Footy Fix and Trackside with no per-brand code.

**WP-16 Words to video**
- Screens: `/studio/video`, `/studio/video/new`.
- Faked today: `composer.tsx` and `storyboard.tsx` (script and scenes from sample data, render timer).
- Build: Claude writes the script and scene list from the article (brand voice, compliance pre-check); `VoiceOver` and `StockMedia` fill it; `VideoRenderer` renders; the output goes to Mux as a draft `content` row with `generated` and `ai_disclosure` set, then to the review gate. Never auto-publish.
- Done when: a pilot article becomes a reviewed long-form and short video in under 10 minutes, with credits charged as previewed.

## 7. Demo-only code: remove or gate

Keep these working in the demo environment behind `NEXT_PUBLIC_DEMO=1`, and leave them out of production builds.

| Code | What it fakes | Replaced by |
| --- | --- | --- |
| `components/channel/viewer.tsx`: `DemoBar`, `?as=`, localStorage in `ViewerProvider` | Viewer state | `Session` (WP-05) |
| `components/channel/lib.ts`: `slotOptions`, the `Record<Viewer, Sponsor>` maps | Ad decisions | `AdDecision` (WP-07) |
| `components/channel/channel-cta.tsx`: `MembersOnly` | Gating | Server check (WP-06) |
| `components/brand/native-ads.tsx`: `AdSenseBox` | The AdSense unit | The real AdSense tag in a fixed-size container (WP-07) |
| `app/demo`, `app/screens` | The demo guide and screen index | Demo environment only |
| `components/account/check-email.tsx`, `verify-age-flow.tsx` | Magic link and age assurance | Supabase Auth, `AgeAssurance` |
| `components/auth/*` (provider button, import live, name form, email link) | Sign-up and import | WP-02 |
| `components/studio/video/composer.tsx` render timer, `storyboard.tsx` sample scenes | Rendering | WP-16 |
| `components/studio/email/builder.tsx` send, `subscriber-import.tsx`, the sending page's DNS check | Email | WP-12, WP-13 |
| `components/studio/upload-flow.tsx`, `review/player.tsx`, `shorts-editor.tsx`, `editor/autosave.tsx` | Uploads, playback and saves | WP-04, WP-10 |
| `components/settings/connections.tsx`, `domain-wizard.tsx`, `voice-form.tsx`, `imports/import-report.tsx` | Settings and imports | WP-02, WP-08, WP-10 |
| `lib/data/sample.ts` | Everything | Postgres via `lib/data` (WP-01), kept as the seed |

## 8. Decisions needed

| Decision | Recommendation | Blocks | Owner |
| --- | --- | --- | --- |
| ~~One identity for creators and viewers (B2)~~ | Decided: one login, separate creator and reader records | WP-01 | Dan |
| ~~Central accounts host for custom domains (B1)~~ | Decided: central sign-in, `accounts.homestand.au` | WP-05 | Dan |
| ~~Payout model (B5)~~ | Decided: pool by verified minutes, signed-in counted in full and logged-out at a fifth. Counsel to confirm | WP-07 | Dan + counsel |
| Whether a Sportsbet-owned subdivision makes its publications, or the whole platform, wagering advertising, and which guardrails make it defensible | Get advice before the in-house brands go live; brief counsel with the guardrails in the revenue model | Launch of in-house brands, and inviting outside publishers | Counsel |
| YouTube player and chapter sponsors (A4) | Ask; fall back to uploads only | WP-09 | Counsel |
| ~~Video engine (B7)~~ | Decided: Remotion, Azure TTS, Pexels and Pixabay ([video-engine.md](video-engine.md)) | WP-15 | Dan |
| Text-to-speech and stock imagery providers | Choose in a one-week spike on price per finished minute | WP-16 | Dan |
| Imported contacts without proof of consent (B3) | Confirmation email first | WP-13 | Dan + counsel |
| ~~AI pricing~~ | Decided: provider cost plus 20%. Confirm provider rates with a test render | WP-14, pricing page | Dan |
| Wagering ownership question (revenue model risks) | Settle before any operator equity or in-house brand launch | Sportsbet deal | Counsel |
| Age-assurance provider, evidence retention, wagering CPC, density caps | As in the build plan | WP-05, WP-07 | Dan + counsel |

## 9. Checks that keep the design honest

`pnpm check:demo` runs `apps/web/scripts/demo-checks.cjs` against a running app:

- **Sweep:** every screen on `/screens` at 390 and 1440 pixels wide, with no HTTP errors, no sideways scroll and no console errors (134 checks).
- **Same shape:** on channel pages, for every viewer state, each sponsor unit matches its neighbour (shorts, story cards, the article column), with at most three a page (48 layouts).
- **Flows:** join, confirm 18+ and opt out on a video page; email import blocked without consent; an article made into a video.

```bash
pnpm --filter web build && pnpm --filter web start
```

```bash
BASE_URL=http://localhost:3000 pnpm check:demo
```

In WP-01, move these into `@playwright/test` specs in CI, and add unit tests for `decide()`, the credit ledger, entitlements and the email sanitiser. Those four are where a bug costs money or breaks the law.

### Smaller things worth fixing along the way

- The landing page is 6,782 pixels tall (target 4,600) and advertisers is 8,541 (target 5,500). Cut a section from each.
- Sign-up has no "Add another publication" path that skips YouTube connection for a brand that doesn't have a channel yet.
- Admin has no review queue for video templates or email sponsor blocks (B13).
- Generated videos need captions burned in or attached, like every other video.
