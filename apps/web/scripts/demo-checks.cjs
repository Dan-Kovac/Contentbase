/*
 * Demo checks: the design rules the real build must keep, run against a running app.
 *
 *   pnpm --filter web build && pnpm --filter web start   (or pnpm dev)
 *   BASE_URL=http://localhost:3000 pnpm --filter web check:demo
 *
 * 1. Sweep: every screen linked from /screens, at 390 and 1440 wide: no HTTP errors, no
 *    sideways scroll, no console errors.
 * 2. Same shape: on channel pages, for every viewer state, each sponsor unit matches its
 *    neighbour (shorts, story cards, the article column) and a page carries 3 units at most.
 * 3. Flows: join, confirm 18+ and opt out on a video page; the consent gate on email import;
 *    generating a video from an article.
 *
 * Uses the `playwright` package (preinstalled in the cloud environment). In CI, move these into
 * @playwright/test specs (build plan, milestone 1).
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script; the global playwright resolves through require
const { chromium } = require("playwright")

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "")
const VIEWERS = ["logged_out", "signed_in", "verified", "opted_out"]
const SHAPE_PAGES = ["/c/footyfix", "/c/trackside", "/c/footyfix/v/blues-centre-bounce-problem", "/c/footyfix/a/ladder-predictor-after-round-7", "/c/trackside/v/cox-plate-draw", "/c/footyfix/live"]

const problems = []
const fail = (where, what) => problems.push(`${where}: ${what}`)

async function sweep(browser) {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(`${BASE}/screens`, { waitUntil: "networkidle" })
  const routes = [...new Set(await page.$$eval("main a[href^='/']", (as) => as.map((a) => a.getAttribute("href"))))]
  await ctx.close()
  routes.push("/demo")
  for (const width of [390, 1440]) {
    for (const route of routes) {
      const c = await browser.newContext({ viewport: { width, height: 900 } })
      const p = await c.newPage()
      const errors = []
      p.on("pageerror", (e) => errors.push(String(e).slice(0, 160)))
      p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)))
      const res = await p.goto(BASE + route, { waitUntil: "networkidle" })
      await p.waitForTimeout(200)
      const sw = await p.evaluate(() => document.documentElement.scrollWidth)
      if (res.status() >= 400) fail(`${width} ${route}`, `HTTP ${res.status()}`)
      if (sw > width) fail(`${width} ${route}`, `scrolls sideways (${sw}px)`)
      if (errors.length) fail(`${width} ${route}`, `console: ${errors[0]}`)
      await c.close()
    }
  }
  return routes.length * 2
}

async function sameShape(browser) {
  let n = 0
  for (const width of [390, 1440]) {
    for (const viewer of VIEWERS) {
      const c = await browser.newContext({ viewport: { width, height: 900 } })
      const p = await c.newPage()
      for (const route of SHAPE_PAGES) {
        await p.goto(`${BASE}${route}?as=${viewer}&demo=0`, { waitUntil: "networkidle" })
        await p.waitForTimeout(250)
        const issues = await p.evaluate(() => {
          const R = (e) => e.getBoundingClientRect()
          const out = []
          const units = [...document.querySelectorAll("[data-sponsor-unit]")].filter((u) => R(u).width > 0)
          if (units.length > 3) out.push(`${units.length} sponsor units (max 3)`)
          for (const u of units) {
            const kind = u.dataset.sponsorUnit
            const r = R(u)
            if (r.width > R(u.parentElement).width + 1) out.push(`${kind} wider than its column`)
            if (kind === "halftime") {
              const para = [...u.parentElement.children].find((c) => c.tagName === "P")
              if (para && Math.abs(R(para).width - r.width) > 1) out.push(`half-time ${Math.round(r.width)}px vs paragraph ${Math.round(R(para).width)}px`)
            }
            if (kind === "short" && u.closest("ul")) {
              const sib = [...u.closest("ul").querySelectorAll(":scope > li > a")].find((a) => !a.dataset.sponsorUnit)
              if (sib && (Math.abs(R(sib).width - r.width) > 1 || Math.abs(R(sib).height - r.height) > 1)) out.push(`sponsored short ${Math.round(r.width)}x${Math.round(r.height)} vs short ${Math.round(R(sib).width)}x${Math.round(R(sib).height)}`)
            }
            if (kind === "story") {
              const sib = [...u.parentElement.parentElement.querySelectorAll("article")].find((a) => a !== u && !a.dataset.sponsorUnit)
              if (sib && Math.abs(R(sib).width - r.width) > 1) out.push(`sponsored story ${Math.round(r.width)}px vs story ${Math.round(R(sib).width)}px`)
            }
          }
          return out
        })
        issues.forEach((i) => fail(`${width} ${viewer} ${route}`, i))
        n++
      }
      await c.close()
    }
  }
  return n
}

async function flows(browser) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await c.newPage()
  const video = "/c/footyfix/v/blues-centre-bounce-problem"
  const sponsors = () => p.$$eval("[data-sponsor-unit]", (us) => us.map((u) => u.getAttribute("aria-label") || u.textContent || ""))

  // Join, confirm 18+, opt out
  await p.goto(`${BASE}${video}?as=logged_out&demo=0`, { waitUntil: "networkidle" })
  if ((await sponsors()).some((s) => /Harbour Bet/.test(s))) fail("flow", "wagering sponsor shown to a logged-out viewer")
  await p.locator("header a", { hasText: "Join free" }).click()
  await p.waitForURL(/\/join/)
  await p.fill("#join-email", "mia@example.com")
  await p.click('button:has-text("Email me a sign-in link")')
  await p.waitForURL((u) => u.pathname === video)
  await p.goto(`${BASE}/account/verify-age?next=${encodeURIComponent(video)}`, { waitUntil: "networkidle" })
  await p.click("button[type=submit]")
  await p.waitForSelector("text=You're confirmed", { timeout: 10000 })
  await p.click('a:has-text("Continue")')
  await p.waitForURL((u) => u.pathname === video)
  await p.waitForTimeout(500)
  if (!(await sponsors()).some((s) => /Harbour Bet/.test(s))) fail("flow", "wagering sponsor missing for a confirmed adult")
  await p.locator('button:has-text("Don\'t show me betting ads")').first().click()
  await p.waitForTimeout(400)
  if ((await sponsors()).some((s) => /Harbour Bet/.test(s))) fail("flow", "wagering sponsor still shown after opting out")

  // Email import needs consent
  await p.goto(`${BASE}/studio/email/subscribers`, { waitUntil: "networkidle" })
  await p.getByRole("button", { name: /Choose a CSV/ }).click()
  if (!(await p.getByRole("button", { name: "Import subscribers" }).isDisabled())) fail("flow", "email import allowed without consent")

  // Words to video
  await p.goto(`${BASE}/studio/video/new?article=a_ladder`, { waitUntil: "networkidle" })
  await p.getByRole("button", { name: /Generate video/ }).click()
  await p.waitForSelector("text=Your draft video is ready to review", { timeout: 8000 }).catch(() => fail("flow", "video render never finished"))

  await c.close()
  return 3
}

;(async () => {
  const browser = await chromium.launch()
  try {
    const a = await sweep(browser)
    const b = await sameShape(browser)
    const f = await flows(browser)
    console.log(`Checked ${a} screens, ${b} sponsor layouts and ${f} flows.`)
  } finally {
    await browser.close()
  }
  if (problems.length) {
    console.log(`\n${problems.length} problems:\n- ${problems.join("\n- ")}`)
    process.exit(1)
  }
  console.log("All demo checks pass.")
})()
