"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CreateOrgWizard, type CreateOrgData } from "@/components/create-org-wizard";
import { useDataStore } from "@/stores/data-store";
import { useAuthStore } from "@/stores/auth-store";
import { useI18n } from "@/lib/i18n";

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const updateOrgSettings = useDataStore((s) => s.updateOrgSettings);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    // Grace period for async session revalidation before deciding the user is
    // logged out (hydrate paints the cached snapshot synchronously first).
    const id = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(id);
  }, [hydrate]);

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace("/login");
  }, [ready, isAuthenticated, router]);

  function handleComplete(orgData: CreateOrgData) {
    updateOrgSettings({
      name: orgData.name,
      slug: orgData.slug,
      email: orgData.email,
      phone: orgData.phone,
      currency: orgData.currency,
      timezone: orgData.timezone,
      country: orgData.country,
      address: orgData.address,
      city: orgData.city,
      zipCode: orgData.zipCode,
      businessType: orgData.type,
    });
    router.push("/dashboard");
  }

  function handleCancel() {
    router.push("/dashboard");
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 py-16 text-vytal-muted">
        <Loader2 className="h-6 w-6 animate-spin text-vytal-green" />
        <span className="text-sm">{t("welcome.loading")}</span>
      </div>
    );
  }

  return (
    <CreateOrgWizard onComplete={handleComplete} onCancel={handleCancel} />
  );
}
