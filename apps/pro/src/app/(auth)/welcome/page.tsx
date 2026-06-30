"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogOut, Building2, Loader2 } from "lucide-react";
import { ROLE_LABELS } from "@vytal-fit/shared";
import { useI18n } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

/**
 * Post-login hub (`/welcome`): lists every gym (organization) the user belongs
 * to. Picking one sets it active and hard-navigates into the backoffice; the
 * dashed action creates a new gym via onboarding. With no gyms the user is sent
 * straight to onboarding. Mirrors kloser's `/welcome` agency hub, adapted to
 * Vytal's org = gym model (no per-org subdomains).
 */
export default function WelcomePage() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const switchOrg = useAuthStore((s) => s.switchOrg);
  const logout = useAuthStore((s) => s.logout);
  const hydrate = useAuthStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    // Grace period for the async session revalidation before deciding the user
    // is logged out (hydrate paints the cached snapshot synchronously first).
    const id = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(id);
  }, [hydrate]);

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace("/login");
  }, [ready, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.memberships.length === 0) {
      window.location.assign("/onboarding");
    }
  }, [isAuthenticated, user]);

  function openGym(orgId: string) {
    switchOrg(orgId);
    // Hard nav so the (app) shell re-initialises with the chosen active org.
    window.location.assign("/dashboard");
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 py-16 text-vytal-muted">
        <Loader2 className="h-6 w-6 animate-spin text-vytal-green" />
        <span className="text-sm">{t("welcome.loading")}</span>
      </div>
    );
  }

  const gyms = user.memberships;

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-2xl border border-vytal-border bg-vytal-card p-8 backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-vytal-text">
              {t("welcome.title")}
            </h1>
            <p className="mt-1 text-sm text-vytal-muted">{t("welcome.subtitle")}</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-vytal-muted transition-colors hover:text-vytal-text"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("welcome.signOut")}
          </button>
        </div>

        {gyms.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-vytal-border py-10 text-center text-vytal-muted">
            <Building2 className="h-8 w-8" />
            <p className="text-sm">{t("welcome.empty")}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {gyms.map((m) => {
              const active = m.organizationId === user.activeOrganizationId;
              return (
                <li key={m.organizationId}>
                  <button
                    onClick={() => openGym(m.organizationId)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                      active
                        ? "border-vytal-green/40 bg-vytal-green/5"
                        : "border-vytal-border bg-vytal-bg2 hover:border-vytal-green/30 hover:bg-vytal-bg3",
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-vytal-green/10 text-sm font-bold text-vytal-green">
                      {m.organization.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-vytal-text">
                        {m.organization.name}
                      </span>
                      <span className="block text-xs text-vytal-muted">
                        {ROLE_LABELS[m.role]}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <button
          onClick={() => window.location.assign("/onboarding")}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-vytal-border py-3 text-sm font-medium text-vytal-muted transition-colors hover:border-vytal-green/30 hover:text-vytal-text"
        >
          <Plus className="h-4 w-4" />
          {t("welcome.createGym")}
        </button>
      </div>
    </div>
  );
}
