"use client"

import { useState } from "react"
import { cx } from "./ui"
import { 
  KNOWLEDGE_GRAPH_NODES,
  type Lang,
  type AILearningPath,
} from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"
import { 
  IconSparkle,
  IconCheckCircle,
  IconChevronRight,
  IconClock,
  IconBook
} from "./icons"

interface AILearningPathProps {
  lang: Lang
  t: TFn
}

// Predefined learning paths for different user types
const LEARNING_PATHS: AILearningPath[] = [
  {
    userType: "beginner",
    path: ["kyc", "wallet", "mainnet", "app-studio"],
    reasoning: {
      en: "Start with identity (KYC) and wallet basics, then understand mainnet and App Studio for ecosystem engagement",
      vi: "Bắt đầu với danh tính (KYC) và kiến thức ví cơ bản, sau đó hiểu mainnet và App Studio để tham gia hệ sinh thái"
    },
    estimatedTime: 2,
    description: {
      en: "Perfect for new Pioneers - Learn the essentials in 2 hours",
      vi: "Hoàn hảo cho Pioneers mới - Tìm hiểu những điều cần thiết trong 2 giờ"
    }
  },
  {
    userType: "developer",
    path: ["app-studio", "smart-contracts", "api-design", "kyb"],
    reasoning: {
      en: "Focus on App Studio for building, smart contracts for logic, API design for integration, and KYB for business features",
      vi: "Tập trung vào App Studio để xây dựng, smart contracts cho logic, thiết kế API để tích hợp, và KYB cho các tính năng kinh doanh"
    },
    estimatedTime: 4,
    description: {
      en: "For developers - Build on Pi in 4 hours",
      vi: "Dành cho nhà phát triển - Xây dựng trên Pi trong 4 giờ"
    }
  },
  {
    userType: "business",
    path: ["kyb", "compliance", "wallet", "mainnet"],
    reasoning: {
      en: "Begin with business verification (KYB), understand compliance requirements, then explore wallet and mainnet for operations",
      vi: "Bắt đầu với xác minh kinh doanh (KYB), hiểu các yêu cầu tuân thủ, sau đó khám phá ví và mainnet để hoạt động"
    },
    estimatedTime: 3,
    description: {
      en: "For businesses - Set up on Pi in 3 hours",
      vi: "Dành cho doanh nghiệp - Cài đặt trên Pi trong 3 giờ"
    }
  }
]

export function AILearningPath({ lang, t }: AILearningPathProps) {
  const [selectedPath, setSelectedPath] = useState<"beginner" | "developer" | "business">("beginner")
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set())

  const currentPath = LEARNING_PATHS.find(p => p.userType === selectedPath)!
  const pathTopics = currentPath.path.map(id => KNOWLEDGE_GRAPH_NODES.find(n => n.id === id)).filter(Boolean)

  const toggleTopic = (topicId: string) => {
    const newCompleted = new Set(completedTopics)
    if (newCompleted.has(topicId)) {
      newCompleted.delete(topicId)
    } else {
      newCompleted.add(topicId)
    }
    setCompletedTopics(newCompleted)
  }

  const completionPercent = Math.round((completedTopics.size / pathTopics.length) * 100)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <IconSparkle className="h-5 w-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">
          {lang === "en" ? "AI Learning Paths" : "Đường Dẫn Học Tập AI"}
        </h2>
      </div>

      {/* Path Selector */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: "beginner", label: lang === "en" ? "Beginner" : "Người mới bắt đầu", time: "2h" },
          { id: "developer", label: lang === "en" ? "Developer" : "Nhà phát triển", time: "4h" },
          { id: "business", label: lang === "en" ? "Business" : "Kinh doanh", time: "3h" },
        ].map((path) => (
          <button
            key={path.id}
            onClick={() => {
              setSelectedPath(path.id as any)
              setCompletedTopics(new Set())
            }}
            className={cx(
              "pi-press rounded-lg border-2 p-3 text-center transition-all",
              selectedPath === path.id
                ? "border-primary bg-primary/10"
                : "border-border/50 bg-card/50 hover:border-primary/50"
            )}
          >
            <p className="text-xs font-semibold text-foreground">{path.label}</p>
            <div className="flex items-center justify-center gap-1 mt-1.5 text-[9px] text-muted-foreground">
              <IconClock className="h-3 w-3" />
              {path.time}
            </div>
          </button>
        ))}
      </div>

      {/* Current Path Details */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
            {lang === "en" ? "Learning Path" : "Đường dẫn học tập"}
          </p>
          <h3 className="text-sm font-bold text-foreground">{currentPath.description[lang]}</h3>
          <p className="text-xs text-foreground/70 mt-1.5">{currentPath.reasoning[lang]}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-3 border-t border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {lang === "en" ? "Progress" : "Tiến độ"}
            </span>
            <span className="text-xs font-bold text-primary">{completionPercent}%</span>
          </div>
          <div className="h-2.5 bg-border/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Learning Steps */}
        <div className="space-y-2 pt-3 border-t border-primary/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {lang === "en" ? "Recommended Order" : "Thứ tự được khuyến nghị"}
          </p>
          <div className="space-y-2">
            {pathTopics.map((topic, idx) => {
              const isCompleted = completedTopics.has(topic!.id)
              return (
                <button
                  key={topic!.id}
                  onClick={() => toggleTopic(topic!.id)}
                  className={cx(
                    "pi-press w-full rounded-lg border p-3 text-left transition-all",
                    isCompleted
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-border/50 bg-background/50 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cx(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0",
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? <IconCheckCircle className="h-4 w-4" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cx(
                        "text-sm font-semibold",
                        isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                      )}>
                        {topic!.label[lang]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {topic!.description[lang]}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[9px] text-muted-foreground">
                        <IconBook className="h-3 w-3" />
                        {topic!.updateCount} {lang === "en" ? "updates" : "cập nhật"}
                        <span className="text-primary font-bold">{topic!.importanceScore}/10</span>
                      </div>
                    </div>
                    <IconChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Completion Message */}
        {completionPercent === 100 && (
          <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-3">
            <p className="text-sm font-semibold text-emerald-700">
              {lang === "en" ? "Congratulations! You've completed this learning path." : "Xin chúc mừng! Bạn đã hoàn thành đường dẫn học tập này."}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              {lang === "en" ? "Explore other topics in the Knowledge Brain to deepen your understanding." : "Khám phá các chủ đề khác trong Bộ Não Kiến Thức để hiểu sâu hơn."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
