"use client";

import { createContext, useCallback, useContext, useState, useRef, useEffect, type ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  action?: ToastAction;
}

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;

function ToastItem({
  toast: t,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: number) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(3000);
  const startRef = useRef(Date.now());

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

  const startTimer = useCallback(() => {
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onRemove(t.id);
    }, remainingRef.current);
  }, [onRemove, t.id]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current -= Date.now() - startRef.current;
      if (remainingRef.current < 0) remainingRef.current = 0;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  function handleActionClick() {
    if (t.action) {
      t.action.onClick();
      onRemove(t.id);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-vytal-bg2 px-4 py-3 shadow-xl animate-slide-in-right",
        borderColors[t.type]
      )}
      style={{ minWidth: 280, maxWidth: 420 }}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
    >
      {icons[t.type]}
      <span className="flex-1 text-sm text-vytal-text">{t.message}</span>
      {t.action && (
        <button
          onClick={handleActionClick}
          className="shrink-0 text-sm font-semibold text-vytal-green transition-colors hover:text-vytal-green/80"
        >
          {t.action.label}
        </button>
      )}
      <button
        onClick={() => onRemove(t.id)}
        className="shrink-0 text-vytal-muted transition-colors hover:text-vytal-text"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "success", options?: ToastOptions) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type, action: options?.action }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
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
