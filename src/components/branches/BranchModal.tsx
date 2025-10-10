// src/components/branches/BranchModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Branch = {
  id: number;
  daerah: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  pulau?: string;
  wilayah?: string;
};

const SNAP_KEY = 'ekatalog_branches_snapshot';

export default function BranchModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: Branch | null; }) {
  const [daerah, setDaerah] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [pulau, setPulau] = useState('');
  const [wilayah, setWilayah] = useState('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setDaerah(initial.daerah);
      setName(initial.name);
      setAddress(initial.address);
      setPulau(initial.pulau ?? '');
      setWilayah(initial.wilayah ?? '');
      setLat(initial.lat?.toString() ?? '');
      setLng(initial.lng?.toString() ?? '');
    } else {
      setDaerah('');
      setName('');
      setAddress('');
      setPulau('');
      setWilayah('');
      setLat('');
      setLng('');
    }
  }, [initial, open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      daerah: (daerah || name.toLowerCase().replace(/\s+/g, '-')),
      name,
      address,
      pulau,
      wilayah,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
    };

    // Try API first
    try {
      if (initial) {
        await fetch('/api/branches', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: initial.id, ...payload }) });
      } else {
        const res = await fetch('/api/branches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        // server returns created item with numeric id
        if (res.ok) {
          // sync snapshot from server
          const listRes = await fetch('/api/branches');
          if (listRes.ok) {
            const list = await listRes.json();
            localStorage.setItem(SNAP_KEY, JSON.stringify(list));
            window.dispatchEvent(new Event('ekatalog:branches_update'));
            setSaving(false);
            onClose();
            return;
          }
        }
      }
    } catch (err) {
      // ignore, fallback to snapshot
    }

    // Fallback: update local snapshot (generate numeric id)
    try {
      const raw = localStorage.getItem(SNAP_KEY);
      let list: Branch[] = raw ? JSON.parse(raw) : [];
      if (initial) {
        list = list.map((b) => (b.id === initial.id ? { ...b, ...payload } : b));
      } else {
        const maxId = list.reduce((m, it) => Math.max(m, Number(it.id) || 0), 0);
        const next: Branch = { id: maxId + 1, ...payload };
        list.push(next);
      }
      localStorage.setItem(SNAP_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('ekatalog:branches_update'));
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
          <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.14 }} className="bg-white rounded-xl shadow-lg w-full max-w-[720px] p-6 z-10">
            <h3 className="text-lg font-medium mb-3">{initial ? 'Edit Branch' : 'Add New Branch'}</h3>
            <form onSubmit={submit} className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs text-gray-600">Daerah (short id)</label>
                <input value={daerah} onChange={(e) => setDaerah(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="eg. medan" />
                <div className="text-xs text-gray-400 mt-1">Jika kosong, akan dibuat dari nama (kebab-case).</div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="Branch name" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Territory</label>
                <input value={wilayah} onChange={(e) => setWilayah(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="Branch territory" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Pulau</label>
                  <input value={pulau} onChange={(e) => setPulau(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="sumatera / jawa ..." />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Lat</label>
                  <input value={lat} onChange={(e) => setLat(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Lng</label>
                  <input value={lng} onChange={(e) => setLng(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-2 rounded bg-[#2563EB] text-white">{saving ? 'Saving...' : (initial ? 'Save Changes' : 'Add Branch')}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
