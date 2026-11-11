Homestand is the software that gives Australian sport and racing creators a channel they own. Upload once and get a video page, an article, shorts and a page that ranks, live in minutes. The brand looks like a modern software company: black, white and grey, one radiant gradient called Pitch, and one confident typeface. It never looks like a trade publication.

The brand works at two levels, and every rule below says which one it governs:

- **Platform** is Homestand itself: the marketing site, sign-in, the creator studio, the admin console and emails. It is always black, white, grey and Pitch, set in Schibsted Grotesk.
- **Channel** is a client's publication on Homestand. Clients adjust a few brand basics and formatting options, listed below. The platform fixes everything else, so every channel looks premium and every ad slot looks designed.

## What clients can change

| Area | The client chooses | Fixed by the platform |
| --- | --- | --- |
| Logo | Upload a logo (SVG or PNG) and a square icon. With no logo, the channel name is set in the pairing's display face. | Logo height in the header (28px desktop, 24px mobile) and clear space |
| Accent colour | One of `channel-pitch`, `channel-turf`, `channel-harbour`, `channel-maroon`, `channel-navy`, `channel-gold`, `channel-violet` or `channel-mono`. A custom hex is allowed only if it passes the automatic contrast check before saving. | Where the accent appears: logo tile, active nav underline, Follow button, kicker squares, video placeholder, links. Grounds, text and greys never change. |
| Type pairing | Grandstand, Broadcast or Minimal (see Typography) | The type scale, line lengths and weights inside each pairing |
| Template | Editorial, Broadcast or Minimal | Page anatomy and every ad position |
| Homepage | Reorder and toggle the modules: lead story, shorts row, article grid, section rows, sponsor band | No free-form blocks and no new ad slots |
| Navigation | Up to 8 items, named by the client | Header layout and mobile menu |
| Article formatting | Headings, paragraphs, lists, pull quotes, images, video, shorts embeds, dividers and embeds in the block editor; mark any item Exclusive | Fonts, sizes and spacing come from the pairing; no colour or font controls inside articles |
| Ads | Block categories (e.g. wagering, alcohol) and turn AdSense on or off | Slot sizes, ad frames, labels, density caps and the betting opt-out link |

The `ChannelPreview` component shows three channels built from these choices.

## Voice and copy

- Write in Australian English: colour, organise, licence (noun), program. Dates read 11 November 2026, times 12:30 pm, and money AUD with GST shown ("$99 a month inc. GST").
- Be plain and direct, like a good sports editor. Use short sentences, the active voice and no hype.
- Address the reader as "you". The platform speaks as "we" only in legal and billing copy.
- Use sentence case for headlines, buttons and menus. Use uppercase only for `kicker` labels and badges.
- Buttons name what happens: "Publish", "Schedule", "Generate article", "Start import", "Sign in to watch". A confirmation toast echoes the verb: "Published".
- Errors say what went wrong and how to fix it: "That domain doesn't resolve. Check the spelling, e.g. footyfix.com.au."
- No emoji in product UI. No exclamation marks.
- Betting copy is neutral and never encourages a bet. The opt-out is always worded "Don't show me betting ads".
- AI drafts are always called drafts. The product never says "AI-written" on a published page and never auto-publishes.

Real strings to copy:

| Where | Copy |
| --- | --- |
| Exclusive gate | Sign in to watch · Free. One account for every Homestand channel. |
| Wagering ad frame | Advertisement · Don't show me betting ads |
| Sponsor band | Presented by |
| Import report | 214 imported · 6 skipped · 2 failed. Retry failed items |
| Draft ready | Your article draft is ready to review. Nothing goes live until you publish. |
| Age assurance | Confirm you're 18 or over. We keep the result, never your ID. |

## Logo

- The logo is the word **homestand.** in lowercase Schibsted Grotesk ExtraBold, drawn as outlines, with a square full stop filled with the Pitch gradient. Use the files in Logos or the `Wordmark` component. Never retype it.
- `homestand-wordmark.svg` is for light grounds, `homestand-wordmark-reversed.svg` for black, and `homestand-wordmark-mono.svg` for single-colour use and for any Pitch ground.
- `homestand-monogram.svg` (a black "h." on a Pitch tile) is the favicon, app icon and social avatar.
- The brand looks its best on black. Marketing heroes, sign-in and social tiles use the reversed wordmark on `brand-black` with `brand-white` headlines and `brand-muted` copy, whatever the viewer's theme.

## Colour

Homestand is black, white and grey with one radiant pop. The neutrals do the work, so the pop stays loud.

- **Black and white.** Set page grounds in `background`, text in `foreground`, and raised panels in `card` with a `border` hairline. Cards take no shadow; only `popover` surfaces get `shadow-popover`.
- **Grey.** Use `secondary`, `muted` and `accent` for quiet fills and hovers, `muted-foreground` for metadata, and `input` for control borders. Every text token passes AA on the grounds its note names, in both themes.
- **Actions are black.** `primary` is black in light and white in dark: primary buttons, active navigation and selected states. The focus `ring` follows `foreground`.
- **Pitch is the pop.** The `pitch` gradient runs lime (`pop-start`) to mint (`pop`) to electric blue (`pop-end`). Use it on the logo's full stop, the monogram, the `pop` button, the Exclusive badge, progress fills and marketing hero panels, and no more than twice a screen.
- **Text on Pitch is always `pop-foreground` (black)**, at 8.8:1 or better on every stop. Never put white text on Pitch, and never set Pitch colours as text.
- **On white, small marks use `pop-ink`.** Pitch is too pale on white for a chart line or a 7px square (1.2–2.3:1). Use `pop-ink` (deep mint, 3.1:1) for kicker squares, chart series 1, the LIVE dot on light badges and selected ticks. In dark, `pop-ink` is the mint itself.
- `pitch-glow` is an ambient radial wash for the top of dark heroes and sign-in. `pitch-soft` is a tint for feature panels and empty states. `shadow-glow` sits only under the pop button.
- `destructive` is the only other hue. Always pair it with a word (Failed, Take down).
- Charts use `chart-1` (pop-ink) for the headline metric, then black and greys from `chart-2` to `chart-5`.

**Channel accents.** See "What clients can change" above. Each `channel-*` value is pre-checked for the text colour its note names, and it is set as `--chan` on the channel root (CHN-03).

## Typography

| Role | Family | Tokens | Where |
| --- | --- | --- | --- |
| Display and interface | Schibsted Grotesk 400–800 | `display-1`, `display-2`, `headline`, `title`, `body`, `body-strong`, `small`, `kicker` | The logo's face, so the brand is one voice. Headlines are 800 weight with tight negative tracking; UI is 400–600. |
| Reading | Source Serif 4 | `standfirst`, `article`, `pullquote` | Article standfirsts and bodies only. Long reads earn a serif. |
| Data | IBM Plex Mono 500 | `timecode` | Durations, chapter and transcript timestamps, evidence IDs. |

- Set article bodies in `article` at the `measure` width (68ch). Never run body text full width.
- Headlines use sentence case with `text-wrap: balance`. Drop `display-1` to 44px below 600px wide.
- On marketing pages a headline may carry one phrase filled with `pitch` (background-clip text) on a black ground only, e.g. "Your channel. **Your audience.**"

**Channel type pairings** (CHN-03; the creator picks one):

1. **Grandstand** (default, Editorial template): Barlow Condensed headlines with Source Serif 4 body.
2. **Broadcast**: Archivo 800 headlines with Archivo 400 body. Heavy and wide, for TV-style channels.
3. **Minimal**: Schibsted Grotesk 800 headlines with Source Serif 4 body. The platform's own voice.

## Layout and spacing

- The spacing scale is `space-1` (4px) to `space-24` (96px) on a 4px base. Gutters are `space-4` on mobile, `space-6` on tablet and `space-8` on desktop.
- Content tops out at `container-max` (1280px). Every page works from 360px to 1440px and beyond (CHN-04).
- Use `radius` (4px) for controls, `radius-lg` (6px) for cards and video, `radius-sm` (2px) for badges and ad frames, and `radius-pill` only for avatars, toggles and the Follow button. Corners stay tight; a magazine is not bubbly.
- Studio and admin use a `sidebar-width` (248px) sidebar plus a `header-height` (64px) top bar. Channels use a top bar only.

**Page anatomy** (from the PID, Section 8):

- Channel home: lead story (video hero and headline), then a shorts row, an article grid, section rows and the footer. Ads allowed: one sponsor band and one sponsored card in the shorts row.
- Video page: player with chapters, then headline and standfirst, article body, collapsed transcript and related items. Ads allowed: non-wagering pre-roll, one in-article unit and one end-of-page unit.
- Article page: headline, standfirst and byline, hero media, then the long-form body at `measure` with pull quotes, then related items. Ads allowed: one in-article unit after a natural break and one at the end.
- Short page: full-height vertical player, caption below, swipe for the next. Ads allowed: a sponsored card every 8 shorts at most.
- Exclusive, logged out: the `ExclusiveGate` only, with no ads.

## Advertising standards

Ads are designed into the page and are never added on top of it.

- Every unit is an `AdSlot`: an `ad-frame` ground, a `border` hairline, `radius-sm` corners and a visible `ad-label` ("Advertisement", "Sponsored" or "Presented by").
- Slots reserve their size from the `ad-size` tokens before anything loads: `ad-mrec-width` × `ad-mrec-height`, `ad-billboard-width` × `ad-billboard-height`, and `ad-band-mobile-height`. An unfilled slot shows a house promo at the same size.
- Wagering units always show "Don't show me betting ads" inside the frame.
- These are banned everywhere: pop-ups, interstitials, sticky overlays, autoplay with sound, AdSense Auto ads, and any ad between a headline and its first paragraph.
- Density is capped at 1 ad per 600 words and 3 per page (ADS-02).

## Imagery and video

- Video is the hero. Thumbnails are 16:9 at `radius-lg`, and shorts are 9:16.
- Missing posters fall back to a near-black placeholder (or the channel accent) with stepped tiers and a play glyph, never a broken image.
- The duration chip is `timecode` on a dark scrim, bottom right. Badges sit top left, two at most.
- Every video has captions (WCAG 2.2 AA). Shorts have burned-in captions.
- Imagery is real match, track and studio photography. No stock "people pointing at laptops", and no AI-generated people.

## Iconography

- Use [Lucide](https://lucide.dev), shadcn/ui's default icon set: a 24px grid, 2px stroke, round caps, drawn in `currentColor`.
- Show icons at 16px inline with text and 20px in navigation, with a `space-2` gap to labels.
- Icon-only buttons need an `aria-label`. Status is never an icon alone.
- No emoji in the UI.

## Motion

- Keep motion short and functional: 120ms for colour and hover, 200ms ease-out for menus and sheets. Nothing bounces.
- Video previews may autoplay muted on hover on desktop only. Ads never animate in.
- Respect `prefers-reduced-motion`: drop transitions to 0 and stop hover autoplay.

## States and accessibility

- Every page meets WCAG 2.2 AA. Every text token above names the grounds it passes on, in both themes.
- Focus is a 2px solid `ring` with a 2px offset in the page colour, and it is always visible on keyboard focus.
- Hover tints with `accent`. Disabled controls drop to 50% opacity and keep their label.
- Form borders use `input` (3:1). Errors use `destructive` text plus a message linked by `aria-describedby`.
- Light is the default theme for channels. The studio and admin follow the system setting. Channel dark mode is Next (CHN-08), but the tokens already carry it.

## Using this with shadcn/ui

- Initialise shadcn/ui with the "neutral" base, then replace the `:root` and `.dark` blocks in `globals.css` with this system's `tokens.css` values. Every colour name matches (`--background`, `--primary`, `--sidebar-*`, `--chart-*`), so components need no edits.
- Add the brand-only variables (`--pop-start`, `--pop`, `--pop-end`, `--pop-ink`, `--pop-foreground`, `--ad-frame`, `--ad-label`, `--channel-*`) as Tailwind colours, and `--pitch` as a background image utility (`bg-pitch`).
- Set `--radius: 4px`. shadcn derives its `sm`, `md` and `lg` radii from it.
- On channel pages, set `--chan` on the channel root from the chosen `channel-*` token, and the font variables from the chosen pairing. `primary` stays black.
- Build the components here (`AdSlot`, `VideoCard`, `ShortCard`, `ExclusiveGate`, `LockStatus`) as app components on top of shadcn primitives. The previews show the agreed look and behaviour.
