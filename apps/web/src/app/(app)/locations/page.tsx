import { mockLocations } from "@vytal-fit/shared";
import { Plus, MapPin, Pencil } from "lucide-react";

export default function LocationsPage() {
  const locations = mockLocations;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">Locations</h1>
          <p className="mt-1 text-sm text-vytal-muted">
            Manage your training spaces
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90">
          <Plus className="h-4 w-4" />
          Add Location
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 rounded-lg border border-vytal-border bg-vytal-card px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vytal-blue/10">
          <MapPin className="h-4 w-4 text-vytal-blue" />
        </div>
        <div>
          <p className="text-lg font-bold text-vytal-text">
            {locations.length}
          </p>
          <p className="text-xs text-vytal-muted">Total Locations</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-vytal-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-vytal-border bg-vytal-bg2">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Capacity
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-vytal-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vytal-border">
            {locations.map((loc) => (
              <tr
                key={loc.id}
                className="bg-vytal-card transition-colors hover:bg-vytal-bg3"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-vytal-green" />
                    <span className="text-sm font-medium text-vytal-text">
                      {loc.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-vytal-muted">
                    {loc.capacity ?? "--"} pax
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-1.5 text-xs text-vytal-text transition-colors hover:bg-vytal-bg3">
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
