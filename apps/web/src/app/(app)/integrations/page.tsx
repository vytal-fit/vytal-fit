"use client";

import { useState } from "react";
import {
  PhoneCall,
  UserPlus,
  CalendarCheck,
  Gift,
  CreditCard,
  CalendarDays,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Code,
  Palette,
  Globe,
  Layers,
  ExternalLink,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { useDataStore } from "@/stores/data-store";
import { cn } from "@/lib/utils";

interface IntegrationForm {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  embedCode: string;
  previewFields: string[];
}

export default function IntegrationsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const orgSettings = useDataStore((s) => s.orgSettings);

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    contact: true,
    registration: true,
    trial: true,
    voucher: false,
    membership: false,
    class_sale: false,
    custom: false,
  });

  const integrations: IntegrationForm[] = [
    {
      id: "contact",
      title: "Contact / Callback Request",
      description: "Capture leads from your website with a simple contact form.",
      icon: PhoneCall,
      active: toggleStates.contact,
      embedCode: `<iframe src="https://vytal.fit/${orgSettings.slug}/embed/contact" width="100%" height="500" frameborder="0"></iframe>`,
      previewFields: ["Name", "Email", "Phone", "Message"],
    },
    {
      id: "registration",
      title: "New Member Registration",
      description: "Let visitors register directly on your website.",
      icon: UserPlus,
      active: toggleStates.registration,
      embedCode: `<iframe src="https://vytal.fit/${orgSettings.slug}/embed/register" width="100%" height="600" frameborder="0"></iframe>`,
      previewFields: ["Name", "Email", "Phone", "Date of Birth", "Emergency Contact"],
    },
    {
      id: "trial",
      title: "Trial Class Booking",
      description: "Visitors book a trial class directly from your website.",
      icon: CalendarCheck,
      active: toggleStates.trial,
      embedCode: `<iframe src="https://vytal.fit/${orgSettings.slug}/embed/trial" width="100%" height="550" frameborder="0"></iframe>`,
      previewFields: ["Name", "Email", "Phone", "Preferred Date", "Class Type"],
    },
    {
      id: "voucher",
      title: "Voucher Pack Sales",
      description: "Sell voucher packs online through your website.",
      icon: Gift,
      active: toggleStates.voucher,
      embedCode: `<iframe src="https://vytal.fit/${orgSettings.slug}/embed/vouchers" width="100%" height="500" frameborder="0"></iframe>`,
      previewFields: ["Pack Selection", "Quantity", "Recipient Name", "Payment"],
    },
    {
      id: "membership",
      title: "Membership Plan Sales",
      description: "Sell membership plans on your website.",
      icon: CreditCard,
      active: toggleStates.membership,
      embedCode: `<iframe src="https://vytal.fit/${orgSettings.slug}/embed/plans" width="100%" height="600" frameborder="0"></iframe>`,
      previewFields: ["Plan Selection", "Personal Info", "Payment Method"],
    },
    {
      id: "class_sale",
      title: "Class / Service Sales",
      description: "Sell individual classes or services online.",
      icon: CalendarDays,
      active: toggleStates.class_sale,
      embedCode: `<iframe src="https://vytal.fit/${orgSettings.slug}/embed/classes" width="100%" height="550" frameborder="0"></iframe>`,
      previewFields: ["Class Selection", "Date & Time", "Name", "Payment"],
    },
    {
      id: "custom",
      title: "Custom Form",
      description: "Build a custom form for any purpose.",
      icon: FileText,
      active: toggleStates.custom,
      embedCode: `<iframe src="https://vytal.fit/${orgSettings.slug}/embed/custom" width="100%" height="500" frameborder="0"></iframe>`,
      previewFields: ["Custom Field 1", "Custom Field 2", "Custom Field 3"],
    },
  ];

  function handleToggle(id: string) {
    setToggleStates((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleCopy(id: string, code: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast("Embed code copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("nav.settings"), href: "/settings" }, { label: "Integrations" }]} />

      <div>
        <h1 className="text-2xl font-bold text-vytal-text">Site Integrations</h1>
        <p className="mt-1 text-sm text-vytal-muted">
          Embed forms on your website to capture leads, sell plans, and let visitors book classes.
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 rounded-xl border border-vytal-border bg-vytal-card p-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-vytal-green" />
          <span className="text-sm text-vytal-muted">
            <span className="font-semibold text-vytal-text">{Object.values(toggleStates).filter(Boolean).length}</span> / {integrations.length} active
          </span>
        </div>
        <div className="h-4 w-px bg-vytal-border" />
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-vytal-blue" />
          <span className="text-sm text-vytal-muted">
            Domain: <span className="font-mono text-vytal-text">vytal.fit/{orgSettings.slug}</span>
          </span>
        </div>
      </div>

      {/* Integration cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((form) => {
          const Icon = form.icon;
          const isExpanded = expandedCard === form.id;

          return (
            <div
              key={form.id}
              className={cn(
                "rounded-xl border bg-vytal-card transition-all duration-200",
                isExpanded
                  ? "border-vytal-green/30 md:col-span-2 xl:col-span-3"
                  : "border-vytal-border hover:border-vytal-green/20"
              )}
            >
              {/* Card header */}
              <div className="flex items-start gap-4 p-5">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  form.active ? "bg-vytal-green/10 text-vytal-green" : "bg-vytal-bg3 text-vytal-muted"
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-vytal-text">{form.title}</h3>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      form.active
                        ? "bg-vytal-green/10 text-vytal-green"
                        : "bg-vytal-bg3 text-vytal-muted"
                    )}>
                      {form.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-vytal-muted">{form.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(form.id)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      form.active ? "bg-vytal-green" : "bg-vytal-bg3"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      form.active ? "left-[22px]" : "left-0.5"
                    )} />
                  </button>

                  {/* Expand */}
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : form.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-vytal-border p-5 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Embed code */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Code className="h-4 w-4 text-vytal-green" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-vytal-muted">Embed Code</h4>
                      </div>
                      <div className="relative rounded-lg border border-vytal-border bg-vytal-bg2 p-4">
                        <code className="block text-xs text-vytal-text font-mono break-all whitespace-pre-wrap">
                          {form.embedCode}
                        </code>
                        <button
                          onClick={() => handleCopy(form.id, form.embedCode)}
                          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-vytal-bg3 px-3 py-1.5 text-xs text-vytal-muted transition-colors hover:bg-vytal-green/10 hover:text-vytal-green"
                        >
                          {copiedId === form.id ? (
                            <><Check className="h-3 w-3" /> Copied</>
                          ) : (
                            <><Copy className="h-3 w-3" /> Copy</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="h-4 w-4 text-vytal-blue" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-vytal-muted">Form Preview</h4>
                      </div>
                      <div className="rounded-lg border border-vytal-border bg-vytal-bg2 p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-vytal-green/10 text-xs font-bold text-vytal-green">
                            {orgSettings.name.charAt(0)}
                          </div>
                          <span className="text-xs font-semibold text-vytal-text">{orgSettings.name}</span>
                        </div>
                        {form.previewFields.map((field) => (
                          <div key={field}>
                            <label className="mb-1 block text-[10px] font-medium text-vytal-muted">{field}</label>
                            <div className="h-8 rounded-md border border-vytal-border bg-vytal-bg3" />
                          </div>
                        ))}
                        <div className="h-8 rounded-md bg-vytal-green/20 flex items-center justify-center text-[10px] font-bold text-vytal-green">
                          Submit
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customization options */}
                  <div className="rounded-lg border border-vytal-border bg-vytal-bg2 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Palette className="h-4 w-4 text-vytal-purple" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-vytal-muted">Customization</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium text-vytal-muted">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-md bg-vytal-green border border-vytal-border" />
                          <span className="font-mono text-xs text-vytal-text">#22c55e</span>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium text-vytal-muted">Language</label>
                        <select className="w-full rounded-lg border border-vytal-border bg-vytal-bg3 px-3 py-2 text-xs text-vytal-text outline-none">
                          <option>Portuguese</option>
                          <option>English</option>
                          <option>Spanish</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium text-vytal-muted">Required Fields</label>
                        <select className="w-full rounded-lg border border-vytal-border bg-vytal-bg3 px-3 py-2 text-xs text-vytal-text outline-none">
                          <option>Default</option>
                          <option>All fields</option>
                          <option>Minimal</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Link to preview */}
                  <div className="flex items-center gap-3">
                    <a
                      href="/integrations"
                      onClick={(e) => { e.preventDefault(); toast("Preview would open in a new tab", "info"); }}
                      className="flex items-center gap-2 text-xs text-vytal-green transition-colors hover:text-vytal-green/80"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Preview form in new tab
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
