"use client"

import { useMemo } from "react"
import { useInsight } from "@/contexts/insight-context"
import { cx, Button } from "./ui"
import { IconTrendingUp, IconTarget, IconCheckCircle, IconArrowRight } from "./icons"
import type { Lang, ReadinessScore } from "@/lib/insight/data"
import { calculateReadinessScore } from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"

interface PiReadinessScoreProps {
  lang: Lang
  t: TFn
}

export function PiReadinessScore({ lang, t }: PiReadinessScoreProps) {
  const { profile, nextActions } = useInsight()

  const readinessScore = useMemo(
    () => calculateReadinessScore(profile, lang),
    [profile, lang]
  )

  const nextAction = nextActions.find((a) => a.priority === "high" && !a.completed)
  const completedCount = readinessScore.steps.filter((s) => s.completed).length

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600"
    if (score >= 60) return "text-blue-600"
    if (score >= 40) return "text-amber-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100"
    if (score >= 60) return "bg-blue-100"
    if (score >= 40) return "bg-amber-100"
    return "bg-red-100"
  }

  return (
    <div className="space-y-4">
      {/* Main Readiness Score */}
      <div className="rounded-lg border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {lang === "en" ? "Pi Readiness Score" : "Điểm Sẵn Sàng Pi"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className={cx("text-5xl font-bold", getScoreColor(readinessScore.overall))}>
                {readinessScore.overall}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="text-right">
            <IconTrendingUp className={cx("h-6 w-6 mb-1", getScoreColor(readinessScore.overall))} />
            <p className="text-xs font-medium text-muted-foreground">
              {completedCount}/{readinessScore.steps.length}
              <br />
              {lang === "en" ? "completed" : "hoàn thành"}
            </p>
          </div>
        </div>

        <p className="text-sm text-foreground leading-relaxed">
          {readinessScore.recommendation[lang]}
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-foreground">
          {lang === "en" ? "Progress by Category" : "Tiến Độ Theo Danh Mục"}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(readinessScore.category).map(([category, score]) => (
            <CategoryCard key={category} category={category as any} score={score} lang={lang} />
          ))}
        </div>
      </div>

      {/* Next Best Action */}
      {nextAction && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <IconTarget className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
                {lang === "en" ? "Next Best Action" : "Hành Động Tiếp Theo Tốt Nhất"}
              </p>
              <p className="text-sm font-medium text-foreground mb-1">{nextAction.title[lang]}</p>
              <p className="text-xs text-foreground/80 mb-3">{nextAction.description[lang]}</p>
              <Button
                size="sm"
                variant="primary"
                className="gap-1"
              >
                {lang === "en" ? "Take Action" : "Thực Hiện Hành Động"}
                <IconArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Journey Progress */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-foreground">
          {lang === "en" ? "Journey Checklist" : "Danh Sách Kiểm Tra Hành Trình"}
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {readinessScore.steps.map((step) => (
            <div
              key={step.id}
              className={cx(
                "rounded-lg border p-2 flex items-start gap-2",
                step.completed
                  ? "border-green-200 bg-green-50/30"
                  : "border-border bg-card/50 hover:bg-card"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  <IconCheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cx("text-xs font-medium", step.completed ? "line-through text-muted-foreground" : "text-foreground")}>
                  {step.name[lang]}
                </p>
              </div>
              <span className="flex-shrink-0 text-[10px] font-semibold text-muted-foreground bg-background px-1.5 py-0.5 rounded">
                {step.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoryCard({ category, score, lang }: { category: string; score: number; lang: "en" | "vi" }) {
  const labels: Record<string, Record<string, string>> = {
    en: {
      kyc: "KYC",
      mainnet: "Mainnet",
      wallet: "Wallet",
      security: "Security",
      node: "Node",
      appstudio: "App Studio",
      kyb: "KYB",
    },
    vi: {
      kyc: "KYC",
      mainnet: "Mainnet",
      wallet: "Ví",
      security: "Bảo Mật",
      node: "Node",
      appstudio: "App Studio",
      kyb: "KYB",
    },
  }

  const getColor = (s: number) => {
    if (s >= 80) return "bg-emerald-500"
    if (s >= 60) return "bg-blue-500"
    if (s >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-foreground">{labels[lang][category] || category}</p>
        <p className="text-xs font-bold text-foreground">{score}%</p>
      </div>
      <div className="h-2 bg-border/30 rounded-full overflow-hidden">
        <div className={cx("h-full transition-all duration-500", getColor(score))} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}
