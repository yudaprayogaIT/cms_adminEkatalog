"use client";

import React, { useEffect, useState } from "react";
import ItemCard from "./ItemCard";
import ItemDetailModal from "./ItemDetailModal";
import AddEditItemModal from "./AddEditItemModal";

export const metadata = {
  title: "Items - Admin Pengelola Ekatalog",
};

const SNAP_KEY = "ekatalog_items_snapshot";

export default function ItemCatalog() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // load items: try API -> public data -> local snapshot
  async function loadItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/items");
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
        return;
      }
    } catch (err) {
      // ignore, try fallback
    }

    try {
      const r2 = await fetch("/data/items.json");
      if (r2.ok) {
        const data2 = await r2.json();
        setItems(Array.isArray(data2) ? data2 : []);
        setLoading(false);
        return;
      }
    } catch { }

    // fallback snapshot
    try {
      const raw = localStorage.getItem(SNAP_KEY);
      const snap = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(snap) ? snap : []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
    function onUpdate() {
      loadItems();
    }
    window.addEventListener("ekatalog:items_update", onUpdate);
    return () => window.removeEventListener("ekatalog:items_update", onUpdate);
  }, []);

  function openDetail(item: any) {
    setSelectedItem(item);
    setDetailOpen(true);
  }

  function openEdit(item?: any) {
    setEditingItem(item ?? null);
    setEditOpen(true);
  }

  async function handleDelete(item: any) {
    if (!confirm(`Hapus item "${item.title}"?`)) return;
    // try API delete
    try {
      const res = await fetch("/api/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      if (!res.ok) {
        // ignore; still update local snapshot
        console.warn("delete /api/items failed", res.status);
      }
    } catch (err) {
      console.warn("delete network error", err);
    }

    // update snapshot (and local state)
    try {
      const raw = localStorage.getItem(SNAP_KEY);
      let arr = raw ? JSON.parse(raw) : [];
      arr = arr.filter((x: any) => Number(x.id) !== Number(item.id));
      localStorage.setItem(SNAP_KEY, JSON.stringify(arr));
      // trigger global update
      window.dispatchEvent(new Event("ekatalog:items_update"));
      // optimistic UI update
      setItems(prev => prev.filter(x => Number(x.id) !== Number(item.id)));
      setDetailOpen(false);
    } catch (err) {
      console.error("failed update snapshot after delete", err);
    }
  }

  return (
    <div>
      {/* <div className="mb-4 flex items-center justify-end">
        <div>
          <button
            onClick={() => openEdit(undefined)}
            className="px-4 py-2 rounded bg-[#2563EB] text-white"
          >
            Add Item
          </button>
        </div>
      </div> */}

      {loading ? (
        <div className="text-sm text-gray-500">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">No items found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              onView={() => openDetail(it)}
              onEdit={() => openEdit(it)}
              onDelete={() => handleDelete(it)}
            />
          ))}
        </div>
      )}

      <ItemDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        item={selectedItem}
        onEdit={(it: any) => {
          setDetailOpen(false);
          openEdit(it);
        }}
        onDelete={(it: any) => handleDelete(it)}
      />

      <AddEditItemModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingItem(null);
        }}
        initial={editingItem}
        products={[] /* optional: pass products list if you have /data/products.json loaded elsewhere */}
      />
      <div className="mt-4 p-4 text-end">
          <div className="text-sm text-gray-500">Total items</div>
          <div className="text-lg font-semibold">{items.length}</div>
        </div>
    </div>
  );
}
