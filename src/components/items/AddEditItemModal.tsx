// src/components/items/AddEditItemModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SNAP_KEY = "ekatalog_items_snapshot";

export default function AddEditItemModal({ open, onClose, initial, products = [] }: any) {
  const [title, setTitle] = useState("");
  const [productId, setProductId] = useState<number | "">("");
  const [itemCode, setItemCode] = useState("");
  const [detail, setDetail] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [branchesText, setBranchesText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? "");
      setProductId(initial.productId ?? "");
      setItemCode(initial["item code"] ?? initial["item_code"] ?? "");
      setDetail(initial.detail ?? "");
      setImagePath(initial.images ?? initial.image ?? "");
      setBranchesText(Array.isArray(initial.branches) ? initial.branches.join(", ") : (initial.branches || ""));
    } else {
      setTitle("");
      setProductId("");
      setItemCode("");
      setDetail("");
      setImagePath("");
      setBranchesText("");
    }
  }, [initial, open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload: any = {
      productId: productId || undefined,
      title: title.trim(),
      "item code": itemCode.trim(),
      detail: detail.trim(),
      images: imagePath || undefined,
      branches: branchesText.split(",").map((s)=>s.trim()).filter(Boolean),
    };

    try {
      // try server API
      const method = initial?.id ? "PUT" : "POST";
      const body = initial?.id ? { id: initial.id, ...payload } : payload;
      await fetch("/api/items", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } catch {
      // ignore
    }

    // fallback update local snapshot
    try {
      const raw = localStorage.getItem(SNAP_KEY);
      let arr: any[] = raw ? JSON.parse(raw) : [];
      if (initial?.id) {
        arr = arr.map((it) => (Number(it.id) === Number(initial.id) ? { ...it, ...payload, id: initial.id } : it));
      } else {
        const max = arr.reduce((m:any, it:any) => Math.max(m, Number(it.id) || 0), 0);
        arr.push({ id: max + 1, ...payload });
      }
      localStorage.setItem(SNAP_KEY, JSON.stringify(arr));
      window.dispatchEvent(new Event("ekatalog:items_update"));
    } catch {}

    setSaving(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div className="bg-white rounded-xl shadow-lg w-full max-w-[720px] p-6 z-10" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}>
            <h3 className="text-lg font-medium mb-3">{initial ? "Edit Item" : "Add New Item"}</h3>
            <form onSubmit={submit} className="grid gap-3">
              <div>
                <label className="text-xs text-gray-600">Product</label>
                <select value={productId as any} onChange={(e)=>setProductId(e.target.value ? Number(e.target.value) : "")} className="w-full px-3 py-2 border rounded">
                  <option value="">-- pilih product --</option>
                  {products.map((p:any)=> <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Title</label>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} required className="w-full px-3 py-2 border rounded" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Item code</label>
                  <input value={itemCode} onChange={(e)=>setItemCode(e.target.value)} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Image path</label>
                  <input value={imagePath} onChange={(e)=>setImagePath(e.target.value)} placeholder="/images/items/..." className="w-full px-3 py-2 border rounded" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Detail</label>
                <textarea value={detail} onChange={(e)=>setDetail(e.target.value)} className="w-full px-3 py-2 border rounded" rows={3} />
              </div>

              <div>
                <label className="text-xs text-gray-600">Branches (comma separated)</label>
                <input value={branchesText} onChange={(e)=>setBranchesText(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Bogor, Samarinda" />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-2 rounded bg-[#2563EB] text-white">{saving ? "Saving..." : (initial ? "Save Changes" : "Add Item")}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
