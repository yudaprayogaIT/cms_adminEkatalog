'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Branch = {
  id?: number;
  daerah: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  pulau?: string;
  wilayah?: 'Barat' | 'Timur';
};

const SNAP_KEY = 'ekatalog_branches_snapshot';

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Branch | null;
};

export default function AddBranchModal({ open, onClose, initial = null }: Props) {
  const [daerah, setDaerah] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [pulau, setPulau] = useState('');
  const [wilayah, setWilayah] = useState<'Barat' | 'Timur'>('Barat');

  useEffect(() => {
    if (initial) {
      setDaerah(initial.daerah ?? '');
      setName(initial.name ?? '');
      setAddress(initial.address ?? '');
      setLat(initial.lat?.toString() ?? '');
      setLng(initial.lng?.toString() ?? '');
      setPulau(initial.pulau ?? '');
      setWilayah(initial.wilayah ?? 'Barat');
    } else {
      setDaerah('');
      setName('');
      setAddress('');
      setLat('');
      setLng('');
      setPulau('');
      setWilayah('Barat');
    }
  }, [initial, open]);

  async function readSnapshotOrBase(): Promise<Branch[]> {
    const raw = localStorage.getItem(SNAP_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as Branch[];
      } catch {}
    }
    try {
      const res = await fetch('/data/branches.json');
      if (res.ok) return (await res.json()) as Branch[];
    } catch {}
    return [];
  }

  function saveSnapshot(list: Branch[]) {
    try {
      localStorage.setItem(SNAP_KEY, JSON.stringify(list));
    } catch {}
    window.dispatchEvent(new Event('ekatalog:branches_update'));
  }

  async function callApiCreate(payload: Branch) {
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function callApiUpdate(payload: Branch) {
    try {
      const res = await fetch('/api/branches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Branch = {
      daerah: daerah || '',
      name: name || '',
      address: address || '',
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      pulau: pulau || '',
      wilayah: wilayah || '',
    };

    if (initial && initial.id) {
      const updated = { ...(initial as Branch), ...payload };
      const server = await callApiUpdate(updated);
      if (server) {
        // sync read server list
        try {
          const r = await fetch('/api/branches');
          if (r.ok) {
            const list = await r.json();
            saveSnapshot(list);
          }
        } catch {}
      } else {
        const list = await readSnapshotOrBase();
        const next = list.map((b) => (b.id === updated.id ? updated : b));
        saveSnapshot(next);
      }
    } else {
      const created = await callApiCreate(payload);
      if (created) {
        try {
          const r = await fetch('/api/branches');
          if (r.ok) {
            const list = await r.json();
            saveSnapshot(list);
          }
        } catch {}
      } else {
        const list = await readSnapshotOrBase();
        const maxId = list.reduce((m, it) => Math.max(m, it.id ?? 0), 0);
        list.push({ id: maxId + 1, ...payload });
        saveSnapshot(list);
      }
    }

    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.16 }} className="bg-white rounded-xl shadow-lg w-full max-w-[800px] p-6 z-10">
            <h3 className="text-lg font-medium mb-3">{initial ? 'Edit Branch' : 'Add New Branch'}</h3>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3">
                <label className="text-xs text-gray-600">Company Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-600">Territory</label>
                <select value={wilayah} onChange={(e) => setWilayah(e.target.value as 'Barat' | 'Timur')} className="w-full px-3 py-2 border rounded mt-1 text-sm">
                  <option value="Barat">Barat</option>
                  <option value="Timur">Timur</option>
                </select>
              </div>
              <div className='md:col-span-2'>
                <label className="text-xs text-gray-600">Region</label>
                <input value={daerah} onChange={(e) => setDaerah(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" />
              </div>
              <div className='md:col-span-2'>
                <label className="text-xs text-gray-600">Island</label>
                <input value={pulau} onChange={(e) => setPulau(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" />
              </div>
              <div className="md:col-span-4">
                <label className="text-xs text-gray-600">Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-600">Latitude</label>
                <input value={lat} onChange={(e) => setLat(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" />
              </div>
              <div className='md:col-span-2'>
                <label className="text-xs text-gray-600">Longitude</label>
                <input value={lng} onChange={(e) => setLng(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" />
              </div>
              <div className="md:col-span-4 flex justify-end gap-2 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded border text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-[#2563EB] text-white text-sm">{initial ? 'Save changes' : 'Add Branch'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
