# Integrations research: what the platforms allow

Researched 11 November 2026 for the automated pipeline in the [brief](../brief.md): a creator connects YouTube, and every new video automatically becomes a draft pack (video page, article, shorts, SEO) waiting in Ready to review. Check each point against the official docs again before building, because platform terms change.

## Summary

| Need | Possible? | How | Watch out for |
| --- | --- | --- | --- |
| List a creator's YouTube videos | Yes | YouTube Data API: `channels.list` → uploads playlist → `playlistItems.list` (1 unit per 50 videos) → `videos.list` (1 unit per 50) | Never use `search.list` (100 units a call) |
| Know when a new video is uploaded | Yes, in near real time | PubSubHubbub push: subscribe our webhook to `https://www.youtube.com/feeds/videos.xml?channel_id=…` via Google's hub | Subscriptions expire and must be renewed. Also fires on title and description edits. Keep a daily `playlistItems` poll as a backstop. |
| Get the transcript of a YouTube video | Usually | `captions.list` + `captions.download` with the **owner's** OAuth token (`youtube.force-ssl`). About 250 units a video. | Whether auto-generated (ASR) tracks download reliably for the owner must be proven in week 1 (a spike). Fallback: the creator adds the source file, which we transcribe with Deepgram. |
| Play YouTube videos on the channel | Yes | The YouTube embedded player (IFrame API) on our video page, at least 200×200, one autoplaying player per page, sending a Referer header | We may not change the player's standard controls. Our own pre-roll ads can't run inside a YouTube embed. |
| Re-host YouTube videos on our CDN | **No** | YouTube's developer policies bar downloading, caching or storing YouTube audiovisual content without written approval | This shapes the shorts design (below) |
| Cut vertical shorts from a YouTube-only video | Not from YouTube itself | Needs the source file. The creator uploads it, or connects a cloud folder (Google Drive or Dropbox) where they keep masters. We then cut, reframe and caption with Mux + a render worker. | For YouTube-only videos, the draft pack carries **clip suggestions** (timestamps, titles, captions); one click on "Add source file" renders them |
| Import the creator's YouTube Shorts | Yes, as embeds | Shorts are ordinary videos in the uploads playlist (under 3 minutes, vertical); play them in the vertical YouTube embed | Same no-re-hosting rule |
| TikTok (later) | Yes, as embeds | Display API: `user.info.basic` + `video.list` scopes, `POST /v2/video/list/` and `/v2/video/query/`, rendered with TikTok's embed player | App review needed. Users can grant scopes partially, so check the token's scopes. |
| Instagram Reels (later) | Mostly | Instagram API with Instagram Login (professional accounts only): `/me/media`, filtered to Reels | `media_url` is omitted for media with copyrighted audio, which is common on Reels, so fall back to the permalink embed. Basic Display API is gone. |

## Quota and approvals

- **YouTube quota.** The default is 10,000 units a day per Google Cloud project. A new video costs about 251 units (`videos.list` 1 + `captions.list` 50 + `captions.download` 200), so the default covers about 40 new videos a day. A first import of 222 videos needs about 55,000 units for captions alone. **Action:** apply for a quota increase through the YouTube API compliance audit before the pilot. Until then, queue first imports and spread caption downloads over several days. The import report already shows "queued".
- **Google OAuth verification.** All YouTube scopes are sensitive, so the app needs Google's OAuth verification before public launch (Google quotes 3–5 business days, with brand verification included). Request `youtube.readonly` at sign-up and add `youtube.force-ssl` only for caption access, with a clear justification. While in Testing status, the app can be used by up to 100 named test users. That is enough for the pilot.
- **TikTok and Meta** both need app review before production access. Start the applications in the "Now" phase so they're ready for "Next".

## What this changes in the product

1. **YouTube videos are embedded, not re-hosted.** The video page uses the YouTube player for YouTube-sourced videos and Mux for uploads. Our non-wagering pre-roll (ADS-01) only runs on uploaded videos. On YouTube embeds, YouTube's own ads apply.
2. **Shorts from long videos need the source file.** Draft packs for YouTube-only videos include clip suggestions. "Add source file" (upload, or a connected Drive or Dropbox folder) turns them into rendered vertical shorts. Creators who upload to Homestand first get rendered shorts automatically.
3. **Transcripts come from YouTube captions first** (free, owner-authorised), with Deepgram as the fallback when a source file exists. If neither is available, the pack waits with a clear "Add captions or a source file" prompt.
4. **Quota is a launch dependency.** Add the YouTube compliance audit to the pre-pilot checklist.

## Sources

- YouTube Data API: [Captions: download](https://developers.google.com/youtube/v3/docs/captions/download), [Subscribe to push notifications](https://developers.google.com/youtube/v3/guides/push_notifications), [Quota costs](https://developers.google.com/youtube/v3/determine_quota_cost), [Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality), [Developer Policies guide](https://developers.google.com/youtube/terms/developer-policies-guide)
- Google OAuth: [Sensitive scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification)
- TikTok: [Display API overview](https://developers.tiktok.com/doc/display-api-overview/), [Video list v2](https://developers.tiktok.com/docs/en/tiktok-api-v2-video-list)
- Instagram: [IG Media reference](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media)
- Community note on owner-only caption download: [Stack Overflow thread (2017)](https://kaweah.freedombox.rocks/kiwix/content/stackoverflow.com_en_all_2023-11/questions/44871603/permission-denied-when-using-captions-download-to-get-auto-generated-captions-)
