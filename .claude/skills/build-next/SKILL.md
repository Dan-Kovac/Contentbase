---
name: build-next
description: Build the next Homestand work package end to end - pick it from docs/work-queue.md, implement it on its own branch, test, self-review, fix, open a pull request into main and merge it once everything passes. Use when asked to "build the next package", "continue the build", or when a scheduled run fires.
---

# Build the next work package

One run builds one work package, start to merge. Read `CLAUDE.md` first: its hard rules beat anything below. Dan has given standing permission to merge into `main` once every check passes (see CLAUDE.md).

## 1. Pick

1. Run `pnpm install`, fetch `main` and read `docs/work-queue.md` there.
2. Check open pull requests with the GitHub tools first. If a package's pull request is still open, finishing it is this run's work: fix CI or review comments on its branch, then go to step 4.
3. Otherwise, take the first `todo` package (MVP table first) whose dependencies are all `done` and whose "Needs" column is empty or already met. Check the environment for the keys it names, by name only, never printing values.
4. If nothing is ready, append a line to the queue's log saying what's blocked and why, and stop. Don't start a later package early, and don't start anything after the MVP while MVP packages remain.

## 2. Plan

1. Read the package in `docs/implementation-plan.md` (section 6), plus every document and screen it names.
2. Open the screens in the running app (`pnpm dev`, then the routes listed). The screens are the spec.
3. Write a short plan into the pull request description draft:
   - what's faked now
   - what becomes real
   - which `lib/data` functions change
   - new tables and migrations
   - tests
   - the "Done when" line, copied word for word

## 3. Build

- Branch from `main`: use the branch this session was given, or `wp/WP-xx-short-name` if there isn't one. Set the package to `doing` in the queue, with the branch, in your first commit.
- Keep the screens' shape. Replace the data behind them through `lib/data` and the provider interfaces. A real provider goes behind its interface, with a fake that the tests and the demo use.
- Add unit tests for logic that moves money or enforces a rule: ad decisions, the ledger, entitlements, sanitising, consent.
- Commit in small steps, with messages that name the package and requirement IDs.

## 4. Check, review, repeat

Loop until everything passes, up to five rounds:

```bash
pnpm typecheck && pnpm lint && pnpm build
pnpm --filter web start -p 3111 &   # then:
BASE_URL=http://localhost:3111 pnpm check:demo
```

Then run `/code-review high --fix` on the branch, and run the checks again. Then walk the package's "Done when" line in the running app, and take screenshots of the screens it touched.

If it still fails after five rounds, push the branch, open the pull request as a draft and say exactly what fails. Set the package to `blocked`, with the reason, and stop.

## 5. Merge

1. In the branch, set the package to `done` with the branch name, and add a log line: date, package, outcome.
2. Push and open the pull request into `main`. The title is "WP-xx: name". The body has the plan, what changed, the checks with their results, the screenshots and anything a person must do (keys, decisions).
3. Wait for CI on the pull request.
   - If it's green, or has reported nothing after 20 minutes, squash-merge with the GitHub tools.
   - If it fails, fix on the branch and push; up to three rounds.
   - If it still fails, leave the pull request open, set the package to `blocked` with the failure in "Needs", and stop.
4. After merging, fetch `main` and run `pnpm build` once more. If `main` is broken, fix it at once in a new pull request, before anything else.
5. Stop: one package per run. Never skip or weaken a check, push straight to `main`, or force-push it.

## Stop and ask instead of guessing

Mark the package `blocked`, with what's needed, when:
- it needs a decision from implementation plan section 8
- it needs a credential or account
- a hard rule and the package seem to conflict
- the screens and the documents disagree
