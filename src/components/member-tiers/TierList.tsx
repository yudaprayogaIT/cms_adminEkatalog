"use client";

import React, { useEffect, useState } from "react";
import TierModal from "./TierModal";

type Tier = {
  id?: number;
  name: string;
  min_points: number;
  min_points_upgrade: number;
  // min_points_maintain: number;
  discount_rate: number;
  inactivity_penalty_points: number;
  inactivity_period_days: number;
  penalty_frequency_days: number;
};


export default function TierList() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tier | null>(null);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch("/api/member-tiers");
      if (res.ok) {
        const data = await res.json();
        setTiers(data);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { fetchList(); }, []);

  async function handleDelete(id?: number) {
    if (!id) return;
    if (!confirm("Hapus tier ini?")) return;
    try {
      const res = await fetch("/api/member-tiers", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
      if (res.status === 204) {
        window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "success", message: "Tier deleted" } }));
        fetchList();
      } else throw new Error("delete failed");
    } catch (e) {
      console.log(e)
      window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "error", message: "Delete failed" } }));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div />
        <div>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="px-3 py-2 bg-blue-600 text-white rounded">Add Tier</button>
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {tiers.length === 0 && <div className="text-sm text-gray-500">No tiers</div>}
          {tiers.map((t) => (
            <div key={t.id} className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{t.name}</div>
                {/* <div className="text-xs text-gray-500">Upgrade: {t.min_points_upgrade} | Maintain: {t.min_points_maintain} | Discount: {t.discount_rate * 100}%</div> */}
                <div className="text-xs text-gray-400">Penalty: {t.inactivity_penalty_points} pts every {t.penalty_frequency_days} days after {t.inactivity_period_days} days</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(t); setModalOpen(true); }} className="px-3 py-1 border rounded">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="px-3 py-1 bg-red-50 text-red-700 rounded border">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TierModal open={modalOpen} onClose={() => setModalOpen(false)} initial={editing} onSaved={() => { setModalOpen(false); fetchList(); }} />
    </div>
  );
}
