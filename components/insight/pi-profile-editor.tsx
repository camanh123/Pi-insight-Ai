"use client"

import { useState } from "react"
import { useInsight } from "@/contexts/insight-context"
import { cx, Button } from "./ui"
import { IconCheckCircle, IconEdit, IconShield, IconCode } from "./icons"
import type { PiProfile, Lang } from "@/lib/insight/data"
import type { TFn } from "@/lib/insight/i18n"

interface PiProfileEditorProps {
  lang: Lang
  t: TFn
}

export function PiProfileEditor({ lang, t }: PiProfileEditorProps) {
  const { profile, updateProfile } = useInsight()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile.displayName)

  const handleSave = () => {
    updateProfile({
      displayName: displayName || "Pioneer",
    })
    setEditing(false)
  }

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
              {displayName?.[0]?.toUpperCase() || "P"}
            </div>
            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-2 py-1 rounded border border-border bg-background text-sm font-semibold"
                  placeholder={lang === "en" ? "Your name" : "Tên của bạn"}
                />
              ) : (
                <h3 className="font-bold text-foreground text-lg">{displayName || "Pioneer"}</h3>
              )}
              <p className="text-xs text-muted-foreground">
                {lang === "en" ? "Pi Network Pioneer" : "Tiên Phong Pi Network"}
              </p>
            </div>
          </div>
          {editing ? (
            <div className="flex gap-1">
              <Button onClick={handleSave} size="sm" variant="primary">
                {lang === "en" ? "Save" : "Lưu"}
              </Button>
              <Button onClick={() => setEditing(false)} size="sm" variant="ghost">
                {lang === "en" ? "Cancel" : "Hủy"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setEditing(true)} size="sm" variant="ghost">
              <IconEdit className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="flex gap-2 text-xs text-muted-foreground bg-background/50 rounded p-2">
          <IconShield className="h-3.5 w-3.5 flex-shrink-0 text-green-600 mt-0.5" />
          <span>
            {lang === "en"
              ? "Your profile is private by default. Enable sharing to get personalized advice."
              : "Hồ sơ của bạn riêng tư theo mặc định. Bật chia sẻ để nhận lời khuyên được cá nhân hóa."}
          </span>
        </div>
      </div>

      {/* Experience Sections */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground">
          {lang === "en" ? "Your Pi Experience" : "Kinh Nghiệm Pi Của Bạn"}
        </h4>

        {/* KYC Status */}
        <ExperienceCard
          title={lang === "en" ? "KYC (Identity)" : "KYC (Nhận Dạng)"}
          status={profile.kycStatus}
          options={["none", "approved", "verified"]}
          value={profile.kycStatus}
          onChange={(val) => updateProfile({ kycStatus: val as any })}
          lang={lang}
        />

        {/* Mainnet Status */}
        <ExperienceCard
          title={lang === "en" ? "Mainnet Migration" : "Di Chuyển Mainnet"}
          status={profile.mainnetStatus}
          options={["interested", "preparing", "migrated"]}
          value={profile.mainnetStatus}
          onChange={(val) => updateProfile({ mainnetStatus: val as any })}
          lang={lang}
        />

        {/* Wallet Status */}
        <ExperienceCard
          title={lang === "en" ? "Wallet" : "Ví"}
          status={profile.walletStatus}
          options={["none", "created", "funded"]}
          value={profile.walletStatus}
          onChange={(val) => updateProfile({ walletStatus: val as any })}
          lang={lang}
        />

        {/* Roles Checkboxes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded hover:bg-card/50 cursor-pointer" onClick={() => updateProfile({ isNodeOperator: !profile.isNodeOperator })}>
            <input type="checkbox" checked={profile.isNodeOperator} readOnly className="h-4 w-4 rounded" />
            <span className="text-sm text-foreground">{lang === "en" ? "Node Operator" : "Nhà Điều Hành Node"}</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded hover:bg-card/50 cursor-pointer" onClick={() => updateProfile({ isDeveloper: !profile.isDeveloper })}>
            <input type="checkbox" checked={profile.isDeveloper} readOnly className="h-4 w-4 rounded" />
            <span className="text-sm text-foreground flex items-center gap-2">
              <IconCode className="h-4 w-4" />
              {lang === "en" ? "Developer (App Studio)" : "Nhà Phát Triển (App Studio)"}
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded hover:bg-card/50 cursor-pointer" onClick={() => updateProfile({ isBusinessUser: !profile.isBusinessUser })}>
            <input type="checkbox" checked={profile.isBusinessUser} readOnly className="h-4 w-4 rounded" />
            <span className="text-sm text-foreground">{lang === "en" ? "Business User (KYB)" : "Người Dùng Kinh Doanh (KYB)"}</span>
          </div>
        </div>

        {/* App Studio Experience */}
        <ExperienceCard
          title={lang === "en" ? "App Studio Experience" : "Kinh Nghiệm App Studio"}
          status={profile.appStudioExperience}
          options={["none", "beginner", "intermediate", "advanced"]}
          value={profile.appStudioExperience}
          onChange={(val) => updateProfile({ appStudioExperience: val as any })}
          lang={lang}
        />
      </div>

      {/* Sharing Preference */}
      <div className="rounded-lg border border-green-200 bg-green-50/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">
              {lang === "en" ? "Share profile for personalized insights" : "Chia sẻ hồ sơ để có nhận xét được cá nhân hóa"}
            </span>
          </div>
          <input
            type="checkbox"
            checked={profile.shareProfileWithAdvisor}
            onChange={(e) => updateProfile({ shareProfileWithAdvisor: e.target.checked })}
            className="h-4 w-4 rounded"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {lang === "en"
            ? "When enabled, the AI Copilot will consider your experience level in recommendations."
            : "Khi bật, AI Copilot sẽ xem xét mức độ kinh nghiệm của bạn trong các gợi ý."}
        </p>
      </div>
    </div>
  )
}

function ExperienceCard({
  title,
  status,
  options,
  value,
  onChange,
  lang,
}: {
  title: string
  status: string
  options: string[]
  value: string
  onChange: (val: string) => void
  lang: "en" | "vi"
}) {
  const labels: Record<string, Record<string, string>> = {
    en: {
      none: "Not Started",
      approved: "KYC Approved",
      verified: "Verified",
      interested: "Interested",
      preparing: "Preparing",
      migrated: "Migrated",
      created: "Wallet Created",
      funded: "Wallet Funded",
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
    vi: {
      none: "Chưa Bắt Đầu",
      approved: "KYC Được Phê Duyệt",
      verified: "Được Xác Minh",
      interested: "Quan Tâm",
      preparing: "Đang Chuẩn Bị",
      migrated: "Đã Di Chuyển",
      created: "Ví Được Tạo",
      funded: "Ví Được Cấp Vốn",
      beginner: "Người Mới Bắt Đầu",
      intermediate: "Trung Gian",
      advanced: "Nâng Cao",
    },
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs font-semibold text-muted-foreground mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cx(
              "pi-press rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              value === opt
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background hover:bg-card/50 text-foreground"
            )}
          >
            {labels[lang][opt] || opt}
          </button>
        ))}
      </div>
    </div>
  )
}
