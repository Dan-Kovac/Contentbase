# Work queue

The build loop reads and updates this file. The packages are defined in [implementation-plan.md](implementation-plan.md#6-work-packages), and the loop is described in [CLAUDE.md](../CLAUDE.md#how-work-gets-done).

**Statuses:**
- `todo`: ready once its dependencies are done.
- `doing`: a run is building it.
- `review`: a pull request is open, waiting for a person.
- `blocked`: needs a person; see "Needs".
- `done`: merged.

A person sets `done` after merging. A run never edits a package another run marked `doing`.

## MVP

| ID | Package | Depends on | Status | Branch / PR | Needs |
| --- | --- | --- | --- | --- | --- |
| WP-00 | Clean-up before code: documents agree, `lib/plans.ts` holds plan limits | — | todo | | |
| WP-01 | Foundations: Supabase, migrations, RLS, CI, `lib/data` on Postgres | WP-00 | blocked | | A Supabase project in Sydney linked to Vercel; its keys saved as environment secrets (see "Set-up a person does") |
| WP-02 | Creator sign-up and YouTube import | WP-01 | todo | | Google OAuth client with YouTube scopes (Testing mode is fine) |
| WP-03 | Several publications and entitlements | WP-01 | todo | | |
| WP-04 | Draft packs (transcript, article, chapters, SEO, clips, compliance flags) | WP-02 | todo | | Anthropic and Deepgram keys |
| WP-08 | Publish and channel pages, sitemaps, revalidation | WP-04 | todo | | |
| WP-09 | Video player compliance (YouTube controls and chapter sponsors) | WP-08 | blocked | | A read on YouTube's API policies (counsel or Dan) |
| WP-10 | Uploads, shorts and site migration | WP-08 | todo | | Mux keys |
| WP-05 | Viewer accounts and one central sign-in | WP-01 | todo | | Choice of age-assurance provider |
| WP-06 | Members-only content checked on the server | WP-05 | todo | | |
| WP-07 | Ad decisions, evidence and AdSense fill | WP-05, WP-06 | todo | | Evidence retention period (counsel) |

## After the MVP

| ID | Package | Depends on | Status | Branch / PR | Needs |
| --- | --- | --- | --- | --- | --- |
| WP-11 | Newsletters for members | WP-05 | todo | | |
| WP-12 | Sending, safely (Resend, unsubscribe, sanitising) | WP-11 | todo | | Resend key |
| WP-13 | Subscriber import with the welcome sign-in email | WP-12 | todo | | |
| WP-14 | AI usage ledger at cost plus 20% | WP-01 | todo | | Stripe keys |
| WP-15 | Brand kit and templates (Remotion) | WP-14 | todo | | Remotion licence, AWS account |
| WP-16 | Words to video | WP-15 | todo | | Azure Speech key |

## Set-up a person does

These can't be automated from a session. Each one unblocks packages.

1. Make one branch the default (rename it `main`), and merge the prototype into it.
2. Create the Supabase project (Sydney) and link it to Vercel. Save the keys as secrets in the cloud environment, never in the repo.
3. Create the Google OAuth client with the YouTube scopes. Add the Anthropic, Deepgram, Mux, Stripe and Resend keys as each package needs them.
4. Make the decisions marked counsel in the implementation plan, section 8.

## Log

Runs add one line here: date, package, outcome, PR.
