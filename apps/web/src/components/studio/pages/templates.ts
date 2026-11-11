// Starting points for a new channel page. Copy is a first draft in the
// channel's voice; creators edit everything before publishing.
import { FileText, Handshake, Mail, Users, type LucideIcon } from "lucide-react"
import type { Block } from "@/lib/types"

export type TemplateId = "about" | "contact" | "partners" | "blank"

export interface PageTemplate {
  id: TemplateId
  label: string
  description: string
  icon: LucideIcon
  title: string
  slug: string
  /** Used when the channel already has a page at `slug`. */
  altSlug: string
  inNav: boolean
  blocks: (channelName: string, owner: string) => Block[]
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "about",
    label: "About",
    description: "Who you are, what you cover and when new videos land.",
    icon: Users,
    title: "About",
    slug: "about",
    altSlug: "about-us",
    inNav: true,
    blocks: (name, owner) => [
      { type: "paragraph", text: `${name} is ${owner} breaking down the game every week: the numbers, the structures and the calls nobody else is making.` },
      { type: "heading", text: "What we cover" },
      { type: "list", items: ["A long-form analysis show every week", "Shorts from every round", "Written pieces between episodes"] },
      { type: "image", caption: "Add a photo of you at work, and credit the photographer", src: "/media/broadcast-control-room.jpg" },
      { type: "heading", text: "When new episodes land" },
      { type: "paragraph", text: "New videos go up on Tuesday nights. Follow the channel and you'll see them first." },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    description: "How readers, guests and the media can reach you.",
    icon: Mail,
    title: "Contact",
    slug: "contact",
    altSlug: "contact-us",
    inNav: false,
    blocks: (name) => [
      { type: "paragraph", text: `The best way to reach ${name} is by email. We read everything and reply to most within two working days.` },
      { type: "heading", text: "Get in touch" },
      { type: "list", items: ["Questions for the mailbag: mailbag@yourdomain.com.au", "Guests and interviews: hello@yourdomain.com.au", "Corrections: corrections@yourdomain.com.au"] },
      { type: "divider" },
      { type: "paragraph", text: "Sponsorship and advertising enquiries go through our partners page." },
    ],
  },
  {
    id: "partners",
    label: "Partners",
    description: "Your audience in numbers and how brands work with you.",
    icon: Handshake,
    title: "Work with us",
    slug: "partners",
    altSlug: "work-with-us",
    inNav: false,
    blocks: (name) => [
      { type: "paragraph", text: `Brands work with ${name} through Homestand, so every partner buys on the same terms and every placement is designed into the page.` },
      { type: "heading", text: "Who you'll reach" },
      { type: "list", items: ["Add your monthly viewers", "Add your followers and subscribers", "Add where your audience is, by state"] },
      { type: "heading", text: "Ways to partner" },
      { type: "list", items: ["Presented by: your brand on a regular segment", "Chapter sponsor: a named chapter inside a video", "Sponsored short: a vertical short made with you"] },
      { type: "quote", text: "Add a line from a partner you've worked with.", cite: "Partner name, role" },
    ],
  },
  {
    id: "blank",
    label: "Blank",
    description: "Start from an empty page.",
    icon: FileText,
    title: "",
    slug: "",
    altSlug: "",
    inNav: false,
    blocks: () => [{ type: "paragraph", text: "" }],
  },
]

export const getTemplate = (id?: string) => PAGE_TEMPLATES.find((t) => t.id === id)
