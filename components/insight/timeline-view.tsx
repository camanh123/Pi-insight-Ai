"use client"

import { useInsight } from "@/contexts/insight-context"
import { IconBack } from "./icons"
import { IconButton } from "./ui"
import { TimelineExplorer } from "./timeline-explorer"

export function TimelineView({
  onBack,
  onOpenUpdate,
}: {
  onBack: () => void
  onOpenUpdate: (updateId: string) => void
}) {
  const { lang, t } = useInsight()

  return (
    <div className="fixed inset-0 z-40 bg-background pi-safe-bottom">
      {/* Fixed header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur pi-safe-top">
        <div className="mx-auto flex max-w-md items-center justify-between px-2 py-2">
          <IconButton label={t("back")} onClick={onBack}>
            <IconBack className="h-5 w-5" />
          </IconButton>
          <span className="text-sm font-semibold text-foreground">{t("piEvolution")}</span>
          <div className="w-10" />
        </div>
      </div>

      {/* Timeline content */}
      <div className="overflow-y-auto flex-1 pb-20 px-4 py-4">
        <TimelineExplorer lang={lang} t={t} onOpenUpdate={onOpenUpdate} onBack={onBack} />
      </div>
    </div>
  )
}
