"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Shield, Save } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Permission = "view" | "edit" | "delete";
type Role = "owner" | "admin" | "coach" | "pt" | "athlete";

interface ModulePermissions {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

type PermissionMatrix = Record<string, Record<Role, ModulePermissions>>;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const modules = [
  "Dashboard",
  "Members",
  "Classes",
  "WODs",
  "CRM",
  "Financials",
  "Reports",
  "Communications",
  "Settings",
  "Community",
];

const roles: { key: Role; label: string }[] = [
  { key: "owner", label: "Owner" },
  { key: "admin", label: "Admin" },
  { key: "coach", label: "Coach" },
  { key: "pt", label: "PT" },
  { key: "athlete", label: "Athlete" },
];

const roleColors: Record<Role, string> = {
  owner: "text-vytal-amber",
  admin: "text-vytal-green",
  coach: "text-vytal-blue",
  pt: "text-vytal-purple",
  athlete: "text-vytal-muted",
};

// ---------------------------------------------------------------------------
// Default permissions
// ---------------------------------------------------------------------------

function getDefaultMatrix(): PermissionMatrix {
  const matrix: PermissionMatrix = {};

  for (const mod of modules) {
    matrix[mod] = {
      owner: { view: true, edit: true, delete: true },
      admin: { view: true, edit: true, delete: true },
      coach: { view: true, edit: true, delete: false },
      pt: { view: true, edit: false, delete: false },
      athlete: { view: true, edit: false, delete: false },
    };
  }

  // Coach specifics
  matrix["Financials"].coach = { view: false, edit: false, delete: false };
  matrix["Settings"].coach = { view: false, edit: false, delete: false };
  matrix["CRM"].coach = { view: true, edit: false, delete: false };

  // PT specifics
  matrix["CRM"].pt = { view: false, edit: false, delete: false };
  matrix["Financials"].pt = { view: false, edit: false, delete: false };
  matrix["Settings"].pt = { view: false, edit: false, delete: false };
  matrix["Reports"].pt = { view: false, edit: false, delete: false };
  matrix["Communications"].pt = { view: false, edit: false, delete: false };
  matrix["Members"].pt = { view: true, edit: true, delete: false };
  matrix["Classes"].pt = { view: true, edit: true, delete: false };

  // Athlete specifics
  matrix["CRM"].athlete = { view: false, edit: false, delete: false };
  matrix["Financials"].athlete = { view: false, edit: false, delete: false };
  matrix["Settings"].athlete = { view: false, edit: false, delete: false };
  matrix["Reports"].athlete = { view: false, edit: false, delete: false };
  matrix["Communications"].athlete = {
    view: false,
    edit: false,
    delete: false,
  };
  matrix["Members"].athlete = { view: false, edit: false, delete: false };

  return matrix;
}

// ---------------------------------------------------------------------------
// Toggle component
// ---------------------------------------------------------------------------

function PermissionToggle({
  enabled,
  locked,
  onChange,
  color,
}: {
  enabled: boolean;
  locked: boolean;
  onChange: () => void;
  color: "green" | "amber" | "red";
}) {
  const colors = {
    green: "bg-vytal-green",
    amber: "bg-vytal-amber",
    red: "bg-vytal-red",
  };
  return (
    <button
      onClick={locked ? undefined : onChange}
      disabled={locked}
      className={cn(
        "relative h-4 w-7 rounded-full transition-colors",
        enabled ? colors[color] : "bg-vytal-bg3",
        locked && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform",
          enabled ? "left-[13px]" : "left-0.5"
        )}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PermissionsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [matrix, setMatrix] = useState<PermissionMatrix>(getDefaultMatrix);

  const togglePermission = useCallback(
    (module: string, role: Role, permission: Permission) => {
      if (role === "owner") return; // Owner is always all-on
      setMatrix((prev) => ({
        ...prev,
        [module]: {
          ...prev[module],
          [role]: {
            ...prev[module][role],
            [permission]: !prev[module][role][permission],
          },
        },
      }));
    },
    []
  );

  function handleSave() {
    toast(t("permissions.saved"), "success");
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.settings"), href: "/settings" },
          { label: t("nav.permissions") },
        ]}
      />

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">
            {t("permissions.title")}
          </h1>
          <p className="mt-1 text-sm text-vytal-muted">
            {t("permissions.subtitle")}
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Save className="h-4 w-4" />
          {t("permissions.savePermissions")}
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-3 rounded-xl border border-vytal-blue/20 bg-vytal-blue/5 p-4">
        <Shield className="h-5 w-5 shrink-0 text-vytal-blue" />
        <p className="text-xs text-vytal-text">
          {t("permissions.info")}
        </p>
      </div>

      {/* Permission Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="border-b border-vytal-border bg-vytal-bg3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-vytal-muted">
                {t("permissions.module")}
              </th>
              {roles.map((role) => (
                <th
                  key={role.key}
                  className="border-b border-vytal-border bg-vytal-bg3 px-3 py-3 text-center"
                >
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      roleColors[role.key]
                    )}
                  >
                    {role.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => (
              <tr
                key={mod}
                className="border-b border-vytal-border transition-colors hover:bg-vytal-bg2"
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-vytal-text">
                    {mod}
                  </span>
                </td>
                {roles.map((role) => {
                  const perms = matrix[mod][role.key];
                  const isOwner = role.key === "owner";
                  return (
                    <td key={role.key} className="px-3 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <PermissionToggle
                            enabled={perms.view}
                            locked={isOwner}
                            onChange={() =>
                              togglePermission(mod, role.key, "view")
                            }
                            color="green"
                          />
                          <span className="text-[8px] uppercase tracking-wider text-vytal-muted">
                            {t("permissions.view")}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <PermissionToggle
                            enabled={perms.edit}
                            locked={isOwner}
                            onChange={() =>
                              togglePermission(mod, role.key, "edit")
                            }
                            color="amber"
                          />
                          <span className="text-[8px] uppercase tracking-wider text-vytal-muted">
                            {t("permissions.edit")}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <PermissionToggle
                            enabled={perms.delete}
                            locked={isOwner}
                            onChange={() =>
                              togglePermission(mod, role.key, "delete")
                            }
                            color="red"
                          />
                          <span className="text-[8px] uppercase tracking-wider text-vytal-muted">
                            {t("permissions.delete")}
                          </span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-vytal-border bg-vytal-card p-4">
        <span className="text-xs font-medium text-vytal-muted">
          {t("permissions.legend")}:
        </span>
        <div className="flex items-center gap-2">
          <div className="h-3 w-5 rounded-full bg-vytal-green" />
          <span className="text-xs text-vytal-text">
            {t("permissions.view")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-5 rounded-full bg-vytal-amber" />
          <span className="text-xs text-vytal-text">
            {t("permissions.edit")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-5 rounded-full bg-vytal-red" />
          <span className="text-xs text-vytal-text">
            {t("permissions.delete")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-5 rounded-full bg-vytal-bg3" />
          <span className="text-xs text-vytal-text">
            {t("permissions.disabled")}
          </span>
        </div>
      </div>
    </div>
  );
}
