"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle className="h-4 w-4 text-vytal-green" />,
    error: <AlertCircle className="h-4 w-4 text-vytal-red" />,
    info: <Info className="h-4 w-4 text-vytal-blue" />,
  };

  const borderColors: Record<ToastType, string> = {
    success: "border-vytal-green/30",
    error: "border-vytal-red/30",
    info: "border-vytal-blue/30",
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border bg-vytal-bg2 px-4 py-3 shadow-xl animate-slide-in-right",
              borderColors[t.type]
            )}
            style={{ minWidth: 280, maxWidth: 420 }}
          >
            {icons[t.type]}
            <span className="flex-1 text-sm text-vytal-text">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-vytal-muted transition-colors hover:text-vytal-text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
