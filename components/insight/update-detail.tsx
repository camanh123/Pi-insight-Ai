"use client"

import { useState } from "react"
import { useInsight } from "@/contexts/insight-context"
import { cx, Card, IconButton, Button, SectionLabel } from "./ui"
import {
  IconBack,
  IconBookmark,
  IconBookmarkFill,
  IconAnalysis,
  IconWarning,
  IconUsers,
  IconClock,
  IconChevronRight,
  IconSparkle,
} from "./icons"
import { ImportanceBadge, TopicPill, SourceLink, SourceMeta, Timeline } from "./parts"
import { ImpactEngine } from "./impact-engine"
import { InsightReport } from "./insight-report"
import { TimelineEvolution } from "./timeline-evolution"
import { relatedUpdates, type Lang, type PiUpdate } from "@/lib/insight/data"

type TextTab = "summary" | "explain" | "vietnamese"

export function UpdateDetail({
  update,
  onBack,
  onOpenRelated,
  onAskQuestion,
}: {
  update: PiUpdate
  onBack: () => void
  onOpenRelated: (id: string) => void
  onAskQuestion: (question: string) => void
}) {
  const { lang, t, isBookmarked, toggleBookmark } = useInsight()
  const [tab, setTab] = useState<TextTab>("summary")
  const bookmarked = isBookmarked(update.id)
  const related = relatedUpdates(update.id)

  const textTabs: { id: TextTab; label: string }[] = [
    { id: "summary", label: t("tabSummary") },
    { id: "explain", label: t("tabExplain") },
    { id: "vietnamese", label: t("tabVietnamese") },
  ]

  return (
    <div className="min-h-[100dvh] bg-background pb-10">
      {/* header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur pi-safe-top">
        <div className="mx-auto flex max-w-md items-center justify-between px-2 py-2">
          <IconButton label={t("back")} onClick={onBack}>
            <IconBack className="h-5 w-5" />
          </IconButton>
          <span className="text-sm font-semibold text-foreground">{t("appName")}</span>
          <IconButton
            label={bookmarked ? t("removeSaved") : t("save")}
            onClick={() => toggleBookmark(update.id)}
            className={bookmarked ? "text-primary" : ""}
          >
            {bookmarked ? (
              <IconBookmarkFill className="h-5 w-5" />
            ) : (
              <IconBookmark className="h-5 w-5" />
            )}
          </IconButton>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-5 px-4 py-5">
        {/* title block */}
        <div className="pi-fade-up space-y-3">
          <div className="flex items-center gap-2">
            <TopicPill topic={update.topic} lang={lang} />
            <ImportanceBadge score={update.importance} size="sm" t={t} />
          </div>
          <h1 className="text-2xl font-bold leading-tight text-balance text-foreground">
            {update.title[lang]}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SourceMeta update={update} lang={lang} t={t} />
            <SourceLink update={update} lang={lang} t={t} />
          </div>
          <Card className="flex items-start gap-2 bg-imp-high-soft p-3">
            <IconSparkle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-foreground text-pretty">{update.importanceReason[lang]}</p>
          </Card>
        </div>

        {/* Official information */}
        <section className="space-y-3 pi-fade-up" style={{ animationDelay: "0.05s" }}>
          <SectionLabel tone="official">{t("official")}</SectionLabel>
          <div className="flex gap-1.5 rounded-xl bg-muted p-1">
            {textTabs.map((tt) => (
              <button
                key={tt.id}
                onClick={() => setTab(tt.id)}
                className={cx(
                  "pi-press flex-1 rounded-lg px-2 py-2 text-xs font-medium",
                  tab === tt.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {tt.label}
              </button>
            ))}
          </div>
          <Card className="p-4">
            {tab === "summary" ? (
              <p className="pi-prose text-[15px] leading-relaxed text-foreground">
                {update.summary[lang]}
              </p>
            ) : null}
            {tab === "explain" ? (
              <p className="pi-prose text-[15px] leading-relaxed text-foreground">
                {update.explanation[lang]}
              </p>
            ) : null}
            {tab === "vietnamese" ? (
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("tabSummary")}
                  </p>
                  <p className="pi-prose text-[15px] leading-relaxed text-foreground">
                    {update.summary.vi}
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("tabExplain")}
                  </p>
                  <p className="pi-prose text-[15px] leading-relaxed text-foreground">
                    {update.explanation.vi}
                  </p>
                </div>
              </div>
            ) : null}
          </Card>
        </section>

        {/* AI analysis */}
        <section className="space-y-3 pi-fade-up" style={{ animationDelay: "0.1s" }}>
          <SectionLabel tone="analysis">
            <IconAnalysis className="h-3.5 w-3.5" />
            {t("aiAnalysis")}
          </SectionLabel>
          <Card className="space-y-4 p-4">
            <AnalysisRow
              icon={<IconSparkle className="h-4 w-4 text-imp-mid" />}
              title={t("whyMatters")}
              body={update.analysis.whyMatters[lang]}
            />
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <IconUsers className="h-4 w-4 text-imp-mid" />
                <p className="text-sm font-semibold text-foreground">{t("whoAffected")}</p>
              </div>
              <ul className="space-y-1.5">
                {update.analysis.affected.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-imp-mid" />
                    <span className="text-pretty">{a[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <ImpactBox
                label={t("shortTerm")}
                sub={t("daysToWeeks")}
                body={update.analysis.shortTerm[lang]}
              />
              <ImpactBox
                label={t("longTerm")}
                sub={t("monthsToYears")}
                body={update.analysis.longTerm[lang]}
              />
            </div>
          </Card>
        </section>

        {/* Impact Engine */}
        <ImpactEngine scores={update.impactScores} t={t} lang={lang} />

        {/* AI Insight Report */}
        {update.insightReport && <InsightReport report={update.insightReport} t={t} lang={lang} />}

        {/* Timeline Evolution - Shows how this update connects to Pi's progression */}
        <TimelineEvolution 
          update={update} 
          lang={lang} 
          t={t}
          onOpenUpdate={onOpenRelated}
        />

        {/* Classic Timeline */}
        <section className="space-y-3 pi-fade-up" style={{ animationDelay: "0.15s" }}>
          <SectionLabel tone="neutral">
            <IconClock className="h-3.5 w-3.5" />
            {t("tabTimeline")}
          </SectionLabel>
          <Card className="p-4">
            <p className="mb-4 text-sm font-medium text-foreground">{t("timelineTitle")}</p>
            <Timeline items={update.timeline} lang={lang} />
          </Card>
        </section>

        {/* AI prediction */}
        <section className="space-y-3 pi-fade-up">
          <SectionLabel tone="prediction">
            <IconWarning className="h-3.5 w-3.5" />
            {t("aiPrediction")}
          </SectionLabel>
          <div className="relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-gold-soft">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-50" />
            <Card className="relative border-0 bg-transparent p-4 shadow-none">
              <p className="pi-prose text-[15px] leading-relaxed text-foreground">
                {update.prediction[lang]}
              </p>
              <p className="mt-3 flex items-start gap-1.5 border-t border-gold/20 pt-3 text-xs font-medium text-gold-foreground">
                <IconWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="text-pretty">{t("predictionDisclaimer")}</span>
              </p>
            </Card>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 ? (
          <section className="space-y-3 pi-fade-up" style={{ animationDelay: "0.25s" }}>
            <SectionLabel tone="neutral">{t("relatedUpdates")}</SectionLabel>
            <div className="space-y-2">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onOpenRelated(r.id)}
                  className="pi-press flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 text-left hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{r.title[lang]}</p>
                    <SourceMeta update={r} lang={lang} t={t} />
                  </div>
                  <IconChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {/* Suggested questions */}
        <section className="space-y-3 pi-fade-up" style={{ animationDelay: "0.3s" }}>
          <SectionLabel tone="analysis">
            <IconSparkle className="h-3.5 w-3.5" />
            {t("suggestedQuestions")}
          </SectionLabel>
          <div className="space-y-2">
            {update.suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => onAskQuestion(q[lang])}
                className="pi-press flex w-full items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-3 text-left hover:bg-primary/10"
              >
                <span className="text-sm text-primary text-pretty">{q[lang]}</span>
                <IconChevronRight className="h-5 w-5 shrink-0 text-primary" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function AnalysisRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <p className="pi-prose text-sm leading-relaxed text-foreground text-pretty">{body}</p>
    </div>
  )
}

function ImpactBox({ label, sub, body }: { label: string; sub: string; body: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      <p className="pi-prose text-sm leading-relaxed text-foreground text-pretty">{body}</p>
    </div>
  )
}

export type { Lang }
