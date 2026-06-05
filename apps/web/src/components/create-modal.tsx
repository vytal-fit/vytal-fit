"use client";

import { useEffect, useCallback, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function CreateModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = "Guardar",
  size = "md",
}: CreateModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) {
      onClose();
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        className={cn(
          "w-full rounded-xl border border-vytal-border bg-vytal-bg2 shadow-2xl shadow-black/30 flex flex-col",
          "animate-in fade-in zoom-in-95 duration-200",
          sizeMap[size]
        )}
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-vytal-border px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-vytal-text">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-vytal-muted">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-vytal-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2 text-sm font-medium text-vytal-muted transition-colors hover:bg-vytal-bg3 hover:text-vytal-text"
          >
            Cancelar
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              className="rounded-lg bg-vytal-green px-4 py-2 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
