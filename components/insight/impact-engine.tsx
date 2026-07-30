"use client"

import { ImpactScore, impactTier, impactColor } from "@/lib/insight/data"
import { TFn } from "@/lib/insight/i18n"
import { Card, IconButton, cx } from "./ui"
import { IconChart, IconUsers, IconCode, IconBuilding, IconGlobe } from "./icons"

interface ImpactEngineProps {
  scores: {
    overall: ImpactScore
    pioneers: ImpactScore
    developers: ImpactScore
    businesses: ImpactScore
    ecosystem: ImpactScore
  }
  t: TFn
  lang?: "en" | "vi"
}

export function ImpactEngine({ scores, t, lang = "en" }: ImpactEngineProps) {
  const categories = [
    { key: "pioneers", label: t("impactPioneers"), Icon: IconUsers },
    { key: "developers", label: t("impactDevelopers"), Icon: IconCode },
    { key: "businesses", label: t("impactBusinesses"), Icon: IconBuilding },
    { key: "ecosystem", label: t("impactEcosystem"), Icon: IconGlobe },
  ] as const

  return (
    <section className="space-y-4 pi-fade-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center gap-2">
        <IconChart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{t("impactEngine")}</h3>
      </div>

      {/* Overall Impact Card */}
      <div className={cx("rounded-xl border-2 p-4", impactColor(impactTier(scores.overall.score)))}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-75">{t("overallImpact")}</p>
            <p className="pi-prose mt-1.5 text-sm leading-relaxed">{scores.overall.reason[lang]}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-4xl font-bold pi-nums">{scores.overall.score}</div>
            <div className="text-xs font-semibold opacity-60">/10</div>
          </div>
        </div>
      </div>

      {/* Category Impact Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map(({ key, label, Icon }) => {
          const score = scores[key]
          const tier = impactTier(score.score)
          return (
            <div key={key} className={cx("rounded-lg border p-3", impactColor(tier))}>
              <div className="flex items-start justify-between gap-1.5">
                <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="text-right">
                  <div className="text-2xl font-bold pi-nums">{score.score}</div>
                </div>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase opacity-60">{label}</p>
              <p className="pi-clamp-2 mt-1.5 text-xs leading-tight">{score.reason[lang]}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">{t("impactLegend")}:</p>
        <div className="mt-2 space-y-1">
          <p>
            <span className="font-semibold text-emerald-900">8-10:</span> {t("impactHigh")}
          </p>
          <p>
            <span className="font-semibold text-amber-900">5-7:</span> {t("impactMid")}
          </p>
          <p>
            <span className="font-semibold text-red-900">1-4:</span> {t("impactLow")}
          </p>
        </div>
      </div>
    </section>
  )
}
