// src/components/products/AddProductModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SNAP_KEY = "ekatalog_products_snapshot";

export default function AddProductModal({ open, onClose, initial }: any) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string|number>("");
  const [type, setType] = useState("");
  const [uom, setUom] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? "");
      setCategoryId(initial.categoryId ?? "");
      setType(initial.type ?? "");
      setUom(initial.uom ?? "");
      setImage(initial.image ?? "");
      setDescription(initial.description ?? "");
    } else {
      setTitle(""); setCategoryId(""); setType(""); setUom(""); setImage(""); setDescription("");
    }
  }, [initial, open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { title: title.trim(), categoryId, type, uom, image, description };

    try { // try server
      await fetch("/api/products", { method: initial?.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(initial?.id ? { id: initial.id, ...payload } : payload) });
    } catch {}

    try {
      const raw = localStorage.getItem(SNAP_KEY);
      let arr = raw ? JSON.parse(raw) : [];
      if (initial?.id) {
        arr = arr.map((p:any) => (Number(p.id) === Number(initial.id) ? { ...p, ...payload, id: initial.id } : p));
      } else {
        const max = arr.reduce((m:any,p:any)=>Math.max(m,Number(p.id)||0),0);
        arr.push({ id: max+1, ...payload });
      }
      localStorage.setItem(SNAP_KEY, JSON.stringify(arr));
      window.dispatchEvent(new Event("ekatalog:products_update"));
    } catch {}

    setSaving(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.12 }} className="bg-white rounded-xl shadow-lg w-full max-w-[720px] p-6 z-10">
            <h3 className="text-lg font-medium mb-3">{initial ? "Edit Product" : "Add New Product"}</h3>
            <form onSubmit={submit} className="grid gap-3">
              <div>
                <label className="text-xs text-gray-600">Title</label>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} required className="w-full px-3 py-2 border rounded" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Type</label>
                  <input value={type} onChange={(e)=>setType(e.target.value)} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">UOM</label>
                  <input value={uom} onChange={(e)=>setUom(e.target.value)} className="w-full px-3 py-2 border rounded" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Image path</label>
                <input value={image} onChange={(e)=>setImage(e.target.value)} placeholder="/images/products/..." className="w-full px-3 py-2 border rounded" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Description</label>
                <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full px-3 py-2 border rounded" rows={3} />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-2 rounded bg-[#2563EB] text-white">{saving ? "Saving..." : (initial ? "Save Changes" : "Add Product")}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
