// src/components/products/ProductDetailModal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function ProductDetailModal({
  open,
  onClose,
  product,
  variants = [],
  onEditProduct,
  onEditItem,
}: any) {
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<any | null>(null);

  // auto-rotate timer ref
  const rotateRef = useRef<number | null>(null);
  // index of current variant for rotation
  const idxRef = useRef<number>(0);

  // initialize selection when product/variants change
  useEffect(() => {
    if (!product) return;
    const first = variants && variants.length > 0 ? variants[0] : null;
    setSelectedVariant(first);
    setMainImage(
      first
        ? first.images || first.image || product.image || ""
        : product.image || ""
    );
    idxRef.current = 0;
  }, [product, variants]);

  // pick variant (user action) - resets auto-rotate
  function pickVariant(v: any, index?: number) {
    setSelectedVariant(v);
    setMainImage(v?.images || v?.image || product.image || "");
    if (typeof index === "number") idxRef.current = index;
    resetAutoRotate();
  }

  // prompt delete
  function promptDeleteVariant(v: any) {
    setConfirmTarget(v);
    setConfirmOpen(true);
  }

  // handle delete confirmed
  async function handleConfirmDelete() {
    setConfirmOpen(false);
    if (!confirmTarget) return;
    try {
      await fetch("/api/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmTarget.id }),
      });
    } catch {
      // ignore
    }

    window.dispatchEvent(new Event("ekatalog:items_update"));

    // if deleted variant was current, choose next available
    if (
      selectedVariant &&
      Number(selectedVariant.id) === Number(confirmTarget.id)
    ) {
      const remaining = variants.filter(
        (x: any) => Number(x.id) !== Number(confirmTarget.id)
      );
      const next = remaining.length ? remaining[0] : null;
      setSelectedVariant(next);
      setMainImage(
        next
          ? next.images || next.image || product.image || ""
          : product.image || ""
      );
    }
    setConfirmTarget(null);
  }

  // Auto-rotate: cycle through variants every 5s
  function startAutoRotate() {
    stopAutoRotate(); // ensure single timer
    if (!variants || variants.length <= 1) return;
    rotateRef.current = window.setInterval(() => {
      const len = variants.length;
      idxRef.current = (idxRef.current + 1) % len;
      const next = variants[idxRef.current];
      if (next) {
        setSelectedVariant(next);
        setMainImage(next.images || next.image || product.image || "");
      }
    }, 5000);
  }
  function stopAutoRotate() {
    if (rotateRef.current !== null) {
      window.clearInterval(rotateRef.current);
      rotateRef.current = null;
    }
  }
  function resetAutoRotate() {
    stopAutoRotate();
    startAutoRotate();
  }

  // start / stop rotate when modal open/close or variants change
  useEffect(() => {
    if (open) {
      startAutoRotate();
    } else {
      stopAutoRotate();
    }
    return () => stopAutoRotate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, variants]);

  // cleanup on unmount
  useEffect(() => () => stopAutoRotate(), []);

  if (!product) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          <motion.div
            className="relative z-10 w-full max-w-5xl h-157 bg-white rounded-lg shadow-2xl overflow-auto"
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <div className="flex items-center gap-2 justify-end pr-4 pt-4">
              <button
                onClick={() => onEditProduct?.(product)}
                className="px-3 py-2 rounded border text-sm"
              >
                Edit Product
              </button>
              {selectedVariant && (
                <button
                  onClick={() => onEditItem?.(selectedVariant)}
                  className="px-3 py-2 rounded border text-sm"
                >
                  Edit Variant
                </button>
              )}
              <button
                onClick={onClose}
                className="px-3 py-2 rounded bg-[#2563EB] text-white text-sm"
              >
                Close
              </button>
            </div>
            <div className="p-6 flex grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 ">
                {/* MAIN IMAGE (crossfade with AnimatePresence) */}
                <div className="bg-gray-50 rounded overflow-hidden h-108 w-108 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {/* key on mainImage so switching triggers exit/enter */}
                    {mainImage ? (
                      <motion.img
                        key={mainImage}
                        src={mainImage}
                        alt={selectedVariant?.title || product.title}
                        initial={{ opacity: 0, x: 8, scale: 0.995 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -8, scale: 0.995 }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <motion.div
                        key="no-image"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-gray-400"
                      >
                        No image
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* THUMBNAILS */}
                <div className="mt-3 flex items-center gap-3 justify-center overflow-auto py-1">
                  {variants.length === 0 ? (
                    <div className="text-sm text-gray-500">No variants</div>
                  ) : (
                    variants.map((v: any, i: number) => {
                      const thumb = v.images || v.image || product.image || "";
                      const active =
                        selectedVariant &&
                        Number(selectedVariant.id) === Number(v.id);

                      return (
                        <motion.button
                          key={v.id}
                          onClick={() => pickVariant(v, i)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.03 }}
                          className={`flex-shrink-0 rounded border border-gray-300 cursor-pointer overflow-hidden ${
                            active
                              ? "ring-2 ring-[#2563EB] w-18 h-18"
                              : "bg-white w-12 h-12"
                          }`}
                          aria-pressed={active}
                        >
                          {thumb ? (
                            <motion.img
                              src={thumb}
                              alt={v.title}
                              className="object-cover w-full h-full"
                              initial={{ scale: 1 }}
                              animate={active ? { scale: 1.03 } : { scale: 1 }}
                              transition={{ duration: 0.25 }}
                            />
                          ) : (
                            <div className="text-xs text-gray-400 p-2">
                              No image
                            </div>
                          )}
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold">
                      {selectedVariant ? selectedVariant.title : product.title}
                    </h2>
                    <div className="text-sm text-gray-500 mt-1">
                      {product.categoryName ?? product.categoryName}{" "}
                      {product.code ? ` • ${product.code}` : ""} •{" "}
                      {product.type ?? product.uom}
                    </div>

                    {/* item code display */}
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">Item code</div>
                      <div className="text-sm font-medium">
                        {(selectedVariant &&
                          (selectedVariant["item code"] ??
                            selectedVariant["item_code"] ??
                            selectedVariant.itemCode)) ||
                          "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-700 whitespace-pre-line">
                  {selectedVariant?.detail ?? product.description ?? "-"}
                </div>

                <div className="mt-4 text-sm text-gray-600">Branches:</div>
                <div className="mt-1 text-sm text-gray-800">
                  {(selectedVariant?.branches || []).join?.(", ") || "-"}
                </div>

                <div className="mt-auto text-right text-xs text-gray-400">
                  Variants: {variants.length}
                </div>
              </div>
            </div>
          </motion.div>

          <ConfirmDialog
            open={confirmOpen}
            title="Hapus variant"
            description={
              confirmTarget
                ? `Yakin ingin menghapus variant "${confirmTarget.title}"?`
                : ""
            }
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
