'use client';

import React, { useEffect, useRef, useState } from 'react';
import BranchCard from './BranchCard';
import AddBranchModal from './AddBranchModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import BranchDetailModal from './BranchDetailModal';

type Branch = {
  id: number;
  daerah: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  pulau?: string;
};

const DATA_URL = '/data/branches.json';
const SNAP_KEY = 'ekatalog_branches_snapshot';

export default function BranchList() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<Branch | null>(null);

  // detail modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewBranch, setViewBranch] = useState<Branch | null>(null);

  // confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDesc, setConfirmDesc] = useState('');
  const actionRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const raw = localStorage.getItem(SNAP_KEY);
      if (raw) {
        try { const snap = JSON.parse(raw) as Branch[]; if (!cancelled) setBranches(snap); setLoading(false); return; } catch {}
      }
      try {
        const res = await fetch(DATA_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('failed fetch');
        const list = (await res.json()) as Branch[];
        if (!cancelled) { setBranches(list); try { localStorage.setItem(SNAP_KEY, JSON.stringify(list)); } catch {} }
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handler() {
      const raw = localStorage.getItem(SNAP_KEY);
      if (!raw) return;
      try { setBranches(JSON.parse(raw) as Branch[]); } catch {}
    }
    window.addEventListener('ekatalog:branches_update', handler);
    return () => window.removeEventListener('ekatalog:branches_update', handler);
  }, []);

  function saveSnapshot(list: Branch[]) {
    try { localStorage.setItem(SNAP_KEY, JSON.stringify(list)); } catch {}
    window.dispatchEvent(new Event('ekatalog:branches_update'));
  }

  async function tryApiDelete(id: number) {
    try {
      const res = await fetch('/api/branches', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      return res.ok;
    } catch { return false; }
  }

  function promptDeleteBranch(b: Branch) {
    setConfirmTitle('Hapus Cabang');
    setConfirmDesc(`Yakin ingin menghapus cabang "${b.name}"?`);
    actionRef.current = async () => {
      const next = branches.filter((x) => x.id !== b.id);
      setBranches(next);
      saveSnapshot(next);
      const ok = await tryApiDelete(b.id);
      if (ok) {
        try {
          const r = await fetch('/api/branches');
          if (r.ok) saveSnapshot(await r.json());
        } catch {}
      }
    };
    setConfirmOpen(true);
  }

  function handleEdit(b: Branch) {
    setModalInitial(b);
    setModalOpen(true);
  }
  function handleAdd() {
    setModalInitial(null);
    setModalOpen(true);
  }

  async function confirmOk() {
    setConfirmOpen(false);
    if (actionRef.current) { await actionRef.current(); actionRef.current = null; }
  }
  function confirmCancel() { actionRef.current = null; setConfirmOpen(false); }

  // ---- detail modal handlers ----
  function openView(b: Branch) {
    setViewBranch(b);
    setViewOpen(true);
  }
  function closeView() {
    setViewOpen(false);
    setViewBranch(null);
  }

  // when user clicks Edit in detail modal -> open edit modal
  function onDetailEdit(b: Branch) {
    closeView();
    // small timeout to avoid UI clash between modals
    setTimeout(() => handleEdit(b), 80);
  }

  // when user clicks Delete in detail modal -> prompt confirm (close detail first)
  function onDetailDelete(b: Branch) {
    closeView();
    setTimeout(() => promptDeleteBranch(b), 80);
  }

  if (loading) return <div className="py-8 text-center text-sm text-gray-500">Loading branches...</div>;
  if (error) return <div className="py-8 text-center text-sm text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-montserrat font-semibold">Cabang Ekatunggal</h2>
        </div>
        <div>
          <button onClick={handleAdd} className="px-3 py-2 bg-[#2563EB] text-white rounded-md text-sm">Add New Branch</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {branches.map((b) => (
          <BranchCard
            key={b.id}
            id={b.id}
            daerah={b.daerah}
            name={b.name}
            address={b.address}
            pulau={b.pulau}
            onDelete={() => promptDeleteBranch(b)}
            onEdit={() => handleEdit(b)}
            onView={() => openView(b)}
          />
        ))}
      </div>

      <AddBranchModal open={modalOpen} onClose={() => setModalOpen(false)} initial={modalInitial} />

      <BranchDetailModal
        open={viewOpen}
        onClose={closeView}
        branch={viewBranch}
        onEdit={onDetailEdit}
        onDelete={onDetailDelete}
      />

      <ConfirmDialog open={confirmOpen} title={confirmTitle} description={confirmDesc} onConfirm={confirmOk} onCancel={confirmCancel} confirmLabel="Yes, delete" cancelLabel="Cancel" />
    </div>
  );
}
