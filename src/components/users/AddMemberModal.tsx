// src/components/users/AddMemberModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type Admin = {
  id: number;
  name: string;
  role: string;
  cabang?: string;
  nomortelepon?: string;
  avatar?: string;
  email?: string;
  gender?: 'male' | 'female';
  username?: string;
  password?: string;
};

const SNAP_KEY = 'ekatalog_admins_snapshot';
const BRANCH_SNAP = 'ekatalog_branches_snapshot';

type Props = { open: boolean; onClose: () => void; initialData?: Admin | null };

const ROLE_OPTIONS = ['Administrator', 'Marketing', 'Manager Sales', 'SPV Sales', 'Kepala Cabang', 'Sales'];

export default function AddMemberModal({ open, onClose, initialData = null }: Props) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [email, setEmail] = useState('');
  const [cabang, setCabang] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('/images/avatars/avatarman_placeholder.png');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branches, setBranches] = useState<{ daerah: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingSaveRef = useRef<null | (() => Promise<void>)>(null);

  useEffect(() => {
    async function loadBranches() {
      const raw = localStorage.getItem(BRANCH_SNAP);
      if (raw) {
        try {
          const list = JSON.parse(raw) as any[];
          setBranches(list.map((b) => ({ daerah: b.daerah, name: b.name })));
          return;
        } catch {}
      }
      try {
        const r = await fetch('/data/branches.json');
        if (r.ok) {
          const list = await r.json();
          setBranches(list.map((b: any) => ({ daerah: b.daerah, name: b.name })));
        }
      } catch {}
    }
    if (open) loadBranches();
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '');
      setRole(initialData.role ?? ROLE_OPTIONS[0]);
      setEmail(initialData.email ?? '');
      setCabang(initialData.cabang ?? '');
      setPhone(initialData.nomortelepon ?? '');
      setGender(initialData.gender ?? 'male');
      setUsername(initialData.username ?? '');
      setPassword(initialData.password ?? '');
      setAvatar(initialData.avatar ?? (initialData.gender === 'female' ? '/images/avatars/avatarwoman_placeholder.png' : '/images/avatars/avatarman_placeholder.png'));
    } else {
      setName('');
      setRole(ROLE_OPTIONS[0]);
      setEmail('');
      setCabang('');
      setPhone('');
      setGender('male');
      setAvatar('/images/avatars/avatarman_placeholder.png');
      setUsername('');
      setPassword('');
    }
  }, [initialData, open]);

  useEffect(() => {
    if (!initialData) {
      setAvatar(gender === 'female' ? '/images/avatars/avatarwoman_placeholder.png' : '/images/avatars/avatarman_placeholder.png');
    } else {
      if (!initialData.avatar) setAvatar(gender === 'female' ? '/images/avatars/avatarwoman_placeholder.png' : '/images/avatars/avatarman_placeholder.png');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender]);

  async function readSnapshotOrBase() {
    const raw = localStorage.getItem(SNAP_KEY);
    if (raw) {
      try { return JSON.parse(raw) as Admin[]; } catch {}
    }
    try {
      const r = await fetch('/data/admins.json');
      if (r.ok) return (await r.json()) as Admin[];
    } catch {}
    return [];
  }

  function saveSnapshot(list: Admin[]) {
    try { localStorage.setItem(SNAP_KEY, JSON.stringify(list)); } catch {}
    window.dispatchEvent(new Event('ekatalog:snapshot_update'));
  }

  async function callApiCreate(payload: Omit<Admin, 'id'>) {
    try {
      const res = await fetch('/api/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) return null;
      return (await res.json()) as Admin;
    } catch { return null; }
  }

  async function callApiUpdate(payload: Admin) {
    try {
      const res = await fetch('/api/admins', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) return null;
      return (await res.json()) as Admin;
    } catch { return null; }
  }

  // on submit = prepare pending action then ask confirm
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    pendingSaveRef.current = async () => {
      setSaving(true);
      const payloadNoId = { name: name || 'Unnamed', role, cabang, nomortelepon: phone, avatar, email, gender, username, password };

      if (initialData) {
        const updated: Admin = { ...initialData, ...payloadNoId };
        const updatedServer = await callApiUpdate(updated);
        if (updatedServer) {
          try { const r = await fetch('/api/admins'); if (r.ok) saveSnapshot(await r.json()); } catch {}
        } else {
          const list = await readSnapshotOrBase();
          const next = list.map((a) => (a.id === updated.id ? updated : a));
          saveSnapshot(next);
        }
      } else {
        const created = await callApiCreate(payloadNoId);
        if (created) {
          try { const r = await fetch('/api/admins'); if (r.ok) saveSnapshot(await r.json()); } catch {}
        } else {
          const list = await readSnapshotOrBase();
          const maxId = list.reduce((m, it) => Math.max(m, it.id ?? 0), 0);
          const nextItem: Admin = { id: maxId + 1, ...payloadNoId };
          list.push(nextItem);
          saveSnapshot(list);
        }
      }

      setSaving(false);
      onClose();
    };

    setConfirmOpen(true);
  }

  async function confirmSave() {
    setConfirmOpen(false);
    if (pendingSaveRef.current) {
      await pendingSaveRef.current();
      pendingSaveRef.current = null;
    }
  }
  function cancelSave() {
    pendingSaveRef.current = null;
    setConfirmOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.16 }} className="bg-white rounded-xl shadow-lg w-full max-w-[900px] p-6 z-10">
            <div className="mb-4">
              <h3 className="text-lg font-medium">{initialData ? 'Edit User' : 'Add New User'}</h3>
              <p className="text-sm text-gray-500">Isi data user. Kamu akan diminta konfirmasi sebelum menyimpan.</p>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-3 md:col-span-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border p-1 bg-white">
                  <img src={avatar} alt="avatar preview" className="object-cover w-full h-full" />
                </div>
                <div className="text-xs text-gray-500">Avatar akan mengikuti gender placeholder</div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="Enter full name" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm">
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Cabang</label>
                <select value={cabang} onChange={(e) => setCabang(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm">
                  <option value=''>-- Pilih Cabang --</option>
                  {branches.map((b) => <option key={b.daerah} value={String(b.daerah)}>{(b.daerah || '').replace(/\b\w/g, (c) => c.toUpperCase())} - {(b.name || '').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className="w-full px-3 py-2 border rounded mt-1 text-sm">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="Enter email" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="Enter phone number" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="username" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="password" />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 rounded border text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-[#2563EB] text-white text-sm">{saving ? 'Saving...' : initialData ? 'Save Changes' : 'Add Now'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={initialData ? 'Simpan Perubahan?' : 'Tambah User?'}
        description={initialData ? 'Simpan perubahan pada user ini?' : 'Yakin ingin menambahkan user baru?'}
        onConfirm={confirmSave}
        onCancel={cancelSave}
        confirmLabel={initialData ? 'Yes, save' : 'Yes, add'}
        cancelLabel="Cancel"
      />
    </AnimatePresence>
  );
}
