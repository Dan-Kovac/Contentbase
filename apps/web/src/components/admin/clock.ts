// Client-only: called from event handlers, never during render.
export function nowStamp() {
  const d = new Date()
  const date = d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
  const time = d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?([ap])\.?m\.?/i, " $1m").toLowerCase()
  return `${date}, ${time}`
}

export function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
