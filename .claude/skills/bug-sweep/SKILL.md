---
name: bug-sweep
description: Hunt for bugs and regressions in Homestand - run every check against main, review what merged recently, test the hard rules, and fix (and merge) or file each real bug. Use when asked to "check for bugs", "run the sweep", or when the nightly scheduled run fires.
---

# Bug sweep

The sweep finds problems; it doesn't build features. Read `CLAUDE.md` first.

## 1. Run everything on `main`

```bash
pnpm install && pnpm typecheck && pnpm lint && pnpm build
pnpm --filter web start -p 3111 &
BASE_URL=http://localhost:3111 pnpm check:demo
```

Run the unit tests too, once they exist.

## 2. Test the hard rules directly

Load these pages logged out, signed in, confirmed 18+ and opted out (once real sessions exist, use test accounts instead of `?as=`):
- a video page and an article on each publication
- a live page
- a members-only video

Check three things on each:
1. No wagering or alcohol creative appears in the HTML or the network payload for anyone who isn't confirmed 18+ and opted in. Search the raw response, not just the screen.
2. Gated content isn't in the page source for logged-out viewers.
3. AdSense appears only in story and half-time slots.

## 3. Review what changed

Run `/code-review high` on the commits merged since the last sweep (the queue's log says when that was). Look hardest at:
- `packages/ads`
- auth and sessions
- RLS policies and migrations
- the ledger
- anything touching email sending

## 4. Look at it

Screenshot each publication's home page and a video page at 390 and 1440 wide, plus the studio home. Look for:
- content from one publication showing on another
- layout breaks
- sponsor units that don't match the units beside them

## 5. Report

For each real bug:
- **If the fix is small and clearly right**, fix it on the session's branch (or `fix/short-name`), with a test that fails before the fix. Run every check, open a pull request into `main`, and squash-merge it once local checks and CI pass (the standing permission in CLAUDE.md).
- **Otherwise** open a GitHub issue with the steps to reproduce, what happens and what should happen.

Add one line to the log in `docs/work-queue.md` with the date, what ran and what was found, even when nothing was. Put it in a fix's pull request, or in its own small pull request. Never push straight to `main`, and never merge with a failing check.
