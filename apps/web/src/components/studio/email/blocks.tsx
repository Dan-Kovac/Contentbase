// Email blocks: the few components an MVP newsletter needs, rendered in the publication's brand.
// The same blocks render the preview (React) and the HTML that gets sent (table-based, inline
// styles, 600px wide), so what you see is what arrives.
import { readableOn } from "@/lib/format"

export type EmailBlock =
  | { id: string; type: "heading"; text: string }
  | { id: string; type: "text"; text: string }
  | { id: string; type: "image"; src: string; alt: string }
  | { id: string; type: "button"; label: string; href: string }
  | { id: string; type: "story"; kicker: string; headline: string; standfirst: string; image?: string; href: string }
  | { id: string; type: "divider" }

export const BLOCK_LABELS: Record<EmailBlock["type"], string> = {
  heading: "Heading",
  text: "Text",
  image: "Image",
  button: "Button",
  story: "Story card",
  divider: "Divider",
}

export interface EmailBrand {
  name: string
  accentHex: string
  domain: string
  postalAddress: string
  streamName: string
}

let n = 0
export const blockId = () => `b${Date.now().toString(36)}${(n++).toString(36)}`

export function newBlock(type: EmailBlock["type"], brand: EmailBrand): EmailBlock {
  const id = blockId()
  switch (type) {
    case "heading":
      return { id, type, text: "A heading" }
    case "text":
      return { id, type, text: "Write something worth opening." }
    case "image":
      return { id, type, src: "/media/mcg-night.jpg", alt: "Describe the image for people who can't see it" }
    case "button":
      return { id, type, label: "Read more", href: `https://${brand.domain}` }
    case "story":
      return { id, type, kicker: "Latest", headline: "Story headline", standfirst: "One line on why it matters.", href: `https://${brand.domain}` }
    case "divider":
      return { id, type }
  }
}

/* ---------------------------------------------------------------------------------------------
 * Preview (React). Email-safe look: one 600px column, system fonts, no web fonts.
 * ------------------------------------------------------------------------------------------- */

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

export function EmailPreview({ blocks, brand, subject, previewText }: { blocks: EmailBlock[]; brand: EmailBrand; subject: string; previewText: string }) {
  const on = readableOn(brand.accentHex)
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-[#f4f4f4] [color-scheme:light]">
      <div className="flex flex-col gap-0.5 border-b bg-white px-4 py-3 text-[13px] text-neutral-900">
        <span>
          <span className="font-semibold">{brand.name}</span> <span className="text-neutral-500">&lt;hello@{brand.domain.replace(/^send\./, "")}&gt;</span>
        </span>
        <span className="font-semibold">{subject || "No subject yet"}</span>
        <span className="truncate text-neutral-500">{previewText}</span>
      </div>
      <div className="px-3 py-5 sm:px-5">
        <div className="mx-auto w-full max-w-[600px] bg-white text-[#141414]" style={{ fontFamily: FONT }}>
          <div className="flex items-center gap-2.5 px-6 pb-4 pt-6" style={{ borderTop: `4px solid ${brand.accentHex}` }}>
            <span className="grid size-7 place-items-center rounded-[5px] text-[14px] font-black" style={{ background: brand.accentHex, color: on }}>
              {brand.name[0]}
            </span>
            <span className="text-[17px] font-extrabold tracking-[-0.02em]">{brand.name}</span>
            <span className="ml-auto text-[12px] text-neutral-500">{brand.streamName}</span>
          </div>
          <div className="flex flex-col gap-4 px-6 pb-6">
            {blocks.map((b) => (
              <PreviewBlock key={b.id} block={b} brand={brand} />
            ))}
          </div>
          <div className="border-t px-6 py-5 text-[12px] leading-[18px] text-neutral-500">
            You&apos;re getting {brand.streamName} because you subscribed on {brand.name}. <span className="underline">Unsubscribe</span> ·{" "}
            <span className="underline">Choose your newsletters</span>
            <br />
            {brand.postalAddress}
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewBlock({ block: b, brand }: { block: EmailBlock; brand: EmailBrand }) {
  const on = readableOn(brand.accentHex)
  switch (b.type) {
    case "heading":
      return <h2 className="text-[24px] font-extrabold leading-[28px] tracking-[-0.02em]">{b.text}</h2>
    case "text":
      return <p className="whitespace-pre-line text-[16px] leading-[25px] text-neutral-800">{b.text}</p>
    case "image":
      // eslint-disable-next-line @next/next/no-img-element -- email preview
      return <img src={b.src} alt={b.alt} className="w-full rounded-[4px]" />
    case "button":
      return (
        <span className="inline-block w-fit rounded-[4px] px-5 py-3 text-[15px] font-bold" style={{ background: brand.accentHex, color: on }}>
          {b.label}
        </span>
      )
    case "story":
      return (
        <div className="flex gap-4 border-t pt-4">
          {b.image && (
            // eslint-disable-next-line @next/next/no-img-element -- email preview
            <img src={b.image} alt="" className="aspect-[4/3] w-[140px] shrink-0 rounded-[4px] object-cover" />
          )}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[1px]" style={{ color: brand.accentHex }}>
              {b.kicker}
            </span>
            <span className="text-[17px] font-bold leading-[22px]">{b.headline}</span>
            <span className="text-[14px] leading-[20px] text-neutral-600">{b.standfirst}</span>
          </div>
        </div>
      )
    case "divider":
      return <hr className="border-neutral-200" />
  }
}

/* ---------------------------------------------------------------------------------------------
 * HTML that gets sent: tables and inline styles, because that's what inboxes render reliably.
 * ------------------------------------------------------------------------------------------- */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

function rowHtml(b: EmailBlock, brand: EmailBrand) {
  const on = readableOn(brand.accentHex)
  switch (b.type) {
    case "heading":
      return `<h2 style="margin:0;font-size:24px;line-height:28px;font-weight:800;">${esc(b.text)}</h2>`
    case "text":
      return `<p style="margin:0;font-size:16px;line-height:25px;color:#262626;">${esc(b.text).replace(/\n/g, "<br>")}</p>`
    case "image":
      return `<img src="${esc(b.src)}" alt="${esc(b.alt)}" width="552" style="display:block;width:100%;height:auto;border-radius:4px;">`
    case "button":
      return `<a href="${esc(b.href)}" style="display:inline-block;padding:12px 20px;border-radius:4px;background:${brand.accentHex};color:${on};font-weight:700;text-decoration:none;">${esc(b.label)}</a>`
    case "story":
      return `<p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${brand.accentHex};">${esc(b.kicker)}</p><a href="${esc(b.href)}" style="font-size:17px;line-height:22px;font-weight:700;color:#141414;text-decoration:none;">${esc(b.headline)}</a><p style="margin:4px 0 0;font-size:14px;line-height:20px;color:#525252;">${esc(b.standfirst)}</p>`
    case "divider":
      return `<hr style="border:0;border-top:1px solid #e5e5e5;margin:0;">`
  }
}

export function toEmailHtml(blocks: EmailBlock[], brand: EmailBrand, previewText: string) {
  const rows = blocks.map((b) => `<tr><td style="padding:0 24px 16px;">${rowHtml(b, brand)}</td></tr>`).join("\n")
  return `<!doctype html>
<html lang="en-AU">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(brand.streamName)}</title></head>
<body style="margin:0;background:#f4f4f4;font-family:${FONT};">
<span style="display:none;max-height:0;overflow:hidden;">${esc(previewText)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-top:4px solid ${brand.accentHex};">
<tr><td style="padding:24px 24px 16px;font-size:17px;font-weight:800;">${esc(brand.name)}</td></tr>
${rows}
<tr><td style="padding:20px 24px;border-top:1px solid #e5e5e5;font-size:12px;line-height:18px;color:#737373;">You're getting ${esc(brand.streamName)} because you subscribed on ${esc(brand.name)}. <a href="{{unsubscribe_url}}" style="color:#737373;">Unsubscribe</a><br>${esc(brand.postalAddress)}</td></tr>
</table>
</td></tr></table>
</body>
</html>`
}
