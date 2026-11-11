# Homestand — Project Initiation Document (PID)

11 November 2026 · Dan Kovac

> Source of truth: the Homestand PID doc. Exported for a Claude Code session. Requirement IDs (e.g. `MIG-01`) are the unit of work; start with Section 15 (Agent handoff).

## Executive summary

We are building Homestand (working name), a video-first publishing platform. It gives sports, racing and lifestyle creators a professional channel they own, where every video becomes a searchable article, a set of shorts and a monetisable page in minutes.

The Australian launch rides one wedge: from 1 January 2027, wagering ads online are only legal behind a "triple lock" (logged in, age-assured, able to opt out). Most mid-tier publishers will not build that themselves. We make it a switch they turn on, and we make migrating to us easier than building it.

Three revenue lines:

1. Creator subscriptions, tiered from about $29 to $299 per month (AUD).
2. The platform's share of advertising, sold per click or per thousand impressions and placed in premium, designed slots.
3. Optional Google AdSense, constrained to the same slots.

**How to use this doc.** It is written so a person or an AI build agent can pick it up cold. Requirements carry IDs (e.g. `MIG-01`) and acceptance criteria. Section 15 gives the build order, conventions and definition of done. Anything marked **Open decision** must be settled by the owner before that item is built.

**Not legal advice.** The compliance sections summarise public commentary on the *Interactive Gambling Amendment (Gambling Reform) Act 2026*. Every compliance item must be signed off by a gambling-regulatory lawyer before launch.

## Context

Creators rent their audience from YouTube, Instagram and TikTok, and their reach and income change with each algorithm update. At the same time, the 2027 reforms take away the main ways sports and racing media earn from wagering brands.

**The problem**

- Creators have no professional home they own. Social profiles are not search-friendly and can't be monetised on the creator's terms.
- Turning a video into an article, shorts and a search-ready page by hand takes hours, so most creators never do it.
- From 1 January 2027, wagering ads online are banned unless the platform has a triple lock in place. Small and mid-sized publishers will mostly not build one and will lose that revenue.
- Former wagering-sponsored creators can no longer take direct deals: the notable-person ban stops bookmakers contracting with athletes, celebrities and influencers to promote wagering.

**The 2027 rules that shape this product** (summary; see Section 7)

| Rule | What it means for us |
| --- | --- |
| Online triple lock | Wagering ads only to logged-in, age-assured users who have not opted out, with evidence kept for each element |
| Notable-person ban | No wagering ad may feature a notable person; bookmakers cannot contract with them to promote wagering |
| Odds promotion ban | Ad creative cannot promote odds (racing channels excepted) |
| Live-sport ban | No wagering ads during or around live sport coverage |
| Commission ban | Bookmakers cannot pay commissions tied to customer activity (sign-ups, deposits, bets) |
| Racing exemption | Dedicated racing online services are exempt from the triple lock and partly from the notable-person ban |
| AdStop register | A national opt-out register that platforms will need to honour once it goes live (after 1 January 2027) |

**The opportunity.** A turnkey platform that makes the triple lock and premium ad placement a setting, not a build project. Migration in is effortless. Owned search traffic replaces rented social reach.

## Goals, metrics and non-goals

The MVP succeeds if pilot creators publish more with less effort, their channels earn search traffic, and visitors sign in. Targets below are starting hypotheses for the owner to confirm.

**Goals**

1. Creators publish more: one upload produces a video page, an article and shorts, ready to go live in under 10 minutes.
2. Channels earn search traffic they own.
3. Visitors become verified, signed-in audience members.
4. Advertisers buy premium, compliant placements.
5. Migration from an existing platform is easier than staying put.

**Success metrics (90-day pilot, 5–10 channels)**

| Metric | Definition | Pilot target (hypothesis) |
| --- | --- | --- |
| Time to publish | Upload finished → article and shorts ready for review | < 10 min, median |
| Publishing volume | Published items per channel per week vs before | 2x |
| Organic search sessions | Google and Bing sessions to channel pages | Growing month on month; baseline set at import |
| Verified sign-up rate | Visitors who create a triple-lock account ÷ unique visitors | ≥ 3% |
| Migration success | Imported items live with redirects and no 404s | ≥ 99% of items |
| Ad experience | Pages meeting Core Web Vitals "good" thresholds with ads on | ≥ 90% |
| Compliance | Wagering impressions served outside a valid triple-lock session | 0 |

**Non-goals (not in scope)**

- Native iOS and Android apps (the web works on mobile; native apps come later).
- A platform-wide social feed or discovery network.
- Comments and community features.
- Livestreaming (it brings live-sport ad rules into play).
- Being a bookmaker, affiliate or tipster service. The platform never takes bets or pays per sign-up.

## Users and personas

The MVP serves the first three personas below. Advertisers and admins are served through the ad and compliance tools.

| Persona | Who | What they need | Priority |
| --- | --- | --- | --- |
| Independent sports creator | Footy podcaster or YouTuber, 5k–500k followers, once wagering-sponsored | A professional home, search traffic, income that replaces lost sponsorship | MVP |
| Mid-tier sports or racing publisher | Small newsroom or racing media brand already on WordPress or Ghost | Migration with rankings intact; a compliant way to keep wagering ad revenue | MVP |
| Internal content brand | The company's own footy and racing brands | A standalone home for strong content that can no longer live in the betting platform | MVP (pilot) |
| Club or racing body | Racing clubs, trainers, sporting clubs | An official video channel with sponsorship slots | Next |
| Advertiser | Media buyers for wagering and non-wagering brands | Premium, verified, brand-safe inventory plus evidence of compliance for due diligence | MVP (manual), Next (self-serve) |
| Viewer | Fans aged 18+ | A clean reading and watching experience; exclusive content when signed in; a clear opt-out | MVP |
| Platform admin / compliance officer | Our ops team | Moderation, ad review, compliance logs, audit exports | MVP |

**Core jobs to be done**

- *Creator:* "I record once and it shows up everywhere, looking professional, without me rewriting anything."
- *Publisher:* "Move my site without losing Google rankings, and switch on compliant wagering ads without hiring engineers."
- *Advertiser:* "Buy placements I can prove were legal."
- *Viewer:* "A site that respects me: no pop-ups, fast, and I control betting ads."

## Roadmap: MVP, Now, Next, Later

The MVP proves the core loop and the compliant ad path with a small pilot. Each later phase starts only when the gate before it is passed. Dates are proposals; Section 14 has the detailed MVP timeline.

| Phase | Focus | Timing (proposed) | Scope | Gate to enter next phase |
| --- | --- | --- | --- | --- |
| MVP | Pilot build | Dec 2026 – Apr 2027 | YouTube, WordPress, Ghost import; video → article + shorts pipeline; one template + SEO engine; viewer accounts + triple lock; ad slots, direct-sold + AdSense; billing, analytics, admin | Gate 1: legal opinion signed off, compliance audit passed |
| Now | Pilot and AU launch | May – Dec 2027 | 90-day pilot (5–10 channels); all templates + racing mode; white-glove publisher migration; AdStop register live; self-serve creator onboarding; sales to AU sports + racing media | Gate 2: pilot targets met (Section 3) |
| Next | Creator economy | 2028 | Pooled earnings + payouts; earnings predictability dashboard; self-serve ad marketplace; paid fan memberships; social auto-posting, team roles; clubs and racing bodies | Gate 3: 500+ paying channels in Australia |
| Later | International | 2028 onwards | Multi-language articles; launch in Flutter-group markets; native mobile apps; topic hubs + discovery; license triple-lock technology; Google Ad Manager integration | — |

The MVP carries only what the pilot needs. Earning tools for creators wait until there is an audience to pay them from, and international expansion waits until Australia proves the model. Requirement IDs for each phase are in Section 6.

## Functional requirements

Requirements are grouped by module. Each has an ID, a phase (MVP, Next or Later) and an acceptance test. An agent builds MVP rows first, module by module, in the order given in Section 15.

### 6.1 Migration (MIG)

Migration is the headline feature: moving to us must be easier than building a triple lock yourself.

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| MIG-01 | Import a YouTube channel by URL, via the YouTube Data API with OAuth | All public videos listed with title, description, thumbnail, date and duration; creator picks all or a selection | MVP |
| MIG-02 | Import from WordPress (WXR export or REST API) | Posts, pages, categories, tags, authors, featured images and media imported; HTML cleaned to platform blocks | MVP |
| MIG-03 | Import from Ghost (JSON export) and Substack (export zip) | Posts and subscriber emails imported (emails flagged "unverified" until they sign in) | MVP |
| MIG-04 | Import from any RSS or Atom feed | Items imported with title, body, date, enclosure media | MVP |
| MIG-05 | Automatic 301 redirects from old URLs | Every imported item keeps a redirect map; old URL returns 301 to the new page; a crawl report shows 0 broken links | MVP |
| MIG-06 | Custom domain cutover wizard | Step-by-step DNS guide, automatic SSL, verification check, rollback note | MVP |
| MIG-07 | Import progress and report | Live progress; final report lists imported, skipped and failed items with reasons and retry | MVP |
| MIG-08 | Bulk article generation for imported videos | Creator can queue "generate article" for all imported videos; runs in background, results land as drafts | MVP |
| MIG-09 | White-glove migration service for publishers | Ops tool to run an import on a customer's behalf, with a signed-off checklist | Next |
| MIG-10 | Import from Instagram, TikTok and podcast RSS (audio) | Media and captions imported where APIs allow | Next |

### 6.2 Ingest and AI content pipeline (ING)

One upload produces a video page, an article draft, shorts and SEO metadata.

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| ING-01 | Upload video (MP4, MOV, up to 4 GB, up to 3 hours) with resumable upload | Upload survives a dropped connection; progress shown | MVP |
| ING-02 | Transcode to adaptive HLS with multiple renditions and a poster frame | Plays on Safari, Chrome, Firefox and mobile browsers within 5 min of upload for a 30-min video | MVP |
| ING-03 | Transcription with speaker labels and timestamps | Transcript stored with word timings; Australian English handled | MVP |
| ING-04 | Article draft generation from the transcript | Draft has headline options (3), standfirst, structured body with H2s, pull quotes, key points and embedded video; written as an article, not a transcript dump | MVP |
| ING-05 | Chapters | Auto-generated chapter titles and timestamps, editable | MVP |
| ING-06 | SEO metadata | Title tag, meta description, slug, alt text, Open Graph and X cards generated; all editable | MVP |
| ING-07 | Auto shorts | 3–5 vertical 9:16 clips per long video, with burned-in captions, each with a suggested caption and title | MVP |
| ING-08 | Thumbnail options | 3 suggested frames plus upload your own | MVP |
| ING-09 | Brand voice settings per channel | Creator sets tone, banned words, house style; the drafts follow them | MVP |
| ING-10 | Compliance pre-check on generated content | Flags odds, betting calls to action, named bookmakers and "bet now" language in drafts for creator review | MVP |
| ING-11 | Human review gate | Nothing AI-generated publishes without a creator action ("Publish" or a scheduled publish they set) | MVP |
| ING-12 | Translations of articles | Machine translation into chosen languages with hreflang | Later |
| ING-13 | Newsletter edition generated from the week's content | Draft email built from the week's posts | Next |

### 6.3 Creator studio (EDT)

A calm, beautiful workspace that makes volume publishing easy.

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| EDT-01 | Block editor for articles (text, headings, image, video, shorts embed, quote, list, divider, embed) | Keyboard-first, autosave every 5 s, undo history | MVP |
| EDT-02 | AI assist in the editor: rewrite, shorten, expand, change tone, suggest headline | Inline, accept or reject per suggestion | MVP |
| EDT-03 | Content library | All videos, shorts and articles with status (draft, scheduled, published), filters and search | MVP |
| EDT-04 | Scheduling | Publish at a set time in the channel's time zone | MVP |
| EDT-05 | Exclusive flag per item | Mark any item "signed-in only"; preview what a logged-out visitor sees | MVP |
| EDT-06 | Shorts editor | Trim, reframe, edit captions before publishing | MVP |
| EDT-07 | Team roles (owner, editor, contributor) | Permissions enforced server-side | Next |
| EDT-08 | Social posting to YouTube Shorts, TikTok and Instagram | Publish or schedule shorts to linked accounts | Next |

### 6.4 Channels and themes (CHN)

Every channel looks like a premium publication.

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| CHN-01 | Channel on a subdomain at signup, custom domain optional | Live within 1 minute of signup | MVP |
| CHN-02 | 3–4 opinionated templates (e.g. Editorial, Broadcast, Minimal) | Each passes the design and ad standards in Section 8 | MVP |
| CHN-03 | Brand settings: logo, one accent colour, one type pairing from a curated list | Colour contrast checked automatically (WCAG AA) before saving | MVP |
| CHN-04 | Page types: home, video, short, article, section/category, about, search, account | All responsive, from 360 px to 1440 px+ | MVP |
| CHN-05 | Homepage modules: lead story, shorts row, article grid, sections, sponsor band | Creator reorders and toggles modules; cannot add free-form ad blocks | MVP |
| CHN-06 | Channel modes: Standard, Triple lock, Racing-only | Mode set by owner; changes logged; Racing-only enforces a racing content declaration (see Section 7) | MVP |
| CHN-07 | Custom navigation and sections | Up to 8 nav items | MVP |
| CHN-08 | Dark mode | Each template supports light and dark | Next |

### 6.5 Search and SEO engine (SEO)

This is what "dominates search" means in practice.

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| SEO-01 | Server-rendered or static pages | Full HTML on first response; Lighthouse SEO score ≥ 95 | MVP |
| SEO-02 | Structured data: Article, VideoObject (with Clip for chapters), BreadcrumbList, Organization, Person | Passes Google Rich Results Test | MVP |
| SEO-03 | XML sitemaps, including video and news sitemaps, auto-submitted | Updated within 5 min of publish | MVP |
| SEO-04 | Canonical URLs and duplicate control (video page vs article) | One canonical per topic; no duplicate-content warnings | MVP |
| SEO-05 | Automatic internal linking to related content | Each article links to 3–5 related items | MVP |
| SEO-06 | Searchable transcript on video pages (collapsed by default) | Indexed text present in HTML | MVP |
| SEO-07 | Core Web Vitals "good" with ads on | LCP < 2.5 s, INP < 200 ms, CLS < 0.1 at the 75th percentile | MVP |
| SEO-08 | IndexNow and Search Console connection | Creator connects Search Console in one click; we show its data in analytics | Next |
| SEO-09 | Topic hubs (auto-generated pages grouping content by team, player or event) | Indexable hub pages with editorial intro | Next |

### 6.6 Audience accounts (AUD)

Viewers get one account across the whole network. Signing in unlocks exclusive content, so there is a reason to log in other than ads.

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| AUD-01 | Network-wide viewer account: email magic link, Google and Apple sign-in | One identity works on every channel; session lasts 30 days | MVP |
| AUD-02 | Follow channels and get email updates | Follow button on every channel; weekly digest email | MVP |
| AUD-03 | Exclusive content gate | Logged-out visitors see a tasteful teaser and a "Sign in to watch" prompt; no hard paywall nags | MVP |
| AUD-04 | Account centre | Profile, followed channels, ad preferences (incl. betting opt-out), data download, delete account | MVP |
| AUD-05 | Paid fan memberships per channel | Creator sets a monthly price; fans pay; creator keeps the bulk | Next |

### 6.7 Triple lock (TLK)

The triple lock is a switch per channel, built to a standard a regulator could audit. When it is off, no wagering ad reaches that channel from any source.

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| TLK-01 | Lock 1, registered account: wagering ads only to users signed in to a registered account | Ad decision service rejects any wagering request without a valid session | MVP |
| TLK-02 | Lock 2, age assurance: integrate a certified third-party age-assurance provider (e.g. document check or age estimation); store only the result, method, provider reference and timestamp | Users not confirmed 18+ never receive wagering ads; raw ID documents never stored by us | MVP |
| TLK-03 | Lock 3, opt-out: a prominent "Don't show me betting ads" control in the account centre, in the site header menu, and on every wagering ad unit | One tap opts out; takes effect on the next ad request; network-wide | MVP |
| TLK-04 | AdStop-ready: an adapter for the national opt-out register | Interface built and stubbed; switched on when the register's specification is published | MVP (stub), Next (live) |
| TLK-05 | Evidence logging: separate, append-only records for each lock per wagering impression (session ID, age-assurance record ID, opt-out status, timestamp, ad ID, channel) | Kept for at least 12 months (recommend 7 years; Open decision); exportable per advertiser and per date range | MVP |
| TLK-06 | Fail closed | If any check errors or times out, no wagering ad is served and a non-wagering ad fills the slot | MVP |
| TLK-07 | Lock off = full block: wagering category blocked across direct ads, our network and AdSense (sensitive-category blocking) | Automated test confirms no wagering creative on a lock-off channel | MVP |
| TLK-08 | Live content auto-off: wagering ads switched off on any page marked as live or near-live coverage of a sporting event | Live flag required on any live stream or live blog | MVP |
| TLK-09 | Advertiser due-diligence pack: downloadable report showing how each lock is enforced, plus impression-level evidence | Generated on demand per campaign | MVP |
| TLK-10 | Racing-only mode: triple lock optional on channels declared racing-only; content checks warn when non-racing content appears | Declaration logged; quarterly review prompt | MVP |

### 6.8 Advertising (ADS)

Ads are part of the design, not stuck on top. The platform owns every slot, and creators never sell wagering placements directly.

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| ADS-01 | Fixed slot system per template: homepage sponsor band, in-article (after a natural break), end-of-article, shorts-row sponsored card, video pre-roll (non-wagering only in MVP) | No other ad positions can exist; reserved dimensions prevent layout shift | MVP |
| ADS-02 | Ad density cap set by the platform | No more than 1 ad per 600 words of article and 3 per page in total (starting values; Open decision) | MVP |
| ADS-03 | Banned formats | No pop-ups, interstitials, sticky overlays, auto-playing ads with sound, or AdSense Auto ads | MVP |
| ADS-04 | Direct-sold campaigns (managed by our team in MVP): upload creative, targeting (channels, categories, geography), flight dates, pricing model | Campaigns run and report correctly | MVP |
| ADS-05 | Pricing models: CPM and flat-fee sponsorship for all; CPC available (wagering CPC subject to legal sign-off) | No pricing tied to sign-ups, deposits or bets, ever | MVP |
| ADS-06 | Creative compliance review queue | Wagering creative checked for odds, notable persons, required responsible-gambling message, harmful content; approve or reject with reason | MVP |
| ADS-07 | Every ad clearly labelled "Advertisement" or "Sponsored" | Label visible on every unit | MVP |
| ADS-08 | Google AdSense support inside designed slots only | Fixed sizes, styled frame, sensitive categories blocked per channel mode | MVP |
| ADS-09 | Creator category controls | Creator can block categories (e.g. wagering, alcohol); cannot add slots | MVP |
| ADS-10 | Self-serve advertiser marketplace with budget, bidding and reporting | Advertiser can launch a campaign without our team | Next |
| ADS-11 | Frequency capping and brand-safety controls | Per-user caps and content-category exclusions | Next |

### 6.9 Billing and creator earnings (BIL)

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| BIL-01 | Creator subscription tiers via Stripe Billing (e.g. Starter, Pro, Publisher, Enterprise) | Upgrade, downgrade, cancel, invoices with GST | MVP |
| BIL-02 | Free trial (14 days) | Card optional for trial; Open decision | MVP |
| BIL-03 | Pooled ad revenue share: a fixed share of net ad revenue goes into a monthly pool, split by each channel's verified engaged minutes and verified article reads | Formula published to creators; independent of which ads ran on their channel | Next |
| BIL-04 | Earnings predictability dashboard: last month's rate per 1,000 verified minutes, projection for this month, 3-month trend | Projection updates daily | Next |
| BIL-05 | Minimum rate guarantee for founding creators (e.g. 6–12 months) | Applied automatically in payout calculation | Next |
| BIL-06 | Payouts via Stripe Connect | Monthly payouts, tax details captured, statements downloadable | Next |

### 6.10 Analytics (ANL)

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| ANL-01 | Creator dashboard: views, watch time, verified users, sign-ups, search traffic, top content, traffic sources | Updated at least hourly | MVP |
| ANL-02 | Privacy-first first-party analytics (no third-party trackers by default) | Consent banner only where tracking needs it | MVP |
| ANL-03 | Advertiser reporting: impressions, clicks, CTR, spend, by placement and channel | Matches billing to the cent | MVP |
| ANL-04 | Platform metrics for our team: pilot KPIs from Section 3 | One internal dashboard | MVP |

### 6.11 Admin and compliance console (ADM)

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| ADM-01 | Channel management: view, suspend, change mode, impersonate (logged) | All admin actions audit-logged | MVP |
| ADM-02 | Ad creative review queue (see ADS-06) | Average review under 1 business day | MVP |
| ADM-03 | Compliance evidence export per advertiser, campaign or date range | CSV and PDF export; generated in under 5 min | MVP |
| ADM-04 | Content moderation: report button for viewers, review queue, takedown with notice to creator | Takedown possible within 1 hour | MVP |
| ADM-05 | Notable-person safeguard: flag channels whose owner is likely a notable person; such channels are kept out of any wagering-linked revenue arrangements pending legal policy | Flag stored; policy applied in ad decisions | MVP |
| ADM-06 | Regulator request workflow: log, collect evidence, respond | Request tracker with deadlines | Next |

## Compliance requirements

The product must make the legal path the default path. This section maps each 2027 obligation to a product control. It summarises public commentary on the *Interactive Gambling Amendment (Gambling Reform) Act 2026* (assented 26 August 2026; most provisions in force 1 January 2027). It is **not legal advice**, and every row needs lawyer sign-off.

| Obligation (summary) | Who it binds | Product control | Req IDs |
| --- | --- | --- | --- |
| Online wagering ads only where the user is logged in, confirmed 18+, and able to opt out (prominently) | Online content service (us) and anyone who authorises or causes the ad, unless they did due diligence | Triple lock, fail closed, evidence logs, due-diligence pack | TLK-01 to TLK-09 |
| Evidence of compliance kept for each lock separately (at least 12 months) | Online content service | Append-only, per-lock evidence store | TLK-05, ADM-03 |
| No notable person in wagering ads; bookmakers cannot contract with notable persons to promote wagering | Bookmaker (primary); notable persons too | Creative review; creators never contract with wagering advertisers; notable-person flag on channels | ADS-06, ADM-05 |
| No promotion of odds in wagering ads (racing services excepted) | Bookmaker | Creative review checks for odds | ADS-06 |
| Responsible-gambling message required; no content aimed at children, linking gambling to alcohol, or misleading | Bookmaker and media | Creative review checklist | ADS-06 |
| No wagering ads during or around live sport coverage | Broadcasters and online services | Live flag turns wagering ads off | TLK-08 |
| No commissions tied to customer activity (sign-ups, deposits, bets, reactivation), including to affiliates | Bookmaker | Pricing limited to CPM, flat fee and (subject to sign-off) CPC; nothing contingent on customer activity | ADS-05 |
| Dedicated racing online services: exempt from the triple lock; notable-person exception for racing-only content on racing-only services | Service and bookmaker | Racing-only mode with declaration, content checks, review | CHN-06, TLK-10 |
| National opt-out register (AdStop) to be honoured once live | Online content services | AdStop adapter | TLK-04 |

**Design rules that follow from this**

1. **Fail closed.** If we cannot prove all three locks for a request, the slot gets a non-wagering ad.
2. **No creator–bookmaker deals.** The platform sells every slot. Creators never receive pay tied to a specific wagering ad on their channel.
3. **Never pay or charge per sign-up, deposit or bet.**
4. **Privacy.** We store age-assurance results, not documents. Age data and opt-outs are personal information under the Privacy Act 1988 and must be handled to that standard.
5. **Audit-ready by default.** Every compliance-relevant decision (ad served or refused, mode changed, creative approved) is logged with a reason.

**Open legal questions (must be answered before launch)**

- [ ] Is a flat per-click fee from a bookmaker, not contingent on any sign-up or bet, outside the "commission relating to customer activity" ban?
- [ ] Does pooled ad revenue paid to a creator who is a notable person count as an arrangement involving them in wagering promotion?
- [ ] Does a racing-only channel on our platform qualify as a "dedicated racing online content service", and does that extend to its linked social accounts?
- [ ] If a wagering company owns or invests in the platform, does all platform content become wagering advertising content "by or for the benefit of" that company?
- [ ] Which age-assurance methods does ACMA accept as "reasonable steps"?
- [ ] Evidence retention period beyond the 12-month minimum.

Sources: [ACMA – About the Interactive Gambling Act](https://www.acma.gov.au/about-interactive-gambling-act) · [Blackbay Lawyers – wagering advertising from 1 January 2027](https://blackbaylawyers.com.au/insights/no-gambling-ads-in-live-sport-stadiums-or-on-uniforms-wagering-advertising-from-) · [Addisons – who you are and how this affects you](https://addisons.com/article/australian-gambling-reforms-who-you-are-and-how-this-affects-you/) · [Safebet – what changes on 1 January 2027](https://safebet.ai/au/guides/gambling-advertising-australia/) · [Sigma – ACMA notable-person guidance](https://sigma.world/news/australias-media-regulator-details-celebrity-wagering-ad-ban/) · [OpenAustralia – Senate debate, 19 Aug 2026](https://www.openaustralia.org.au/senate/?id=2026-08-19.14.1&m=100934)

## Design principles and ad standards

Every channel should feel like a premium sports magazine that happens to be video-first. Ads are designed into the page, never added on top of it.

**Principles**

1. **Magazine, not blog.** Big editorial typography, generous white space, strong imagery, a clear hierarchy on every page.
2. **Video-first, read-second.** Video is the hero; the article makes it searchable and gives people something to read.
3. **Brand within limits.** Creators choose a logo, one accent colour and a curated type pairing. Guardrails mean no channel can look cheap, and the network stays premium for advertisers.
4. **Fast is beautiful.** Pages feel instant; nothing jumps while loading.
5. **Respect the viewer.** No dark patterns, no nagging paywalls, a visible opt-out, labelled ads.
6. **Accessible.** WCAG 2.2 AA: contrast, keyboard navigation, captions on all video, alt text.

**Page anatomy**

| Page | Layout | Ad slots allowed |
| --- | --- | --- |
| Channel home | Lead story (video hero + headline) → shorts row (vertical cards, side-scrolling) → article grid → section rows → footer | One "presented by" sponsor band; one sponsored card in the shorts row |
| Video page | Player with chapters → headline and standfirst → article body → transcript (collapsed) → related | Non-wagering pre-roll (MVP); one in-article unit; one end-of-page unit |
| Article page | Headline, standfirst, byline → hero media → long-form body (65–75 characters a line) with pull quotes → related | One in-article unit after a natural break; one end-of-article unit |
| Short page | Full-height vertical player, swipe to next, caption below | One sponsored card every 8 shorts at most |
| Exclusive (logged out) | Blurred or cropped teaser, short description, "Sign in to watch" | None in the teaser |

**Ad unit standards**

- Every unit sits in a styled frame matching the template, with a small "Advertisement" or "Sponsored" label.
- Space is reserved before the ad loads (no layout shift). An unfilled slot collapses gracefully or shows a house promo.
- Wagering units carry the opt-out link ("Don't show me betting ads") inside the frame.
- AdSense runs only in these slots, at fixed sizes, with Auto ads disabled.
- Banned everywhere: pop-ups, interstitials, sticky overlays, auto-playing ads with sound, ads between a headline and its first paragraph.

**Design deliverables (before build)**

- [ ] Design system: tokens (colour, type, spacing, radius), components, ad frames
- [ ] 3–4 channel templates in light mode, desktop and mobile
- [ ] Creator studio: upload flow, article review, shorts editor, library
- [ ] Viewer flows: sign-in, age assurance, account centre and opt-out
- [ ] Mock-ups showing every ad slot with real creative sizes

**Open decision:** the visual direction (references, mood, the final product name and brand; "Homestand" is a placeholder).

## Architecture, data model and tech stack

The system has a single multi-tenant web app serving every channel, a media and AI pipeline running as background jobs, and our own ad decision service. The ad decision service is the only component allowed to serve wagering ads. A partly built version of the platform already exists. The first build task is to audit it and reuse what fits (Section 15).

```
Viewers (channel pages, mobile web)   Creators (upload, edit, publish)   Advertisers + admins (campaigns, review, audit)
                         \                       |                       /
                Edge CDN: cached channel pages and video streaming
                                           |
        Web app (Next.js, Sydney region): Channel pages + SEO | Creator studio | Admin + compliance console
              |                                  |                                   |
  Content pipeline (jobs)             AD DECISION SERVICE                       Data
  - Importers + redirects             - Slot + density rules                   - PostgreSQL (tenants)
  - Video: upload, HLS, clips         - Triple-lock check, FAIL CLOSED          - Object storage
  - Transcription                     - Approved creative only                 - Analytics store
  - AI drafts + pre-check             - Evidence writer                        - Evidence (append-only)
              |                                  |                                   |
  External services: video host, speech-to-text, Claude API, age assurance, AdStop, Stripe, AdSense, source platforms
```
Only the ad decision service can serve a wagering ad.

Requests flow down through the edge cache to one web app. Heavy work runs as background jobs, and every ad slot asks the ad decision service, which checks the triple lock and writes evidence before it returns any wagering creative.

**Recommended stack** (proposed; the agent may substitute equivalents with a written reason)

| Layer | Recommendation | Why |
| --- | --- | --- |
| Web app (channels + studio) | Next.js (App Router, React Server Components), TypeScript | Server rendering for SEO; one codebase for channels and studio |
| Hosting | Vercel or AWS, primary region Sydney (ap-southeast-2) | Low latency for Australian viewers; data kept in Australia |
| Database | PostgreSQL (managed, e.g. Neon, Supabase or RDS) | Relational data, row-level tenancy |
| Object storage + CDN | S3 or Cloudflare R2 with a CDN | Media and image delivery |
| Video | Mux or Cloudflare Stream | Upload, transcode, HLS, thumbnails, clipping without running our own video infrastructure |
| Transcription | A managed speech-to-text API (e.g. Deepgram, AssemblyAI or Whisper) | Word timings, speaker labels |
| LLM | Claude API | Article drafting, rewrites, compliance pre-check |
| Jobs and workflows | A durable workflow engine (e.g. Inngest, Temporal or SQS + workers) | Long-running imports, retries, fan-out |
| Search | Postgres full-text to start; Typesense or Meilisearch later | On-site search |
| Auth | Network-wide viewer identity + creator accounts (e.g. Auth.js, Clerk or WorkOS) | One viewer account across channels |
| Age assurance | Certified third-party provider (shortlist, e.g. Australian digital ID or age-estimation vendors) | We never handle ID documents ourselves |
| Ads | Own ad decision service (MVP); Google Ad Manager integration later | Triple lock must be enforced in our own code path |
| Payments | Stripe Billing (subscriptions), Stripe Connect (payouts) | GST invoices, global coverage |
| Analytics | First-party events into a columnar store (e.g. ClickHouse or Tinybird) | Fast dashboards, privacy-first |
| Compliance evidence | Append-only store (separate Postgres schema with no updates or deletes, or an immutable log) plus nightly export to cold storage | Tamper-evident, auditable |

**Core data model**

| Entity | Key fields |
| --- | --- |
| Organisation | id, name, billing plan, Stripe customer |
| Channel | id, org\_id, slug, custom\_domain, template, brand tokens, mode (standard / triple\_lock / racing\_only), notable\_person\_flag, ad\_category\_blocks |
| User (creator) | id, email, role per org |
| Viewer | id, email, auth providers, created\_at |
| AgeAssurance | viewer\_id, provider, method, result (18+ yes/no), reference, assured\_at, expires\_at |
| AdPreference | viewer\_id, wagering\_opt\_out (bool), source (account / ad unit / AdStop), updated\_at |
| MediaAsset | id, channel\_id, provider\_asset\_id, duration, status, renditions |
| Transcript | asset\_id, language, words (with timings), speakers |
| Content | id, channel\_id, type (video / short / article), status, title, slug, body (blocks), exclusive (bool), is\_live (bool), published\_at, seo fields, canonical\_url |
| Redirect | channel\_id, from\_path, to\_content\_id |
| ImportJob | id, channel\_id, source type, status, counts, report |
| Advertiser | id, name, is\_wagering, licence details |
| Campaign | id, advertiser\_id, pricing\_model (cpm / flat / cpc), budget, targeting, dates |
| Creative | id, campaign\_id, assets, review\_status, reviewer, reasons |
| AdDecision | id, request context, slot, creative served or refused, reason codes |
| ComplianceEvidence | decision\_id, lock1\_session\_ref, lock2\_assurance\_ref, lock3\_optout\_state, timestamp (append-only) |
| AuditLog | actor, action, target, before/after, timestamp |

**Ad decision flow (wagering request)**

1. Slot requests an ad with channel, page and session context.
2. If the channel mode is not triple\_lock (or racing\_only), or the page is\_live, exclude wagering.
3. Check lock 1: valid signed-in session. Lock 2: current 18+ assurance. Lock 3: not opted out (account and AdStop).
4. All pass → eligible wagering creative may compete. Any fail or error → non-wagering only.
5. Write the AdDecision and, for wagering, the ComplianceEvidence record, before the creative is returned.

## Non-functional requirements

These standards apply to every module and are part of the definition of done.

| Area | Requirement |
| --- | --- |
| Performance | Core Web Vitals "good" at the 75th percentile with ads on (LCP < 2.5 s, INP < 200 ms, CLS < 0.1); channel pages served from the edge cache |
| Availability | 99.9% monthly for channel pages; 99.5% for the studio; ad decision service fails closed |
| Scale (MVP) | 50 channels, 1M page views a month, 2,000 hours of video stored; designed so moving to 10x needs no re-architecture |
| Security | OWASP ASVS Level 2; SSO and MFA for creators and admins; secrets in a managed vault; dependency and container scanning in CI; annual penetration test before public launch |
| Tenancy | Strict per-organisation isolation enforced in the database (row-level security) and tested |
| Privacy | Compliant with the Privacy Act 1988 and Australian Privacy Principles; data kept in Australia; age-assurance results only, no ID documents; data export and deletion in the account centre; privacy impact assessment before launch |
| Accessibility | WCAG 2.2 AA across channels and studio; captions on all video |
| Audit | Every admin, compliance and ad decision action logged with actor, time and reason; compliance logs append-only |
| Observability | Structured logs, traces and metrics; alerts on ad-decision error rate, import failures, video pipeline backlog |
| Data retention | Compliance evidence at least 12 months (Open decision: longer); deleted content purged in 30 days except where law requires retention |
| Browser support | Last 2 versions of Chrome, Safari, Firefox and Edge; iOS Safari 16+ |
| Testing | Unit and integration tests on all modules; end-to-end tests on publish, sign-in and age assurance, opt-out and ad decision; contract tests for every external provider |
| Content safety | AI drafts never auto-publish; compliance pre-check on all generated text |

## Business model and pricing

The platform earns from creator subscriptions and from its share of advertising. Creators earn from a pooled ad-revenue share and, later, fan memberships. All prices are AUD and are starting hypotheses (Open decision).

**Creator tiers (draft)**

| Tier | Price / month | For | Includes |
| --- | --- | --- | --- |
| Starter | $29 | Solo creators getting started | 1 channel, subdomain, 10 video hours/month processed, AI articles and shorts, standard templates |
| Pro | $99 | Established creators | Custom domain, 40 video hours/month, triple lock mode, ad revenue share, priority processing |
| Publisher | $299 | Small media brands and clubs | 3 channels, team roles, 150 video hours/month, migration assistance, AdSense |
| Enterprise | Custom | Large publishers, networks, internal brands | Unlimited channels, white-glove migration, SLA, dedicated support |

**Advertising**

- Sold per thousand impressions (CPM), as flat-fee sponsorships (e.g. channel or section takeovers), and per click (CPC). Wagering CPC only after legal sign-off.
- Never priced on sign-ups, deposits or bets.
- Pitch to all advertisers: a premium, logged-in, age-verified audience. Wagering is one category among several.

**Creator earnings (Next)**

Each month a fixed share of net ad revenue (e.g. 50%; Open decision) forms a creator pool. It is split by each channel's share of verified engaged minutes and verified article reads.

```latex
\text{Creator payout} = \text{Pool} \times \frac{\text{channel verified minutes}}{\text{total verified minutes}}
```

Pay is independent of which ads ran on a channel. A published rate per 1,000 verified minutes, a monthly projection and a minimum-rate guarantee for founding creators make earnings predictable.

**Comparable businesses**

| Company | Model | Scale |
| --- | --- | --- |
| [beehiiv](https://yespress.io/beehiiv) | SaaS tiers + ad network | ~~$30M USD ARR in 2025 (~~$20M software, \~$10M ads); guiding $50–55M for 2026 |
| [Substack](https://sacra.com/research/substack) | 10% of paid subscriptions | \~$45M USD annualised revenue (July 2025) |
| [Kajabi](https://everything-pr.com/where-creator-money-actually-routes-kajabi-whop-passes) | Flat SaaS, $179–$399 USD per month | Serves established creator businesses |

**Illustrative subscription revenue at a $100 average**

| Paying channels | Annual subscription revenue (AUD) |
| --- | --- |
| 500 (Australia, year 1–2) | $0.6M |
| 3,000 (Australia at scale) | $3.6M |
| 20,000 (international) | $24M |

Ad revenue sits on top of these figures. Real averages are likely lower (beehiiv works out to roughly $30 USD a month per user), so the tier mix matters.

## Governance, ownership and legal questions

Who owns the platform is the most important decision in this doc. If a wagering company owns it, regulators may treat the whole platform's content as wagering advertising "by or for the benefit of" that company. That would undo the separation between creators and bookmakers that the model depends on.

**Ownership options**

| Option | How it works | Legal exposure | Commercial upside | Commercial downside |
| --- | --- | --- | --- | --- |
| A. Independent company | Separate entity and brand, independent board; a wagering group may invest as a minority | Lowest | All bookmakers can advertise; creators trust it | Less control for any one investor |
| B. Wagering-owned, no wagering ads | Wagering group owns it; the platform carries no wagering ads at all | Low to medium | Full control; pure media and SaaS business | Gives up wagering ad revenue |
| C. Wagering-owned, sells the triple-lock technology only | Group licenses the triple-lock and ad compliance module to other publishers; the creator platform runs separately | Medium | Monetises the compliance edge | A narrower product |
| D. Wagering-owned, runs wagering ads | Group owns it and sells wagering ads on it | Highest | Simplest to set up | Competitors won't buy; creators wary; regulatory scrutiny |

**Recommendation:** Option A for the creator platform, with Option C as an optional parallel line. Confirm with counsel before incorporating.

**Governance**

- **Compliance owner:** a named person accountable for triple-lock operation, creative review and regulator requests.
- **Independent review:** compliance controls audited externally before launch, then yearly.
- **Advertiser neutrality:** published policy that every licensed advertiser buys on the same terms.
- **Creator agreement:** creators warrant they hold no direct wagering promotion deals tied to their platform channel, and agree to the content and live-coverage rules.

**Open decisions for the owner**

- [ ] Ownership option (A, B, C or D)
- [ ] Final product name and brand (placeholder: Homestand; trademark, domain and social-handle checks pending)
- [ ] Pricing tiers and the creator pool share
- [ ] Evidence retention period
- [ ] Pilot channel list

## Risks and mitigations

The biggest risks are legal interpretation and search performance. Both are tested early in the pilot.

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Regulator treats the platform as a vehicle to get around the notable-person or commission bans | Medium | High | Ownership option A; no creator–bookmaker deals; pooled pay; written legal opinion before launch |
| Triple-lock failure serves a wagering ad to a minor or someone who opted out | Low | High | Fail closed; end-to-end tests; evidence logs; monitoring alert on any wagering impression without full evidence |
| AI-generated articles judged low-value by Google | Medium | High | Human review gate; articles built on original video; editorial quality bar; watch Search Console during pilot |
| Login walls cut traffic | Medium | Medium | Gate only exclusive content; most content stays open |
| AdStop design changes or delays | High | Low | Adapter interface, launch with our own opt-out list |
| Age-assurance friction stops sign-ups | Medium | Medium | Ask for age assurance only when needed for wagering ads; offer the lowest-friction certified method |
| Migration breaks publishers' search rankings | Low | High | Redirect maps, pre- and post-crawl checks, staged cutover with rollback |
| Video and AI costs exceed subscription revenue | Medium | Medium | Hours-per-tier limits; cost monitoring per channel; cache transcripts and drafts |
| Big platforms copy the idea | Medium | Medium | Win the mid-tier Australian sports and racing market first; migration and compliance depth as the moat |
| Creators distrust a platform linked to a bookmaker | Medium | High | Independent brand and governance; transparent pay formula |

## Delivery plan and pilot

The proposed plan gets the MVP to a 90-day pilot starting 3 May 2027, with a go/no-go decision in early August. The reforms take effect on 1 January 2027, before the MVP is ready. Internal brands may need an interim home in the meantime (Open decision).

| Workstream / milestone | Start | End |
| --- | --- | --- |
| Discovery, legal opinion, audit of existing build | 2026-11-16 | 2026-12-18 |
| Design system + templates | 2026-11-30 | 2027-01-29 |
| Reforms in force (milestone) | 2027-01-01 | — |
| MVP build | 2027-01-04 | 2027-04-30 |
| Compliance audit + penetration test | 2027-04-05 | 2027-04-30 |
| Gate 1: pilot starts (milestone) | 2027-05-03 | — |
| 90-day pilot | 2027-05-03 | 2027-07-30 |
| Go / no-go decision (milestone) | 2027-08-06 | — |

**Pilot design**

- 5–10 channels: 2–3 internal footy and racing brands, 3–5 independent creators, 1–2 mid-tier publishers migrating from WordPress or Ghost.
- At least one channel in each mode: standard, triple lock, racing-only.
- Measured against the Section 3 targets, reviewed every two weeks.
- Ads sold directly by our team; AdSense on at least two channels.

**Team (indicative)**

| Role | Count | Focus |
| --- | --- | --- |
| Product lead / owner | 1 | Decisions, pilot, partners |
| Product designer | 1 | Design system, templates, studio |
| Full-stack engineers (human or agent-assisted) | 3–4 | Web app, pipeline, ads, migration |
| Compliance owner | 1 (part-time) | Triple lock, creative review, legal liaison |
| Gambling-regulatory counsel | External | Opinion on the Section 7 open questions |

## Agent handoff

This section tells a build agent how to take the project from here: work in the order below, keep to the conventions, and treat the definition of done as the bar for every requirement.

**Before writing code**

1. Read this whole doc. Treat requirement IDs as the unit of work.
2. Audit the existing partly built platform. Write a short report: what exists, what maps to which requirement ID, what to keep, rewrite or delete.
3. List every **Open decision** and open legal question that blocks an MVP item, and ask the owner before building those items. Build everything else.
4. Propose the final stack (Section 9) with reasons for any change. Wait for approval.

**Build order (MVP)**

1. Foundations: repo, CI/CD, environments (dev, staging, prod in Sydney), auth for creators, tenancy model, audit log.
2. Ingest pipeline: ING-01 to ING-03 (upload, transcode, transcript).
3. Channel rendering: CHN-01 to CHN-05 and SEO-01 to SEO-07, with one template first.
4. AI pipeline and studio: ING-04 to ING-11, EDT-01 to EDT-06.
5. Migration: MIG-01 to MIG-08 (YouTube first, then WordPress, Ghost, Substack, RSS).
6. Viewer accounts: AUD-01 to AUD-04.
7. Ad decision service and slots: ADS-01 to ADS-09.
8. Triple lock: TLK-01 to TLK-10, including evidence logs and the due-diligence pack.
9. Billing and analytics: BIL-01, BIL-02, ANL-01 to ANL-04.
10. Admin and compliance console: ADM-01 to ADM-05.
11. Remaining templates, hardening, external compliance audit, penetration test.

**Conventions**

- TypeScript strict mode everywhere; one monorepo.
- Every database change through migrations; row-level security on every tenant table.
- Every external provider (video, transcription, LLM, age assurance, payments) behind an interface, with a fake for tests.
- Commit messages and pull requests reference requirement IDs (e.g. `TLK-05: append-only evidence store`).
- Feature flags for anything in the triple lock or ad path.
- No secrets in code; no personal data in logs.
- Australian English in all user-facing copy; dates as 11 November 2026; currency AUD with GST shown.

**Definition of done (every requirement)**

- [ ] Acceptance criteria in Section 6 met and demonstrated
- [ ] Unit and integration tests pass; end-to-end tests for any user-facing flow
- [ ] Meets the non-functional requirements in Section 10 (performance, accessibility, security)
- [ ] Audit logging in place where the action is compliance-relevant
- [ ] Docs updated: README for the module, API docs, runbook for ops
- [ ] Reviewed by a human before merge to main

**Hard rules the agent must never break**

- Never serve a wagering ad without passing all three locks, and fail closed on any error.
- Never price anything on sign-ups, deposits or bets.
- Never let a creator contract directly with a wagering advertiser through the platform.
- Never auto-publish AI-generated content.
- Never store identity documents.
- Stop and ask the owner when a requirement conflicts with these rules or with a legal opinion.
