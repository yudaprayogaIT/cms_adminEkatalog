// src/app/admin/whatsapp/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import WAList from '@/components/wa/WAList';
import ConnectModal from '@/components/wa/ConnectModal';
import AddNumberModal from '@/components/wa/AddNumberModal';

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [connectAccount, setConnectAccount] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([fetch('/api/wa_accounts'), fetch('/api/users')]);
      if (r1.ok) setItems(await r1.json());
      if (r2.ok) setUsers(await r2.json());
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  function handleConnectClick(item: any) {
    setConnectAccount(item);
  }

  async function handleMarkConnected(id: number) {
    const now = new Date().toISOString();
    const res = await fetch('/api/wa_accounts', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'connected', last_login_at: now, last_seen_at: now })
    });
    if (res.ok) {
      const updated = await res.json();
      setItems(prev => prev.map(p => p.id === updated.id ? updated : p));
    }
  }

  async function handleDisconnect(id: number) {
    const res = await fetch('/api/wa_accounts', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'disconnected', updated_at: new Date().toISOString() })
    });
    if (res.ok) {
      const updated = await res.json();
      setItems(prev => prev.map(p => p.id === updated.id ? updated : p));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus akun ini?')) return;
    const res = await fetch('/api/wa_accounts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (res.ok) setItems(prev => prev.filter(p => p.id !== id));
  }

  async function handleCreate(payload: { user_id?: number | null; name?: string; phone?: string }) {
    // payload uses phone (not phone_number) to match wa_accounts.json
    const res = await fetch('/api/wa_accounts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (res.ok) {
      const created = await res.json();
      setItems(prev => [created, ...prev]);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">WhatsApp Accounts</h1>
          <div className="text-sm text-gray-500">Dashboard / WhatsApp</div>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-white border px-3 py-2 rounded" onClick={fetchData}>Refresh</button>

          <button className="bg-gradient-to-r from-green-300 to-green-500 text-white rounded-full px-4 py-2" onClick={() => setShowAddModal(true)}>
            Add Number
          </button>
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <WAList
          items={items}
          users={users}
          onConnectClick={handleConnectClick}
          onDisconnect={handleDisconnect}
          onDelete={handleDelete}
          pageSize={10}
        />
      )}

      <ConnectModal open={!!connectAccount} account={connectAccount} onClose={() => setConnectAccount(null)} onMarkConnected={handleMarkConnected} />

      <AddNumberModal open={showAddModal} users={users} onClose={() => setShowAddModal(false)} onCreate={handleCreate} />
    </div>
  );
}
