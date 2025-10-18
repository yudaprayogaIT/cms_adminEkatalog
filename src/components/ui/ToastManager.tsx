"use client";

import React, { useEffect, useState } from "react";

type Toast = { id: number; type: "success" | "error" | "info"; message: string };

export default function ToastManager() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function handler(ev: Event) {
      const det = (ev as CustomEvent).detail as { type?: string; message?: string };
      if (!det || !det.message) return;
      const id = Date.now() + Math.floor(Math.random() * 999);
      setToasts((s) => [...s, { id, type: (det.type as any) || "info", message: det.message! }]);
      setTimeout(() => setToasts((s) => s.filter((t) => t.id !== id)), 4000);
    }
    window.addEventListener("ekatalog:toast", handler);
    return () => window.removeEventListener("ekatalog:toast", handler);
  }, []);

  return (
    <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`min-w-[220px] px-4 py-2 rounded shadow text-sm ${t.type === "success" ? "bg-green-600 text-white" : t.type === "error" ? "bg-red-600 text-white" : "bg-gray-800 text-white"}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
