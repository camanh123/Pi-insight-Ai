"use client"

import { useState } from "react"
import { useInsight } from "@/contexts/insight-context"
import { cx } from "./ui"
import { IconCheck, IconClose } from "./icons"
import type { Lang, PiProfile } from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"

export function ProfileEditor({
  onClose,
}: {
  onClose: () => void
}) {
  const { profile, updateProfile, lang, t } = useInsight()
  const [name, setName] = useState(profile.displayName)
  const [kyc, setKyc] = useState(profile.kycStatus)
  const [mainnet, setMainnet] = useState(profile.mainnetStatus)
  const [isNode, setIsNode] = useState(profile.isNodeOperator)
  const [isDev, setIsDev] = useState(profile.isDeveloper)
  const [isBusiness, setIsBusiness] = useState(profile.isBusinessUser)
  const [appExp, setAppExp] = useState(profile.appStudioExperience)
  const [wallet, setWallet] = useState(profile.walletStatus)

  const handleSave = () => {
    updateProfile({
      displayName: name,
      kycStatus: kyc as any,
      mainnetStatus: mainnet as any,
      isNodeOperator: isNode,
      isDeveloper: isDev,
      isBusinessUser: isBusiness,
      appStudioExperience: appExp as any,
      walletStatus: wallet as any,
      shareProfileWithAdvisor: true,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 pi-fade-in">
      <div className="w-full rounded-t-2xl border-t border-border bg-background p-4 sm:m-auto sm:max-w-md sm:rounded-2xl sm:border">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{t("piProfile")}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground">{t("displayName")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pioneer"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* KYC Status */}
          <div>
            <label className="block text-sm font-medium text-foreground">{t("kycStatus")}</label>
            <select
              value={kyc}
              onChange={(e) => setKyc(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Mainnet Status */}
          <div>
            <label className="block text-sm font-medium text-foreground">{t("mainnetStatus")}</label>
            <select
              value={mainnet}
              onChange={(e) => setMainnet(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="not-started">Not Started</option>
              <option value="eligible">Eligible</option>
              <option value="migrated">Migrated</option>
            </select>
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t("roles")}</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isNode}
                  onChange={(e) => setIsNode(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">{t("nodeOperator")}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isDev}
                  onChange={(e) => setIsDev(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">{t("developer")}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isBusiness}
                  onChange={(e) => setIsBusiness(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">{t("businessUser")}</span>
              </label>
            </div>
          </div>

          {/* App Studio */}
          <div>
            <label className="block text-sm font-medium text-foreground">{t("appStudioExperience")}</label>
            <select
              value={appExp}
              onChange={(e) => setAppExp(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="none">None</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Wallet */}
          <div>
            <label className="block text-sm font-medium text-foreground">{t("walletStatus")}</label>
            <select
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="none">None</option>
              <option value="created">Created</option>
              <option value="funded">Funded</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-card/80"
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("save") || "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}
