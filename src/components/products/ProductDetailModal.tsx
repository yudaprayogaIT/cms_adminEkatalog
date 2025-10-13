// src/components/products/ProductDetailModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Image from "next/image";

export default function ProductDetailModal({ open, onClose, product, variants = [], onEditProduct, onEditItem }: any) {
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<any | null>(null);

  useEffect(() => {
    if (!product) return;
    const first = (variants && variants.length > 0) ? variants[0] : null;
    setSelectedVariant(first);
    setMainImage(first ? (first.images || first.image || product.image || "") : (product.image || ""));
  }, [product, variants]);

  function pickVariant(v: any) {
    setSelectedVariant(v);
    setMainImage(v?.images || v?.image || product.image || "");
  }

  function promptDeleteVariant(v: any) {
    setConfirmTarget(v);
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    setConfirmOpen(false);
    if (!confirmTarget) return;
    // try API delete; fallback remove from localStorage snapshot
    try {
      await fetch("/api/items", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: confirmTarget.id }) });
    } catch {}
    // dispatch update event (parent reloads on events)
    window.dispatchEvent(new Event("ekatalog:items_update"));
    // small UI feedback: close if deleted variant was selected
    if (selectedVariant && Number(selectedVariant.id) === Number(confirmTarget.id)) {
      setSelectedVariant(null);
    }
  }

  if (!product) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          <motion.div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-auto" initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.16 }}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-gray-50 rounded overflow-hidden h-72 flex items-center justify-center">
                  {mainImage ? <Image src={mainImage} alt={selectedVariant?.title || product.title} width={200} height={200} className="object-cover w-full h-full" /> : <div className="text-xs text-gray-400">No image</div>}
                </div>

                <div className="mt-3 flex items-center gap-2 overflow-auto">
                  {variants.length === 0 ? <div className="text-sm text-gray-500">No variants</div> : variants.map((v:any) => {
                    const thumb = v.images || v.image || product.image || "";
                    const active = selectedVariant && Number(selectedVariant.id) === Number(v.id);
                    return (
                      <div key={v.id} className="flex items-center gap-2">
                        <button onClick={() => pickVariant(v)} className={`w-16 h-16 rounded border ${active ? "ring-2 ring-[#2563EB]" : "bg-white"} overflow-hidden flex-shrink-0`}>
                          {thumb ? <Image src={thumb} alt={v.title} width={200} height={200} className="object-cover w-full h-full" /> : <div className="text-xs text-gray-400 p-2">No image</div>}
                        </button>

                        {/* <div className="flex flex-col text-xs">
                          <div className="font-medium">{v.title}</div>
                          <div className="text-gray-500">{v["item code"] ?? v["item_code"] ?? ""}</div>
                          <div className="flex gap-1 mt-1">
                            <button onClick={(e)=>{ e.stopPropagation(); onEditItem?.(v); }} className="px-2 py-1 rounded border text-xs">Edit</button>
                            <button onClick={(e)=>{ e.stopPropagation(); promptDeleteVariant(v); }} className="px-2 py-1 rounded bg-red-50 text-red-600 border text-xs">Delete</button>
                          </div>
                        </div> */}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold">{selectedVariant ? selectedVariant.title : product.title}</h2>
                    <div className="text-sm text-gray-500 mt-1">{product.categoryName ?? product.categoryName} {product.code} • {product.type ?? product.uom}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => onEditProduct?.(product)} className="px-3 py-2 rounded border text-sm">Edit Product</button>
                    {selectedVariant && <button onClick={() => onEditItem?.(selectedVariant)} className="px-3 py-2 rounded border text-sm">Edit Variant</button>}
                    <button onClick={onClose} className="px-3 py-2 rounded bg-[#2563EB] text-white text-sm">Close</button>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-700 whitespace-pre-line">
                  {selectedVariant?.detail ?? product.description ?? "-"}
                </div>

                <div className="mt-4 text-sm text-gray-600">Branches:</div>
                <div className="mt-1 text-sm text-gray-800">{(selectedVariant?.branches || []).join?.(", ") || "-"}</div>

                <div className="mt-auto text-right text-xs text-gray-400">Variants: {variants.length}</div>
              </div>
            </div>
          </motion.div>

          <ConfirmDialog
            open={confirmOpen}
            title="Hapus variant"
            description={confirmTarget ? `Yakin ingin menghapus variant "${confirmTarget.title}"?` : ""}
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmOpen(false)}
            confirmLabel="Yes, delete"
            cancelLabel="Cancel"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
