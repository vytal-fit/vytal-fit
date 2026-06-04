"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  Search,
  FolderOpen,
  Download,
  Link2,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MediaType = "image" | "video" | "document";

interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  size: string;
  uploadedDate: string;
  uploadedBy: string;
  folder: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockMedia: MediaItem[] = [
  { id: "m-1", name: "Back Squat Tutorial", type: "video", size: "45 MB", uploadedDate: "2026-05-28", uploadedBy: "Andre", folder: "Exercises" },
  { id: "m-2", name: "Clean & Jerk Demo", type: "video", size: "62 MB", uploadedDate: "2026-05-25", uploadedBy: "Ricardo", folder: "Exercises" },
  { id: "m-3", name: "Deadlift Form Guide", type: "video", size: "38 MB", uploadedDate: "2026-05-20", uploadedBy: "Andre", folder: "Exercises" },
  { id: "m-4", name: "Snatch Progression", type: "video", size: "55 MB", uploadedDate: "2026-05-18", uploadedBy: "Ricardo", folder: "Exercises" },
  { id: "m-5", name: "Muscle-Up Tutorial", type: "video", size: "41 MB", uploadedDate: "2026-05-15", uploadedBy: "Andre", folder: "Exercises" },
  { id: "m-6", name: "Handstand Walk Drills", type: "video", size: "33 MB", uploadedDate: "2026-05-12", uploadedBy: "Marine", folder: "Exercises" },
  { id: "m-7", name: "Double Under Technique", type: "video", size: "28 MB", uploadedDate: "2026-05-10", uploadedBy: "Ricardo", folder: "Exercises" },
  { id: "m-8", name: "Thruster Breakdown", type: "video", size: "36 MB", uploadedDate: "2026-05-08", uploadedBy: "Andre", folder: "Exercises" },
  { id: "m-9", name: "Rope Climb Tips", type: "video", size: "30 MB", uploadedDate: "2026-05-05", uploadedBy: "Marine", folder: "Exercises" },
  { id: "m-10", name: "Kipping Pull-Up Guide", type: "video", size: "34 MB", uploadedDate: "2026-05-02", uploadedBy: "Ricardo", folder: "Exercises" },
  { id: "m-11", name: "Summer Throwdown 2025", type: "image", size: "4.2 MB", uploadedDate: "2026-05-30", uploadedBy: "Owner", folder: "Events" },
  { id: "m-12", name: "New Gym Photo", type: "image", size: "3.8 MB", uploadedDate: "2026-05-22", uploadedBy: "Owner", folder: "Marketing" },
  { id: "m-13", name: "Team Photo June 2026", type: "image", size: "5.1 MB", uploadedDate: "2026-06-01", uploadedBy: "Marine", folder: "Events" },
  { id: "m-14", name: "Logo High-Res", type: "image", size: "1.2 MB", uploadedDate: "2026-04-15", uploadedBy: "Owner", folder: "Marketing" },
  { id: "m-15", name: "Open Day Flyer", type: "image", size: "2.5 MB", uploadedDate: "2026-05-01", uploadedBy: "Marine", folder: "Marketing" },
  { id: "m-16", name: "Membership Agreement.pdf", type: "document", size: "320 KB", uploadedDate: "2026-03-10", uploadedBy: "Owner", folder: "Documents" },
  { id: "m-17", name: "PAR-Q Form.pdf", type: "document", size: "180 KB", uploadedDate: "2026-03-10", uploadedBy: "Owner", folder: "Documents" },
  { id: "m-18", name: "Liability Waiver.pdf", type: "document", size: "210 KB", uploadedDate: "2026-03-12", uploadedBy: "Owner", folder: "Documents" },
  { id: "m-19", name: "Price List 2026.pdf", type: "document", size: "150 KB", uploadedDate: "2026-01-05", uploadedBy: "Owner", folder: "Documents" },
  { id: "m-20", name: "Staff Handbook.pdf", type: "document", size: "480 KB", uploadedDate: "2026-02-20", uploadedBy: "Owner", folder: "Documents" },
];

const folders = ["All", "Exercises", "Events", "Documents", "Marketing"];

const typeConfig: Record<MediaType, { icon: typeof ImageIcon; color: string; bg: string; label: string }> = {
  image: { icon: ImageIcon, color: "text-vytal-blue", bg: "bg-vytal-blue/10", label: "Image" },
  video: { icon: Video, color: "text-vytal-purple", bg: "bg-vytal-purple/10", label: "Video" },
  document: { icon: FileText, color: "text-vytal-amber", bg: "bg-vytal-amber/10", label: "Document" },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MediaLibraryPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [media, setMedia] = useState<MediaItem[]>(mockMedia);
  const [filterType, setFilterType] = useState<"all" | MediaType>("all");
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Filter
  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      if (filterType !== "all" && item.type !== filterType) return false;
      if (activeFolder !== "All" && item.folder !== activeFolder) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [media, filterType, search, activeFolder]);

  // Stats
  const totalCount = media.length;
  const videoCount = media.filter((m) => m.type === "video").length;
  const imageCount = media.filter((m) => m.type === "image").length;
  const docCount = media.filter((m) => m.type === "document").length;

  // Actions
  const handleDelete = useCallback(
    (id: string) => {
      const item = media.find((m) => m.id === id);
      setMedia((prev) => prev.filter((m) => m.id !== id));
      if (item) toast(`"${item.name}" deleted`, "success");
    },
    [media, toast]
  );

  const handleCopyLink = useCallback(
    (item: MediaItem) => {
      toast(`Link copied for "${item.name}"`, "success");
    },
    [toast]
  );

  const handleDownload = useCallback(
    (item: MediaItem) => {
      toast(`Downloading "${item.name}"...`, "success");
    },
    [toast]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-vytal-text">{t("media.title")}</h1>
          <span className="flex h-7 items-center rounded-full bg-vytal-green/10 px-3 text-xs font-semibold text-vytal-green">
            {totalCount}
          </span>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Upload className="h-4 w-4" />
          {t("media.upload")}
        </button>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <div
          className={cn(
            "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            dragOver
              ? "border-vytal-green bg-vytal-green/5"
              : "border-vytal-border bg-vytal-bg2"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); toast(t("media.uploadStarted"), "success"); setShowUpload(false); }}
        >
          <button
            onClick={() => setShowUpload(false)}
            className="absolute right-3 top-3 text-vytal-muted hover:text-vytal-text"
          >
            <X className="h-4 w-4" />
          </button>
          <Upload className="mx-auto h-10 w-10 text-vytal-muted" />
          <p className="mt-3 text-sm text-vytal-text">{t("media.dragDrop")}</p>
          <p className="mt-1 text-xs text-vytal-muted">{t("media.supportedFormats")}</p>
          <button
            onClick={() => { toast(t("media.uploadStarted"), "success"); setShowUpload(false); }}
            className="mt-4 rounded-lg border border-vytal-green/30 px-4 py-2 text-sm text-vytal-green hover:bg-vytal-green/10 transition-colors"
          >
            {t("media.browseFiles")}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: t("media.totalFiles"), value: totalCount, color: "text-vytal-text" },
          { label: t("media.videos"), value: videoCount, color: "text-vytal-purple" },
          { label: t("media.images"), value: imageCount, color: "text-vytal-blue" },
          { label: t("media.documents"), value: docCount, color: "text-vytal-amber" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-vytal-border bg-vytal-bg2 p-4">
            <p className="text-xs text-vytal-muted">{stat.label}</p>
            <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vytal-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("media.searchPlaceholder")}
            className="w-full rounded-lg border border-vytal-border bg-vytal-bg2 py-2 pl-9 pr-3 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as "all" | MediaType)}
          className="rounded-lg border border-vytal-border bg-vytal-bg2 px-3 py-2 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
        >
          <option value="all">{t("media.allTypes")}</option>
          <option value="image">{t("media.images")}</option>
          <option value="video">{t("media.videos")}</option>
          <option value="document">{t("media.documents")}</option>
        </select>
      </div>

      {/* Folders */}
      <div className="flex items-center gap-2">
        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => setActiveFolder(folder)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeFolder === folder
                ? "bg-vytal-green/10 text-vytal-green border border-vytal-green/30"
                : "bg-vytal-bg2 text-vytal-muted border border-vytal-border hover:text-vytal-text"
            )}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            {folder}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-4 gap-4">
        {filteredMedia.map((item) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          return (
            <div
              key={item.id}
              className="group rounded-xl border border-vytal-border bg-vytal-bg2 overflow-hidden transition-colors hover:border-vytal-green/20"
            >
              {/* Thumbnail placeholder */}
              <div className={cn("flex h-32 items-center justify-center", config.bg)}>
                <Icon className={cn("h-10 w-10", config.color)} />
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="truncate text-sm font-medium text-vytal-text">{item.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", config.bg, config.color)}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-vytal-muted">{item.size}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[10px] text-vytal-muted">{item.uploadedDate} &middot; {item.uploadedBy}</span>
                </div>
                {/* Actions */}
                <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleDownload(item)}
                    className="rounded p-1.5 text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopyLink(item)}
                    className="rounded p-1.5 text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
                    title="Copy Link"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded p-1.5 text-vytal-muted hover:bg-vytal-red/10 hover:text-vytal-red"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMedia.length === 0 && (
        <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-12 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-vytal-muted" />
          <p className="mt-3 text-sm text-vytal-muted">{t("media.noResults")}</p>
        </div>
      )}
    </div>
  );
}
