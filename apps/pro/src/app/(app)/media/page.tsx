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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { trpc } from "@/lib/trpc";

function humanBytes(n: number): string {
  if (!n) return "-";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

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
  url?: string;
}

const FOLDER_KEYS = ["all", "exercises", "events", "documents", "marketing"] as const;
type FolderKey = typeof FOLDER_KEYS[number];

const FOLDER_VALUES: Record<FolderKey, string> = {
  all: "All",
  exercises: "Exercises",
  events: "Events",
  documents: "Documents",
  marketing: "Marketing",
};

const typeConfig: Record<MediaType, { icon: typeof ImageIcon; color: string; bg: string; labelKey: string }> = {
  image: { icon: ImageIcon, color: "text-vytal-blue", bg: "bg-vytal-blue/10", labelKey: "media.type.image" },
  video: { icon: Video, color: "text-vytal-purple", bg: "bg-vytal-purple/10", labelKey: "media.type.video" },
  document: { icon: FileText, color: "text-vytal-amber", bg: "bg-vytal-amber/10", labelKey: "media.type.document" },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MediaLibraryPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const utils = trpc.useUtils();
  const mediaQuery = trpc.media.list.useQuery();
  const media: MediaItem[] = useMemo(
    () =>
      (mediaQuery.data ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type as MediaType,
        size: humanBytes(a.sizeBytes),
        uploadedDate: new Date(a.createdAt).toISOString().slice(0, 10),
        uploadedBy: a.uploadedBy ?? "-",
        folder: a.folder,
        url: a.url ?? undefined,
      })),
    [mediaQuery.data],
  );
  const [filterType, setFilterType] = useState<"all" | MediaType>("all");
  const [search, setSearch] = useState("");
  const [activeFolderKey, setActiveFolderKey] = useState<FolderKey>("all");

  // Derive the raw folder value used in data for filtering (always English)
  const activeFolder = FOLDER_VALUES[activeFolderKey];
  const [showUpload, setShowUpload] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<MediaType>("document");
  const [newFolder, setNewFolder] = useState("Documents");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const onError = (e: { data?: { code?: string } | null }) =>
    toast(e.data?.code === "FORBIDDEN" ? t("settings.adminOnly") : t("ui.error"), "error");
  const createAsset = trpc.media.create.useMutation({
    onSuccess: () => {
      void utils.media.list.invalidate();
      setNewName("");
      setShowUpload(false);
      toast(t("media.uploadStarted"), "success");
    },
    onError,
  });
  const deleteAsset = trpc.media.delete.useMutation({
    onSuccess: () => void utils.media.list.invalidate(),
    onError,
  });

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
  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteAsset.mutate({ id: deleteTarget.id });
    toast(t("media.deleted"), "success");
    setDeleteTarget(null);
  }, [deleteTarget, deleteAsset, toast, t]);

  const handleCopyLink = useCallback(
    (item: MediaItem) => {
      if (item.url) void navigator.clipboard.writeText(item.url);
      toast(t("toast.linkCopied").replace("{name}", item.name), item.url ? "success" : "info");
    },
    [toast, t]
  );

  const handleDownload = useCallback(
    (item: MediaItem) => {
      if (item.url) window.open(item.url, "_blank");
      else toast(t("toast.downloading").replace("{name}", item.name), "info");
    },
    [toast, t]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vytal-text">{t("media.title")}</h1>
          <p className="mt-1 text-sm text-vytal-muted">{totalCount} {t("media.totalFiles").toLowerCase()}</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Upload className="h-4 w-4" />
          {t("media.upload")}
        </button>
      </div>

      {/* Add asset (metadata catalog — binary upload via S3 is the next step) */}
      {showUpload && (
        <div className="relative rounded-xl border border-vytal-green/30 bg-vytal-bg2 p-6">
          <button
            onClick={() => setShowUpload(false)}
            className="absolute right-3 top-3 text-vytal-muted hover:text-vytal-text"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-vytal-green" />
            <h3 className="text-base font-semibold text-vytal-text">{t("media.addAsset")}</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("media.assetName")}
              className="w-full rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none focus:ring-1 focus:ring-vytal-green/20"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as MediaType)}
              className="rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text focus:outline-none"
            >
              <option value="document">{t("media.type.document")}</option>
              <option value="image">{t("media.type.image")}</option>
              <option value="video">{t("media.type.video")}</option>
            </select>
            <select
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg px-3 py-2 text-sm text-vytal-text focus:outline-none"
            >
              {(["Exercises", "Events", "Documents", "Marketing"] as const).map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => newName.trim() && createAsset.mutate({ name: newName.trim(), type: newType, folder: newFolder })}
              disabled={!newName.trim() || createAsset.isPending}
              className="rounded-lg bg-vytal-green px-5 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-60"
            >
              {t("media.addAsset")}
            </button>
          </div>
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
        {FOLDER_KEYS.map((folderKey) => (
          <button
            key={folderKey}
            onClick={() => setActiveFolderKey(folderKey)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeFolderKey === folderKey
                ? "bg-vytal-green/10 text-vytal-green border border-vytal-green/30"
                : "bg-vytal-bg2 text-vytal-muted border border-vytal-border hover:text-vytal-text"
            )}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            {t(`media.folder.${folderKey}`)}
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
              className="group rounded-xl border border-vytal-border bg-vytal-bg2 overflow-hidden transition-colors hover:border-[rgba(34,197,94,0.22)]"
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
                    {t(config.labelKey)}
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
                    title={t("action.download")}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopyLink(item)}
                    className="rounded p-1.5 text-vytal-muted hover:bg-vytal-bg3 hover:text-vytal-text"
                    title={t("media.copyLink")}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                    className="rounded p-1.5 text-vytal-muted hover:bg-vytal-red/10 hover:text-vytal-red"
                    title={t("action.delete")}
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
        <EmptyState
          icon={ImageIcon}
          title={t("media.noResults")}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("action.delete")}
        description={`${t("media.confirmDelete")} "${deleteTarget?.name}"?`}
        confirmLabel={t("action.delete")}
        cancelLabel={t("action.cancel")}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
