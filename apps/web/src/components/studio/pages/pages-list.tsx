"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { ExternalLink, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatusBadge } from "@/components/brand/status-badge"

export interface PageRow {
  id: string
  title: string
  slug: string
  status: "draft" | "published"
  inNav: boolean
  blocks: number
}

/** The channel's custom pages, with their address, status and place in the header. */
export function PagesList({ initialRows, channelSlug }: { initialRows: PageRow[]; channelSlug: string }) {
  const [rows, setRows] = useState(initialRows)
  const [deleting, setDeleting] = useState<PageRow | null>(null)
  const cols = "md:grid-cols-[minmax(0,1fr)_160px_120px_150px_48px]"

  if (!rows.length) {
    return (
      <div className="grid place-items-center rounded-lg border border-dashed px-6 py-14 text-center">
        <span className="grid size-10 place-items-center rounded-full bg-muted">
          <FileText className="size-5" aria-hidden />
        </span>
        <p className="mt-3 font-semibold">No pages yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">Start from a template below. An About page is the one most readers look for.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className={`hidden gap-4 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid ${cols}`} aria-hidden>
          <span>Page</span>
          <span>Address</span>
          <span>Status</span>
          <span>In navigation</span>
          <span />
        </div>
        <ul className="divide-y">
          {rows.map((p) => (
            <li key={p.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 ${cols}`}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted">
                  <FileText className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <Link href={`/studio/pages/${p.id}`} className="line-clamp-1 text-sm font-semibold hover:underline focus-visible:underline focus-visible:outline-none">
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground tabular md:hidden">/p/{p.slug}</p>
                  <p className="hidden text-xs text-muted-foreground tabular md:block">
                    {p.blocks} {p.blocks === 1 ? "block" : "blocks"}
                  </p>
                </div>
              </div>
              <span className="hidden font-mono text-xs text-muted-foreground md:block">/p/{p.slug}</span>
              <span className="col-start-1 row-start-2 md:col-auto md:row-auto">
                <StatusBadge tone={p.status} />
              </span>
              <div className="col-start-2 row-start-2 flex items-center justify-end gap-2 md:col-auto md:row-auto md:justify-start">
                <Switch
                  id={`nav-${p.id}`}
                  checked={p.inNav}
                  onCheckedChange={(v) => {
                    setRows((rs) => rs.map((r) => (r.id === p.id ? { ...r, inNav: v } : r)))
                    toast.success(v ? "Added to navigation" : "Removed from navigation", {
                      description: v ? `${p.title} is in your channel header.` : `${p.title} is no longer in your channel header.`,
                    })
                  }}
                  aria-label={`Show ${p.title} in navigation`}
                />
                <label htmlFor={`nav-${p.id}`} className="text-[13px] text-muted-foreground">
                  {p.inNav ? "Shown" : "Hidden"}
                </label>
              </div>
              <div className="col-start-2 row-start-1 justify-self-end md:col-auto md:row-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${p.title}`}>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={`/studio/pages/${p.id}`}>
                        <Pencil /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={`/c/${channelSlug}/p/${p.slug}`} target="_blank" rel="noreferrer">
                        <ExternalLink /> {p.status === "published" ? "View on channel" : "Preview"}
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(p)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.status === "published"
                ? `The page comes down and /p/${deleting.slug} redirects to your channel home. It's also removed from your header.`
                : "This draft is deleted. Nobody has seen it."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const t = deleting
                setRows((rs) => rs.filter((r) => r.id !== t?.id))
                toast.success("Deleted", { description: `${t?.title} is deleted.` })
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
