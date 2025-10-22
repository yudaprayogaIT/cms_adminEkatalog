// src/components/wa/AddNumberModal.tsx
'use client';
import React, { useState } from 'react';

type Props = {
  open: boolean;
  users: any[];
  onClose: () => void;
  onCreate: (payload: { user_id?: number | null; name?: string; phone_number?: string }) => Promise<void>;
};

export default function AddNumberModal({ open, users, onClose, onCreate }: Props) {
  const [useUserId, setUseUserId] = useState<number | null>(null);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-[92%] max-w-md p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add WhatsApp Account</h3>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select existing user (optional)</label>
            <select
              className="mt-2 w-full border rounded px-3 py-2"
              value={useUserId ?? ''}
              onChange={(e) => setUseUserId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">-- choose user --</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.id} — {u.name} ({u.phone_number ?? '-'})</option>)}
            </select>
          </div>

          <div className="text-sm text-gray-500">Or enter manually:</div>

          <div>
            <label className="block text-sm text-gray-700">Name</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={manualName} onChange={(e) => setManualName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Phone</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 rounded bg-green-600 text-white"
            onClick={async () => {
              // if select user chosen, create with user_id only
              if (useUserId) {
                await onCreate({ user_id: useUserId });
                onClose();
                return;
              }
              // otherwise require manual inputs
              if (!manualName || !manualPhone) { alert('Isi name dan phone jika tidak memilih user'); return; }
              await onCreate({ name: manualName, phone_number: manualPhone });
              onClose();
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
