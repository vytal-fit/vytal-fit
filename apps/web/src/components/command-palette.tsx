"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Users,
  CalendarDays,
  Dumbbell,
  UserPlus,
  CreditCard,
  Settings,
  TrendingUp,
  BarChart3,
  Heart,
  MessageCircle,
  MessageSquare,
  Zap,
  Globe,
  UserCog,
  Tag,
  MapPin,
  DollarSign,
  HelpCircle,
  Plus,
  Mail,
  Download,
} from "lucide-react";
import { mockMembers } from "@vytal-fit/shared";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommandItem {
  id: string;
  label: string;
  category: "pages" | "actions" | "members";
  icon: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Global keyboard listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  // Build items list
  const allItems = useMemo<CommandItem[]>(() => {
    const pages: CommandItem[] = [
      { id: "p-dashboard", label: "Dashboard", category: "pages", icon: <LayoutDashboard className="h-4 w-4" />, shortcut: "D", onSelect: () => navigate("/dashboard") },
      { id: "p-members", label: "Members", category: "pages", icon: <Users className="h-4 w-4" />, shortcut: "M", onSelect: () => navigate("/members") },
      { id: "p-classes", label: "Classes", category: "pages", icon: <CalendarDays className="h-4 w-4" />, onSelect: () => navigate("/classes") },
      { id: "p-wods", label: "WODs", category: "pages", icon: <Dumbbell className="h-4 w-4" />, onSelect: () => navigate("/wods") },
      { id: "p-crm", label: "CRM", category: "pages", icon: <UserPlus className="h-4 w-4" />, onSelect: () => navigate("/crm") },
      { id: "p-staff", label: "Staff", category: "pages", icon: <UserCog className="h-4 w-4" />, onSelect: () => navigate("/staff") },
      { id: "p-class-types", label: "Class Types", category: "pages", icon: <Tag className="h-4 w-4" />, onSelect: () => navigate("/class-types") },
      { id: "p-locations", label: "Locations", category: "pages", icon: <MapPin className="h-4 w-4" />, onSelect: () => navigate("/locations") },
      { id: "p-exercises", label: "Exercises", category: "pages", icon: <Dumbbell className="h-4 w-4" />, onSelect: () => navigate("/exercises") },
      { id: "p-plans", label: "Plans", category: "pages", icon: <CreditCard className="h-4 w-4" />, onSelect: () => navigate("/plans") },
      { id: "p-dropins", label: "Drop-ins", category: "pages", icon: <Globe className="h-4 w-4" />, onSelect: () => navigate("/dropins") },
      { id: "p-financials", label: "Financials", category: "pages", icon: <DollarSign className="h-4 w-4" />, onSelect: () => navigate("/financials") },
      { id: "p-analytics", label: "Analytics", category: "pages", icon: <TrendingUp className="h-4 w-4" />, onSelect: () => navigate("/analytics") },
      { id: "p-reports", label: "Reports", category: "pages", icon: <BarChart3 className="h-4 w-4" />, onSelect: () => navigate("/reports") },
      { id: "p-community", label: "Community", category: "pages", icon: <Heart className="h-4 w-4" />, onSelect: () => navigate("/community") },
      { id: "p-messages", label: "Messages", category: "pages", icon: <MessageCircle className="h-4 w-4" />, onSelect: () => navigate("/messages") },
      { id: "p-communications", label: "Communications", category: "pages", icon: <MessageSquare className="h-4 w-4" />, onSelect: () => navigate("/communications") },
      { id: "p-automations", label: "Automations", category: "pages", icon: <Zap className="h-4 w-4" />, onSelect: () => navigate("/automations") },
      { id: "p-settings", label: "Settings", category: "pages", icon: <Settings className="h-4 w-4" />, onSelect: () => navigate("/settings") },
      { id: "p-help", label: "Help", category: "pages", icon: <HelpCircle className="h-4 w-4" />, onSelect: () => navigate("/help") },
    ];

    const actions: CommandItem[] = [
      { id: "a-create-member", label: "Create Member", category: "actions", icon: <Plus className="h-4 w-4" />, onSelect: () => navigate("/members/import") },
      { id: "a-create-class", label: "Create Class", category: "actions", icon: <Plus className="h-4 w-4" />, onSelect: () => navigate("/classes/create") },
      { id: "a-create-wod", label: "Create WOD", category: "actions", icon: <Plus className="h-4 w-4" />, onSelect: () => navigate("/wods/create") },
      { id: "a-create-lead", label: "Create Lead", category: "actions", icon: <Plus className="h-4 w-4" />, onSelect: () => navigate("/crm") },
      { id: "a-send-email", label: "Send Email", category: "actions", icon: <Mail className="h-4 w-4" />, onSelect: () => navigate("/communications") },
      { id: "a-export-csv", label: "Export CSV", category: "actions", icon: <Download className="h-4 w-4" />, onSelect: () => navigate("/members") },
    ];

    const members: CommandItem[] = mockMembers.map((m) => ({
      id: `member-${m.id}`,
      label: m.name,
      category: "members" as const,
      icon: <Users className="h-4 w-4" />,
      onSelect: () => navigate(`/members/${m.id}`),
    }));

    return [...pages, ...actions, ...members];
  }, [navigate]);

  // Filter items
  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Show pages + actions, no members (unless searching)
      return allItems.filter((item) => item.category !== "members");
    }
    const q = query.toLowerCase();
    const results = allItems.filter((item) =>
      item.label.toLowerCase().includes(q)
    );
    // Limit members to 5
    const memberResults = results.filter((r) => r.category === "members").slice(0, 5);
    const otherResults = results.filter((r) => r.category !== "members");
    return [...otherResults, ...memberResults];
  }, [query, allItems]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: { category: string; label: string; items: CommandItem[] }[] = [];
    const categoryLabels: Record<string, string> = {
      pages: "Pages",
      actions: "Actions",
      members: "Members",
    };
    const order = ["pages", "actions", "members"];
    for (const cat of order) {
      const items = filtered.filter((i) => i.category === cat);
      if (items.length > 0) {
        groups.push({ category: cat, label: categoryLabels[cat], items });
      }
    }
    return groups;
  }, [filtered]);

  // Flat list for arrow navigation
  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  // Clamp active index
  useEffect(() => {
    if (activeIndex >= flatItems.length) {
      setActiveIndex(Math.max(0, flatItems.length - 1));
    }
  }, [activeIndex, flatItems.length]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flatItems[activeIndex]?.onSelect();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-vytal-border bg-vytal-bg2 shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95 duration-150"
        style={{ animation: "command-palette-in 0.15s ease-out both" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-vytal-border px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-vytal-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-vytal-text placeholder:text-vytal-muted/60 outline-none"
          />
          <kbd className="hidden rounded-md border border-vytal-border bg-vytal-bg3 px-1.5 py-0.5 text-[10px] font-semibold text-vytal-muted sm:block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {flatItems.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-vytal-muted">No results found.</p>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.category} className="mb-1">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-vytal-muted">
                {group.label}
              </p>
              {group.items.map((item) => {
                flatIndex += 1;
                const idx = flatIndex;
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    data-index={idx}
                    onClick={() => {
                      item.onSelect();
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-vytal-green/10 text-vytal-green"
                        : "text-vytal-text hover:bg-vytal-bg3"
                    )}
                  >
                    <span className={cn("shrink-0", isActive ? "text-vytal-green" : "text-vytal-muted")}>
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.shortcut && (
                      <kbd className="hidden rounded border border-vytal-border bg-vytal-bg3 px-1.5 py-0.5 text-[10px] font-medium text-vytal-muted sm:block">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-vytal-border px-4 py-2">
          <div className="flex items-center gap-3 text-[10px] text-vytal-muted">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-vytal-border bg-vytal-bg3 px-1 py-0.5 text-[9px]">&uarr;</kbd>
              <kbd className="rounded border border-vytal-border bg-vytal-bg3 px-1 py-0.5 text-[9px]">&darr;</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-vytal-border bg-vytal-bg3 px-1 py-0.5 text-[9px]">&crarr;</kbd>
              select
            </span>
          </div>
          <span className="text-[10px] text-vytal-muted">Vytal v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

/** Button to open the command palette from the top bar */
export function CommandPaletteButton() {
  return null; // The palette opens via keyboard; we add a trigger button in layout instead
}
