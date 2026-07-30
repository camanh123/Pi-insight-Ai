"use client"

import { useInsight } from "@/contexts/insight-context"
import { Card, IconButton } from "./ui"
import { IconBookmark, IconBookmarkFill, IconChevronRight } from "./icons"
import { ImportanceBadge, TopicPill, SourceLink } from "./parts"
import { NewBadge } from "./new-badge"
import type { Lang, PiUpdate } from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"

export function UpdateCard({
  update,
  lang,
  t,
  onOpen,
}: {
  update: PiUpdate
  lang: Lang
  t: TFn
  onOpen: () => void
}) {
  const { isBookmarked, toggleBookmark, markUpdateAsRead, newUpdatesCount } = useInsight()
  const bookmarked = isBookmarked(update.id)
  // Treat updates fetched today as new (this is a simple heuristic)
  const isNew = new Date(update.date).toDateString() === new Date().toDateString()

  return (
    <Card className="pi-fade-up overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30">
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TopicPill topic={update.topic} lang={lang} />
            <ImportanceBadge score={update.importance} size="sm" t={t} />
            {isNew && <NewBadge />}
          </div>
          <IconButton
            label={bookmarked ? t("removeSaved") : t("save")}
            onClick={(e) => {
              e.stopPropagation()
              toggleBookmark(update.id)
            }}
            className={bookmarked ? "h-9 w-9 text-primary" : "h-9 w-9"}
          >
            {bookmarked ? (
              <IconBookmarkFill className="h-[18px] w-[18px]" />
            ) : (
              <IconBookmark className="h-[18px] w-[18px]" />
            )}
          </IconButton>
        </div>

        <button
          onClick={() => {
            markUpdateAsRead(update.id)
            onOpen()
          }}
          className="block w-full text-left"
        >
          <h3 className="text-lg font-semibold leading-snug text-balance text-foreground">
            {update.title[lang]}
          </h3>
          <p className="pi-clamp-3 mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {update.summary[lang]}
          </p>
        </button>

        <div className="mt-3 flex items-center justify-between gap-3">
          <SourceLink update={update} lang={lang} t={t} />
          <button
            onClick={() => {
              markUpdateAsRead(update.id)
              onOpen()
            }}
            className="pi-press inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-1.5"
          >
            {t("readMore")}
            <IconChevronRight className="h-4 w-4 transition-transform" />
          </button>
        </div>
      </div>
    </Card>
  )
}
