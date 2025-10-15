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
  onAddItemForProduct,
}: any) {
  const [localVariants, setLocalVariants] = useState<any[]>(
    Array.isArray(variants) ? variants : []
  );
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<any | null>(null);

  const rotateRef = useRef<number | null>(null);
  const idxRef = useRef<number>(0);

  // keep localVariants in sync when parent passes new variants prop (immediate fallback)
  useEffect(() => {
    setLocalVariants(Array.isArray(variants) ? variants : []);
  }, [variants]);

  // When modal opens or product changes, fetch latest variants from API
  useEffect(() => {
    if (!open) return;

    // fetch fresh variants for current product
    fetchVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  // listen to global items update events (dispatched after save/delete)
  useEffect(() => {
    const handler = () => {
      // only fetch when this modal is open and product is set
      if (open && product?.id) fetchVariants();
    };
    window.addEventListener("ekatalog:items_update", handler);
    return () => window.removeEventListener("ekatalog:items_update", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  // when localVariants change, try keep selection consistent
  useEffect(() => {
    if (!localVariants || localVariants.length === 0) {
      setSelectedVariant(null);
      setMainImage(product?.image || "");
      idxRef.current = 0;
      return;
    }

    // if selectedVariant exists, try find its updated object
    if (selectedVariant) {
      const found = localVariants.find(
        (v) => String(v.id) === String(selectedVariant.id)
      );
      if (found) {
        setSelectedVariant(found);
        setMainImage(found.images || found.image || product?.image || "");
        return;
      }
    }

    // otherwise pick first
    const first = localVariants[0];
    setSelectedVariant(first);
    setMainImage(first?.images || first?.image || product?.image || "");
    idxRef.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localVariants]);

  // fetch helper - always tries API, safe-fail silently
  async function fetchVariants() {
    if (!product?.id) {
      // nothing to do
      return;
    }
    try {
      const res = await fetch(
        `/api/items?productId=${encodeURIComponent(String(product.id))}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        // do not throw — keep current localVariants
        console.warn(
          "ProductDetailModal: failed to fetch variants",
          res.status
        );
        return;
      }
      const data = await res.json();
      setLocalVariants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("ProductDetailModal: error fetching variants", err);
    }
  }

  function pickVariant(v: any, index?: number) {
    setSelectedVariant(v);
    setMainImage(v?.images || v?.image || product?.image || "");
    if (typeof index === "number") idxRef.current = index;
    resetAutoRotate();
  }

  function promptDeleteVariant(v: any) {
    setConfirmTarget(v);
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    setConfirmOpen(false);
    if (!confirmTarget) return;
    try {
      const res = await fetch("/api/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmTarget.id }),
      });
      if (!res.ok) {
        console.warn("Failed to delete variant", await res.text());
      } else {
        // notify others (ProductCatalog and this modal listener will react)
        window.dispatchEvent(new Event("ekatalog:items_update"));
      }
    } catch (err) {
      console.warn("Delete error", err);
    }

    // immediately update UI optimistically
    setLocalVariants((prev) =>
      prev.filter((x: any) => String(x.id) !== String(confirmTarget.id))
    );
    setConfirmTarget(null);
  }

  function startAutoRotate() {
    stopAutoRotate();
    if (!localVariants || localVariants.length <= 1) return;
    rotateRef.current = window.setInterval(() => {
      const len = localVariants.length;
      idxRef.current = (idxRef.current + 1) % len;
      const next = localVariants[idxRef.current];
      if (next) {
        setSelectedVariant(next);
        setMainImage(next.images || next.image || product?.image || "");
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

  useEffect(() => {
    if (open) startAutoRotate();
    else stopAutoRotate();
    return () => stopAutoRotate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, localVariants]);

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
            className="relative z-10 w-full max-w-5xl h-150 md:h-110 lg:h-157 bg-white rounded-lg shadow-2xl overflow-auto"
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <div className="flex items-center gap-2 justify-center md:justify-end pr-4 pt-4">
              <button
                onClick={() => onEditProduct?.(product)}
                className="px-2 py-1 lg:px-3 lg:py-2 rounded border text-[9px] md:text-xs lg:text-sm"
              >
                Edit Product
              </button>
              {selectedVariant && (
                <button
                  onClick={() => onEditItem?.(selectedVariant)}
                  className="px-2 py-1 lg:px-3 lg:py-2 rounded border text-[9px] md:text-xs lg:text-sm"
                >
                  Edit Variant
                </button>
              )}
              <button
                onClick={() => onAddItemForProduct?.(product)}
                className="px-2 py-1 lg:px-3 lg:py-2 rounded border text-[9px] md:text-xs lg:text-sm"
              >
                Add Variant
              </button>
              <button
                onClick={onClose}
                className="px-2 py-1 lg:px-3 lg:py-2 rounded bg-[#2563EB] text-white text-[9px] md:text-xs lg:text-sm hidden"
              >
                Close
              </button>
            </div>

            <div className="p-6 flex flex-col md:flex-row grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 flex flex-row md:flex-col justify-between">
                <div className="bg-gray-50 rounded overflow-hidden h-58 w-58 md:h-64 md:w-64 lg:h-108 lg:w-108 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {mainImage ? (
                      <motion.img
                        key={mainImage}
                        src={mainImage}
                        alt={selectedVariant?.title || product?.title || ""}
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

                <div className="mt-3 flex flex-col md:flex-row items-center gap-3 justify-center overflow-auto py-1">
                  {localVariants.length === 0 ? (
                    <div className="text-sm text-gray-500">No variants</div>
                  ) : (
                    localVariants.map((v: any, i: number) => {
                      const thumb = v.images || v.image || product?.image || "";
                      const active =
                        selectedVariant &&
                        String(selectedVariant.id) === String(v.id);
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
                              ? "ring-2 ring-[#2563EB] w-14 h-14 lg:w-18 lg:h-18"
                              : "bg-white w-10 h-10 lg:w-12 lg:h-12"
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

              <div className="md:col-span-2 flex flex-col w-full">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-sm md:text-2xl font-semibold">
                      {selectedVariant ? selectedVariant.title : product?.title}
                    </h2>
                    <div className="text-xs md:text-sm text-gray-500 mt-1">
                      {product?.categoryName}
                      {product?.code ? ` • ${product.code}` : ""} •{" "}
                      {product?.type ?? product?.uom}
                    </div>

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

                <div className="mt-4 text-xs md:text-sm text-gray-700 whitespace-pre-line">
                  {selectedVariant?.detail ?? product?.description ?? "-"}
                </div>

                <div className="mt-4 text-xs md:text-sm text-gray-600">Branches:</div>
                <div className="mt-1 text-xs md:text-sm text-gray-800">
                  {(selectedVariant?.branches || []).join?.(", ") || "-"}
                </div>

                <div className="mt-4 md:mt-auto text-right text-[9px] md:text-xs text-gray-400">
                  Variants: {localVariants.length}
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
