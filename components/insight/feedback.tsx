"use client"

import type { ReactNode } from "react"
import { useInsight } from "@/contexts/insight-context"
import { cx, Button } from "./ui"
import { IconSpinner, IconClose, IconCheck, IconWarning, IconPi } from "./icons"

export function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground pi-pop">
        <IconPi className="h-8 w-8" />
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <IconSpinner className="h-4 w-4 pi-spin" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}

export function StorageNotice({ message }: { message: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 pi-safe-bottom">
      <div className="pi-toast-in flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft px-4 py-2 text-xs font-medium text-gold-foreground shadow-sm">
        <IconWarning className="h-3.5 w-3.5" />
        <span>{message}</span>
      </div>
    </div>
  )
}

export function ToastHost() {
  const { toasts, dismissToast } = useInsight()
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 pi-safe-bottom">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => dismissToast(toast.id)}
          className={cx(
            "pi-toast-in pointer-events-auto flex max-w-xs items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg",
            toast.tone === "success" && "bg-primary text-primary-foreground",
            toast.tone === "warning" && "bg-gold text-gold-foreground",
            toast.tone === "default" && "bg-foreground text-background",
          )}
        >
          {toast.tone === "success" ? <IconCheck className="h-4 w-4" /> : null}
          <span className="text-left">{toast.message}</span>
        </button>
      ))}
    </div>
  )
}

export function ConfirmDialog({
  open,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pi-fade-in sm:items-center">
      <div className="pi-fade-up w-full max-w-md rounded-t-3xl border border-border bg-card p-5 sm:rounded-3xl">
        <p className="text-pretty text-sm text-foreground">{message}</p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Overlay({
  children,
  onClose,
  closeLabel,
}: {
  children: ReactNode
  onClose: () => void
  closeLabel: string
}) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background pi-fade-in">
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        <div className="flex-1 overflow-y-auto pi-no-scrollbar">{children}</div>
      </div>
      <span className="sr-only">
        <button onClick={onClose}>{closeLabel}</button>
      </span>
    </div>
  )
}
