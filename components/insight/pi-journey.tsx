"use client"

import { useInsight } from "@/contexts/insight-context"
import { cx } from "./ui"
import { getUserJourneyStage } from "@/lib/insight/data"
import { IconCheck } from "./icons"

const JOURNEY_STAGES = [
  { id: "pioneer", order: 0 },
  { id: "kyc-verified", order: 1 },
  { id: "eligible", order: 2 },
  { id: "migrated", order: 3 },
  { id: "open-network", order: 4 },
]

export function PiJourney() {
  const { profile, lang, t } = useInsight()
  const currentStage = getUserJourneyStage(profile)
  const currentOrder = JOURNEY_STAGES.find((s) => s.id === currentStage)?.order ?? 0

  const getStageTitle = (stageId: string): string => {
    const titleMap: Record<string, string> = {
      pioneer: t("pioneer") || "Pioneer",
      "kyc-verified": t("kycVerified") || "KYC Verified",
      eligible: t("eligible") || "Eligible for Mainnet",
      migrated: t("migrated") || "Migrated",
      "open-network": t("openNetwork") || "Open Network Ready",
    }
    return titleMap[stageId] || stageId
  }

  const getStageDescription = (stageId: string): string => {
    const descMap: Record<string, { en: string; vi: string }> = {
      pioneer: {
        en: "You&apos;ve joined the Pi Network. Mine Pi and prepare for KYC.",
        vi: "Bạn đã tham gia Pi Network. Khai thác Pi và chuẩn bị cho KYC.",
      },
      "kyc-verified": {
        en: "Your identity is verified. Complete migration to access Mainnet.",
        vi: "Danh tính của bạn đã được xác minh. Hoàn tất di chuyển để truy cập Mainnet.",
      },
      eligible: {
        en: "You&apos;re eligible for Mainnet. Migrate your Pi to connect to the Open Network.",
        vi: "Bạn đủ điều kiện cho Mainnet. Di chuyển Pi của bạn để kết nối với Mạng Mở.",
      },
      migrated: {
        en: "Your Pi is on Mainnet. Get ready to use it across the ecosystem.",
        vi: "Pi của bạn trên Mainnet. Hãy sẵn sàng sử dụng nó trên toàn hệ sinh thái.",
      },
      "open-network": {
        en: "You&apos;re ready for the Open Network. Your Pi connects to the world.",
        vi: "Bạn đã sẵn sàng cho Mạng Mở. Pi của bạn kết nối với thế giới.",
      },
    }
    const desc = descMap[stageId]
    return desc ? desc[lang] : ""
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("piJourney")}</h2>
        <p className="text-sm text-muted-foreground">{t("journeyProgress")}</p>
      </div>

      {/* Progress Line */}
      <div className="space-y-4">
        {JOURNEY_STAGES.map((stage, idx) => {
          const isCompleted = stage.order < currentOrder
          const isCurrent = stage.order === currentOrder
          const isNext = stage.order > currentOrder

          return (
            <div key={stage.id}>
              <div className="flex items-start gap-4">
                {/* Checkpoint */}
                <div className="flex flex-col items-center">
                  <div
                    className={cx(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold",
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCurrent
                          ? "border-primary bg-card text-primary"
                          : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <IconCheck className="h-4 w-4" />
                    ) : (
                      <span className="text-xs">{idx + 1}</span>
                    )}
                  </div>
                  {idx < JOURNEY_STAGES.length - 1 && (
                    <div
                      className={cx(
                        "mt-2 h-8 w-0.5",
                        isCompleted || isCurrent ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="pt-1 pb-4 flex-1">
                  <h3
                    className={cx(
                      "text-sm font-semibold",
                      isCurrent ? "text-primary" : "text-foreground"
                    )}
                  >
                    {getStageTitle(stage.id)}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {getStageDescription(stage.id)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress Summary */}
      <div className="rounded-lg border border-border bg-card/50 p-4">
        <div className="text-sm font-medium text-foreground mb-2">
          {Math.round(((currentOrder + 1) / JOURNEY_STAGES.length) * 100)}% {t("complete") || "Complete"}
        </div>
        <div className="h-2 w-full rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentOrder + 1) / JOURNEY_STAGES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
