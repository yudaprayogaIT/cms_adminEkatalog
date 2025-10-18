"use client";

import React, { useEffect, useState } from "react";

type MemberRecord = {
  user_id: number;
  user_name: string;
  member_tier?: string;
  loyalty_points?: number;
  branch_id?: number;
  branch_name?: string;
  member_status?: string;
  member_since?: string | null;
  application_date?: string | null;
  company_name?: string | null;
  company_address?: string | null;
};

export default function AddMemberModal({
  open,
  onClose,
  user,
  onApplied,
}: {
  open: boolean;
  onClose: () => void;
  user?: { id: number; name: string } | null;
  onApplied?: (m: MemberRecord) => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [branchId, setBranchId] = useState<number | null>(null);
  const [memberTier, setMemberTier] = useState("Bronze");
  const SNAP = "ekatalog_members_snapshot";

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  if (!open) return null;

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name || !companyName) return alert("Lengkapi nama dan nama perusahaan");

    const payload: MemberRecord = {
      user_id: user?.id ?? Math.floor(Math.random() * 1000000),
      user_name: name,
      member_tier: memberTier,
      loyalty_points: 0,
      branch_id: branchId ?? 0,
      branch_name: branchId ? String(branchId) : "",
      member_status: "pending",
      member_since: null,
      application_date: new Date().toISOString(),
      company_name: companyName,
      company_address: companyAddress,
    };

    try {
      const res = await fetch("/api/members", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        const created = await res.json();
        window.dispatchEvent(new Event("ekatalog:members_snapshot_update"));
        onApplied?.(created);
        onClose();
        return;
      }
    } catch (e) {
      // fallback to snapshot
    }

    try {
      const raw = localStorage.getItem(SNAP);
      const list = raw ? JSON.parse(raw) : [];
      list.push(payload);
      localStorage.setItem(SNAP, JSON.stringify(list));
      window.dispatchEvent(new Event("ekatalog:members_snapshot_update"));
      onApplied?.(payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save member application");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={submit} className="relative z-10 w-full max-w-lg bg-white rounded-xl p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Apply to become Member</h3>
          <button type="button" onClick={onClose} className="text-gray-600">
            Close
          </button>
        </div>

        <div className="grid gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="border px-3 py-2 rounded" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone for OTP" className="border px-3 py-2 rounded" />
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name (PT...)" className="border px-3 py-2 rounded" />
          <input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Company address" className="border px-3 py-2 rounded" />
          <select value={memberTier} onChange={(e) => setMemberTier(e.target.value)} className="border px-3 py-2 rounded">
            <option>Bronze</option>
            <option>Silver</option>
            <option>Gold</option>
            <option>Platinum</option>
          </select>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Apply
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
