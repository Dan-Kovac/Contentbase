"use client"

import { useState } from "react"
import { CircleCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const CATEGORIES = ["Automotive", "Sportswear and equipment", "Food and drink", "Financial services", "Travel", "Wagering (licensed)", "Other"]
const BUDGETS = ["Under $10,000", "$10,000 to $50,000", "$50,000 to $150,000", "Over $150,000"]

export function AdvertiserContactForm() {
  const [sent, setSent] = useState<null | { name: string; email: string }>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get("name") ?? "").trim()
    const email = String(data.get("email") ?? "").trim()
    const company = String(data.get("company") ?? "").trim()
    const next: Record<string, string> = {}
    if (!name) next.name = "Add your name."
    if (!company) next.company = "Add your company or agency."
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Check the email address, e.g. alex@brand.com.au."
    setErrors(next)
    if (Object.keys(next).length === 0) setSent({ name, email })
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-lg border bg-card p-6 sm:p-8">
        <CircleCheck className="size-8 text-pop-ink" aria-hidden />
        <h3 className="text-[22px] font-bold tracking-[-0.01em]">Thanks, {sent.name.split(" ")[0]}. We&apos;ll be in touch.</h3>
        <p className="text-[15px] leading-[23px] text-muted-foreground">
          Our partnerships team replies within one working day at {sent.email}, with our rate card and a sample due-diligence pack.
        </p>
        <Button variant="outline" onClick={() => setSent(null)}>
          Send another enquiry
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 rounded-lg border bg-card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Your name" error={errors.name}>
          <Input id="name" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
        </Field>
        <Field id="company" label="Company or agency" error={errors.company}>
          <Input id="company" name="company" autoComplete="organization" aria-invalid={!!errors.company} aria-describedby={errors.company ? "company-error" : undefined} />
        </Field>
      </div>
      <Field id="email" label="Work email" error={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="category" label="Category">
          <Select name="category" defaultValue={CATEGORIES[0]}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="budget" label="Budget (AUD)">
          <Select name="budget" defaultValue={BUDGETS[1]}>
            <SelectTrigger id="budget" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUDGETS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field id="message" label="What are you planning?">
        <Textarea id="message" name="message" rows={4} placeholder="e.g. A summer campaign across AFL and racing channels, 1 December to 31 January." />
      </Field>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted-foreground">We reply within one working day.</p>
        <Button type="submit" size="lg">
          Send enquiry
        </Button>
      </div>
    </form>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
