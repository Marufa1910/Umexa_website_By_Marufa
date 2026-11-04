"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Toast = { id: number; message: string; ok: boolean };

const ToastContext = createContext<(message: string, ok?: boolean) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string, ok = true) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, ok }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 left-4 z-[70] flex flex-col items-end gap-2"
      >
        {toasts.map((toast) => (
          <p
            key={toast.id}
            role={toast.ok ? "status" : "alert"}
            className={`pointer-events-auto max-w-sm border bg-surface-2 px-4 py-3 text-sm ${
              toast.ok ? "border-lime" : "border-red-400"
            }`}
          >
            {toast.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
