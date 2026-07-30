"use client"

import { useInsight } from "@/contexts/insight-context"
import { cx } from "./ui"
import { IconSparkle, IconUser, IconTarget } from "./icons"
import type { Lang } from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"

interface ForYouInsightProps {
  updateTopic: string // Topic of the update being read
  updateTitle: string // Title of the update
  lang: Lang
  t: TFn
}

export function ForYouInsight({ updateTopic, updateTitle, lang, t }: ForYouInsightProps) {
  const { profile } = useInsight()

  // Skip if user hasn't shared profile
  if (!profile.shareProfileWithAdvisor) {
    return null
  }

  // Generate personalized insight based on user profile and update topic
  const insight = generatePersonalizedInsight(profile, updateTopic, updateTitle, lang)

  if (!insight) return null

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-4 space-y-3 pi-fade-up">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2">
          <IconSparkle className="h-4 w-4 text-purple-600" />
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
            {lang === "en" ? "For You" : "Dành Cho Bạn"}
          </p>
        </div>
        {insight.relevanceLevel === "high" && (
          <span className="text-[10px] font-bold text-purple-700 bg-purple-200 px-1.5 py-0.5 rounded">
            {lang === "en" ? "Highly Relevant" : "Có Liên Quan Cao"}
          </span>
        )}
      </div>

      {/* Personal relevance message */}
      <p className="text-sm text-foreground leading-relaxed">
        {insight.personalMessage[lang]}
      </p>

      {/* Recommended action based on profile */}
      {insight.recommendedAction && (
        <div className="bg-background/50 rounded p-2.5 border border-purple-200/50">
          <div className="flex items-start gap-2">
            <IconTarget className="h-3.5 w-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/80">
              <span className="font-semibold text-purple-700">
                {lang === "en" ? "Action for you:" : "Hành động cho bạn:"}
              </span>{" "}
              {insight.recommendedAction[lang]}
            </p>
          </div>
        </div>
      )}

      {/* Privacy note */}
      <p className="text-[10px] text-muted-foreground">
        {lang === "en"
          ? "✓ This insight is based on your profile but stays private. Your choices are not tracked."
          : "✓ Hiểu biết này dựa trên hồ sơ của bạn nhưng vẫn riêng tư. Các lựa chọn của bạn không được theo dõi."}
      </p>
    </div>
  )
}

interface PersonalInsight {
  personalMessage: { en: string; vi: string }
  recommendedAction: { en: string; vi: string } | null
  relevanceLevel: "high" | "medium" | "low"
}

function generatePersonalizedInsight(
  profile: any,
  updateTopic: string,
  updateTitle: string,
  lang: "en" | "vi"
): PersonalInsight | null {
  const insights: Record<string, PersonalInsight> = {
    kyc_node_operator: {
      personalMessage: {
        en: `As a Node Operator, this KYC update is essential for your network participation. Completing identity verification unlocks validator access.`,
        vi: `Là một Nhà Điều Hành Node, cập nhật KYC này rất quan trọng cho sự tham gia mạng của bạn. Hoàn thành xác minh danh tính mở khóa quyền truy cập xác thực.`,
      },
      recommendedAction: {
        en: `Complete your KYC verification to begin node operator registration`,
        vi: `Hoàn thành xác minh KYC của bạn để bắt đầu đăng ký nhà điều hành node`,
      },
      relevanceLevel: "high",
    },
    mainnet_developer: {
      personalMessage: {
        en: `For App Studio developers, this mainnet migration update signals when your applications can move to production.`,
        vi: `Đối với các nhà phát triển App Studio, cập nhật di chuyển mainnet này báo hiệu khi ứng dụng của bạn có thể chuyển sang sản xuất.`,
      },
      recommendedAction: {
        en: `Review mainnet requirements and begin preparing your App Studio projects`,
        vi: `Xem xét các yêu cầu mainnet và bắt đầu chuẩn bị các dự án App Studio của bạn`,
      },
      relevanceLevel: "high",
    },
    wallet_beginner: {
      personalMessage: {
        en: `As a new explorer, understanding wallet capabilities helps you secure and manage your Pi safely.`,
        vi: `Là một nhà thám phá mới, việc hiểu các khả năng ví giúp bạn bảo mật và quản lý Pi của mình một cách an toàn.`,
      },
      recommendedAction: {
        en: `Create your wallet and practice with small transactions`,
        vi: `Tạo ví của bạn và thực hành với các giao dịch nhỏ`,
      },
      relevanceLevel: "high",
    },
    node_intermediate_developer: {
      personalMessage: {
        en: `This node infrastructure update is critical for your development environment as you build sophisticated applications.`,
        vi: `Cập nhật cơ sở hạ tầng nút này rất quan trọng cho môi trường phát triển của bạn khi bạn xây dựng các ứng dụng phức tạp.`,
      },
      recommendedAction: {
        en: `Set up a local node for testing before deploying to mainnet`,
        vi: `Thiết lập một nút cục bộ để kiểm tra trước khi triển khai lên mainnet`,
      },
      relevanceLevel: "high",
    },
  }

  // Generate key based on profile
  const isNodeOp = profile.isNodeOperator
  const isDev = profile.isDeveloper
  const appStudioLevel = profile.appStudioExperience
  const walletStatus = profile.walletStatus

  let key = ""
  if (updateTopic === "kyc" && isNodeOp) {
    key = "kyc_node_operator"
  } else if (updateTopic === "mainnet" && isDev) {
    key = "mainnet_developer"
  } else if (updateTopic === "wallet" && appStudioLevel === "beginner") {
    key = "wallet_beginner"
  } else if (updateTopic === "nodes" && appStudioLevel === "intermediate" && isDev) {
    key = "node_intermediate_developer"
  }

  return key ? insights[key] : null
}
