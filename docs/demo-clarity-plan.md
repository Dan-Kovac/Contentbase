# Homestand demo: clarity plan

Written 11 November 2026 after a review of all 56 screens at 1440px and 390px, plus the code behind them. It is a brief for an implementation session. Read sections 1 to 4 for the argument, then build from section 5 in the order given in section 8.

**Ground rules for the implementing session**

- This is a demo on sample data (`apps/web/src/lib/data`). Do not add a backend. Fake state lives in React context and `localStorage`.
- `apps/web/AGENTS.md` applies: this is Next.js 16, so read the relevant guide in `node_modules/next/dist/docs/` before writing code.
- Park screens by removing them from navigation. Do not delete routes; `/screens` stays as the full index.
- Copy follows `docs/brief.md`: plain Australian English, short sentences, no exclamation marks, no emoji.
- Done means `pnpm typecheck && pnpm lint && pnpm build` pass and the checks in section 9 pass.

---

## 1. What the demo has to prove

The current build is a faithful MVP of the PID. It is broad (56 screens) and the value is spread thin across it. A person watching a ten-minute demo should leave with four ideas, and each idea needs one screen that proves it.

| # | The idea | Said in one line | The screen that proves it |
| --- | --- | --- | --- |
| 1 | Value to Sportsbet (and any age-restricted advertiser) | Every wagering impression reaches a signed-in, confirmed adult who hasn't opted out, with evidence for each one, in formats people watch. | A video page that changes its sponsor as the viewer signs in, verifies and opts out; then the evidence log. |
| 2 | Value to publishers and creators | Keep the revenue the 2027 rules would take away, and own the audience, the domain and the search traffic. | Studio home with an earnings number; the review-and-publish flow. |
| 3 | A new kind of publication | One video becomes a video page, an article and shorts. Sponsors take the shape of the content beside them. No banners. | The channel home and video page, next to a sketch of a typical ad-heavy page. |
| 4 | Digital empires | Start with one channel. Grow it into a publication, then a network, under your own brand and your own call to action. | Two channels with different looks and different calls to action; the join flow in the channel's brand. |

The PID also lists an "internal content brand" persona: the company's own footy and racing brands, which need a standalone home once that content can no longer live inside the betting product. That is a second Sportsbet value and belongs in the Sportsbet track of the demo (section 5K), with the legal caveat the PID already carries.

**Legal wording.** Every statement about the 1 January 2027 rules comes from the PID, which is explicit that it is not legal advice. Keep the existing disclaimer wherever the rules are described and do not strengthen any claim.

---

## 2. What I found

Measured in a browser, not estimated.

**The banner problem is real and it breaks the brand's own rules.**

| Where | The sponsor unit | What it sits next to | Verdict |
| --- | --- | --- | --- |
| Video page, in the article | Half-time break, 1216 × 340 | Reading column, 684 wide | 1.8 times the width of the article |
| Article page | Half-time break, 1216 × 340 | Reading column 684; headline block 920 | Same problem |
| Channel home (both templates) | Half-time break, 1216 × 340 | Shorts row above (168 × 299 cards), story grid below | Matches neither neighbour |
| Live page | Grey "Advertisement · 300 × 250" box, 326 × 296 | Key moments rail, 373 wide | A standard IAB banner, which the brand guidelines ban |
| Shorts feed | The same grey placeholder, 168 wide | Feed player, 372 wide | Not a short at all |
| Shorts row | Sponsored short, 168 × 327 | Short cards, 168 × 327 | Correct. This is the model for everything else. |
| Video page, after the article | Stat card, 240 × 254 | Key points, 423 × 254 | Same height, different width |

There are two ad systems in the code: `components/brand/native-ads.tsx` (the five native formats) and `components/brand/ad-slot.tsx` (the old IAB sizes: 300 × 250, 970 × 250, 320 × 100). The second one should not exist.

**Too many sponsor voices per page.** The brand guidelines cap a page at three formats. The channel home carries four (Presented by on the lead, a sponsored short, the half-time break, Presented by on the AFL section). The video page mentions its chapter sponsor in three places (timeline label, a strip under the player, the chapter list) and then adds a half-time break and a stat card.

**Sponsor creative looks like editorial.** Every sample sponsor uses a stadium photo from the same library as the stories. A ute brand's ad is a picture of a football ground. Once ads share the shape of content, the creative has to look like the sponsor.

**Nobody can tell what the channel wants a visitor to do.** The channel header has a search icon, an unlabelled person icon and a "Follow" pill that goes to a Homestand-branded sign-in page. There is no "Sign in" in words, the creator cannot change the call to action, and the sign-up page carries Homestand's brand, not the channel's. `Channel` in `lib/types.ts` has no call-to-action field.

**The landing page sells a subscription, not the idea.** It is 6,856px tall with nine sections. The kicker says "creators" only. The advertiser value is one panel two-thirds of the way down. The hero visual is a browser mock that is cropped by the fold with a half-empty shorts row. There is no picture of "one video in, a publication out", no comparison with a normal ad-heavy page, and nothing about growing beyond one channel. Footer links for Privacy and Terms point at the pricing FAQ.

**The triple lock's best demo is hidden.** The "Preview as" switch on the video page (logged out, signed in, 18+ verified, opted out) swaps the sponsors live. It is the single strongest proof for an advertiser, and it sits in a dashed box between the player and the headline, on one page only. The channel home and article page ignore viewer state entirely.

**The studio never shows money.** Studio home and Analytics report views, watch time, sign-ups and search. There is no earnings figure anywhere in the studio, so the publisher's main reason to switch is invisible.

**Breadth and navigation.** Sign-up is six steps. The studio sidebar has 16 items (9 plus 7 settings). The admin console has 7. Monetisation settings is 3,865px tall and Design is 3,151px.

**Smaller inconsistencies**

- Footy Fix's studio queue contains a Trackside video ("Why the Cox Plate draw matters more than ever").
- Article page uses three widths: headline 920, hero image 1216, body 684.
- Shorts feed and its "Up next" list show flat colour blocks; the shorts row on the home page shows photos of the same shorts.
- The same five stadium photos repeat across most cards, so the home page reads as one image.
- The primary action changes colour: "Start free trial" is Pitch in the marketing header and white in the hero.
- The channel logo tile reads "FF" in the landing mock and "F" on the channel.
- Channel pages show production notes to viewers ("Plays in the YouTube player · Captions in English").
- The Exclusive badge on a client's channel uses Homestand's Pitch gradient, so the platform's brand shows inside the client's.
- Home page, editorial template: a large empty column under "Most watched".
- Two sign-in designs (`/signin` for creators, `/account/signin` for viewers) and "Follow" doubles as the sign-in link.
- `README.md` says 50 screens; there are 56.

---

## 3. Decisions for Dan

Each has a recommendation. If there is no answer, the implementing session should take the recommendation.

| # | Decision | Recommendation |
| --- | --- | --- |
| D1 | Do we show Sportsbet's real name and brand in the demo? | No on anything that could be deployed publicly. Keep the fictional "Harbour Bet" in the product. Name Sportsbet only on the unlisted `/demo` guide. If you have permission to show the brand, it is a one-line change to the `sp_harbour` record in `lib/data/sample.ts`. |
| D2 | Hero headline. The brief (decided today) says "Your channel. Your audience." | Change it to "Turn your channel into a publication you own." The current line is a slogan; it does not say what the product is. Keep "Your channel. Your audience." as the footer tagline. |
| D3 | Retire the Stat card format? | Yes. Replace it with a Sponsored story (a story card in the grid). The stat card has no natural sibling to match. The count stays at five formats. |
| D4 | Remove the plan step from sign-up? | Yes. Start everyone on a Pro trial; choose a plan later in Billing. |
| D5 | Use the word "empire" on the landing page? | Once, as a section headline ("From one channel to a media empire."). It bends the brief's no-hype rule, so keep it to that one place. |
| D6 | Should the Exclusive badge on channel pages use the channel's accent instead of Pitch? | Yes. A client's channel should carry one brand. |

**One open product question, which Sportsbet will ask.** The size of the verified-adult audience depends on viewers choosing to confirm their age, and today the only stated reason to do it is so that age-restricted ads can be shown to them. The admin overview's own sample KPI shows a 2.7% verified sign-up rate. The demo should not hide this; it should show the number and have an answer (for example: racing channels gate exclusives behind 18+, and one check covers every channel). This plan does not solve it. It needs an owner.

---

## 4. The demo spine

Twelve screens tell the whole story. Everything else is parked: reachable from `/screens`, absent from navigation.

| Step | Screen | Idea it proves |
| --- | --- | --- |
| 1 | Landing `/` | All four, in a minute |
| 2 | Sign-up: Connect, Pick channel, Make it yours, You're live (4 steps) | 2 |
| 3 | Studio home `/studio` | 2 (earnings, queue) |
| 4 | Review workspace `/studio/review/v_blues`, then Publish | 2, 3 |
| 5 | Channel home `/c/footyfix` | 3 |
| 6 | Video page `/c/footyfix/v/blues-centre-bounce-problem` | 3 |
| 7 | Join `/c/footyfix/join` (the channel's own call to action) | 4 |
| 8 | Confirm 18+ `/account/verify-age`, back to the video page: the wagering sponsor now appears; opt out and it goes | 1 |
| 9 | Second channel `/c/trackside` (different look, different call to action) | 4 |
| 10 | For advertisers `/advertisers` | 1 |
| 11 | Evidence log `/admin/evidence` | 1 |
| 12 | Campaign results `/admin/campaigns` | 1 |

**Parked (kept in code, removed from nav):** Upload, Imports (3), Articles list and editor, Pages list and editor, Shorts list and editor, Brand voice, Domain, Billing, Connections as separate sidebar items (see 5G); Admin Channels, Moderation and Audit; Live coverage; channel Search; `/pricing` stays linked but is not on the spine.

---

## 5. Workstreams

### 5A. Same-shape ads (the banner fix)

**The rule.** A sponsor unit never has a size of its own. It is rendered by the same component, in the same grid cell or column, as the content beside it, so its width and height equal its neighbour's. If there is no content unit to match, there is no ad there.

**The five formats, respecified**

| Format | Is the same shape as | Desktop size | Mobile size | Label |
| --- | --- | --- | --- | --- |
| Sponsored short | A short card in a row; the player in the feed | 168 wide, 9:16, plus two caption lines (row). 372 wide, 9:16 (feed). | Same as the short beside it | "Sponsored" tag top left, where the "Clip" tag sits |
| Sponsored story (new, replaces Stat card) | A `StoryCard` in the story grid | One grid cell: 16:9 image, kicker, headline, meta line | One full-width card, as stories are | Kicker reads "Sponsored · Brand name" in place of the section |
| Half-time break | An image or video block inside the article | The reading column (`max-w-[68ch]`, 684px), 16:9, same radius as article images | Column width, 16:9 | In the caption row under it, where a figure caption sits: "Sponsored · Brand name" left, opt-out right |
| Chapter sponsor | A chapter | One row in the chapter list; one segment on the timeline | Same | "Sponsored" in the chapter row |
| Presented by | A byline | One line of text with a 2px rule, the width of its module header | Same | "Presented by" |

**Density.** One sponsor per module. Three formats per page at most. The home page carries at most: Presented by on the lead story, one sponsored short in the shorts row, one sponsored story in the grid. The video page carries at most: one chapter sponsor, one half-time break in the article, one sponsored short in "Watch and read next".

**Sponsor creative.** A unit is the sponsor's colour, the sponsor's mark and name, one line of type and one button. An image or muted loop is optional. Remove the `image` field from the four sample sponsors in `lib/data/sample.ts` (lines 551 to 555) so the demo shows type on the sponsor's colour; stadium photos stay editorial. This makes a sponsor unit recognisable at a glance while keeping the shape of content.

**Changes**

1. `components/brand/native-ads.tsx`
   - `HalftimeBreak`: remove the fixed `height: 340`. Render as a `figure`: a 16:9 box (`aspect-video`, `rounded-lg`, same classes as the article image block in `components/channel/video-page.tsx` line 145) holding the mark, name, line and button; then a `figcaption` row with "Sponsored · Name", the 18+ tag and the opt-out. Below 480px wide, clamp the line to two lines and use the 30px type size.
   - Add `SponsoredStoryCard`, built from `StoryImage` and the text layout of `StoryCard` (`components/channel/story.tsx`) so it cannot drift from a story card. The headline is the sponsor's line; the meta line is the button text with an arrow.
   - `SponsoredShortCard`: keep. Add a `variant="feed"` that fills the feed's 9:16 frame.
   - Delete `StatCard`.
   - `ChapterSponsorCredit` and `PresentedBy`: keep as they are.
2. Delete `components/brand/ad-slot.tsx`. Remove `--ad-frame` and `--ad-label` from `app/globals.css` and `docs/brand/` if nothing else uses them.
3. `components/channel/home-editorial.tsx` and `home-broadcast.tsx`: remove the `"sponsor"` module case (the full-width half-time break). In the `"grid"` case, place one `SponsoredStoryCard` as the third cell of the grid. Keep the lead's `PresentedBy`. Remove the `PresentedBy` from the first section row so the home page stays at three.
4. `lib/types.ts`: remove `"sponsor"` from `HomeModule`; in `NativeFormat` replace `"stat_card"` with `"sponsored_story"`. Update `SLOT_PLANS` in `components/channel/lib.ts`: rename `stat` to `story`, same sponsors.
5. `app/c/[channel]/a/[slug]/page.tsx` (line 119) and `app/c/[channel]/v/[slug]/page.tsx`: move the half-time break inside the `READING` wrapper so it takes the column width. Use the same vertical margin as an image block.
6. `components/channel/video-client.tsx`: delete `ChapterSponsorUnderPlayer` and `StatSlot` and their uses in the video page. The key points box then takes the full column width. Show the timeline's "Presented by" label only while the sponsored chapter is playing or hovered.
7. `components/channel/shorts-feed.tsx` (line 150): replace the `AdSlot` placeholder with `SponsoredShortCard variant="feed"` in the same frame as a short, with the same caption area under it.
8. `app/c/[channel]/live/page.tsx` (line 109): remove the 300 × 250 unit. Put one `PresentedBy` line under the live header. Live pages never carry age-restricted sponsors; keep that rule.
9. Follow-on edits so every preview matches: `components/settings/template-preview.tsx` (remove `SponsorBand`, add the sponsored story to the mini grid), `components/settings/design-editor.tsx` (drop the "Sponsor band" homepage module; mark "Article grid" as able to carry a sponsor), `components/settings/monetisation.tsx`, `components/admin/review-queue.tsx`, `components/marketing/native-formats.tsx`, `app/(marketing)/advertisers/page.tsx`, and the sample campaigns and creatives in `lib/data/sample.ts` that use `stat_card`. Keep the admin demo of a failing check ("No odds promoted: fail"): move the offending "$3.50" line into a half-time break creative.

**Acceptance.** See section 9, check 1. In short: on every channel page, each sponsor unit's bounding box matches its sibling's to within 1px in width and, for shorts and story cards, in height; no element on any channel page is wider than the column it sits in; the strings "Advertisement", "300 × 250" and "970 × 250" appear nowhere in the app.

### 5B. The channel's own call to action, and a join flow in the channel's brand

**The idea.** Every channel has one call to action that the creator names and points wherever they like. Signing in is always available, in words.

1. `lib/types.ts`, `Channel`: add

   ```ts
   cta: {
     /** Button text, 20 characters at most. */
     label: string
     /** One supporting line, 60 characters at most. */
     line: string
     /** join: free Homestand account for this channel. link: the creator's own URL. */
     action: "join" | "link"
     href?: string
   }
   ```

   Sample data: Footy Fix `{ label: "Join free", line: "New episodes every Tuesday, and members-only sessions.", action: "join" }`. Trackside `{ label: "Get the form guide", line: "Saturday's form in your inbox on Friday.", action: "join" }`.

2. New `components/channel/channel-cta.tsx` with three variants, all reading `channel.cta`:
   - `pill`: the header button, in the channel accent.
   - `block`: a panel the width of the column it sits in (the reading column at the end of an article or video; the right rail on the home page, which fills the empty space under "Most watched"). Channel logo, the line, the button, and "Already a member? Sign in".
   - `gate`: the Exclusive gate uses the same label and line.
3. `components/shell/channel-chrome.tsx`, header right side becomes: search icon, a text link "Sign in" (logged out) or an avatar with a small menu (signed in: Account, Sign out), then the CTA pill. Remove the unlabelled person icon. Footer: add the CTA block's line and button beside the logo.
4. New route `app/c/[channel]/join/page.tsx`, inside the channel layout so it carries the channel's header, fonts and accent. Content: "Join Footy Fix" (channel name), the CTA line, three benefits (members-only videos, a weekly digest, follow the channel), an email field with "Email me a sign-in link", Google and Apple buttons, and small print: "One free account works on every Homestand channel." Submitting signs the viewer in (see 5C) and returns to `?next=`. Point every "Sign in to watch", "Follow" and CTA at this page. `/account/signin` redirects here when it has a channel to return to.
5. Studio: add a "Call to action" card to Design settings (`components/settings/design-editor.tsx`): label (with presets Follow, Join free, Subscribe, Become a member), supporting line, destination (Join this channel, or a link). The live preview updates the header pill. Add the row to "What clients can change" in the brand guidelines.
6. Sign-up step 3 (see 5F) asks "What should your button say?" with the same four presets.

**Acceptance.** Logged out, every channel page shows "Sign in" in words and the channel's CTA in the header. Footy Fix and Trackside show different labels. The join page has the channel's logo, accent and type, and the Homestand wordmark appears only as "Powered by".

### 5C. One viewer switch for the whole channel (replaces "Preview as")

1. Move viewer state out of `VideoPageProvider` into a `ViewerProvider` mounted in `app/c/[channel]/layout.tsx`. State: the existing `Viewer` type (`logged_out`, `signed_in`, `verified`, `opted_out`). Persist to `localStorage` inside try/catch; accept `?as=verified` to set it from a link.
2. Home, article, section and shorts pages are server components that call `sponsorFor(slot)` with no viewer. Add a small client component `Slot` that reads the viewer and the channel and renders the right sponsor, and use it for every sponsor unit. Then every page responds to the viewer, not only the video page.
3. Replace `PreviewAs` (`components/channel/video-client.tsx` line 153) with a demo bar: a small dark pill fixed to the bottom centre of channel pages. "Viewing as" plus the four states as a segmented control, and one line that explains the result (reuse the notes already written in `slotPlans`). It collapses to a dot. `?demo=0` hides it.
4. Wire the real flows to the same state: joining sets `signed_in`; finishing `/account/verify-age` sets `verified`; any "Don't show me betting ads" link sets `opted_out`. The header reflects it.

**Acceptance.** Starting logged out on the Footy Fix video page: join, confirm 18+, return. The chapter sponsor is now Harbour Bet with an 18+ tag. Tap "Don't show me betting ads": it becomes Southern Cross Utes without a reload. The same switch changes the sponsor on the home page.

### 5D. Landing page

Target: under 4,600px at 1440 wide (now 6,856), seven sections, one idea each.

| # | Section | Content |
| --- | --- | --- |
| 0 | Header | Creators · Publishers · Advertisers · Pricing. "Sign in". "Start free trial" in Pitch. Fix the "For creators" link, which points at an anchor that will move. |
| 1 | Hero | Kicker: "Video-first publishing for Australian sport and racing". H1: "Turn your channel into a publication **you own.**" (Pitch on the last two words). Sub: "Connect YouTube. Every video becomes a video page, an article and shorts on your own site, with fans who sign in and sponsors that fit the page." Primary button "Start free trial" in Pitch, the same as the header. Secondary "See a live channel". Under it, keep "14-day free trial. No card needed. From $29 a month inc. GST." and add a text link "Advertising with us? See the formats". |
| 1b | Hero visual | Replace the cropped browser mock with "one video in, a publication out": a YouTube video tile on the left, then four outputs in a row: Video page, Article, Shorts (three 9:16 tiles), Search result. Build it from the pieces in `components/marketing/product-visuals.tsx` (`ReviewCardMock`, `SearchResultMock`). It must sit fully above the fold at 1440 × 900 or end on a clean edge. |
| 2 | Who wins (`id="who"`) | Three equal columns. **Creators and publishers: "Own the audience and the income."** Your domain, your sign-ins, your search traffic. Every video becomes a page, an article and shorts. Sponsors pay to reach verified adults and you take a share. Buttons: Connect YouTube, Import your site. **Fans: "A page worth staying on."** No banners and no pop-ups. Watch, read or skip to a chapter. One free account, and a say over the ads they see. **Advertisers: "Verified adults, in formats people watch."** Three checks before every age-restricted ad. Your brand set in the channel's own design. Evidence for every impression. Link: See the formats. |
| 3 | How it works | Keep the existing three steps and the draft-pack mock. It is the clearest part of the page. |
| 4 | The page, rethought | H2: "No banners. Sponsors take the shape of the story." Sub: "Most publications bolt ads on top of the page. Here a sponsor is a short among shorts, a story among stories, a break the width of the article." Visual: two page sketches side by side. Left, "A typical sports page", drawn as plain grey blocks only (leaderboard, side box, in-article banner, sticky footer) with no real publisher's name or look. Right, the Homestand video page in miniature with its sponsor units tinted. Under it, the five formats in one row, each shown beside its content sibling, using the real components. Link: "See all five formats". |
| 5 | Age-verified advertising | Keep `AgeVerifiedPanel` and the three locks. H2: "Adults-only ads, checked every time." One paragraph, one link to `/advertisers#triple-lock`. |
| 6 | Growth | H2: "From one channel to a media empire." Three steps: **A channel** (your videos on your own domain). **A publication** (sections, writers, your own pages, members and your own call to action). **A network** (more channels under one roof: three on Publisher, unlimited on Enterprise). Visual: Footy Fix and Trackside side by side with `ChannelPreview`, showing two looks and two calls to action. |
| 7 | Close | Keep the dark closing band. Add one line: "From $29 a month inc. GST. 14-day free trial." with a "See pricing" link. |

**Removed from the landing page:** the "Own it" section (its points move into Who wins; the search result moves into the hero visual), "Move in easily" (it already lives on `/publishers`), and the four-column pricing row (it lives on `/pricing`).

**Also:** change the kicker and the footer blurb so they say creators and publishers, not creators only. Point the footer's Privacy and Terms links at a simple placeholder page or remove them; they currently go to the pricing FAQ.

File: `app/(marketing)/page.tsx`, with new visuals in `components/marketing/product-visuals.tsx`.

### 5E. Advertisers and publishers pages

`/advertisers` (8,066px now; target under 5,500) is the Sportsbet page. Reorder it so the argument runs problem, proof, product, purchase:

1. Hero: keep "Reach verified adults, in formats people actually watch." Replace the 1216-style half-time break in the hero with the column-width version.
2. The rule in one line, with the PID's disclaimer: "From 1 January 2027, wagering ads online need a signed-in viewer, a confirmed adult and an opt-out. We check all three on every impression."
3. The triple lock, made interactive: the same four-state viewer switch from 5C beside a small video page, so the reader sees the sponsor change. This replaces the two static pass and fail panels.
4. The five formats, each beside its content sibling (shared with the landing page).
5. Evidence pack: keep.
6. The network: channels, signed-in viewers and verified adults, from the sample analytics, labelled as sample data.
7. "Have content of your own?" One short block for brands with their own footy or racing content: a standalone channel on Enterprise. Carry the legal caveat.
8. Ways to buy, then the contact form.

Cut "People who chose to be here" (three cards that repeat the hero) and shrink the categories section to one row.

`/publishers`: keep the structure. Add an earnings example near the top (sample figures, labelled) because revenue is the reason a publisher moves. Replace any full-width half-time break with the column-width version.

### 5F. Sign-up: six steps to four

| Now | After |
| --- | --- |
| 1 Connect, 2 Channel, 3 Name, 4 Look, 5 Plan, 6 Live | 1 Connect, 2 Channel, 3 Make it yours, 4 Live |

- **Make it yours** merges Name and Look: channel name and address, template (Editorial or Broadcast), accent colour, and "What should your button say?" (5B). Logo upload and type pairing move to Design settings; the pairing defaults from the template. The left panel is the live preview for this step, and it shows the CTA pill.
- **Plan** is removed (D4). The trial starts on Pro. The sidebar's trial meter and Billing already cover the choice.
- **Live**: primary button "Review your first draft", going straight to `/studio/review/v_blues`. Secondary "Open your channel". Today the primary is "Go to your studio", which adds a step before the first moment of value.
- Use one left-panel treatment throughout: slogan on steps 1 and 2, live preview on 3 and 4.

Files: `components/auth/signup-steps.tsx` (`SIGNUP_STEPS`), `components/auth/name-form.tsx`, `components/auth/style-step.tsx`, `components/auth/signup-draft.ts`, `app/(auth)/signup/*`. Keep `/signup/plan` as a route that redirects to `/signup/importing`.

### 5G. Studio

**Navigation: 16 items to 5.** `components/shell/studio-sidebar.tsx`:

| Sidebar item | Contains |
| --- | --- |
| Home | As now, simplified below |
| Review | The Ready to review queue, with its badge |
| Library | A shared tab bar across the existing routes: Videos (`/studio/library`), Articles (`/studio/articles`), Shorts (`/studio/shorts`), Pages (`/studio/pages`). "Upload" and "Write an article" are buttons on this page. |
| Analytics | With a new Earnings tab |
| Settings | A shared tab bar across the existing settings routes: Channel, Design, Monetisation, then a "More" group for Domain, Connections (which links to Imports), Brand voice and Billing |

No page is rebuilt; this is two tab-bar components and a shorter sidebar.

**Home** (`app/studio/page.tsx`, 1,782px now):

- Keep the greeting, Ready to review, On the way and the 30-day numbers.
- Add an earnings tile as the first of the 30-day numbers: sponsor earnings for the period, with the share that came from age-verified formats. Add the figures to the sample analytics in `lib/data/sample.ts` and label them as sample data.
- Remove the Create card (the same actions are in the header and Library) and move the YouTube connection card to Settings, leaving a one-line status.
- Fix the data: Footy Fix's queue should hold only Footy Fix videos. Keep the compliance-flag demo by adding a flagged Footy Fix draft (for example a tips video that quotes odds), and leave the Cox Plate pack to Trackside.

**Analytics:** add an Earnings tab: earnings by format, by sponsor and by viewer state (signed in, verified), from sample data.

**Monetisation settings** (3,865px): lead with the earnings summary and the Standard or Age-verified switch; collapse category blocks behind a disclosure; show the five formats with the shared same-shape components.

**Review workspace:** no structural change. It is the best screen in the product.

### 5H. Channel pages, screen by screen

| Screen | Changes |
| --- | --- |
| Home, Editorial | Sponsor changes from 5A. CTA block in the right rail under "Most watched". Add previous and next buttons to the shorts row so the overflow is visible. Give each story a different poster where the media library allows (20 assets in `public/media`). |
| Home, Broadcast | Sponsor changes from 5A. Same CTA and shorts-row changes. |
| Video | Sponsor changes from 5A. Remove "Plays in the YouTube player · Captions in English". `PreviewAs` leaves the page (5C). CTA block at the end of the article, column width. |
| Article | Headline, standfirst, byline and hero image all on the 920 width; body and the half-time break on the reading column. CTA block at the end. |
| Exclusive (logged out) | Gate uses the channel's CTA label and line, and goes to the join page. |
| Shorts feed | Use posters for the player and "Up next" instead of flat colour. Sponsored short as a full item (5A). |
| Section | Add at most one sponsored story in the grid. Otherwise unchanged. |
| About and custom pages | Replace the lone Follow button with the CTA block. |
| Live | 5A change. Parked from the demo spine. |
| Search, 404 | Unchanged. |

### 5I. Admin

Navigation shows three items: Overview, Creative review, Evidence, plus Campaigns as the results view. Park Channels, Moderation and Audit log. Update creative review and campaigns for the renamed format (5A). On Campaigns, add one summary line an advertiser cares about: verified-adult impressions, and impressions outside a valid triple-lock session (target 0), which the overview already tracks.

### 5J. One set of rules for consistency

| Rule | Detail |
| --- | --- |
| Three widths on channel pages | Container 1216 (grids, player with chapters). Wide 920 (article headline and hero). Reading column 684 (body, half-time break, key points, transcript, CTA block). Define them once in `components/channel/lib.ts` and use them everywhere. |
| One Pitch button per screen | Pitch marks the one conversion action: Start free trial, Publish, Review your first draft. Everything else is black or outline. Channel pages never use Pitch; they use the channel accent (D6 covers the Exclusive badge). |
| One sponsor label | "Sponsored" on every unit; "Presented by" only for the credit line. "Advertisement" is retired. |
| One sign-in language | "Sign in" for returning viewers, the channel's CTA for new ones. "Follow" is a preset label, not a hidden sign-in link. |
| Channel identity | The logo tile shows the same initials everywhere (fix "FF" in `ChannelHomeMock`). |
| No production notes on public pages | Player source, keyboard hints and demo controls stay out of the channel's page body. |
| Real posters | Every card and every short shows its poster. Flat colour is a loading fallback only. |

### 5K. A guided demo page, and the docs

1. New `/demo` page (unlisted, linked from `/screens` and the README): three tracks, each a numbered list of links with the viewer state set by `?as=`.
   - **For Sportsbet:** `/advertisers`; a Trackside video logged out; join; confirm 18+; the same video with the wagering sponsor; opt out; `/admin/evidence`; `/admin/campaigns`; then the "your own content brands" point with an Enterprise channel.
   - **For publishers:** landing; sign-up in four steps; studio home with earnings; review and publish; the live channel.
   - **The publication:** channel home; video page; shorts feed; article; the typical-page comparison on the landing page.
2. `README.md`: correct the screen count and point to `/demo` first.
3. `docs/brief.md` and `docs/brand/brand-guidelines.md`: update the Native Formats sections (the same-shape rule, sizes from 5A, Stat card replaced by Sponsored story, the home page no longer has a sponsor band), the page-anatomy ad allowances, the "Wagering ad frame" string, the hero line (D2) and the new "Call to action" row under "What clients can change". Update `docs/screens.md` for the new and parked screens.

---

## 6. What to take out, in one list

- The 1216 × 340 half-time break on home pages, and at that width anywhere.
- The old `AdSlot` and every IAB size.
- The Stat card format.
- The chapter-sponsor strip under the player and the second "Presented by" on the home page.
- Sponsor photos that look like editorial.
- The plan step in sign-up, and logo and type pairing from sign-up.
- From the landing page: Own it, Move in easily, the pricing row.
- From studio navigation: eleven sidebar items (folded into Library and Settings).
- From admin navigation: Channels, Moderation, Audit log.
- "Preview as" in the page body, production notes on public pages, the Create card on studio home.

---

## 7. Every screen at a glance

K = keep as is. C = change (section in brackets). P = park from navigation.

| Area | Screen | Action |
| --- | --- | --- |
| Marketing | Landing | C (5D) |
| | For publishers | C (5E) |
| | Pricing | K, off the spine |
| | For advertisers | C (5E) |
| Sign-up | Connect, Channel | K |
| | Name, Look | C, merged (5F) |
| | Plan | P (5F) |
| | You're live | C (5F) |
| | Creator sign-in | K |
| Studio | Home | C (5G) |
| | Ready to review, Review workspace (both) | K, data fix (5G) |
| | Library | C, tab bar (5G) |
| | Shorts, Shorts editor, Articles, Article editor, Pages, Page editor | P as nav items; reached through Library |
| | Upload, Imports (3) | P as nav items; reached through Library and Settings |
| | Analytics | C, Earnings tab (5G) |
| | Settings: Channel | K, tab bar |
| | Settings: Design | C, CTA card, homepage modules (5A, 5B) |
| | Settings: Monetisation | C (5G) |
| | Settings: Connections, Domain, Brand voice, Billing | P under "More" |
| Channel | Home (both templates), Video, Article, Shorts feed, Section, About, Custom page, Exclusive | C (5A, 5B, 5C, 5H) |
| | Join (new) | New (5B) |
| | Live, Search | P from the spine; Live gets the 5A fix |
| Account | Viewer sign-in | C, redirects to Join (5B) |
| | Check email, Account centre | K |
| | Age assurance | C, sets viewer state (5C) |
| Admin | Overview, Creative review, Evidence, Campaigns | C, small (5I) |
| | Channels, Moderation, Audit log | P |
| Other | `/screens` | K, add link to `/demo` |
| | `/demo` (new) | New (5K) |

---

## 8. Build order

Each phase leaves the app in a working state.

| Phase | Work | Size |
| --- | --- | --- |
| 1 | 5A same-shape ads, including type and sample-data changes and every preview that shows a format | Large |
| 2 | 5C viewer provider and demo bar (do this before 5B so the join flow has state to set) | Medium |
| 3 | 5B channel CTA, header, join page, Design settings card | Medium |
| 4 | 5D landing page | Large |
| 5 | 5E advertisers and publishers pages | Medium |
| 6 | 5F sign-up in four steps | Small |
| 7 | 5G studio navigation, home, earnings | Medium |
| 8 | 5H remaining channel polish, 5J rules, 5I admin | Medium |
| 9 | 5K `/demo`, README and docs | Small |

Phases 1 to 4 are what was asked for directly and make the biggest visible difference. If time is short, stop there.

---

## 9. Checks before calling it done

1. **Same-shape check.** With a browser at 1440 and at 390 wide, on `/c/footyfix`, `/c/trackside`, the Footy Fix video page, the article page and the shorts feed:
   - the sponsored short's box equals a neighbouring short card's box (within 1px, width and height);
   - the sponsored story's box equals a neighbouring story card's width, and its image has the same 16:9 box;
   - the half-time break's width equals the width of a paragraph's column on that page (684 at desktop);
   - no sponsor unit is wider than its parent column;
   - the page has at most three sponsor units.
2. `grep -rn -E "Advertisement|300 × 250|970 × 250|AdSlot|StatCard|stat_card" apps/web/src` returns nothing.
3. Logged out, every channel page shows "Sign in" as text and the channel's own CTA label; Footy Fix and Trackside differ.
4. The click-through in 5C's acceptance works from a fresh `localStorage`, and the viewer switch changes sponsors on the home page as well as the video page.
5. Landing page is under 4,600px tall at 1440 wide, the hero visual is not cut by the fold at 1440 × 900, and the primary button is the same colour in the header and the hero.
6. Sign-up shows four steps and ends on "Review your first draft".
7. The studio sidebar has five items and studio home shows an earnings figure labelled as sample data.
8. No page scrolls sideways at 390 wide, and no page logs a console error.
9. `pnpm typecheck && pnpm lint && pnpm build` pass.
