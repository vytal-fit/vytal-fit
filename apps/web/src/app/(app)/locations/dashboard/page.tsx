"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Users,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  members: number;
  classesToday: number;
  revenueThisMonth: number;
  occupancy: number;
  status: "active" | "inactive";
}

// ---------------------------------------------------------------------------
// Mock locations
// ---------------------------------------------------------------------------

const mockLocations: Location[] = [
  {
    id: "loc-1",
    name: "CrossFit Aveiro",
    address: "Rua da Liberdade 45, 3800-123 Aveiro",
    city: "Aveiro",
    members: 187,
    classesToday: 8,
    revenueThisMonth: 14250,
    occupancy: 78,
    status: "active",
  },
  {
    id: "loc-2",
    name: "CrossFit Porto",
    address: "Av. da Boavista 1200, 4100-130 Porto",
    city: "Porto",
    members: 243,
    classesToday: 12,
    revenueThisMonth: 19800,
    occupancy: 85,
    status: "active",
  },
  {
    id: "loc-3",
    name: "CrossFit Lisboa",
    address: "Rua Augusta 78, 1100-053 Lisboa",
    city: "Lisboa",
    members: 312,
    classesToday: 14,
    revenueThisMonth: 26400,
    occupancy: 91,
    status: "active",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(value);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MultiLocationDashboardPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [locations] = useState<Location[]>(mockLocations);

  // Aggregate stats
  const totalMembers = useMemo(() => locations.reduce((sum, l) => sum + l.members, 0), [locations]);
  const totalRevenue = useMemo(() => locations.reduce((sum, l) => sum + l.revenueThisMonth, 0), [locations]);
  const avgOccupancy = useMemo(
    () => Math.round(locations.reduce((sum, l) => sum + l.occupancy, 0) / locations.length),
    [locations]
  );
  const bestPerforming = useMemo(
    () => locations.reduce((best, l) => (l.revenueThisMonth > best.revenueThisMonth ? l : best), locations[0]),
    [locations]
  );

  // Chart data -- max values for bar scaling
  const maxMembers = useMemo(() => Math.max(...locations.map((l) => l.members)), [locations]);
  const maxRevenue = useMemo(() => Math.max(...locations.map((l) => l.revenueThisMonth)), [locations]);
  const maxOccupancy = 100;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("nav.locations"), href: "/locations" }, { label: t("locations.dashboard.title") }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-vytal-text">{t("locations.dashboard.title")}</h1>
          <span className="flex h-7 items-center rounded-full bg-vytal-green/10 px-3 text-xs font-semibold text-vytal-green">
            {locations.length} {t("locations.dashboard.locations")}
          </span>
        </div>
        <button
          onClick={() => toast(t("locations.dashboard.addLocationToast"), "success")}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("locations.dashboard.addLocation")}
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: t("locations.dashboard.totalMembers"), value: totalMembers.toString(), icon: Users, color: "text-vytal-blue" },
          { label: t("locations.dashboard.combinedRevenue"), value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-vytal-green" },
          { label: t("locations.dashboard.avgOccupancy"), value: `${avgOccupancy}%`, icon: Activity, color: "text-vytal-amber" },
          { label: t("locations.dashboard.bestPerforming"), value: bestPerforming.name, icon: TrendingUp, color: "text-vytal-purple" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-vytal-border bg-vytal-bg2 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-vytal-muted">{stat.label}</p>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </div>
            <p className={cn("mt-1 text-xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-3 gap-4">
        {locations.map((location) => (
          <div
            key={location.id}
            className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5 transition-colors hover:border-vytal-green/20"
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-vytal-green" />
                  <h3 className="text-base font-semibold text-vytal-text">{location.name}</h3>
                </div>
                <p className="mt-1 text-xs text-vytal-muted">{location.address}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  location.status === "active"
                    ? "bg-vytal-green/10 text-vytal-green"
                    : "bg-vytal-red/10 text-vytal-red"
                )}
              >
                {location.status === "active" ? t("locations.dashboard.active") : t("locations.dashboard.inactive")}
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-vytal-bg3 p-3">
                <p className="text-[10px] text-vytal-muted uppercase tracking-wider">{t("locations.dashboard.members")}</p>
                <p className="mt-0.5 text-lg font-bold text-vytal-text">{location.members}</p>
              </div>
              <div className="rounded-lg bg-vytal-bg3 p-3">
                <p className="text-[10px] text-vytal-muted uppercase tracking-wider">{t("locations.dashboard.classesToday")}</p>
                <p className="mt-0.5 text-lg font-bold text-vytal-text">{location.classesToday}</p>
              </div>
              <div className="rounded-lg bg-vytal-bg3 p-3">
                <p className="text-[10px] text-vytal-muted uppercase tracking-wider">{t("locations.dashboard.revenue")}</p>
                <p className="mt-0.5 text-lg font-bold text-vytal-green">{formatCurrency(location.revenueThisMonth)}</p>
              </div>
              <div className="rounded-lg bg-vytal-bg3 p-3">
                <p className="text-[10px] text-vytal-muted uppercase tracking-wider">{t("locations.dashboard.occupancy")}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className={cn("text-lg font-bold", location.occupancy >= 85 ? "text-vytal-green" : location.occupancy >= 60 ? "text-vytal-amber" : "text-vytal-red")}>
                    {location.occupancy}%
                  </p>
                  <div className="flex-1 rounded-full bg-vytal-bg h-1.5">
                    <div
                      className={cn("h-1.5 rounded-full", location.occupancy >= 85 ? "bg-vytal-green" : location.occupancy >= 60 ? "bg-vytal-amber" : "bg-vytal-red")}
                      style={{ width: `${location.occupancy}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Charts */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
        <h2 className="mb-4 text-base font-semibold text-vytal-text">{t("locations.dashboard.comparison")}</h2>
        <div className="grid grid-cols-3 gap-6">
          {/* Members comparison */}
          <div>
            <p className="mb-3 text-xs font-medium text-vytal-muted uppercase tracking-wider">{t("locations.dashboard.memberComparison")}</p>
            <div className="space-y-2">
              {locations.map((loc) => (
                <div key={loc.id} className="flex items-center gap-3">
                  <span className="w-20 truncate text-xs text-vytal-text">{loc.city}</span>
                  <div className="flex-1 rounded-full bg-vytal-bg3 h-5">
                    <div
                      className="h-5 rounded-full bg-vytal-blue/60 flex items-center justify-end px-2"
                      style={{ width: `${(loc.members / maxMembers) * 100}%` }}
                    >
                      <span className="text-[10px] font-semibold text-white">{loc.members}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue comparison */}
          <div>
            <p className="mb-3 text-xs font-medium text-vytal-muted uppercase tracking-wider">{t("locations.dashboard.revenueComparison")}</p>
            <div className="space-y-2">
              {locations.map((loc) => (
                <div key={loc.id} className="flex items-center gap-3">
                  <span className="w-20 truncate text-xs text-vytal-text">{loc.city}</span>
                  <div className="flex-1 rounded-full bg-vytal-bg3 h-5">
                    <div
                      className="h-5 rounded-full bg-vytal-green/60 flex items-center justify-end px-2"
                      style={{ width: `${(loc.revenueThisMonth / maxRevenue) * 100}%` }}
                    >
                      <span className="text-[10px] font-semibold text-white">{formatCurrency(loc.revenueThisMonth)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Occupancy comparison */}
          <div>
            <p className="mb-3 text-xs font-medium text-vytal-muted uppercase tracking-wider">{t("locations.dashboard.occupancyComparison")}</p>
            <div className="space-y-2">
              {locations.map((loc) => (
                <div key={loc.id} className="flex items-center gap-3">
                  <span className="w-20 truncate text-xs text-vytal-text">{loc.city}</span>
                  <div className="flex-1 rounded-full bg-vytal-bg3 h-5">
                    <div
                      className={cn(
                        "h-5 rounded-full flex items-center justify-end px-2",
                        loc.occupancy >= 85 ? "bg-vytal-green/60" : loc.occupancy >= 60 ? "bg-vytal-amber/60" : "bg-vytal-red/60"
                      )}
                      style={{ width: `${(loc.occupancy / maxOccupancy) * 100}%` }}
                    >
                      <span className="text-[10px] font-semibold text-white">{loc.occupancy}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
