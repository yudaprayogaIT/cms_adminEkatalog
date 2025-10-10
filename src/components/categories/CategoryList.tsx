// src/components/categories/CategoryList.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import CategoryCard from "./CategoryCard";
import AddCategoryModal from "./AddCategoryModal";
import CategoryDetailModal from "./CategoryDetailModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Category = {
  id: number;
  name: string;
  type: string; // "Material" | "Furniture"
  points: number;
  image?: string;
  description?: string;
};

const DATA_URL = "/data/categories.json";
const SNAP_KEY = "ekatalog_categories_snapshot";

export default function CategoryList() {
  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<Category | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Category | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");
  const actionRef = useRef<(() => Promise<void>) | null>(null);

  // Try to get fresh data from API; fallback to localStorage or static data file
  async function refreshFromServer() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setList(data);
        try {
          localStorage.setItem(SNAP_KEY, JSON.stringify(data));
        } catch {}
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      // 1) try server/api first
      const ok = await refreshFromServer();
      if (!ok) {
        // 2) fallback to localStorage snapshot if present
        const raw = localStorage.getItem(SNAP_KEY);
        if (raw) {
          try {
            const snap = JSON.parse(raw) as Category[];
            if (!cancelled) setList(snap);
            setLoading(false);
            return;
          } catch {}
        }

        // 3) fallback to static data file (public/data)
        try {
          const r = await fetch(DATA_URL, { cache: "no-store" });
          if (r.ok) {
            const d = (await r.json()) as Category[];
            if (!cancelled) {
              setList(d);
              try { localStorage.setItem(SNAP_KEY, JSON.stringify(d)); } catch {}
            }
          } else {
            if (!cancelled) setError(`Failed to fetch (${r.status})`);
          }
        } catch (err: unknown) {
          if (!cancelled) setError(err instanceof Error ? err.message : String(err));
        } finally {
          if (!cancelled) setLoading(false);
        }
      } else {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handler() {
      const raw = localStorage.getItem(SNAP_KEY);
      if (!raw) return;
      try { setList(JSON.parse(raw) as Category[]); } catch {}
    }
    window.addEventListener("ekatalog:categories_update", handler);
    return () => window.removeEventListener("ekatalog:categories_update", handler);
  }, []);

  function saveSnapshot(arr: Category[]) {
    try { localStorage.setItem(SNAP_KEY, JSON.stringify(arr)); } catch {}
    window.dispatchEvent(new Event("ekatalog:categories_update"));
  }

  async function tryApiDelete(id: number) {
    try {
      const res = await fetch("/api/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      return res.ok;
    } catch { return false; }
  }

  function promptDeleteCategory(c: Category) {
    setConfirmTitle("Hapus Kategori");
    setConfirmDesc(`Yakin ingin menghapus kategori "${c.name}"?`);
    actionRef.current = async () => {
      const next = list.filter((x) => x.id !== c.id);
      setList(next);
      saveSnapshot(next);
      const ok = await tryApiDelete(c.id);
      if (ok) {
        // try to sync fresh data from server
        await refreshFromServer();
      }
    };
    setConfirmOpen(true);
  }

  function handleAdd() {
    setModalInitial(null);
    setModalOpen(true);
  }
  function handleEdit(c: Category) {
    setModalInitial(c);
    setModalOpen(true);
  }

  function openDetail(c: Category) {
    setDetailItem(c);
    setDetailOpen(true);
  }
  function closeDetail() {
    setDetailOpen(false);
    setDetailItem(null);
  }

  function onDetailEdit(c: Category) {
    closeDetail();
    setTimeout(() => handleEdit(c), 80);
  }
  function onDetailDelete(c: Category) {
    closeDetail();
    setTimeout(() => promptDeleteCategory(c), 80);
  }

  async function confirmOk() {
    setConfirmOpen(false);
    if (actionRef.current) { await actionRef.current(); actionRef.current = null; }
  }
  function confirmCancel() { actionRef.current = null; setConfirmOpen(false); }

  if (loading) return <div className="py-8 text-center text-sm text-gray-500">Loading categories...</div>;
  if (error) return <div className="py-8 text-center text-sm text-red-500">Error: {error}</div>;

  const furniture = list.filter((c) => String(c.type).toLowerCase() === "furniture");
  const material = list.filter((c) => String(c.type).toLowerCase() === "material");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-montserrat font-semibold">Categories</h2>
          <div className="text-sm text-gray-500">Atur kategori & rules poin</div>
        </div>
        <div>
          <button onClick={handleAdd} className="px-3 py-2 bg-[#2563EB] text-white rounded-md text-sm">Add Category</button>
        </div>
      </div>

      {/* Furniture Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Furniture</h3>
          <div className="text-sm text-gray-500">{furniture.length} item(s)</div>
        </div>

        {furniture.length === 0 ? (
          <div className="text-sm text-gray-500">No furniture categories yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {furniture.map((c) => (
              <CategoryCard key={c.id} id={c.id} name={c.name} type={c.type} points={c.points} image={c.image} onEdit={() => handleEdit(c)} onDelete={() => promptDeleteCategory(c)} onView={() => openDetail(c)} />
            ))}
          </div>
        )}
      </section>

      {/* Material Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Material</h3>
          <div className="text-sm text-gray-500">{material.length} item(s)</div>
        </div>

        {material.length === 0 ? (
          <div className="text-sm text-gray-500">No material categories yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {material.map((c) => (
              <CategoryCard key={c.id} id={c.id} name={c.name} type={c.type} points={c.points} image={c.image} onEdit={() => handleEdit(c)} onDelete={() => promptDeleteCategory(c)} onView={() => openDetail(c)} />
            ))}
          </div>
        )}
      </section>

      <AddCategoryModal open={modalOpen} onClose={() => setModalOpen(false)} initial={modalInitial} />
      <CategoryDetailModal open={detailOpen} onClose={closeDetail} category={detailItem} onEdit={onDetailEdit} onDelete={onDetailDelete} />

      <ConfirmDialog open={confirmOpen} title={confirmTitle} description={confirmDesc} onConfirm={confirmOk} onCancel={confirmCancel} confirmLabel="Yes, delete" cancelLabel="Cancel" />
    </div>
  );
}
