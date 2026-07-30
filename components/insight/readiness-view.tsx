"use client"

import { useInsight } from "@/contexts/insight-context"
import { ReadinessScore } from "./readiness-score"
import { cx } from "./ui"
import type { Lang } from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"

export function ReadinessView() {
  const { lang, t, profile } = useInsight()

  return (
    <div className="space-y-4 px-4 py-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">{t("piReadinessScore")}</h1>
        <p className="text-sm text-muted-foreground">
          {profile.displayName
            ? `${profile.displayName}'s ${t("journeyProgress")}`
            : t("journeyProgress")}
        </p>
      </div>

      {/* Main Readiness Score Card */}
      <ReadinessScore />

      {/* Info Card */}
      <div className="space-y-2 rounded-lg bg-blue-500/10 p-4 border border-blue-500/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          {t("official")}
        </p>
        <p className="text-sm leading-relaxed text-foreground">
          {lang === "vi"
            ? "Điểm sẵn sàng này dựa trên thông tin chính thức từ Pi Network về yêu cầu cho Mạng Mở. Hoàn tất từng bước để tối ưu hóa sự chuẩn bị của bạn."
            : "This readiness score is based on official Pi Network information about Open Network requirements. Complete each step to optimize your preparation."}
        </p>
      </div>

      {/* Quick Tips */}
      <div className="space-y-2 rounded-lg bg-muted/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {lang === "vi" ? "Mẹo nhanh" : "Quick Tips"}
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="mt-0.5 text-primary">✓</span>
            <span>
              {lang === "vi"
                ? "Hoàn tất KYC trước để mở khóa các bước tiếp theo"
                : "Complete KYC first to unlock next steps"}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-primary">✓</span>
            <span>
              {lang === "vi"
                ? "Một ví được tài trợ là bắt buộc cho di chuyển Mainnet"
                : "A funded wallet is required for Mainnet migration"}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-primary">✓</span>
            <span>
              {lang === "vi"
                ? "Xây dựng vòng bảo mật của bạn để bảo vệ tài khoản"
                : "Build your security circle to protect your account"}
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
