"use client"

import { useInsight } from "@/contexts/insight-context"
import { EmptyState } from "./ui"
import { UpdateCard } from "./update-card"
import { LangToggle } from "./lang-toggle"
import { IconInbox, IconBookmark } from "./icons"
import { getUpdate } from "@/lib/insight/data"

export function SavedView({ onOpen }: { onOpen: (id: string) => void }) {
  const { lang, t, bookmarks } = useInsight()
  const saved = bookmarks.map((id) => getUpdate(id)).filter((u): u is NonNullable<typeof u> => Boolean(u))

  return (
    <div className="mx-auto max-w-md">
      <div className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur pi-safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <IconBookmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold leading-none text-foreground">{t("savedTitle")}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{t("savedSub")}</p>
            </div>
          </div>
          <LangToggle />
        </div>
      </div>

      <div className="px-4 py-4">
        {saved.length === 0 ? (
          <EmptyState icon={<IconInbox className="h-6 w-6" />} title={t("noSaved")} hint={t("noSavedHint")} />
        ) : (
          <div className="space-y-3">
            {saved.map((u) => (
              <UpdateCard key={u.id} update={u} lang={lang} t={t} onOpen={() => onOpen(u.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
