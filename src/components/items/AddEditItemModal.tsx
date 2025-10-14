// src/components/items/AddEditItemModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SNAP_KEY = "ekatalog_items_snapshot";

type Branch = { id: number; daerah: string; name?: string; [k: string]: any };
type Item = {
  id?: number | string;
  productId?: number | string;
  title?: string;
  [k: string]: any;
};
type Product = { id: number | string; title?: string; [k: string]: any };

export default function AddEditItemModal({
  open,
  onClose,
  initial,
  products = [],
}: {
  open: boolean;
  onClose: () => void;
  initial?: Item | null;
  products?: Product[];
}) {
  const [title, setTitle] = useState("");
  const [productId, setProductId] = useState<number | string | "">("");
  const [itemCode, setItemCode] = useState("");
  const [detail, setDetail] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [saving, setSaving] = useState(false);

  const [branchesList, setBranchesList] = useState<Branch[]>([]);
  const [branchesSelected, setBranchesSelected] = useState<string[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setBranchesLoading(true);
    fetch("/api/branches")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load branches");
        return r.json();
      })
      .then((d) => {
        if (!mounted) return;
        setBranchesList(Array.isArray(d) ? d : []);
        setBranchesError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setBranchesList([]);
        setBranchesError(String(err?.message ?? err));
      })
      .finally(() => {
        if (!mounted) return;
        setBranchesLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? "");
      setProductId(initial.productId ?? initial.productId ?? "");
      setItemCode(
        initial["item code"] ?? initial["item_code"] ?? initial.itemCode ?? ""
      );
      setDetail(initial.detail ?? "");
      setImagePath(initial.images ?? initial.image ?? "");
      if (Array.isArray(initial.branches))
        setBranchesSelected(initial.branches);
      else if (typeof initial.branches === "string")
        setBranchesSelected(
          initial.branches
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        );
      else setBranchesSelected([]);
    } else {
      // for new variant, allow prefilled productId if provided in initial (e.g. { productId: p.id })
      setTitle("");
      setProductId(
        initial && (initial as any).productId ? (initial as any).productId : ""
      );
      setItemCode("");
      setDetail("");
      setImagePath("");
      setBranchesSelected([]);
    }
  }, [initial, open]);

  function toggleBranch(b: string) {
    setBranchesSelected((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  }
  function selectAllShown() {
    const daerahList = branchesList.map((b) => b.daerah).filter(Boolean);
    setBranchesSelected(
      Array.from(new Set([...branchesSelected, ...daerahList]))
    );
  }
  function clearAll() {
    setBranchesSelected([]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload: any = {
      productId: productId || undefined,
      title: title.trim(),
      "item code": itemCode.trim(),
      detail: detail.trim(),
      images: imagePath || undefined,
      branches: branchesSelected || [],
    };

    // try API
    let serverSuccess = false;
    try {
      const method = initial?.id ? "PUT" : "POST";
      const body = initial?.id ? { id: initial.id, ...payload } : payload;
      const res = await fetch("/api/items", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {}

      if (!res.ok) {
        console.error("API save failed", res.status, json);
        alert(
          "Gagal menyimpan perubahan: " +
            (json?.error || res.statusText || res.status)
        );
      } else {
        serverSuccess = true;
        // update snapshot from server (best-effort)
        try {
          const r2 = await fetch("/api/items");
          if (r2.ok) {
            const list = await r2.json();
            localStorage.setItem(SNAP_KEY, JSON.stringify(list));
          }
        } catch {}
        // notify UI
        window.dispatchEvent(new Event("ekatalog:items_update"));
      }
    } catch (err) {
      console.warn("Save error", err);
    }

    // fallback snapshot update if server failed or offline
    try {
      const raw = localStorage.getItem(SNAP_KEY);
      let arr: any[] = raw ? JSON.parse(raw) : [];
      if (initial?.id) {
        arr = arr.map((it) =>
          String(it.id) === String(initial.id)
            ? { ...it, ...payload, id: initial.id }
            : it
        );
      } else {
        const max = arr.reduce(
          (m: number, it: any) => Math.max(m, Number(it.id) || 0),
          0
        );
        arr.push({ id: max + 1, ...payload });
      }
      localStorage.setItem(SNAP_KEY, JSON.stringify(arr));
      if (!serverSuccess) {
        // still notify so UI updates in dev/offline
        window.dispatchEvent(new Event("ekatalog:items_update"));
      }
    } catch (err) {
      console.error("Failed to update snapshot", err);
    }

    setSaving(false);
    onClose();
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div
            className="bg-white rounded-xl shadow-lg w-full max-w-[820px] p-6 z-10"
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
          >
            <h3 className="text-lg font-medium mb-3">
              {initial?.id ? "Edit Item" : "Add New Item"}
            </h3>

            <form onSubmit={submit} className="grid gap-3">
              <div>
                <label className="text-xs text-gray-600">Product</label>
                <select
                  value={productId as any}
                  onChange={(e) =>
                    setProductId(e.target.value ? e.target.value : "")
                  }
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">-- pilih product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title ?? p.name ?? p.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Item code</label>
                  <input
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Image path</label>
                  <input
                    value={imagePath}
                    onChange={(e) => setImagePath(e.target.value)}
                    placeholder="/images/items/..."
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Detail</label>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-xs text-gray-600">Branches</label>
                    <div className="text-xs text-gray-400">
                      Pilih branch yang tersedia untuk item ini
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllShown}
                      className="text-xs px-2 py-1 border rounded"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs px-2 py-1 border rounded"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-44 overflow-auto border rounded p-2 bg-white">
                  {branchesLoading ? (
                    <div className="text-sm text-gray-500">
                      Loading branches...
                    </div>
                  ) : branchesError ? (
                    <div className="text-sm text-red-500">
                      Failed to load branches
                    </div>
                  ) : branchesList.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No branches found
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {branchesList.map((b) => {
                        const label = b.daerah ?? b.name ?? String(b.id);
                        const checked = branchesSelected.includes(label);
                        return (
                          <label
                            key={b.id}
                            className="flex items-center gap-2 text-sm cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleBranch(label)}
                              className="w-4 h-4"
                            />
                            <span className="truncate">{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-2 rounded bg-[#2563EB] text-white"
                >
                  {saving
                    ? "Saving..."
                    : initial?.id
                    ? "Save Changes"
                    : "Add Item"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
