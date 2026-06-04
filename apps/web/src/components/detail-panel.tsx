"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: "md" | "lg" | "xl";
  actions?: ReactNode;
}

const widthMap = {
  md: "max-w-[400px]",
  lg: "max-w-[500px]",
  xl: "max-w-[640px]",
};

export function DetailPanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "lg",
  actions,
}: DetailPanelProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm detail-panel-backdrop"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative flex h-full w-full flex-col border-l border-vytal-border bg-vytal-bg2 shadow-2xl detail-panel-slide",
          widthMap[width]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-vytal-border px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-vytal-text">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 truncate text-sm text-vytal-muted">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 pl-4">
            {actions}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
