"use client"

import { useMemo, useState } from "react"
import { CalendarClock, Globe2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { longDateFromValue, upcomingDays } from "./lib"

const TIMES = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4)
  const m = (i % 4) * 15
  const h12 = h % 12 === 0 ? 12 : h % 12
  return {
    value: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    label: `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`,
  }
})

const timeLabel = (v: string) => TIMES.find((t) => t.value === v)?.label ?? v

/** EDT-04: schedule in the channel's time zone (Australia/Melbourne). */
export function ScheduleDialog({
  open,
  onOpenChange,
  itemTitle,
  onSchedule,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemTitle: string
  onSchedule: (label: string) => void
}) {
  const days = useMemo(() => upcomingDays(21), [])
  const [day, setDay] = useState(days[0].value)
  const [time, setTime] = useState("18:00")

  // Earlier than 9:15 am today is in the past (demo clock: 9:15 am, 11 November).
  const inPast = day === days[0].value && time <= "09:15"

  const quick = [
    { label: "Tonight, 6:00 pm", day: days[0].value, time: "18:00" },
    { label: "Tomorrow, 7:00 am", day: days[1].value, time: "07:00" },
    { label: "Saturday, 9:00 am", day: days[3].value, time: "09:00" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Schedule</DialogTitle>
          <DialogDescription className="line-clamp-2">{itemTitle}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested times">
            {quick.map((q) => {
              const on = q.day === day && q.time === time
              return (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => {
                    setDay(q.day)
                    setTime(q.time)
                  }}
                  aria-pressed={on}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    on && "border-foreground bg-foreground text-background hover:bg-foreground",
                  )}
                >
                  {q.label}
                </button>
              )
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <div className="grid gap-2">
              <Label htmlFor="schedule-date">Date</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger id="schedule-date" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {days.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schedule-time">Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="schedule-time" className="w-full tabular">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {TIMES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="tabular">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-md bg-muted px-3 py-2.5 text-[13px] leading-5 text-muted-foreground">
            <Globe2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Times are in your channel&apos;s time zone, <span className="font-medium text-foreground">Australia/Melbourne (AEDT, UTC+11)</span>. Your audience is most active from 6:00 pm.
            </p>
          </div>
          {inPast && (
            <p className="text-[13px] text-destructive" role="alert">
              That time has passed. Pick a time after 9:15 am today.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={inPast}
            onClick={() => {
              onSchedule(`${longDateFromValue(day)}, ${timeLabel(time)}`)
              onOpenChange(false)
            }}
          >
            <CalendarClock /> Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
