"use client"

import { useInsight } from "@/contexts/insight-context"
import { calculateReadinessScore } from "@/lib/insight/data"
import { cx } from "./ui"
import { IconCheck, IconSparkle } from "./icons"
import type { Lang } from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"

function ScoreCircle({ score }: { score: number }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  let color = "text-destructive"
  if (score >= 80) color = "text-green-500"
  else if (score >= 60) color = "text-amber-500"
  else if (score >= 40) color = "text-orange-500"

  return (
    <div className="relative h-32 w-32">
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cx("transition-all duration-700", color)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  )
}

function CategoryScore({
  label,
  score,
  lang,
}: {
  label: string
  score: number
  lang: Lang
}) {
  const percentage = Math.round(score)
  let bgColor = "bg-destructive/20"
  let textColor = "text-destructive"
  if (score >= 80) {
    bgColor = "bg-green-500/20"
    textColor = "text-green-600"
  } else if (score >= 60) {
    bgColor = "bg-amber-500/20"
    textColor = "text-amber-600"
  } else if (score >= 40) {
    bgColor = "bg-orange-500/20"
    textColor = "text-orange-600"
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className={cx("text-xs font-bold", textColor)}>{percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cx("h-full transition-all duration-500", bgColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function ReadinessScore() {
  const { profile, nextActions, lang, t } = useInsight()
  const readiness = calculateReadinessScore(profile, nextActions, lang)

  const categoryLabels: Record<string, string> = {
    kyc: t("kycStatus"),
    mainnet: t("mainnetStatus"),
    wallet: t("walletStatus"),
    security: t("security") || "Security Circle",
    node: t("nodeOperator"),
    appstudio: t("appStudioExperience"),
    kyb: "KYB",
  }

  const completedCount = readiness.steps.filter((s) => s.completed).length
  const totalCount = readiness.steps.length
  const completedPercent = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4 pi-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">{t("piReadinessScore")}</h3>
          <p className="text-xs text-muted-foreground">{t("scoreCalculation")}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div className="font-semibold text-primary">{completedCount}/{totalCount}</div>
          <div>{t("completedSteps")}</div>
        </div>
      </div>

      {/* Score Circle */}
      <div className="flex justify-center py-2">
        <ScoreCircle score={readiness.overall} />
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-foreground">{t("progress")}</div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500"
            style={{ width: `${completedPercent}%` }}
          />
        </div>
      </div>

      {/* Category Scores */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("categoryScores")}
        </div>
        <div className="space-y-2.5">
          {Object.entries(readiness.category).map(([cat, score]) => (
            <CategoryScore key={cat} label={categoryLabels[cat] || cat} score={score} lang={lang} />
          ))}
        </div>
      </div>

      {/* Completed Steps */}
      {completedCount > 0 && (
        <div className="space-y-2 rounded-lg bg-green-500/10 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
            <IconCheck className="h-4 w-4" />
            {t("completedSteps")}
          </div>
          <div className="space-y-1">
            {readiness.steps
              .filter((s) => s.completed)
              .map((step) => (
                <div key={step.id} className="flex items-center gap-2 text-xs">
                  <IconCheck className="h-3 w-3 text-green-600" />
                  <span className="text-foreground">{step.name[lang]}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Pending Steps */}
      {completedCount < totalCount && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">{t("pendingSteps")}</div>
          <div className="space-y-2">
            {readiness.steps
              .filter((s) => !s.completed)
              .slice(0, 3)
              .map((step) => (
                <div key={step.id} className="rounded-lg border border-border/50 bg-muted/40 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-foreground">{step.name[lang]}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{step.description[lang]}</p>
                    </div>
                    <div className="whitespace-nowrap text-xs font-semibold text-primary">
                      +{Math.round(step.weight * 10)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* AI Recommendation */}
      <div className="space-y-2 rounded-lg bg-primary/10 p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <IconSparkle className="h-4 w-4" />
          <span>{t("readinessRecommendation")}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground">{readiness.recommendation[lang]}</p>
        {readiness.isOfficial && (
          <p className="text-xs text-muted-foreground">{t("official")}</p>
        )}
      </div>

      {/* Next Best Action */}
      {readiness.nextBestAction && (
        <div className="space-y-2 rounded-lg border border-border bg-card p-3">
          <div className="text-xs font-semibold text-muted-foreground">{t("nextBestAction")}</div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{readiness.nextBestAction.title[lang]}</p>
            <p className="text-xs text-muted-foreground">{readiness.nextBestAction.description[lang]}</p>
            <div className="mt-2 inline-block rounded px-2 py-1 text-xs font-medium">
              {readiness.nextBestAction.priority === "high" && <span className="text-red-600">High Priority</span>}
              {readiness.nextBestAction.priority === "medium" && <span className="text-amber-600">Medium Priority</span>}
              {readiness.nextBestAction.priority === "low" && <span className="text-blue-600">Low Priority</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
