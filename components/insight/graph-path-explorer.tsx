"use client"

import { useState } from "react"
import { AI_LEARNING_PATHS, type Topic } from "@/lib/insight/data"
import type { Lang } from "@/lib/insight/data"
import { cx } from "./ui"
import { IconSparkle, IconChevronRight } from "./icons"

interface GraphPathExplorerProps {
  lang: Lang
  onSelectPath?: (path: Topic[]) => void
}

export function GraphPathExplorer({ lang, onSelectPath }: GraphPathExplorerProps) {
  const [selectedPath, setSelectedPath] = useState<"beginner" | "developer" | "business" | null>(null)

  const pathTypeLabels = {
    beginner: { en: "For Beginners", vi: "Cho người mới bắt đầu" },
    developer: { en: "For Developers", vi: "Cho nhà phát triển" },
    business: { en: "For Businesses", vi: "Cho doanh nghiệp" },
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <IconSparkle className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-foreground">AI Learning Path Explorer</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {lang === "en"
            ? "Get personalized recommendations on what to learn first based on your goals."
            : "Nhận được khuyến nghị cá nhân hóa về những gì nên học trước tiên dựa trên mục tiêu của bạn."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {AI_LEARNING_PATHS.map((path) => (
          <button
            key={path.userType}
            onClick={() => {
              setSelectedPath(path.userType)
              onSelectPath?.(path.path)
            }}
            className={cx(
              "rounded-lg border-2 p-4 text-left transition-all",
              selectedPath === path.userType
                ? "border-purple-600 bg-purple-50 dark:bg-purple-950/30"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <p className="text-sm font-semibold text-foreground">{pathTypeLabels[path.userType][lang]}</p>
            <p className="text-xs text-muted-foreground mt-2">{path.description[lang]}</p>
            <p className="text-xs text-muted-foreground mt-2">⏱ {path.estimatedTime} {lang === "en" ? "hours" : "giờ"}</p>
          </button>
        ))}
      </div>

      {selectedPath && (
        <div className="rounded-lg border border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/30 p-4 space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {lang === "en" ? "Your Learning Path:" : "Đường dẫn học tập của bạn:"}
            </p>
            <div className="space-y-2">
              {AI_LEARNING_PATHS.find((p) => p.userType === selectedPath)?.path.map((topic, i) => (
                <div key={topic} className="flex items-center gap-2 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="font-medium text-foreground capitalize">{topic}</span>
                  {i < (AI_LEARNING_PATHS.find((p) => p.userType === selectedPath)?.path.length || 0) - 1 && (
                    <IconChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">
            {AI_LEARNING_PATHS.find((p) => p.userType === selectedPath)?.reasoning[lang]}
          </p>
        </div>
      )}
    </div>
  )
}
