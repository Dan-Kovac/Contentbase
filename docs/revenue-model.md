# Homestand revenue model

Written 13 November 2026. How Homestand gets past subscriptions to a business doing $45–50 million a year. Every figure is an illustrative assumption in AUD, not a forecast. The prices sit alongside the PID's (which are themselves starting hypotheses) and need testing in the pilot.

## The short version

Subscriptions alone don't get there. The PID's own maths puts 3,000 Australian channels at about $3.6 million a year. The business gets big by charging for what publishers do on the platform, not just for access to it:

1. **Advertising**, sold by Homestand in Native Formats, with the platform keeping a share. This is the biggest line and the least certain.
2. **AI credits**: metered usage for the expensive work (article to video, dubbing, voice, extra processing), bought on top of the plan.
3. **The triple lock as a product**: licence the compliance engine and evidence packs to sites and apps that aren't on Homestand.
4. **Data housing**: each publication's first-party audience vault (accounts, consent, follows, evidence), charged by retention, exports and integrations. Never sold.
5. **Templates, memberships and services**, which are smaller but attach to the same accounts.

| Line | How it's charged | Illustrative annual revenue at scale |
| --- | --- | --- |
| Subscriptions | Platform fee per publication (Starter to Enterprise) | $10.2M |
| Advertising | Platform share of Native Format sales | $15.0M |
| AI credits | Metered, prepaid credits on top of the plan | $6.0M |
| Triple lock licensing | Annual licence plus per-decision fee | $4.8M |
| Data housing and insights | Retention tiers, warehouse sync, aggregate advertiser reports | $4.0M |
| Services | Migrations, managed branded video | $3.0M |
| Memberships | Take rate on fan memberships and paid content | $2.0M |
| Video templates | Template sales and a cut of third-party templates | $1.5M |
| Hosting overage | Video hours, storage and bandwidth beyond the plan | $1.5M |
| Email | Sends beyond the plan (credits), dedicated sending IPs | $1.0M |
| **Total** | | **about $49M** |

The assumptions behind each row are below. The sum depends on three things being true at once: the verified audience is large enough for premium CPMs, publishers use AI credits every week, and the platform grows beyond Australian sport (other countries, other sports, clubs and racing bodies). Australia alone, on these assumptions, lands nearer $15–20 million.

## 1. Subscriptions: the platform fee

Unchanged from the PID: Starter $29, Pro $99 and Publisher $299 a month, with Enterprise on request, all inc. GST. The new piece is **multi-publication accounts**: one login running several brands. Publisher includes three publications; Enterprise is unlimited and priced per publication beyond a base.

| Segment | Accounts | Average per month | Annual |
| --- | --- | --- | --- |
| Creators (Starter, Pro) | 6,000 | $45 | $3.2M |
| Publishers | 600 | $299 | $2.2M |
| Enterprise and networks (in-house brands, media groups, clubs) | 40 | $10,000 | $4.8M |
| **Total** | | | **$10.2M** |

Multi-brand owners are the best customers: they pay per publication, use the most credits and buy the most services. The publication switcher and the All publications view are what they buy.

## 2. Advertising: the platform's share

Homestand sells the five Native Formats network-wide. The PID proposes a creator pool of a fixed share of net ad revenue (for example 50%). The rest is the platform's.

- Assumption: 1.2 billion sponsor impressions a year across the network at a blended $25 CPM is about $30M of ad sales. A 50% platform share is **$15M**.
- What justifies a premium CPM is a signed-in audience, confirmed adults for age-restricted categories, formats people watch, and evidence for every impression.
- The lever is the verified sign-up rate. The PID's target is 3% of visitors and the sample pilot shows 2.7%. Members-only content, the channel's own call to action and one account across every channel all push it up.

## 3. AI credits: metered usage

The platform fee covers the core loop (YouTube video to draft pack, within the plan's video hours). Credits pay for the work that costs real compute and grows with the publisher.

| Work | Sample price in credits |
| --- | --- |
| Article to short video (up to 60 s, 9:16) | 40 |
| Article to long-form video, per finished minute (16:9) | 25 |
| Synthetic voiceover, per minute | 5 |
| Translation and dubbing, per minute | 15 |
| Extra video-to-article processing beyond the plan, per video hour | 20 |
| Thumbnail and title set | 5 |

- One credit retails at about $0.10. Plans include a monthly allowance: Starter 100, Pro 500, Publisher 2,000, Enterprise custom.
- Top-ups: 1,000 credits for $100, 5,000 for $450, 20,000 for $1,600. Unused top-ups roll over for 12 months.
- Every publication gets a monthly spend cap and an alert at 80%, so there are no surprise bills.
- Assumption: 30% of paying accounts top up at an average of $150 a month, plus enterprise at $5,000 a month. That's **$6M** a year at roughly 60–70% gross margin after the video engine and model costs.
- The margin comes from Homestand's own layer over the video engine: brand kit, voice, templates, compliance pre-check and the review gate. Customers pay for the result, not raw generation.

## 4. The triple lock, licensed

The PID's wedge is that most mid-tier publishers won't build a triple lock themselves. Many will never move to Homestand either. Sell them the engine:

- An age-verified ad decision API and SDK covering session, age assurance and opt-out, with the AdStop check once it's live.
- Evidence packs and an audit log their advertisers' compliance teams accept.
- Price: an annual licence plus a fee per thousand decisions. Assumption: 60 licensees (sites, apps, racing bodies, streaming services) averaging $80,000 is **$4.8M**.
- This line is also the cheapest way into a publisher that might later move across.

## 5. Data housing: the audience vault

Each publication's first-party data lives on Homestand: viewer accounts, follows, consent and opt-out records, age-assurance results (the result only, never the ID), ad-decision evidence, and content performance. The publication owns it. Homestand stores, protects and moves it.

- **Retention tiers.** 12 months is included; 3, 5 or 7 years for publishers with compliance or archive needs.
- **Warehouse sync and API.** Push to the publisher's own BigQuery, Snowflake or CRM, metered by volume.
- **Audience insights for advertisers.** Aggregate, contextual reports (reach by section, verified share, attention) with minimum group sizes. No personal data, no individual targeting, no data sold.
- Assumption: **$4M** a year across retention, sync and insights.

Guardrails that protect the business: personal data is never sold or shared with advertisers, including wagering advertisers. Age-assurance results are used only for the triple lock. Exports and deletion are self-serve. The design assumes the Privacy Act reforms tighten, not loosen.

## 6. Video templates

Article to video starts with three included templates: Explainer (voiceover, charts, tables), Match report and Countdown. More are for sale:

- First-party templates at $49–$299 one-off, or included on higher plans.
- A marketplace for third-party motion designers, with Homestand taking 30%.
- Every template takes the publication's brand kit (colours, type, logo, voice), so one purchase works for every brand on the account.
- Assumption: **$1.5M**. The bigger value is that templates drive credit usage.

## 7. Memberships, services and hosting

- **Memberships and paid content:** a take rate of about 8% on fan memberships and paywalled series. Assumption: $25M of membership sales gives **$2M**.
- **Services:** white-glove migrations, plus a managed branded-video studio where brands commission template videos and Homestand charges a margin over credits. Assumption: **$3M**.
- **Hosting overage:** video hours, storage and bandwidth beyond the plan, metered like credits. Assumption: **$1.5M**.
- **Email:** each plan includes subscribers and sends; beyond that, sends draw on credits (1 per 100 emails), and Enterprise can add dedicated sending IPs. The bigger value is retention: newsletters are why members come back, and members are the verified audience. Assumption: **$1M**. See [email.md](email.md).

## What has to be true

| Assumption | Why it matters | How the pilot tests it |
| --- | --- | --- |
| Verified sign-up rate reaches 3% or more | It sets the premium CPM and the advertising line | Members-only content and channel calls to action, measured weekly |
| A third of accounts buy credits | It sets the second-biggest variable line | Offer article to video to pilot channels with a starter credit grant |
| Advertisers pay a premium for evidence | It sets CPMs and the licensing line | Sell two flights with evidence packs before launch |
| Growth beyond Australian sport | Australia alone is about $15–20M on these numbers | Enterprise and racing-body pilots; New Zealand and the UK next |

## Risks to say out loud

- **Ownership.** The PID warns that if a wagering company owns or controls the platform, regulators may treat the whole platform's content as wagering advertising. The licensing and data lines make this question bigger, not smaller. Settle it with lawyers before any wagering operator takes equity or in-house brands go live.
- **Synthetic media.** Generated videos are drafts that a person approves. Synthetic voiceover is disclosed. Imagery is licensed. No AI-generated people, per the brand guidelines.
- **Provider cost.** Credit prices assume the video engine's per-minute cost stays within a range. Check it before publishing prices, and keep the engine swappable.
- **Revenue concentration.** If advertising is a third of revenue, a regulatory change can move the whole business. Credits, licensing and subscriptions are the hedge.

## Comparable businesses (from the PID)

beehiiv (software plus an ad network) was around US$30M ARR in 2025, guiding US$50–55M for 2026. Substack takes 10% of paid subscriptions, about US$45M annualised. Neither has metered AI or a compliance product; both of those are Homestand's to own.
