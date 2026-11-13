# Email on Homestand

Written 13 November 2026. How email works in the demo, and what the real build needs. It sits beside [revenue-model.md](revenue-model.md) and [build-plan.md](build-plan.md).

## What it is

Every publication can email its members directly, without Mailchimp or another newsletter tool. There are two halves:

- **For viewers:** each publication has a Newsletters page listing its streams, such as The Weekly Fix (Mondays), Big news (only when it matters), Tuesday tips and Members' notes. Anyone can see them. Subscribing needs a free account, so every subscriber is a signed-in member. Joining a channel subscribes them to its default stream. The account centre lists every channel's newsletters.
- **For publishers:** Email in the studio, with three tabs.
  - **Email:** streams and their numbers, plus sent and scheduled emails. Some streams draft themselves from the week's stories.
  - **Subscribers:** CSV import with a consent check.
  - **Sending:** the publication's own domain and its health.

There are two ways to build an email: blocks in the publication's brand, or pasted HTML. Either way, Homestand adds the footer every email needs.

## Why members only

A list of signed-in members is worth more than a list of addresses, and it fits how everything else on Homestand works:

- One account follows channels, subscribes to newsletters, unlocks members-only videos and, if the viewer chooses, confirms they're 18+.
- Members are the verified audience sponsors pay for. More newsletter sign-ups mean a higher verified sign-up rate.
- Imported subscribers become members too. Their first email explains why they're hearing from the publication and how to sign in with a link.

## The builder (MVP)

- **Blocks:** heading, text, image (alt text required), button, story card (pulled from the publication's own stories) and divider. They render in the publication's colour and logo, in a single 600px column with system fonts. The same blocks produce the HTML that is sent: tables and inline styles, because that's what inboxes render reliably.
- **Paste HTML:** for anyone with a design from elsewhere. The preview runs in a sandbox with scripts off. On send, scripts and forms are stripped and the standard footer is added.
- **Draft from this week:** fills a digest from the week's published stories. It costs a few AI credits and the draft waits for review, like every other draft.
- **Before it sends:** subject present and under 70 characters, every image has alt text, the unsubscribe footer and header are added, and it's sent from the verified domain. Send a test, schedule or send now.

## Delivery

One sending provider sits behind the scenes. **Resend** is the likely fit: an API-first service that can verify a separate sending domain for each publication, send in batches, and report bounces and complaints through webhooks. The product never names the provider, and the integration sits behind one interface so it can be swapped.

| Need | How |
| --- | --- |
| Send as the publication | A sending subdomain per publication (e.g. `send.footyfix.com.au`) with SPF, DKIM, MX and DMARC records. Until a publication adds its own, it sends from a Homestand shared domain (`<slug>.homestand.email`). |
| Inbox placement | DKIM-signed and DMARC-aligned. New domains are warmed up gradually. Bounce rate is kept under 2% and complaints under 0.1% (Gmail and Yahoo require bulk senders to stay under 0.3%). |
| Unsubscribe | A one-click `List-Unsubscribe` header (RFC 8058) plus a footer link. It takes effect immediately and applies across every publication on the account. |
| Suppression | Bounces, complaints and unsubscribes go on a suppression list that imports can never override. |
| Isolation | Each publication's reputation is kept separate. A dedicated IP is offered to high-volume senders (Enterprise). |

## Australian rules (Spam Act 2003)

- **Consent:** people opt in on the channel, or the importer confirms consent before an import runs. Bought lists aren't allowed.
- **Identify the sender:** the from name, reply-to and postal address appear in every footer.
- **A working unsubscribe:** one click, honoured within five working days (we do it straight away), with no sign-in needed.

This is a summary, not legal advice.

## Ads in email

Email can't check a reader's age, so **no age-restricted sponsor ever appears in an email**. That covers wagering and alcohol. Everyday sponsors may appear later, as a story card labelled "Sponsored", with the same caps as on the page.

## How it's charged

- Plans include subscribers and sends: Starter 1,000 subscribers, Pro 10,000, Publisher 50,000 across all publications, Enterprise custom. Sends are included at up to four emails per subscriber per month.
- Beyond the plan, sends come out of AI credits: 1 credit per 100 emails. Drafting a digest costs 5 credits.
- Dedicated sending IPs and priority support are add-ons for Enterprise.

These are sample figures to test in the pilot.

## What the demo fakes

Sending, imports and DNS checks are simulated on sample data. Subscriptions are kept in the browser. The real build needs these database tables:

- `email_streams`, `email_subscriptions` (member, stream, status, consent source and time)
- `email_campaigns`, `email_events` (delivered, opened, clicked, bounced, complained, unsubscribed)
- `sending_domains` (records and status)
- `suppressions`

It also needs a worker that sends in batches and a webhook endpoint for the provider's events.
