"use client"

/**
 * One sign-in, two records. The person signs in once at the central sign-in; their creator record
 * (publications, team, billing) and their reader record (follows, newsletters, 18+ result, opt-outs)
 * both hang off that one login, so moving between the studio and reading is a link, not a new sign-in.
 */
import Link from "next/link"
import { BookOpen, LayoutGrid, LogOut, Settings } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AccountMenu({ name, initials }: { name: string; initials: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Your account">
        <Avatar className="size-8">
          <AvatarFallback className="bg-brand-black text-[12px] font-bold text-brand-white">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-[14px] font-semibold">{name}</span>
          <span className="text-[12px] font-normal text-muted-foreground">One sign-in for the studio and for reading</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/studio/publications">
            <LayoutGrid /> Your publications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">
            <BookOpen /> Your reader account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/studio/settings/billing">
            <Settings /> Plan and billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/signin">
            <LogOut /> Sign out everywhere
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
