"use client";

import { useRouter } from "next/navigation";
import { CreateOrgWizard, type CreateOrgData } from "@/components/create-org-wizard";
import { useDataStore } from "@/stores/data-store";

export default function OnboardingPage() {
  const router = useRouter();
  const updateOrgSettings = useDataStore((s) => s.updateOrgSettings);

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

  return (
    <div className="mx-auto w-full max-w-5xl">
      <CreateOrgWizard onComplete={handleComplete} onCancel={handleCancel} />
    </div>
  );
}
