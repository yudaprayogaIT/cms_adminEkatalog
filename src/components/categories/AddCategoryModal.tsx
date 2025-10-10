// src/components/categories/AddCategoryModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Category = {
  id?: number;
  name: string;
  type: "Material" | "Furniture" | string;
  points: number;
  image?: string;
  description?: string;
};

const SNAP_KEY = "ekatalog_categories_snapshot";

export default function AddCategoryModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: Category | null; }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"Material" | "Furniture" | string>("Material");
  const [points, setPoints] = useState<number>(0);
  const [imagePath, setImagePath] = useState(""); // can be path or dataURL
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name ?? "");
      setType(initial.type ?? "Material");
      setPoints(initial.points ?? 0);
      setImagePath(initial.image ?? "");
      setDescription(initial.description ?? "");
      setPreview(initial.image ?? null);
      setImageFile(null);
    } else {
      setName("");
      setType("Material");
      setPoints(0);
      setImagePath("");
      setDescription("");
      setPreview(null);
      setImageFile(null);
    }
  }, [initial, open]);

  // when user picks a file, create preview (dataURL)
  useEffect(() => {
    if (!imageFile) return;
    const fr = new FileReader();
    fr.onload = () => {
      setPreview(String(fr.result));
      setImagePath(String(fr.result)); // store dataURL as imagePath
    };
    fr.readAsDataURL(imageFile);
  }, [imageFile]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: name.trim(),
      type,
      points: Number(points || 0),
      image: imagePath || undefined, // either path or dataURL
      description: description || undefined,
    };

    try {
      if (initial && initial.id) {
        await fetch("/api/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: initial.id, ...payload }) });
      } else {
        await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }

      // try to sync snapshot from server
      try {
        const r = await fetch("/api/categories");
        if (r.ok) {
          const list = await r.json();
          localStorage.setItem(SNAP_KEY, JSON.stringify(list));
          window.dispatchEvent(new Event("ekatalog:categories_update"));
          setSaving(false);
          onClose();
          return;
        }
      } catch {}
    } catch (err) {
      // ignore, fallback to snapshot
    }

    // fallback: update local snapshot (merge)
    try {
      const raw = localStorage.getItem(SNAP_KEY);
      let list: any[] = raw ? JSON.parse(raw) : [];
      if (initial && initial.id) {
        list = list.map((c) => (c.id === initial.id ? { ...c, ...payload } : c));
      } else {
        const maxId = list.reduce((m: number, it: any) => Math.max(m, Number(it.id) || 0), 0);
        list.push({ id: maxId + 1, ...payload });
      }
      localStorage.setItem(SNAP_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event("ekatalog:categories_update"));
    } catch {}
    setSaving(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.14 }} className="bg-white rounded-xl shadow-lg w-full max-w-[720px] p-6 z-10">
            <h3 className="text-lg font-medium mb-3">{initial ? "Edit Category" : "Add New Category"}</h3>

            <form onSubmit={submit} className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs text-gray-600">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm">
                    <option value="Material">Material</option>
                    <option value="Furniture">Furniture</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Points</label>
                  <input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} className="w-full px-3 py-2 border rounded mt-1 text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Image (upload or path)</label>
                <div className="flex items-center gap-3 mt-1">
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
                  <input value={imagePath} onChange={(e) => { setImagePath(e.target.value); setPreview(e.target.value || null); }} placeholder="/images/categories/..." className="flex-1 px-3 py-2 border rounded text-sm" />
                </div>
                <div className="text-xs text-gray-400 mt-1">Pilih file dari komputer atau masukkan path relatif dari folder <code>public/</code>.</div>

                {preview && (
                  <div className="mt-3 w-40 h-40 bg-gray-50 rounded overflow-hidden flex items-center justify-center border">
                    {/* jika dataURL atau path, langsung tampilkan */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="preview" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" rows={3} />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-2 rounded bg-[#2563EB] text-white">{saving ? "Saving..." : (initial ? "Save Changes" : "Add Category")}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
