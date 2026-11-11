import type { Plan } from "@/lib/types"

export interface PlanInfo {
  id: Plan
  name: string
  /** Monthly price in AUD inc. GST. null = on request. */
  price: number | null
  for: string
  includes: string[]
  cta: string
  href: string
  featured?: boolean
}

/** Creator tiers from the PID, section 11. Prices AUD inc. GST. */
export const PLANS: PlanInfo[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    for: "Solo creators getting started",
    includes: [
      "1 channel on your own subdomain",
      "10 video hours processed a month",
      "Article drafts and shorts from every video",
      "Editorial, Broadcast and Minimal templates",
    ],
    cta: "Start free trial",
    href: "/signup",
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    for: "Established creators",
    includes: [
      "Everything in Starter",
      "Your own domain, e.g. footyfix.com.au",
      "40 video hours processed a month",
      "Age-verified advertising",
      "Ad revenue share",
      "Priority processing",
    ],
    cta: "Start free trial",
    href: "/signup",
    featured: true,
  },
  {
    id: "publisher",
    name: "Publisher",
    price: 299,
    for: "Small media brands and clubs",
    includes: [
      "Everything in Pro",
      "3 channels",
      "Team roles for editors and producers",
      "150 video hours processed a month",
      "Migration assistance",
    ],
    cta: "Start free trial",
    href: "/signup",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    for: "Large publishers, networks and internal brands",
    includes: [
      "Unlimited channels",
      "White-glove migration",
      "Service level agreement",
      "Dedicated support",
    ],
    cta: "Talk to us",
    href: "/publishers#white-glove",
  },
]

export function planPrice(p: PlanInfo) {
  return p.price == null ? "On request" : `$${p.price}`
}

/** Comparison table rows. true/false render as ticks, strings as text. */
export const COMPARISON: { group: string; rows: { label: string; values: [string | boolean, string | boolean, string | boolean, string | boolean] }[] }[] = [
  {
    group: "Channel",
    rows: [
      { label: "Channels", values: ["1", "1", "3", "Unlimited"] },
      { label: "Subdomain on homestand.com.au", values: [true, true, true, true] },
      { label: "Your own domain", values: [false, true, true, true] },
      { label: "Templates, accents and type pairings", values: [true, true, true, true] },
      { label: "Team roles", values: [false, false, true, true] },
    ],
  },
  {
    group: "Video and drafts",
    rows: [
      { label: "Video hours processed a month", values: ["10", "40", "150", "Custom"] },
      { label: "YouTube auto-import", values: [true, true, true, true] },
      { label: "Article, shorts and SEO drafts", values: [true, true, true, true] },
      { label: "Priority processing", values: [false, true, true, true] },
    ],
  },
  {
    group: "Earn",
    rows: [
      { label: "Homestand Native Formats", values: [true, true, true, true] },
      { label: "Age-verified advertising", values: [false, true, true, true] },
      { label: "Ad revenue share", values: [false, true, true, true] },
    ],
  },
  {
    group: "Move in and support",
    rows: [
      { label: "Self-serve import with 301 redirects", values: [true, true, true, true] },
      { label: "Migration assistance", values: [false, false, true, true] },
      { label: "White-glove migration", values: [false, false, false, true] },
      { label: "Service level agreement", values: [false, false, false, true] },
      { label: "Support", values: ["Email", "Email, priority", "Email and chat", "Dedicated manager"] },
    ],
  },
]

/** Trial end shown on sign-up. Fixed so pages prerender (no Date.now). */
export const TRIAL_ENDS = "25 November 2026"
