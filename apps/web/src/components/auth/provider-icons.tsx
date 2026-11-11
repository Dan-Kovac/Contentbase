// Third-party sign-in marks. Lucide has no brand icons, so these are drawn here.
import { cn } from "@/lib/utils"

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3.02c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.11A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28V6.61H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4.01-3.11z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4.01 3.11C6.23 6.88 8.88 4.77 12 4.77z" />
    </svg>
  )
}

export function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden fill="currentColor">
      <path d="M16.37 12.74c-.02-2.27 1.86-3.36 1.94-3.42-1.06-1.55-2.7-1.76-3.28-1.78-1.4-.14-2.73.82-3.44.82-.71 0-1.8-.8-2.96-.78a4.38 4.38 0 0 0-3.71 2.25c-1.58 2.74-.4 6.8 1.14 9.02.75 1.09 1.64 2.31 2.81 2.27 1.13-.05 1.55-.73 2.92-.73 1.36 0 1.75.73 2.94.71 1.21-.02 1.98-1.11 2.72-2.2.86-1.26 1.21-2.48 1.23-2.54-.03-.01-2.36-.9-2.38-3.6zM14.12 6.07c.62-.76 1.04-1.8.93-2.85-.9.04-1.98.6-2.62 1.35-.58.67-1.08 1.73-.94 2.76 1 .08 2.02-.51 2.63-1.26z" />
    </svg>
  )
}

/** YouTube play-button mark. `mono` draws it in currentColor. */
export function YouTubeIcon({ className, mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden>
      <path
        fill={mono ? "currentColor" : "#FF0000"}
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8z"
      />
      <path fill={mono ? "var(--background, #fff)" : "#fff"} d="M9.6 15.6 15.8 12 9.6 8.4z" />
    </svg>
  )
}
