"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { usePiAuth } from "@/contexts/pi-auth-context"
import {
  PREFS_KEY,
  CHAT_KEY,
  CHAT_CAP,
  PROFILE_KEY,
  ACTIONS_KEY,
  DEFAULT_PREFS,
  sanitizePrefs,
  prefsToBlob,
  sanitizeMessages,
  messagesToBlob,
  uid,
  defaultProfile,
  sanitizeProfile,
  profileToBlob,
  generateNextActions,
  buildProfileContext,
  type Lang,
  type Prefs,
  type ChatMessage,
  type Toast,
  type UpdateReadStatus,
  type SyncStatus,
  type PiProfile,
  type NextAction,
} from "@/lib/insight/data"
import { DEFAULT_SYNC_STATE } from "@/lib/insight/sync"
import { makeT, type TFn } from "@/lib/insight/i18n"

interface InsightContextType {
  ready: boolean
  lang: Lang
  t: TFn
  setLang: (lang: Lang) => void
  bookmarks: string[]
  isBookmarked: (id: string) => boolean
  toggleBookmark: (id: string) => void
  messages: ChatMessage[]
  isStreaming: boolean
  streamingText: string
  sendMessage: (text: string) => void
  clearChat: () => void
  storageNotice: boolean
  toasts: Toast[]
  pushToast: (message: string, tone?: Toast["tone"]) => void
  dismissToast: (id: string) => void
  syncStatus: SyncStatus
  syncUpdates: () => Promise<void>
  markUpdateAsRead: (id: string) => void
  newUpdatesCount: number
  profile: PiProfile
  updateProfile: (updates: Partial<PiProfile>) => void
  nextActions: NextAction[]
  completeAction: (id: string) => void
}

const InsightContext = createContext<InsightContextType | undefined>(undefined)

// In-memory fallback when the Pi SDK is not available (e.g. App Studio preview iframe).
const memStore = new Map<string, Record<string, unknown>>()

export function InsightProvider({ children }: { children: ReactNode }) {
  const { sdk, isAuthenticated } = usePiAuth()

  const [ready, setReady] = useState(false)
  const [lang, setLangState] = useState<Lang>("en")
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncAt: null,
    isSyncing: false,
    syncError: null,
    newUpdateCount: 0,
  })
  const [readUpdates, setReadUpdates] = useState<Set<string>>(new Set())
  const [profile, setProfile] = useState<PiProfile>(defaultProfile())
  const [nextActions, setNextActions] = useState<NextAction[]>([])
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const profileRef = useRef<PiProfile>(defaultProfile())
  const actionsRef = useRef<NextAction[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [storageNotice, setStorageNotice] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const prefsRef = useRef<Prefs>({ ...DEFAULT_PREFS })
  const messagesRef = useRef<ChatMessage[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const t = makeT(lang)

  /* ---------- toasts ---------- */
  const pushToast = useCallback((message: string, tone: Toast["tone"] = "default") => {
    const id = uid()
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, 2600)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  /* ---------- storage primitives ---------- */
  const readKey = useCallback(
    async (key: string): Promise<Record<string, unknown> | null> => {
      if (!sdk) return memStore.get(key) ?? null
      try {
        const record = await sdk.state.get(key)
        return record?.blob ?? null
      } catch {
        return memStore.get(key) ?? null
      }
    },
    [sdk],
  )

  // Per-key debounced saver with backoff on rejection.
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({})
  const backoff = useRef<Record<string, number>>({})

  const writeNow = useCallback(
    async (key: string, blob: Record<string, unknown>) => {
      memStore.set(key, blob)
      if (!sdk) return
      try {
        await sdk.state.set(key, blob)
        backoff.current[key] = 0
        setStorageNotice(false)
      } catch {
        setStorageNotice(true)
        const next = Math.min((backoff.current[key] || 1500) * 1.8, 30000)
        backoff.current[key] = next
        window.clearTimeout(saveTimers.current[key])
        saveTimers.current[key] = setTimeout(() => {
          void writeNow(key, blob)
        }, next)
      }
    },
    [sdk],
  )

  const scheduleSave = useCallback(
    (key: string, blob: Record<string, unknown>) => {
      memStore.set(key, blob)
      window.clearTimeout(saveTimers.current[key])
      saveTimers.current[key] = setTimeout(() => {
        void writeNow(key, blob)
      }, 1300)
    },
    [writeNow],
  )

  /* ---------- initial load ---------- */
  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    ;(async () => {
      const [prefsBlob, chatBlob, profileBlob, actionsBlob] = await Promise.all([
        readKey(PREFS_KEY),
        readKey(CHAT_KEY),
        readKey(PROFILE_KEY),
        readKey(ACTIONS_KEY),
      ])
      if (cancelled) return
      const prefs = sanitizePrefs(prefsBlob)
      prefsRef.current = prefs
      setLangState(prefs.lang)
      setBookmarks(prefs.bookmarks)
      const msgs = sanitizeMessages(chatBlob)
      messagesRef.current = msgs
      setMessages(msgs)
      const prof = sanitizeProfile(profileBlob)
      profileRef.current = prof
      setProfile(prof)
      const actions = generateNextActions(prof, prefs.lang)
      actionsRef.current = actions
      setNextActions(actions)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, readKey])

  /* ---------- flush on hide ---------- */
  useEffect(() => {
    const flush = () => {
      void writeNow(PREFS_KEY, prefsToBlob(prefsRef.current))
      void writeNow(CHAT_KEY, messagesToBlob(messagesRef.current))
      void writeNow(PROFILE_KEY, profileToBlob(profileRef.current))
      void writeNow(ACTIONS_KEY, { items: actionsRef.current })
    }
    const onHide = () => {
      if (document.visibilityState === "hidden") flush()
    }
    window.addEventListener("pagehide", flush)
    document.addEventListener("visibilitychange", onHide)
    return () => {
      window.removeEventListener("pagehide", flush)
      document.removeEventListener("visibilitychange", onHide)
    }
  }, [writeNow])

  /* ---------- prefs mutations ---------- */
  const persistPrefs = useCallback(
    (immediate = false) => {
      const blob = prefsToBlob(prefsRef.current)
      if (immediate) void writeNow(PREFS_KEY, blob)
      else scheduleSave(PREFS_KEY, blob)
    },
    [scheduleSave, writeNow],
  )

  const setLang = useCallback(
    (next: Lang) => {
      prefsRef.current = { ...prefsRef.current, lang: next }
      setLangState(next)
      persistPrefs(true)
    },
    [persistPrefs],
  )

  const isBookmarked = useCallback((id: string) => bookmarks.includes(id), [bookmarks])

  const toggleBookmark = useCallback(
    (id: string) => {
      const has = prefsRef.current.bookmarks.includes(id)
      const nextBookmarks = has
        ? prefsRef.current.bookmarks.filter((x) => x !== id)
        : [id, ...prefsRef.current.bookmarks]
      prefsRef.current = { ...prefsRef.current, bookmarks: nextBookmarks }
      setBookmarks(nextBookmarks)
      persistPrefs(true)
      pushToast(has ? t("bookmarkRemoved") : t("bookmarkAdded"), has ? "default" : "success")
    },
    [persistPrefs, pushToast, t],
  )

  /* ---------- chat ---------- */
  const persistChat = useCallback(
    (immediate = false) => {
      const blob = messagesToBlob(messagesRef.current)
      if (immediate) void writeNow(CHAT_KEY, blob)
      else scheduleSave(CHAT_KEY, blob)
    },
    [scheduleSave, writeNow],
  )

  const clearChat = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
    setStreamingText("")
    messagesRef.current = []
    setMessages([])
    persistChat(true)
  }, [persistChat])

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        at: Date.now(),
      }
      const nextMessages = [...messagesRef.current, userMsg].slice(-CHAT_CAP)
      messagesRef.current = nextMessages
      setMessages(nextMessages)
      persistChat(true)

      setIsStreaming(true)
      setStreamingText("")

      const controller = new AbortController()
      abortRef.current = controller

      ;(async () => {
        try {
          const res = await fetch("/api/advisor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lang: prefsRef.current.lang,
              messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
            }),
            signal: controller.signal,
          })

          if (!res.ok || !res.body) throw new Error("bad response")

          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let acc = ""
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            acc += decoder.decode(value, { stream: true })
            setStreamingText(acc)
          }

          const finalText = acc.trim() || t("advisorError")
          const assistantMsg: ChatMessage = {
            id: uid(),
            role: "assistant",
            content: finalText,
            at: Date.now(),
          }
          const withReply = [...messagesRef.current, assistantMsg].slice(-CHAT_CAP)
          messagesRef.current = withReply
          setMessages(withReply)
          persistChat(true)
        } catch (err) {
          if ((err as Error).name === "AbortError") return
          const assistantMsg: ChatMessage = {
            id: uid(),
            role: "assistant",
            content: t("advisorError"),
            at: Date.now(),
          }
          const withReply = [...messagesRef.current, assistantMsg].slice(-CHAT_CAP)
          messagesRef.current = withReply
          setMessages(withReply)
          persistChat(true)
        } finally {
          setIsStreaming(false)
          setStreamingText("")
          abortRef.current = null
        }
      })()
    },
    [isStreaming, persistChat, t],
  )

  /* ---------- profile management ---------- */
  const updateProfile = useCallback(
    (updates: Partial<PiProfile>) => {
      const updated: PiProfile = {
        ...profileRef.current,
        ...updates,
        updatedAt: Date.now(),
      }
      profileRef.current = updated
      setProfile(updated)
      
      // Regenerate next actions
      const actions = generateNextActions(updated, lang)
      actionsRef.current = actions
      setNextActions(actions)
      
      // Save to storage
      if (sdk?.userState?.set) {
        void sdk.userState.set(PROFILE_KEY, profileToBlob(updated))
      } else {
        memStore.set(PROFILE_KEY, profileToBlob(updated))
      }
    },
    [lang, sdk]
  )

  const completeAction = useCallback((id: string) => {
    const action = actionsRef.current.find((a) => a.id === id)
    if (!action) return
    
    const updated = {
      ...action,
      completed: true,
      completedAt: Date.now(),
    }
    
    actionsRef.current = actionsRef.current.map((a) => (a.id === id ? updated : a))
    setNextActions([...actionsRef.current])
    
    if (sdk?.userState?.set) {
      void sdk.userState.set(ACTIONS_KEY, { items: actionsRef.current })
    } else {
      memStore.set(ACTIONS_KEY, { items: actionsRef.current })
    }
    
    pushToast(
      lang === "vi" ? "Hoàn tất hành động" : "Action completed",
      "success"
    )
  }, [lang, sdk, pushToast])

  /* ---------- sync updates ---------- */
  const syncUpdates = useCallback(
    async (force = false) => {
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: true,
        syncError: null,
      }))

      try {
        const url = `/api/sync-updates?lang=${lang}${force ? "&force=true" : ""}`
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`Sync failed with status ${response.status}`)
        }

        const data = await response.json()
        
        if (data.ok && data.updates && Array.isArray(data.updates)) {
          // Count new updates (those not yet read)
          const newCount = (data.updates as Array<{ id?: string }>).filter(
            (u) => u.id && !readUpdates.has(u.id)
          ).length

          setSyncStatus((prev) => ({
            ...prev,
            lastSyncAt: data.syncedAt,
            isSyncing: false,
            newUpdateCount: newCount,
          }))

          if (newCount > 0) {
            pushToast(
              lang === "vi"
                ? `${newCount} cập nhật mới từ Pi Network`
                : `${newCount} new update${newCount > 1 ? "s" : ""} from Pi Network`,
              "success"
            )
          }
        } else {
          throw new Error(data.error || "Invalid sync response")
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to sync updates"
        setSyncStatus((prev) => ({
          ...prev,
          isSyncing: false,
          syncError: errorMsg,
        }))

        pushToast(
          lang === "vi"
            ? `Lỗi đồng bộ: ${errorMsg}`
            : `Sync error: ${errorMsg}`,
          "warning"
        )
      }
    },
    [lang, readUpdates, pushToast]
  )

  const markUpdateAsRead = useCallback((id: string) => {
    setReadUpdates((prev) => {
      const updated = new Set(prev)
      updated.add(id)
      return updated
    })
    setSyncStatus((prev) => ({
      ...prev,
      newUpdateCount: Math.max(0, prev.newUpdateCount - 1),
    }))
  }, [])

  // Auto-sync on mount and periodically
  useEffect(() => {
    if (!ready) return

    // Initial sync
    void syncUpdates(false)

    // Sync every 30 minutes
    syncIntervalRef.current = setInterval(() => {
      void syncUpdates(false)
    }, 30 * 60 * 1000)

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [ready, syncUpdates])

  const value: InsightContextType = {
    ready,
    lang,
    t,
    setLang,
    bookmarks,
    isBookmarked,
    toggleBookmark,
    messages,
    isStreaming,
    streamingText,
    sendMessage,
    clearChat,
    storageNotice,
    toasts,
    pushToast,
    dismissToast,
    syncStatus,
    syncUpdates,
    markUpdateAsRead,
    newUpdatesCount: syncStatus.newUpdateCount,
    profile,
    updateProfile,
    nextActions,
    completeAction,
  }

  return <InsightContext.Provider value={value}>{children}</InsightContext.Provider>
}

export function useInsight() {
  const ctx = useContext(InsightContext)
  if (!ctx) throw new Error("useInsight must be used within an InsightProvider")
  return ctx
}
