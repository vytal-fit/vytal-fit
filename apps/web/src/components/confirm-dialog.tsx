"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => confirmRef.current?.focus(), 50);
    }
  }, [open]);

  // Handle ESC key
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        style={{ animation: "confirm-fade-in 0.15s ease-out both" }}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-vytal-border bg-vytal-bg2 p-6 shadow-2xl shadow-black/40"
        style={{ animation: "confirm-scale-in 0.15s ease-out both" }}
      >
        <h3 className="text-lg font-bold text-vytal-text">{title}</h3>
        <p className="mt-2 text-sm text-vytal-muted">{description}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-vytal-border px-4 py-2 text-sm font-medium text-vytal-text transition-colors hover:bg-vytal-bg3"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              variant === "danger"
                ? "bg-vytal-red text-white hover:bg-vytal-red/90"
                : "bg-vytal-green text-vytal-bg hover:bg-vytal-green/90"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
