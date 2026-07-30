"use client"

import { useMemo, useState } from "react"
import { useInsight } from "@/contexts/insight-context"
import { cx } from "./ui"
import { UpdateCard } from "./update-card"
import { LangToggle } from "./lang-toggle"
import { SyncStatus } from "./sync-status"
import { Dashboard } from "./dashboard"
import { KnowledgeGraph } from "./knowledge-graph"
import { TopicDetail } from "./topic-detail"
import { DailyBriefing } from "./daily-briefing"
import { CompareUpdates } from "./compare-updates"
import { sortedUpdates, TOPICS, type Topic } from "@/lib/insight/data"
import { IconPi } from "./icons"

export function HomeView({ onOpen, onViewTimeline }: { onOpen: (id: string) => void; onViewTimeline?: () => void }) {
  const { lang, t } = useInsight()
  const [filter, setFilter] = useState<Topic | "all">("all")
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [showCompare, setShowCompare] = useState(false)

  const updates = useMemo(() => {
    const all = sortedUpdates()
    return filter === "all" ? all : all.filter((u) => u.topic === filter)
  }, [filter])

  return (
    <div className="mx-auto max-w-md">
      {/* header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur pi-safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <IconPi className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold leading-none text-foreground">{t("appName")}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{t("tagline")}</p>
            </div>
          </div>
          <LangToggle />
        </div>

        {/* topic filter */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 pi-no-scrollbar">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            {t("filterAll")}
          </FilterChip>
          {TOPICS.map((topic) => (
            <FilterChip
              key={topic.id}
              active={filter === topic.id}
              onClick={() => setFilter(topic.id)}
            >
              {topic.label[lang]}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* feed */}
      <div className="px-4 py-4">
        {/* Daily Briefing */}
        <div className="mb-6 pb-6 border-b border-border">
          <DailyBriefing />
        </div>

        {/* Dashboard */}
        <div className="mb-6 pb-6 border-b border-border">
          <Dashboard lang={lang} t={t} />
        </div>

        {/* Timeline Evolution */}
        {onViewTimeline && (
          <div className="mb-6 pb-6 border-b border-border">
            <button
              onClick={onViewTimeline}
              className="pi-press w-full rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-left hover:from-primary/15 hover:to-primary/10"
            >
              <h2 className="mb-2 text-base font-bold text-primary">
                {lang === "en" ? "Pi's Evolution" : "Tiến hóa của Pi"}
              </h2>
              <p className="text-sm text-foreground/80 text-pretty">
                {lang === "en"
                  ? "See how each update shaped Pi Network's journey from a closed experiment to a connected blockchain."
                  : "Xem cách mỗi cập nhật định hình hành trình của Pi từ một thử nghiệm khép kín thành một blockchain kết nối."}
              </p>
              <p className="mt-3 text-xs font-medium text-primary">
                {lang === "en" ? "View Timeline →" : "Xem Dòng thời gian →"}
              </p>
            </button>
          </div>
        )}

        {/* Knowledge Graph */}
        <div className="mb-6 pb-6 border-b border-border">
          <h2 className="mb-4 text-lg font-bold text-foreground">
            {lang === "en" ? "Pi Knowledge Graph" : "Đồ thị kiến thức Pi"}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground text-pretty">
            {lang === "en"
              ? "Explore how Pi Network topics connect and relate to each other. Tap any topic to see dependencies and official updates."
              : "Khám phá cách các chủ đề mạng Pi kết nối và liên quan đến nhau. Nhấn vào bất kỳ chủ đề nào để xem phụ thuộc và cập nhật chính thức."}
          </p>
          <KnowledgeGraph lang={lang} onSelectTopic={setSelectedTopic} selectedTopic={selectedTopic} />
        </div>

        {/* Compare Updates Button */}
        <div className="mb-6 pb-6 border-b border-border">
          <button
            onClick={() => setShowCompare(true)}
            className="pi-press w-full rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-left hover:from-primary/15 hover:to-primary/10"
          >
            <h2 className="mb-2 text-base font-bold text-primary">
              {lang === "en" ? "Compare Updates" : "So sánh cập nhật"}
            </h2>
            <p className="text-sm text-foreground/80 text-pretty">
              {lang === "en"
                ? "Select any two updates to see differences, similarities, and ecosystem impact side by side."
                : "Chọn bất kỳ hai cập nhật nào để xem sự khác biệt, điểm giống nhau và tác động của hệ sinh thái."}
            </p>
            <p className="mt-3 text-xs font-medium text-primary">
              {lang === "en" ? "Start Comparison →" : "Bắt đầu so sánh →"}
            </p>
          </button>
        </div>

        {/* Updates Section */}
        <div className="mb-3">
          <h2 className="text-lg font-bold text-foreground">{t("recentUpdates")}</h2>
          <p className="text-sm text-muted-foreground text-pretty">{t("recentUpdatesSub")}</p>
        </div>
        <div className="space-y-3">
          {updates.map((u) => (
            <UpdateCard key={u.id} update={u} lang={lang} t={t} onOpen={() => onOpen(u.id)} />
          ))}
        </div>

        {/* sync status footer */}
        <div className="mt-6">
          <SyncStatus />
        </div>
      </div>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <div onClick={() => setSelectedTopic(null)}>
          <TopicDetail
            topicId={selectedTopic}
            lang={lang}
            onClose={() => setSelectedTopic(null)}
            onSelectUpdate={onOpen}
          />
        </div>
      )}

      {/* Compare Updates Modal */}
      {showCompare && <CompareUpdates onClose={() => setShowCompare(false)} lang={lang} t={t} />}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "pi-press shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-muted-foreground",
      )}
    >
      {children}
    </button>
  )
}
