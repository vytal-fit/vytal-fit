"use client";

import { useDataStore } from "@/stores/data-store";
import { Plus, Dumbbell } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/empty-state";

export default function ClassTypesPage() {
  const { t } = useI18n();
  const classTypes = useDataStore((s) => s.classTypes);
  const updateClassType = useDataStore((s) => s.updateClassType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("classTypes.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("classTypes.subtitle")}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
          <Plus className="h-4 w-4" />
          {t("classTypes.addClassType")}
        </button>
      </div>

      {/* Table */}
      {classTypes.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={t("classTypes.noClassTypes")}
          description={t("classTypes.noClassTypesDesc")}
        />
      ) : (
      <div className="overflow-hidden rounded-xl border border-vytal-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Color
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Abbreviation
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted sm:table-cell">
                Icon
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vytal-border">
            {classTypes.map((ct) => (
              <tr
                key={ct.id}
                className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full border border-vytal-border"
                      style={{ backgroundColor: ct.color }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-vytal-text">
                  {ct.name}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-vytal-muted">
                  {ct.abbreviation}
                </td>
                <td className="hidden px-4 py-3 text-sm text-vytal-muted sm:table-cell">
                  {ct.icon || "--"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      onClick={() => updateClassType(ct.id, { active: !ct.active })}
                      className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${
                        ct.active ? "bg-vytal-green" : "bg-vytal-bg3"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          ct.active ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs ${ct.active ? "text-vytal-green" : "text-vytal-muted"}`}
                    >
                      {ct.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
