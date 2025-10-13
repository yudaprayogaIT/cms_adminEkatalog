// src/components/items/ItemDetailModal.tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ItemDetailModal({ open, onClose, item, onEdit, onDelete }: any) {
  if (!item) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          <motion.div initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.16 }} className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow p-6 overflow-auto">
            <div className="flex gap-6">
              <div className="w-1/3 bg-gray-50 rounded overflow-hidden h-56 flex items-center justify-center">
                {item.images ? <img src={item.images} alt={item.title} className="object-cover w-full h-full" /> : <div className="text-xs text-gray-400">No image</div>}
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <div className="text-sm text-gray-500 mt-1">{item.productName} • {item.categoryResolved ?? item.category}</div>

                <div className="mt-4 text-sm text-gray-700 whitespace-pre-line">{item.detail ?? "-"}</div>

                <div className="mt-4 text-sm text-gray-600">Branches:</div>
                <div className="mt-1 text-sm text-gray-700">{(item.branchesResolved || item.branches || []).join(", ")}</div>

                <div className="mt-6 flex items-center gap-2">
                  <button onClick={() => onEdit?.(item)} className="px-3 py-2 rounded border text-sm">Edit</button>
                  <button onClick={() => onDelete?.(item)} className="px-3 py-2 rounded bg-red-600 text-white text-sm">Delete</button>
                  <button onClick={onClose} className="ml-auto px-3 py-2 rounded border text-sm">Close</button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
