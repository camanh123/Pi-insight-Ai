"use client"

import { cx, Pill } from "./ui"
import { IconExternal, IconFire } from "./icons"
import {
  importanceTier,
  formatDate,
  topicLabel,
  type Lang,
  type Milestone,
  type PiUpdate,
} from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"

export function ImportanceBadge({
  score,
  size = "md",
  t,
}: {
  score: number
  size?: "sm" | "md"
  t: TFn
}) {
  const tier = importanceTier(score)
  const tones: Record<string, string> = {
    high: "bg-imp-high-soft text-imp-high",
    mid: "bg-imp-mid-soft text-imp-mid",
    low: "bg-imp-low-soft text-imp-low",
  }
  const showIcon = score >= 8
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold pi-nums",
        tones[tier],
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1.5 text-sm",
      )}
    >
      {showIcon && <IconFire className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />}
      <span>{score}/10</span>
    </span>
  )
}

export function TopicPill({ topic, lang }: { topic: PiUpdate["topic"]; lang: Lang }) {
  return (
    <Pill className="bg-secondary text-secondary-foreground">{topicLabel(topic, lang)}</Pill>
  )
}

export function SourceLink({
  update,
  lang,
  t,
}: {
  update: PiUpdate
  lang: Lang
  t: TFn
}) {
  return (
    <a
      href={update.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="pi-press inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
    >
      <IconExternal className="h-3.5 w-3.5" />
      <span>{t("viewSource")}</span>
    </a>
  )
}

export function SourceMeta({
  update,
  lang,
  t,
}: {
  update: PiUpdate
  lang: Lang
  t: TFn
}) {
  return (
    <p className="text-xs text-muted-foreground">
      {update.source} · {formatDate(update.date, lang)}
    </p>
  )
}

export function Timeline({
  items,
  lang,
}: {
  items: Milestone[]
  lang: Lang
}) {
  return (
    <ol className="relative ml-2 border-l-2 border-primary/20 pl-5">
      {items.map((m, i) => (
        <li key={i} className="relative pb-5 last:pb-0">
          <span className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
          <p className="text-sm font-medium text-foreground text-pretty">{m.title[lang]}</p>
          <p className="text-xs text-muted-foreground pi-nums">{formatDate(m.date, lang)}</p>
        </li>
      ))}
    </ol>
  )
}
