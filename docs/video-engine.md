# Words to video: the engine

Written 14 November 2026. This compares the cheapest reliable ways to turn an article into an explainer video, and prices the rate card in `apps/web/src/lib/credits.ts`. The research ran from search results because the provider sites were blocked in the research session. Treat every price as a starting point, and check it before the pricing goes public.

Words to video comes after the MVP (see the [implementation plan](implementation-plan.md)). This is the decision to build on when it starts.

## Recommendation

| Layer | Choice | Why |
| --- | --- | --- |
| Rendering | **Remotion** on AWS Lambda | Templates are React components. Charts, tables, big type and the brand kit are ordinary code, and one composition outputs 16:9, 9:16 and 4:5. It's the cheapest at volume. |
| Voice | **Azure Neural TTS**, Australian voices | The cheapest option, with about 14 en-AU voices. Run a blind test against ElevenLabs Flash first: it costs about US$0.03 a minute more and may sound better. |
| Imagery | **Pexels and Pixabay** APIs | Free for commercial use with no attribution. Cache the files; Pixabay doesn't allow hotlinking. |
| Script | **Claude** | Writes the script and scene list from the article, in the publication's voice, with the compliance pre-check. |
| Generative video | **Not in the first version** | It costs US$3 or more a minute, which is 10 to 100 times the rest of the stack combined. Add it later as a capped "hero shot" scene. |

**Runner-up: Shotstack.** It needs no infrastructure, so it's the fastest to ship, and at 500 minutes a month it costs about the same as Remotion. But it's a JSON timeline, so good charts are harder, and at scale it costs two to five times as much.

## What it costs

At 500 finished minutes a month:

- **A finished minute of long-form costs about US$0.30 (A$0.43).** Most of that is Remotion's US$100 monthly minimum spread across the minutes. The marginal cost is about A$0.10 a minute.
- **A 45-second short costs about US$0.20 (A$0.29).** The marginal cost is about US$0.06.

At 50,000 minutes a month, the all-in cost is about US$0.06–0.10 a finished minute, or US$3–5k a month. Remotion becomes an enterprise licence of about US$250–500 a month, compute takes over as the biggest cost, and voice is about US$675 a month on Azure.

## How it's priced to customers

Every line is charged at the provider's price plus 20% (`MARGIN` in `lib/credits.ts`), on a ledger the customer can read. The fixed costs (the Remotion minimum, storage, the team) come out of the platform fee, not the per-minute price.

| Work | Provider cost (AUD) | Customer pays |
| --- | --- | --- |
| Script and scenes, per finished minute | $0.03 | $0.036 |
| Voiceover, per minute | $0.02 | $0.024 |
| Rendering, per finished minute | $0.06 | $0.072 |
| Render licence, per video | $0.015 | $0.018 |
| Stock imagery | Free | Free |

So a 45-second short charges about 15 cents and a 6-minute explainer about 85 cents. At cost plus 20%, AI usage is a thin-margin line. It keeps publishers creating on the platform, which protects the platform fee and the ad pool. See the [revenue model](revenue-model.md).

## Licence gotchas

- **Pexels and Pixabay** don't guarantee model or property releases. Don't use identifiable people, brands or logos in a way that implies endorsement.
- **Sport imagery** from Getty and the like is almost always editorial-only. That's fine in an editorial explainer but not in a sponsored or branded video. League footage rights (AFL, racing bodies) need their own check.
- **Generative video** of real events is an editorial-integrity risk. If it's added, label it and keep it to abstract or illustrative shots.
- **Voice cloning** needs the speaker's recorded consent on every provider. Azure custom voice is sales-gated and costs about US$2,900 a month to host.
- **AI disclosure:** every generated video carries a "Voiced with AI" label. A person approves it before it's published.

## Prices and sources (USD)

| Option | Price | Per finished minute | Source |
| --- | --- | --- | --- |
| Remotion licence | $0.01 a render, $100 a month minimum | $0.20 at 500 min, under $0.01 at scale | remotion.dev/docs/license/terms |
| Remotion Lambda compute | about $0.01–0.02 a minute of video | $0.02–0.05 | remotion.dev/docs/lambda/cost-example |
| Shotstack | $39 for 200 credits; $0.30 pay-as-you-go | $0.045–0.30 | shotstack.io/pricing |
| Creatomate | about 37 credits a 1080p minute (unconfirmed) | about $0.25–1.00 | creatomate.com |
| ElevenLabs | Flash $0.05 per 1,000 characters | $0.045 | elevenlabs.io/pricing/api |
| OpenAI gpt-4o-mini-tts | $12 per million audio tokens | about $0.015 | developers.openai.com |
| Google Chirp 3 HD | $30 per million characters | $0.027 | cloud.google.com/text-to-speech/pricing |
| Azure Neural | $15 per million characters | $0.0135 | azure.microsoft.com/pricing/details/speech |
| Amazon Polly | Neural $16, Generative $30 per million characters | $0.024–0.027 | aws.amazon.com/polly/pricing |
| Veo 3.1, Runway, Kling (via Higgsfield or direct) | $0.05–0.40 a second | $3–24 | provider pages |

**Not confirmed:**
- official prices for Creatomate, JSON2Video, Plainly, Kling's own API and Luma Ray3
- Lambda cost for 1080p renders heavy on b-roll (run a test render)
- stock API prices, which are quote-only
- Pexels' current rate limit
