"use client"

import { useState, useCallback } from "react"
import { InsightProvider, useInsight } from "@/contexts/insight-context"
import { LoadingScreen, StorageNotice, ToastHost } from "./feedback"
import { BottomNav } from "./bottom-nav"
import { HomeView } from "./home-view"
import { AdvisorView } from "./advisor-view"
import { SavedView } from "./saved-view"
import { UpdateDetail } from "./update-detail"
import { TimelineView } from "./timeline-view"
import { getUpdate, type TabId } from "@/lib/insight/data"

function AppInner() {
  const { ready, t, bookmarks, storageNotice } = useInsight()
  const [tab, setTab] = useState<TabId>("home")
  const [openId, setOpenId] = useState<string | null>(null)
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
  const [showTimeline, setShowTimeline] = useState(false)

  const openUpdate = useCallback((id: string) => {
    setOpenId(id)
    window.scrollTo({ top: 0 })
  }, [])

  const askQuestion = useCallback((question: string) => {
    setPendingQuestion(question)
    setOpenId(null)
    setTab("advisor")
  }, [])

  if (!ready) return <LoadingScreen label={t("loading")} />

  const openUpdateData = openId ? getUpdate(openId) : null

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Timeline Evolution View */}
      {showTimeline ? (
        <TimelineView
          onBack={() => setShowTimeline(false)}
          onOpenUpdate={openUpdate}
        />
      ) : null}

      {/* main tab content */}
      <div className={showTimeline || tab === "advisor" ? "" : "pb-20"}>
        {tab === "home" && !showTimeline ? <HomeView onOpen={openUpdate} onViewTimeline={() => setShowTimeline(true)} /> : null}
        {tab === "advisor" && !showTimeline ? (
          <AdvisorView
            pending={pendingQuestion}
            onPendingConsumed={() => setPendingQuestion(null)}
          />
        ) : null}
        {tab === "saved" && !showTimeline ? <SavedView onOpen={openUpdate} /> : null}
      </div>

      {/* update detail overlay */}
      {openUpdateData ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-background pi-fade-in">
          <UpdateDetail
            update={openUpdateData}
            onBack={() => setOpenId(null)}
            onOpenRelated={openUpdate}
            onAskQuestion={askQuestion}
          />
        </div>
      ) : null}

      {/* bottom nav hidden while detail or timeline is open */}
      {!openUpdateData && !showTimeline ? (
        <BottomNav active={tab} onChange={setTab} savedCount={bookmarks.length} t={t} />
      ) : null}

      {storageNotice ? <StorageNotice message={t("storageNotice")} /> : null}
      <ToastHost />
    </div>
  )
}

export function InsightApp() {
  return (
    <InsightProvider>
      <AppInner />
    </InsightProvider>
  )
}
