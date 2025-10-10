'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Category = {
  id?: number;
  name: string;
  description?: string;
  points?: number;
  parent?: string;
};

const SNAP_KEY = 'ekatalog_categories_snapshot';

export default function CategoryModal({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Category | null;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState<string>('');
  const [parent, setParent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name ?? '');
      setDescription(initial.description ?? '');
      setPoints(initial.points?.toString() ?? '');
      setParent(initial.parent ?? '');
    } else {
      setName('');
      setDescription('');
      setPoints('');
      setParent('');
    }
  }, [initial, open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: (name || '').trim(),
      description: (description || '').trim(),
      points: points ? Number(points) : 0,
      parent: parent ? parent.trim() : undefined,
    };

    try {
      if (initial?.id) {
        // try API update
        const res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: initial.id, ...payload }),
        });
        if (res.ok) {
          // sync snapshot from server
          const listRes = await fetch('/api/categories');
          if (listRes.ok) {
            const list = await listRes.json();
            localStorage.setItem(SNAP_KEY, JSON.stringify(list));
            window.dispatchEvent(new Event('ekatalog:categories_update'));
            setSaving(false);
            onClose();
            return;
          }
        }
      } else {
        // try API create
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const listRes = await fetch('/api/categories');
          if (listRes.ok) {
            const list = await listRes.json();
            localStorage.setItem(SNAP_KEY, JSON.stringify(list));
            window.dispatchEvent(new Event('ekatalog:categories_update'));
            setSaving(false);
            onClose();
            return;
          }
        }
      }
    } catch (err) {
      // ignore and fallback to local snapshot
      // console.warn(err);
    }

    // fallback local snapshot update
    try {
      const raw = localStorage.getItem(SNAP_KEY);
      let list: Category[] = raw ? JSON.parse(raw) : [];
      if (initial?.id) {
        list = list.map((c) => (c.id === initial.id ? { ...c, ...payload, id: initial.id } : c));
      } else {
        const maxId = list.reduce((m, it) => Math.max(m, Number(it.id) || 0), 0);
        const next: Category = { id: maxId + 1, ...payload };
        list.push(next);
      }
      localStorage.setItem(SNAP_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('ekatalog:categories_update'));
    } catch {
      // ignore
    }

    setSaving(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.14 }} className="bg-white rounded-xl shadow-lg w-full max-w-[640px] p-6 z-10">
            <h3 className="text-lg font-medium mb-3">{initial ? 'Edit Category' : 'Add New Category'}</h3>
            <form onSubmit={submit} className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs text-gray-600">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="e.g. Accessories Kaki" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Points (per purchase)</label>
                  <input value={points} onChange={(e) => setPoints(e.target.value.replace(/[^\d\-]/g, ''))} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="e.g. 5" />
                  <div className="text-xs text-gray-400 mt-1">Angka poin yang didapat setiap pembelian item di kategori ini.</div>
                </div>

                <div>
                  <label className="text-xs text-gray-600">Parent (optional)</label>
                  <input value={parent} onChange={(e) => setParent(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="e.g. Accessories" />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-2 rounded bg-[#2563EB] text-white">{saving ? 'Saving...' : (initial ? 'Save Changes' : 'Add Category')}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
