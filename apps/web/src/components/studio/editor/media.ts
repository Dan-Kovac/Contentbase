// The channel's photo library for the prototype: real match, track and studio
// photography under /public/media. Uploads are kept as object URLs in the browser.

export interface MediaPhoto {
  src: string
  label: string
}

export const PHOTO_LIBRARY: MediaPhoto[] = [
  { src: "/media/mcg-night.jpg", label: "The MCG at night" },
  { src: "/media/afl-docklands.jpg", label: "Kangaroos v Magpies at Docklands" },
  { src: "/media/stadium-day-pitch.jpg", label: "A day game from the stand" },
  { src: "/media/stadium-night-stand.jpg", label: "Under lights, from the stand" },
  { src: "/media/stadium-night-wide.jpg", label: "Stadium at night, wide" },
  { src: "/media/stadium-lights-blue.jpg", label: "Light towers at dusk" },
  { src: "/media/stadium-crowd-red.jpg", label: "Home crowd" },
  { src: "/media/festival-crowd.jpg", label: "Crowd on the hill" },
  { src: "/media/broadcast-control-room.jpg", label: "Our control room" },
  { src: "/media/racing-motion.jpg", label: "Field at full gallop" },
  { src: "/media/racing-close.jpg", label: "A close finish" },
  { src: "/media/racing-jockey-red.jpg", label: "Jockey in red silks" },
  { src: "/media/racing-hurdle.jpg", label: "Over the hurdle" },
  { src: "/media/racing-jumps-field.jpg", label: "Jumps field" },
]

/** Human label for an image source: a library photo's name or an upload's file name. */
export function photoLabel(src: string, names: Record<string, string> = {}) {
  return names[src] ?? PHOTO_LIBRARY.find((p) => p.src === src)?.label ?? src.split("/").pop() ?? "Image"
}
