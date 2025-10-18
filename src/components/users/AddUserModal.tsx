'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Image from 'next/image';

type FormUser = {
  name?: string;
  role?: string;
  cabang?: string;
  phone?: string; // single canonical phone field
  profilePic?: string;
  gender?: 'male' | 'female';
  username?: string | null;
  password?: string | null;
  // address
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

type Props = { open: boolean; onClose: () => void; initialData?: (FormUser & { id?: number }) | null };

const SNAP_KEY = 'ekatalog_users_snapshot';
const BRANCH_SNAP = 'ekatalog_branches_snapshot';

const ROLE_OPTIONS = ['Administrator', 'Marketing', 'Manager Sales', 'SPV Sales', 'Kepala Cabang', 'Sales', 'Customer'];

/** Helper: Title Case (capitalize each word) */
function capitalizeWords(raw?: string) {
  if (!raw) return raw ?? '';
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w.length ? (w[0].toUpperCase() + w.slice(1).toLowerCase()) : w))
    .join(' ');
}

function nowISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Build full user object according to your users.json schema.
 * - For create (isUpdate=false) we DO NOT set `id`.
 * - For update (isUpdate=true) pass id param to include.
 *
 * NOTE: In production you should NOT send plaintext password to storage;
 * server should hash the password before persisting.
 */
function buildFullUserPayload(form: FormUser, opts?: { isUpdate?: boolean; id?: number; createdBy?: number; updatedBy?: number }) {
  const createdBy = opts?.createdBy ?? 1;
  const updatedBy = opts?.updatedBy ?? 1;
  const now = nowISO();

  type UserPayload = {
    id?: number;
    role: string;
    status: string;
    email: string | null;
    phone: string | null;
    is_email_verified: boolean;
    is_phone_verified: boolean;
    password_hash: string | null;
    google_id: string | null;
    login_type: string;
    name: string;
    gender: 'male' | 'female' | null;
    dateOfBirth: string | null;
    profilePic: string | null;
    cabang: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
    country: string | null;
    lastLogin: string | null;
    createdAt?: string;
    updatedAt: string;
    createdBy: number;
    updatedBy: number;
    tokenVersion: number;
    mobileSessionId: string | null;
    username: string | null;
    // Uncomment and add membership fields if needed
    // member_status?: string | null;
    // member_branch_id?: number | null;
    // loyalty_points?: number;
    // member_active_date?: string | null;
    // member_since?: string | null;
    // is_member_active?: boolean;
  };

  const base: UserPayload = {
    // do not include id for create; Add it in the caller for update
    role: form.role ?? 'Customer',
    status: 'enabled',
    email: null,
    phone: form.phone ?? null,
    is_email_verified: false,
    is_phone_verified: false,
    // we place raw password into password_hash field (server should hash it!)
    password_hash: form.password ?? null,
    google_id: null,
    login_type: form.password ? 'traditional' : 'phone_otp',
    name: form.name ?? '',
    gender: form.gender ?? null,
    dateOfBirth: null,
    profilePic: form.profilePic ?? null,
    cabang: form.cabang ?? null,
    address: form.address ?? null,
    city: form.city ?? null,
    province: null,
    postal_code: form.postal_code ?? null,
    country: form.country ?? 'Indonesia',
    lastLogin: null,
    createdAt: opts?.isUpdate ? undefined : now,
    updatedAt: now,
    createdBy,
    updatedBy,
    tokenVersion: 1,
    mobileSessionId: null,
    username: form.username ?? null,
    // // membership fields defaults
    // member_status: null,
    // member_branch_id: null,
    // loyalty_points: 0,
    // member_active_date: null,
    // member_since: null,
    // is_member_active: false,
  };

  if (opts?.isUpdate && typeof opts.id === 'number') {
    base.id = opts.id;
    // do not override createdAt on update; leave it undefined so server/merge keeps original
    delete base.createdAt;
  }

  return base;
}

export default function AddMemberModal({ open, onClose, initialData = null }: Props) {
  // form state (canonical keys)
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [cabang, setCabang] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState('/images/avatars/avatarman_placeholder.png');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branches, setBranches] = useState<{ daerah: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // address fields (only for Customer)
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Indonesia');

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
      // adapt initialData which may be in full schema
      setName(initialData.name ?? '');
      setRole(initialData.role ?? ROLE_OPTIONS[0]);
      setCabang(initialData.cabang ?? '');
      setPhone(initialData.phone ?? '');
      setGender((initialData.gender as 'male' | 'female') ?? 'male');
      setUsername(initialData.username ?? '');
      // we don't prefill password for security; if initialData.password_hash exists, leave password empty
      setPassword('');
      setProfilePic(initialData.profilePic ?? (initialData.gender === 'female' ? '/images/avatars/avatarwoman_placeholder.png' : '/images/avatars/avatarman_placeholder.png'));
      // address fields
      setAddress(initialData.address ?? '');
      setCity(initialData.city ?? '');
      setPostalCode(initialData.postal_code ?? '');
      setCountry(initialData.country ?? 'Indonesia');
    } else {
      setName('');
      setRole(ROLE_OPTIONS[0]);
      setCabang('');
      setPhone('');
      setGender('male');
      setProfilePic('/images/avatars/avatarman_placeholder.png');
      setUsername('');
      setPassword('');
      setAddress('');
      setCity('');
      setPostalCode('');
      setCountry('Indonesia');
    }
  }, [initialData, open]);

  useEffect(() => {
    // profilePic default when gender changes (only for new entry or when no custom profilePic)
    if (!initialData) {
      setProfilePic(gender === 'female' ? '/images/avatars/avatarwoman_placeholder.png' : '/images/avatars/avatarman_placeholder.png');
    } else {
      if (!initialData.profilePic) setProfilePic(gender === 'female' ? '/images/avatars/avatarwoman_placeholder.png' : '/images/avatars/avatarman_placeholder.png');
    }
    // if role is not Customer, clear address fields (admin creation doesn't need address)
    if (role !== 'Customer') {
      setAddress('');
      setCity('');
      setPostalCode('');
      setCountry('Indonesia');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender, role]);

  async function readSnapshotOrBase() {
    const raw = localStorage.getItem(SNAP_KEY);
    if (raw) {
      try { return JSON.parse(raw) as any[]; } catch {}
    }
    try {
      const r = await fetch('/data/users.json');
      if (r.ok) return (await r.json()) as any[];
    } catch {}
    return [];
  }

  function saveSnapshot(list: any[]) {
    try { localStorage.setItem(SNAP_KEY, JSON.stringify(list)); } catch {}
    window.dispatchEvent(new Event('ekatalog:snapshot_update'));
  }

  async function callApiCreate(payload: any) {
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) return null;
      return (await res.json());
    } catch { return null; }
  }

  async function callApiUpdate(payload: any) {
    try {
      const res = await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) return null;
      return (await res.json());
    } catch { return null; }
  }

  // onBlur handlers to auto-capitalize visible fields
  function handleNameBlur() { setName(capitalizeWords(name)); }
  function handleCabangBlur() { setCabang(capitalizeWords(cabang)); }
  function handleAddressBlur() { setAddress(capitalizeWords(address)); }
  function handleCityBlur() { setCity(capitalizeWords(city)); }
  function handleCountryBlur() { setCountry(capitalizeWords(country)); }

  // on submit = prepare pending action then ask confirm
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    pendingSaveRef.current = async () => {
      setSaving(true);

      // gather canonical form fields
      const form: FormUser = {
        name: capitalizeWords(name) || 'Unnamed',
        role,
        cabang: capitalizeWords(cabang) || undefined,
        phone: phone?.trim() || undefined,
        profilePic,
        gender,
        username: username?.trim() || null,
        password: password?.trim() || null,
        address: role === 'Customer' ? capitalizeWords(address) || null : null,
        city: role === 'Customer' ? capitalizeWords(city) || null : null,
        postal_code: role === 'Customer' ? (postalCode?.trim() || null) : null,
        country: role === 'Customer' ? capitalizeWords(country) || null : null,
      };

      if (initialData && typeof initialData.id === 'number') {
        // update: build full payload including id
        const full = buildFullUserPayload(form, { isUpdate: true, id: initialData.id, updatedBy: 1 });
        // merge with initialData to preserve fields not in form (createdAt, createdBy, etc.)
        const merged = { ...initialData, ...full, updatedAt: nowISO(), updatedBy: 1 };
        const updatedServer = await callApiUpdate(merged);
        if (updatedServer) {
          try { const r = await fetch('/api/users'); if (r.ok) saveSnapshot(await r.json()); } catch {}
        } else {
          const list = await readSnapshotOrBase();
          const next = list.map((a) => (a.id === merged.id ? merged : a));
          saveSnapshot(next);
        }
      } else {
        // create: build full payload (without id)
        const full = buildFullUserPayload(form, { isUpdate: false, createdBy: 1, updatedBy: 1 });
        const created = await callApiCreate(full);
        if (created) {
          try { const r = await fetch('/api/users'); if (r.ok) saveSnapshot(await r.json()); } catch {}
        } else {
          // fallback local snapshot add
          const list = await readSnapshotOrBase();
          const maxId = list.reduce((m, it) => Math.max(m, it.id ?? 0), 0);
          const nextItem = { id: maxId + 1, ...full };
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
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="bg-white rounded-xl shadow-lg w-full max-w-[900px] p-6 z-10"
          >
            <div className="mb-4">
              <h3 className="text-lg font-medium">{initialData ? 'Edit User' : 'Add New User'}</h3>
              <p className="text-sm text-gray-500">Isi data user. Kamu akan diminta konfirmasi sebelum menyimpan.</p>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-3 md:col-span-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border p-1 bg-white">
                  <Image src={profilePic} alt="avatar preview" width={100} height={100} className="object-cover w-full h-full" />
                </div>
                <div className="text-xs text-gray-500">Avatar akan mengikuti gender placeholder</div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} onBlur={handleNameBlur} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="Enter full name" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm">
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Cabang</label>
                <select value={cabang} onChange={(e) => setCabang(e.target.value)} onBlur={handleCabangBlur} className="w-full px-3 py-2 border rounded mt-1 text-sm">
                  <option value=''>-- Pilih Cabang --</option>
                  {branches.map((b, i) => (
                    <option key={`${b.daerah ?? 'branch'}-${i}`} value={String(b.daerah)}>
                      {(b.daerah || '').replace(/\b\w/g, (c) => c.toUpperCase())} - {(b.name || '').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
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

              {/* Address fields only for Customer */}
              {role === 'Customer' && (
                <>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-600">Alamat</label>
                    <input value={address} onChange={(e) => setAddress(e.target.value)} onBlur={handleAddressBlur} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="Alamat lengkap" />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">City</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} onBlur={handleCityBlur} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="Kota" />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Postal Code</label>
                    <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="Kode pos" />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Country</label>
                    <input value={country} onChange={(e) => setCountry(e.target.value)} onBlur={handleCountryBlur} className="w-full px-3 py-2 border rounded mt-1 text-sm" placeholder="Country" />
                  </div>
                </>
              )}

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 rounded border text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-[#2563EB] text-white text-sm">{saving ? 'Saving...' : initialData ? 'Save Changes' : 'Add Now'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      <ConfirmDialog
        key="confirm"
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
