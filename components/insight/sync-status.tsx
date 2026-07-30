import { useInsight } from "@/contexts/insight-context"
import { formatLastSync } from "@/lib/insight/sync"
import { cx } from "./ui"
import { IconRefresh, IconAlertCircle, IconCheckCircle } from "./icons"

export function SyncStatus() {
  const { syncStatus, syncUpdates, lang, t, newUpdatesCount } = useInsight()

  const lastSyncDisplay = syncStatus.lastSyncAt
    ? formatLastSync(syncStatus.lastSyncAt, lang)
    : t("neverSynced")

  return (
    <div className="space-y-2 border-t border-border/40 pt-3">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {syncStatus.isSyncing ? (
            <div className="h-3 w-3 rounded-full bg-primary pi-blink" />
          ) : syncStatus.syncError ? (
            <IconAlertCircle className="h-4 w-4 text-destructive" />
          ) : (
            <IconCheckCircle className="h-4 w-4 text-success" />
          )}
          <span className="text-xs text-muted-foreground">
            {syncStatus.isSyncing
              ? t("syncing")
              : `${t("lastSync")}: ${lastSyncDisplay}`}
          </span>
        </div>
        <button
          onClick={() => syncUpdates(true)}
          disabled={syncStatus.isSyncing}
          className="pi-press -mr-2 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconRefresh className={cx("h-3 w-3", syncStatus.isSyncing && "pi-spin")} />
          <span className="hidden sm:inline">{t("syncNow")}</span>
        </button>
      </div>

      {newUpdatesCount > 0 && (
        <div className="px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs font-medium text-primary">
            {newUpdatesCount} {newUpdatesCount === 1 ? t("newUpdate") : t("newUpdates")} {t("available")}
          </p>
        </div>
      )}

      {syncStatus.syncError && (
        <div className="px-4 py-2 rounded-lg bg-destructive/5 border border-destructive/20">
          <p className="text-xs text-destructive">{t("officialDataOutdated")}</p>
        </div>
      )}
    </div>
  )
}
