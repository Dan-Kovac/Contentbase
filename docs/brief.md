# Homestand marketing and product brief

The decisions from the brand questions (11 November 2026), sitting alongside the [PID](pid.md) and the [brand guidelines](brand/brand-guidelines.md). Every screen and every line of copy follows this.

## Purpose

Homestand gives Australian sport and racing creators and publishers a channel they own. They connect YouTube, and every video automatically becomes a video page, an article, shorts and a page that ranks in Google. They review it and publish. The audience, the search traffic and the income belong to them, not to an algorithm.

## Who we speak to

Creators and publishers are equal audiences, and the landing page gives each its own path from the hero.

| | Independent creators | Publishers |
| --- | --- | --- |
| Who | Footy and racing YouTubers and podcasters, 5k–500k followers | Small newsrooms, racing media, clubs on WordPress or Ghost |
| Their problem | Reach and income swing with every algorithm change; no home they own | Losing wagering revenue on 1 January 2027; publishing video is slow |
| What we say | "Turn your YouTube channel into a publication you own." | "Move your site in a day, keep your rankings, keep your ad revenue." |
| First action | Connect YouTube | Import your site |

## The promise

**Ownership.** The hero headline promises a channel, an audience and search traffic the client owns. Automation is how we keep that promise; it is the proof, not the headline.

- Hero: **Your channel. Your audience.** Sub-line: "Connect YouTube and every video becomes an article, shorts and a page that ranks. You own all of it."
- Supporting messages, in order: 1) Own it (your domain, your audience, your search traffic). 2) Automated (connect once; new videos arrive as ready-to-publish drafts). 3) Earn (premium ads, including compliant wagering ads with the triple lock). 4) Move in easily (WordPress, Ghost, Substack, RSS with redirects).

## Voice

Confident and punchy, like a good software startup. Short sentences. Plain Australian English. No hype words ("revolutionary", "game-changing", "unleash"), no exclamation marks, no emoji.

| Say | Don't say |
| --- | --- |
| Your channel. Your audience. | Grow your brand presence |
| Connect YouTube | Integrate your video assets |
| Ready to review | AI-generated content |
| Publish | Submit |
| Draft | AI article |
| Don't show me betting ads | Gambling preferences |
| $99 a month inc. GST | $99/mo |

## Age-verified advertising (the triple lock)

The triple lock is **age-verified advertising**, not a gambling feature. A channel in Age-verified mode only shows age-restricted ads (alcohol, wagering, and other categories later) to viewers who are signed in, confirmed 18+ and haven't opted out. Lead with age-appropriate advertising; name the industries second. The 1 January 2027 wagering rules are one reason it matters, not the pitch. Feature-level on the landing page, in full on the For advertisers page. Copy never encourages betting or drinking.

Channel modes: **Standard** (no age-restricted ads) and **Age-verified** (triple lock on; the creator can still block categories). There is no racing-only mode.

## Ads: Homestand Native Formats

No banner placements, no standard IAB sizes, no AdSense. Advertisers fill a brief (name, one line, an image or muted loop, a link) and Homestand renders it in the channel's own design:

| Format | Where it appears |
| --- | --- |
| Chapter sponsor | A brand owns a chapter of the video: a marker on the player timeline and a credit in the chapter list |
| Half-time break | An editorial pause between article sections, styled like a broadcast break, full width of the container |
| Stat card | A sponsor message set as a scoreboard tile beside the key points |
| Sponsored short | A 9:16 short exactly the size of every other short, in rows and the feed |
| Presented by | A sponsor credit on the lead story or a section header |

Every format is labelled, fixed in size, fast (no third-party code) and checked in creative review. Age-restricted formats carry an 18+ mark and a one-tap opt-out.

## Product decisions

| Decision | Choice | Requirement IDs |
| --- | --- | --- |
| Sign-up | YouTube first: sign in with Google, pick the channel, import starts while they choose a name and look | CHN-01, MIG-01 |
| New videos | Automatic. Each new YouTube upload becomes a draft pack (video page, article, shorts, SEO) in a "Ready to review" queue. One click publishes. Nothing goes live without that click. | MIG-01, MIG-08, ING-04–11 |
| Shorts in the MVP | YouTube Shorts only (imported, plus shorts we cut from long videos). TikTok and Instagram come later (MIG-10, EDT-08). | ING-07 |
| Pricing | Shown on the site with a 14-day trial: Starter $29, Pro $99, Publisher $299, Enterprise on request, AUD inc. GST | BIL-01, BIL-02 |
| Channel look | The creator's own accent hex (contrast-checked) and logo; 3 preset type pairings (custom fonts later); 2 templates, Editorial and Broadcast, each previewed visually | CHN-02, CHN-03 |
| Custom pages | Creators build their own pages (About, Work with us, anything) and write standalone articles, not only video-generated ones | CHN-04, EDT-01 |
| Brand voice | Learned from the creator's own writing: upload articles, paste links or import a whole site; editable by hand | ING-09 |
| Stack | Vercel + Supabase (database, auth, storage); Mux for video | — |
