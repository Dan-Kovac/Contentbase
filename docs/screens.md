# Homestand screen inventory

This is the brief for step 2, designing every screen. Each screen lists what it must show and the requirement IDs it serves (see [pid.md](pid.md)). Design every MVP screen at 1440px desktop and 390px mobile, in light mode, using the [Homestand design system](https://claude.ai/artifact/CaZaHa7oNM8mt5GvUohXPV) and real Australian sport and racing content. Lorem ipsum is not allowed.

Screens are grouped by surface. Each surface has its own chrome:

| Surface | Who | Chrome | Theme |
| --- | --- | --- | --- |
| A. Marketing site | Prospective creators and publishers | Platform header and footer | Platform brand |
| B. Channel (public) | Viewers | Channel header with the creator's logo; "Powered by Homestand" footer | Channel accent and type pairing |
| C. Viewer account | Viewers | Platform sheet over the channel | Platform brand |
| D. Creator studio | Creators | Sidebar and top bar | Platform brand, follows system dark mode |
| E. Admin and compliance | Our team | Sidebar and top bar, plus an "Admin" marker | Platform brand |

## A. Marketing site (homestand.com.au)

| # | Screen | Must show | IDs |
| --- | --- | --- | --- |
| A1 | Home | The pitch ("Your channel, your audience, your search traffic"), the video → article + shorts loop, the triple-lock switch, example channels and the migration call to action | — |
| A2 | Pricing | Starter $29, Pro $99, Publisher $299, Enterprise, all AUD inc. GST; comparison table; 14-day trial | BIL-01, BIL-02 |
| A3 | Migrate | "Move from WordPress, Ghost, Substack or YouTube without losing rankings"; the redirect promise | MIG-01–06 |
| A4 | For advertisers | Premium logged-in, age-assured audience; the compliance evidence pack; contact form | TLK-09, ADS-04 |
| A5 | Sign up | Email or Google; choose a channel name and subdomain; plan selection | CHN-01 |

## B. Channel (public)

Show each screen in the **Editorial** template first. Broadcast and Minimal follow after design sign-off (CHN-02).

| # | Screen | Must show | IDs |
| --- | --- | --- | --- |
| B1 | Channel home | Lead story (video hero and headline), shorts row with one sponsored card, article grid, section rows, sponsor band ("Presented by"), follow button | CHN-04, CHN-05, ADS-01 |
| B2 | Video page | Player with chapters, ArticleHeader, article body with one in-article MREC, collapsed transcript with timestamps, related row, end-of-page MREC | ING-05, SEO-05, SEO-06 |
| B3 | Article page | Kicker, headline, standfirst, byline, hero media, 68ch body with pull quote, in-article MREC after a natural break, end-of-article MREC, related | CHN-04, ADS-02 |
| B4 | Short page | Full-height 9:16 player, caption, swipe hint, a sponsored card shown in sequence | ING-07 |
| B5 | Section / category | Section title, video and article grid, pagination | CHN-07 |
| B6 | Exclusive, logged out | ExclusiveGate over the blurred teaser, with no ads | AUD-03, EDT-05 |
| B7 | Search | Search box, results mixing videos, articles and shorts, an empty state | CHN-04 |
| B8 | About | Channel bio, the creator's socials, follow button | CHN-04 |
| B9 | Live page | LIVE badge, live blog or stream, with no wagering ads (show the slot filled by a non-wagering ad) | TLK-08 |
| B10 | Wagering ad states | The same article, logged in and age-assured: a wagering MREC with the opt-out link; then the opted-out state with a non-wagering ad and the toast "You won't see betting ads on Homestand" | TLK-01–03, TLK-06 |
| B11 | 404 and redirected | A 404 page that offers search; a note in the design file that imported URLs 301 to their new pages | MIG-05 |

## C. Viewer account

| # | Screen | Must show | IDs |
| --- | --- | --- | --- |
| C1 | Sign in sheet | Email magic link, Google, Apple; "One account for every Homestand channel" | AUD-01 |
| C2 | Check your email | Magic link sent, resend option | AUD-01 |
| C3 | Age assurance | Why we ask (only for betting ads), provider handoff, "We keep the result, never your ID", the success and failed states | TLK-02 |
| C4 | Account centre: profile | Name, email, sign-in methods | AUD-04 |
| C5 | Account centre: following | Followed channels, weekly digest toggle | AUD-02 |
| C6 | Account centre: ad preferences | "Don't show me betting ads" switch with the current state, age-assurance status, AdStop note | AUD-04, TLK-03, TLK-04 |
| C7 | Account centre: your data | Download my data, delete account (with a confirmation step) | AUD-04 |
| C8 | Weekly digest email | Followed channels' new videos and articles | AUD-02 |

## D. Creator studio

| # | Screen | Must show | IDs |
| --- | --- | --- | --- |
| D1 | Onboarding | Channel name, subdomain live in 1 minute, choose template, logo, accent, type pairing (with the contrast check), "Import from…" choice | CHN-01–03 |
| D2 | Dashboard | Views, watch time, verified users, sign-ups, search sessions, top content, traffic sources, items awaiting review | ANL-01 |
| D3 | Upload | Drag-and-drop, resumable progress (survives a dropped connection), file limits (4 GB, 3 hours) | ING-01 |
| D4 | Processing | Pipeline steps: uploaded → transcoding → transcribing → drafting article → cutting shorts, with an ETA | ING-02, ING-03 |
| D5 | Review: article draft | 3 headline options, standfirst, body in the block editor, compliance pre-check flags inline ("Odds mentioned in paragraph 4"), AI assist menu, Publish and Schedule | ING-04, ING-10, ING-11, EDT-01, EDT-02 |
| D6 | Review: shorts | 3–5 suggested clips, trim and reframe, caption edit, title suggestions | ING-07, EDT-06 |
| D7 | Review: SEO and thumbnail | Title tag, meta description, slug, Open Graph preview, 3 suggested thumbnails plus upload, chapters editor | ING-05, ING-06, ING-08 |
| D8 | Content library | Videos, shorts and articles with Draft, Scheduled and Published badges; filters, search, bulk actions | EDT-03 |
| D9 | Schedule dialog | Date and time in the channel's time zone | EDT-04 |
| D10 | Exclusive toggle and preview | Mark as signed-in only; "See what logged-out visitors see" | EDT-05 |
| D11 | Import: choose source | YouTube (OAuth), WordPress (WXR or REST), Ghost, Substack, RSS | MIG-01–04 |
| D12 | Import: pick items | YouTube video list with select all; counts | MIG-01 |
| D13 | Import: progress and report | Live progress; imported, skipped and failed with reasons; retry; "Generate articles for all imported videos" | MIG-07, MIG-08 |
| D14 | Custom domain wizard | DNS steps, verification check, SSL status, rollback note | MIG-06 |
| D15 | Channel design | Template switcher, homepage module order and toggles (no free-form ad blocks), navigation (up to 8 items), live preview | CHN-02, CHN-05, CHN-07 |
| D16 | Brand voice | Tone, banned words, house style | ING-09 |
| D17 | Channel mode and ads | Standard, Triple lock or Racing-only (with the racing declaration), ad category blocks, AdSense on/off | CHN-06, TLK-10, ADS-08, ADS-09 |
| D18 | Billing | Current plan, video hours used, upgrade or downgrade, invoices with GST | BIL-01, BIL-02 |

## E. Admin and compliance console

| # | Screen | Must show | IDs |
| --- | --- | --- | --- |
| E1 | Channels | List with mode, plan and notable-person flag; detail with suspend, change mode, impersonate (logged) | ADM-01, ADM-05 |
| E2 | Creative review queue | Creative preview, checklist (odds, notable persons, responsible-gambling message, harmful content), approve or reject with a reason | ADS-06, ADM-02 |
| E3 | Campaigns | Advertiser, pricing model (CPM, flat, CPC), targeting, flight dates, delivery | ADS-04, ADS-05 |
| E4 | Ad decision and evidence viewer | Search by impression, session or campaign; the LockStatus for each lock; reason codes | TLK-05, TLK-06 |
| E5 | Evidence export | Per advertiser, campaign or date range; CSV and PDF; job status | ADM-03, TLK-09 |
| E6 | Moderation queue | Viewer reports, takedown with notice to the creator | ADM-04 |
| E7 | Audit log | Actor, action, target, before and after, time | ADM-01 |
| E8 | Pilot KPIs | The Section 3 metrics across pilot channels | ANL-04 |
| E9 | Advertiser report | Impressions, clicks, CTR and spend by placement and channel | ANL-03 |

## Shared states to design once

- Empty states for the library, search, imports and the review queue
- Loading skeletons for the channel home, video page and library
- Toasts: Published, Scheduled, Saved, Import finished, Opted out of betting ads
- Error pages: 404, 500, suspended channel
- Confirmation dialogs: take down, delete, change channel mode
