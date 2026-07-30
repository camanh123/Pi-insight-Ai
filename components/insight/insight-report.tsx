"use client"

import { type PiUpdate } from "@/lib/insight/data"
import { type TFn } from "@/lib/insight/i18n"
import { SectionLabel, Card, cx } from "./ui"
import { IconAnalysis, IconWarning, IconSparkle } from "./icons"

interface InsightReportProps {
  report: PiUpdate["insightReport"]
  t: TFn
  lang: "en" | "vi"
}

export function InsightReport({ report, t, lang }: InsightReportProps) {
  const content = (str: { en: string; vi: string }) => str[lang]

  return (
    <section className="space-y-5 pi-fade-up" style={{ animationDelay: "0.2s" }}>
      <SectionLabel tone="analysis">
        <IconSparkle className="h-3.5 w-3.5" />
        {t("insightReport")}
      </SectionLabel>

      <div className="space-y-4">
        {/* Key Takeaway */}
        <Card className="border-l-4 border-primary bg-primary/5">
          <div className="flex gap-3">
            <div className="text-xs font-bold uppercase text-primary opacity-70 leading-tight pt-0.5">
              {t("keyTakeaway")}
            </div>
            <p className="text-sm leading-relaxed text-foreground">{content(report.keyTakeaway)}</p>
          </div>
        </Card>

        {/* Why This Matters */}
        <Card>
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase text-muted-foreground opacity-70">{t("whyMatters")}</p>
            <p className="pi-prose text-sm leading-relaxed text-foreground">{content(report.whyMatters)}</p>
          </div>
        </Card>

        {/* Before vs After */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-red-200 bg-red-50">
            <p className="text-xs font-bold uppercase text-red-900 opacity-70 mb-2">{t("before")}</p>
            <p className="text-xs leading-relaxed text-red-900">{content(report.beforeVsAfter.before)}</p>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50">
            <p className="text-xs font-bold uppercase text-emerald-900 opacity-70 mb-2">{t("after")}</p>
            <p className="text-xs leading-relaxed text-emerald-900">{content(report.beforeVsAfter.after)}</p>
          </Card>
        </div>

        {/* Who Is Affected */}
        <Card>
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase text-muted-foreground opacity-70">{t("whoIsAffected")}</p>
            <p className="pi-prose text-sm leading-relaxed text-foreground">{content(report.whoIsAffected)}</p>
          </div>
        </Card>

        {/* AI Insight */}
        <div className="relative overflow-hidden rounded-xl border-2 border-amber-200/50 bg-amber-50/50 p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-transparent opacity-30" />
          <div className="relative space-y-2">
            <div className="flex items-start gap-2">
              <IconSparkle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs font-bold uppercase text-amber-900 opacity-70">{t("aiInsight")}</p>
            </div>
            <p className="pi-prose text-sm leading-relaxed text-amber-900">{content(report.aiInsight)}</p>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase text-muted-foreground opacity-70">{t("suggestedQuestions")}</p>
          <div className="space-y-2">
            {report.suggestedQuestions.slice(0, 3).map((q, i) => (
              <div key={i} className="flex gap-2.5 text-sm">
                <span className="text-primary font-semibold shrink-0">{i + 1}</span>
                <p className="pi-prose text-foreground leading-relaxed">{content(q)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
