"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Bell,
  Globe,
  Palette,
  Building2,
  LogOut,
  Camera,
  Smartphone,
  Laptop,
  Tablet,
  Trash2,
  Download,
  Key,
  Eye,
  EyeOff,
  ChevronRight,
  Check,
  Save,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";
import { useI18n, type Language } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { ROLE_LABELS, ROLE_COLORS, ORGANIZATION_CONFIGS } from "@vytal-fit/shared";
import { CreateOrgWizard, type CreateOrgData } from "@/components/create-org-wizard";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useAppStore();
  const { language, setLanguage, t } = useI18n();

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "orgs" | "privacy">("profile");
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [name, setName] = useState(user?.user.name ?? "");
  const [email, setEmail] = useState(user?.user.email ?? "");
  const [phone, setPhone] = useState(user?.user.phone ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [show2fa, setShow2fa] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  const [notifications, setNotifications] = useState({
    classReminder: true,
    wodPublished: true,
    prAchieved: true,
    paymentSuccess: true,
    paymentFailed: true,
    streakMilestone: true,
    newMember: true,
    leadAssigned: true,
    bookingCancelled: true,
    atRiskMember: false,
    weeklyReport: true,
    monthlyReport: true,
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [
    { id: "profile" as const, label: t("profile.tab.profile"), icon: User },
    { id: "security" as const, label: t("profile.tab.security"), icon: Shield },
    { id: "notifications" as const, label: t("profile.tab.notifications"), icon: Bell },
    { id: "orgs" as const, label: t("profile.tab.orgs"), icon: Building2 },
    { id: "privacy" as const, label: t("profile.tab.privacy"), icon: Lock },
  ];

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("profile.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{t("profile.subtitle")}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-5 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          {t("action.save")}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-vytal-green/10 text-vytal-green"
                      : "text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Avatar */}
              <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-vytal-muted">{t("profile.photo")}</h2>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-vytal-green/10 text-2xl font-bold text-vytal-green">
                      {user?.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-vytal-text">{t("profile.uploadPhoto")}</p>
                    <p className="text-xs text-vytal-muted">{t("profile.photoHint")}</p>
                    <button className="mt-2 rounded-lg border border-vytal-border px-3 py-1.5 text-xs font-medium text-vytal-text transition-colors hover:bg-vytal-bg3">
                      {t("profile.chooseFile")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-vytal-muted">{t("profile.personalInfo")}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-vytal-muted">{t("profile.fullName")}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-4 text-sm text-vytal-text outline-none focus:border-vytal-green/40"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-vytal-muted">{t("auth.email")}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-4 text-sm text-vytal-text outline-none focus:border-vytal-green/40"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-vytal-muted">{t("auth.phone")}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-4 text-sm text-vytal-text outline-none focus:border-vytal-green/40"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-vytal-muted">{t("profile.language")}</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text outline-none focus:border-vytal-green/40"
                      >
                        <option value="pt">🇵🇹 Português</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="es">🇪🇸 Español</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-vytal-muted">{t("profile.theme")}</label>
                      <button
                        onClick={toggleTheme}
                        className="flex w-full items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2.5 text-sm text-vytal-text"
                      >
                        {theme === "dark" ? <Palette className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
                        {theme === "dark" ? t("profile.darkMode") : t("profile.lightMode")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-vytal-muted">{t("profile.changePassword")}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-vytal-muted">{t("profile.currentPassword")}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••••" className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-10 text-sm text-vytal-text outline-none focus:border-vytal-green/40" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-vytal-muted">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-vytal-muted">{t("profile.newPassword")}</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
                      <input type="password" placeholder={t("auth.minChars")} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-4 text-sm text-vytal-text outline-none focus:border-vytal-green/40" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-vytal-muted">{t("profile.confirmNewPassword")}</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
                      <input type="password" placeholder={t("auth.confirmPlaceholder")} className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2.5 pl-10 pr-4 text-sm text-vytal-text outline-none focus:border-vytal-green/40" />
                    </div>
                  </div>
                </div>
                <button className="mt-6 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg">{t("profile.changePasswordBtn")}</button>
              </div>

              <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-vytal-muted">{t("profile.2fa")}</h2>
                <p className="mb-4 text-sm text-vytal-muted">{t("profile.2faDesc")}</p>
                {!show2fa ? (
                  <button
                    onClick={() => setShow2fa(true)}
                    className="flex items-center gap-2 rounded-lg border border-vytal-green/30 px-4 py-2.5 text-sm font-medium text-vytal-green transition-colors hover:bg-vytal-green/10"
                  >
                    <Shield className="h-4 w-4" /> {t("profile.enable2fa")}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-vytal-border bg-vytal-bg2 p-6">
                      <p className="text-sm font-medium text-vytal-text">{t("profile.2faQrTitle")}</p>
                      <div className="flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-vytal-border bg-vytal-bg3">
                        <div className="grid grid-cols-5 gap-1">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} className={`h-5 w-5 rounded-sm ${Math.random() > 0.4 ? "bg-vytal-text" : "bg-transparent"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-vytal-muted">{t("profile.2faQrDesc")}</p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-vytal-muted">{t("profile.2faEnterCode")}</label>
                      <input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2.5 text-center font-mono text-lg tracking-[0.5em] text-vytal-text outline-none focus:border-vytal-green/40"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShow2fa(false); toast(t("profile.2faEnabled"), "success"); }}
                        className="rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
                      >
                        {t("profile.2faVerify")}
                      </button>
                      <button
                        onClick={() => setShow2fa(false)}
                        className="rounded-lg border border-vytal-border px-4 py-2.5 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
                      >
                        {t("profile.2faCancel")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-vytal-muted">{t("profile.activeSessions")}</h2>
                <div className="space-y-3">
                  {[
                    { device: "MacBook Pro — Chrome", location: "Aveiro, Portugal", current: true, time: t("profile.sessionNow"), icon: Laptop },
                    { device: "iPhone 15 — Safari", location: "Aveiro, Portugal", current: false, time: "2h", icon: Smartphone },
                    { device: "iPad — Chrome", location: "Porto, Portugal", current: false, time: "3d", icon: Tablet },
                  ].map((session, i) => {
                    const DeviceIcon = session.icon;
                    return (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-vytal-border bg-vytal-bg2 p-3">
                      <div className="flex items-center gap-3">
                        <DeviceIcon className="h-4 w-4 text-vytal-muted" />
                        <div>
                          <p className="text-sm text-vytal-text">{session.device}</p>
                          <p className="text-xs text-vytal-muted">{session.location} · {session.time}</p>
                        </div>
                      </div>
                      {session.current ? (
                        <span className="rounded-full bg-vytal-green/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-green">{t("profile.current")}</span>
                      ) : (
                        <button
                          onClick={() => toast(t("toast.sessionEnded"), "success")}
                          className="text-xs text-vytal-red hover:underline"
                        >
                          {t("profile.endSession")}
                        </button>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              {[
                {
                  title: t("profile.notifClassesTraining"),
                  items: [
                    { key: "classReminder" as const, label: t("profile.notif.classReminder"), desc: t("profile.notif.classReminderDesc") },
                    { key: "wodPublished" as const, label: t("profile.notif.wodPublished"), desc: t("profile.notif.wodPublishedDesc") },
                    { key: "prAchieved" as const, label: t("profile.notif.prAchieved"), desc: t("profile.notif.prAchievedDesc") },
                    { key: "bookingCancelled" as const, label: t("profile.notif.bookingCancelled"), desc: t("profile.notif.bookingCancelledDesc") },
                  ],
                },
                {
                  title: t("profile.notifPayments"),
                  items: [
                    { key: "paymentSuccess" as const, label: t("profile.notif.paymentSuccess"), desc: t("profile.notif.paymentSuccessDesc") },
                    { key: "paymentFailed" as const, label: t("profile.notif.paymentFailed"), desc: t("profile.notif.paymentFailedDesc") },
                  ],
                },
                {
                  title: t("profile.notifCommunity"),
                  items: [
                    { key: "streakMilestone" as const, label: t("profile.notif.streakMilestone"), desc: t("profile.notif.streakMilestoneDesc") },
                    { key: "newMember" as const, label: t("profile.notif.newMember"), desc: t("profile.notif.newMemberDesc") },
                    { key: "atRiskMember" as const, label: t("profile.notif.atRiskMember"), desc: t("profile.notif.atRiskMemberDesc") },
                  ],
                },
                {
                  title: t("profile.notifReports"),
                  items: [
                    { key: "weeklyReport" as const, label: t("profile.notif.weeklyReport"), desc: t("profile.notif.weeklyReportDesc") },
                    { key: "monthlyReport" as const, label: t("profile.notif.monthlyReport"), desc: t("profile.notif.monthlyReportDesc") },
                    { key: "leadAssigned" as const, label: t("profile.notif.leadAssigned"), desc: t("profile.notif.leadAssignedDesc") },
                  ],
                },
              ].map((section) => (
                <div key={section.title} className="rounded-xl border border-vytal-border bg-vytal-card p-6">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-vytal-muted">{section.title}</h2>
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-vytal-text">{item.label}</p>
                          <p className="text-xs text-vytal-muted">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications((n) => ({ ...n, [item.key]: !n[item.key] }))}
                          className={`relative h-6 w-11 rounded-full transition-colors ${notifications[item.key] ? "bg-vytal-green" : "bg-vytal-bg3"}`}
                        >
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifications[item.key] ? "left-[22px]" : "left-0.5"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Organizations Tab */}
          {activeTab === "orgs" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-vytal-muted">{t("profile.yourOrganizations")}</h2>
                <div className="space-y-3">
                  {(user?.memberships ?? []).map((mem) => {
                    const config = ORGANIZATION_CONFIGS[mem.organization.type];
                    const isActive = mem.organizationId === user?.activeOrganizationId;
                    return (
                      <div key={mem.id} className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${isActive ? "border-vytal-green/30 bg-vytal-green/5" : "border-vytal-border bg-vytal-bg2"}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-vytal-green/10 text-lg font-bold text-vytal-green">
                            {mem.organization.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-vytal-text">{mem.organization.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-semibold" style={{ color: ROLE_COLORS[mem.role] }}>{ROLE_LABELS[mem.role]}</span>
                              <span className="text-[10px] text-vytal-muted">· {config?.label}</span>
                              <span className="text-[10px] text-vytal-muted">· {t("profile.memberSince")} {new Date(mem.joinedAt).toLocaleDateString("pt-PT", { month: "short", year: "numeric" })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isActive && <span className="rounded-full bg-vytal-green/10 px-2 py-0.5 text-[10px] font-semibold text-vytal-green">{t("profile.active")}</span>}
                          <ChevronRight className="h-4 w-4 text-vytal-muted" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowCreateOrg(true)}
                  className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-vytal-border px-4 py-3 text-sm text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-green w-full justify-center"
                >
                  <Building2 className="h-4 w-4" /> {t("profile.createNewOrg")}
                </button>

                {/* Create Org Wizard Modal */}
                {showCreateOrg && (
                  <CreateOrgWizard
                    isModal
                    onComplete={(orgData: CreateOrgData) => {
                      setShowCreateOrg(false);
                      toast(t("toast.orgCreated").replace("{name}", orgData.name), "success");
                    }}
                    onCancel={() => setShowCreateOrg(false)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-vytal-border bg-vytal-card p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-vytal-muted">{t("profile.dataGdpr")}</h2>
                <p className="mb-4 text-sm text-vytal-muted">{t("profile.gdprDesc")}</p>
                <div className="space-y-3">
                  <button
                    onClick={() => toast(t("profile.exportPreparing"), "info")}
                    className="flex w-full items-center justify-between rounded-lg border border-vytal-border bg-vytal-bg2 p-3 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="h-4 w-4 text-vytal-muted" />
                      <div className="text-left">
                        <p>{t("profile.exportData")}</p>
                        <p className="text-xs text-vytal-muted">{t("profile.exportDataDesc")}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-vytal-muted" />
                  </button>
                  <button className="flex w-full items-center justify-between rounded-lg border border-vytal-border bg-vytal-bg2 p-3 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-vytal-muted" />
                      <div className="text-left">
                        <p>{t("profile.privacyPolicy")}</p>
                        <p className="text-xs text-vytal-muted">{t("profile.privacyPolicyDesc")}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-vytal-muted" />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-vytal-red/30 bg-vytal-red/5 p-6">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-vytal-red">{t("profile.dangerZone")}</h2>
                <p className="mb-4 text-sm text-vytal-muted">{t("profile.dangerZoneDesc")}</p>
                <div className="space-y-3">
                  <button
                    onClick={() => { logout(); }}
                    className="flex items-center gap-2 rounded-lg border border-vytal-red/30 px-4 py-2.5 text-sm font-medium text-vytal-red transition-colors hover:bg-vytal-red/10"
                  >
                    <LogOut className="h-4 w-4" /> {t("profile.endAllSessions")}
                  </button>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 rounded-lg border border-vytal-red/30 px-4 py-2.5 text-sm font-medium text-vytal-red transition-colors hover:bg-vytal-red/10"
                    >
                      <Trash2 className="h-4 w-4" /> {t("profile.deleteAccount")}
                    </button>
                  ) : (
                    <div className="space-y-3 rounded-lg border border-vytal-red/20 bg-vytal-red/5 p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-vytal-red" />
                        <p className="text-sm font-medium text-vytal-red">{t("profile.deleteAccountConfirm")}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            toast(t("toast.accountDeleted"), "error");
                            setShowDeleteConfirm(false);
                            logout();
                          }}
                          className="flex items-center gap-2 rounded-lg bg-vytal-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-vytal-red/90"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("profile.deleteAccountConfirmBtn")}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="rounded-lg border border-vytal-border px-4 py-2 text-sm text-vytal-text transition-colors hover:bg-vytal-bg3"
                        >
                          {t("action.cancel")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
