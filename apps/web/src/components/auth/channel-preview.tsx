"use client"

import { accentState } from "@/components/settings/accent-field"
import { TemplatePreview } from "@/components/settings/template-preview"
import type { Pairing, Template } from "@/lib/types"

/**
 * Live preview of the new channel's homepage for the chosen look, used on the
 * sign-up style step and the import screen. Until the accent is a valid hex,
 * the preview keeps Homestand's default blue.
 */
export function ChannelPreview({
  name,
  subdomain,
  template,
  accentHex,
  pairing,
  logoUrl,
  iconUrl,
  maxHeight = 760,
}: {
  name: string
  subdomain: string
  template: Template
  accentHex: string
  pairing: Pairing
  logoUrl?: string | null
  iconUrl?: string | null
  maxHeight?: number
}) {
  const { hex } = accentState(accentHex)
  return (
    <figure aria-label={`Preview of ${name.trim() || "your channel"}`} className="m-0">
      <div aria-hidden>
        <TemplatePreview
          template={template}
          accentHex={hex ?? "#1c4fb8"}
          pairing={pairing}
          name={name}
          logoUrl={logoUrl}
          iconUrl={iconUrl}
          domain={`${subdomain || "yourchannel"}.homestand.com.au`}
          maxHeight={maxHeight}
          className="border-white/10"
        />
      </div>
    </figure>
  )
}
