"use client";

import React, { useCallback, useState } from "react";
import ConfirmActionModal from "./ConfirmActionModal";

type MemberRecord = {
  user_id: number;
  user_name?: string;
  company_name?: string | null;
  company_address?: string | null;
  member_tier?: string;
  loyalty_points?: number | null;
  branch_id?: number | null;
  branch_name?: string;
  member_status?: string;
  application_date?: string | null;
  reject_reason?: string | null;
};

type User = {
  id: number;
  name: string;
  phone?: string;
  profilePic?: string | null;
  cabang?: string;
  role?: string;
};

function makeKey(userId: number | string, branchId: number | string | null | undefined, companyName?: string | null) {
  const b = branchId ?? "no-branch";
  const name = (companyName ?? "").toString().trim().replace(/[^a-z0-9\-_. ]/gi, "").replace(/\s+/g, "_").slice(0, 60);
  return `${userId}-${b}-${name || "company"}`;
}

export default function PendingModal({
  open,
  onClose,
  pending,
  users,
  onView,
  onApprove,
  onReject,
}: {
  open: boolean;
  onClose: () => void;
  pending: MemberRecord[];
  users: User[];
  onView: (user_id: number, branch_id?: number | null) => void;
  onApprove?: (user_id: number, branch_id?: number | null) => void | Promise<void>;
  onReject?: (user_id: number, branch_id?: number | null, reason?: string | null) => void | Promise<void>;
}) {
  const [processing, setProcessing] = useState<number | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ user_id: number; branch_id?: number | null; user_name?: string; company_name?: string | null } | null>(null);

  const openConfirm = useCallback((action: "approve" | "reject", user_id: number, branch_id?: number | null, user_name?: string, company_name?: string | null) => {
    setConfirmAction(action);
    setConfirmTarget({ user_id, branch_id, user_name, company_name });
    setConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmTarget(null);
  }, []);

  async function callAction(action: "approve" | "reject", user_id: number, branch_id?: number | null, reason?: string | null) {
    if (processing) return;
    setProcessing(user_id);
    try {
      if (action === "approve") {
        if (onApprove) await Promise.resolve(onApprove(user_id, branch_id ?? null));
      } else {
        if (onReject) await Promise.resolve(onReject(user_id, branch_id ?? null, reason ?? null));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  }

  async function handleConfirm(reason?: string | null) {
    if (!confirmAction || !confirmTarget) {
      closeConfirm();
      return;
    }
    await callAction(confirmAction, confirmTarget.user_id, confirmTarget.branch_id ?? null, reason);
    closeConfirm();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Pending Member Applications ({pending.length})</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>

        {pending.length === 0 ? (
          <div className="text-sm text-gray-500 py-6 text-center">Tidak ada aplikasi pending.</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-auto">
            {pending.map((m) => {
              const u = users.find((x) => x.id === m.user_id);
              const isProcessing = processing === m.user_id;
              return (
                <div key={makeKey(m.user_id, m.branch_id, m.company_name)} className="flex items-center justify-between gap-3 p-3 border rounded">
                  <div>
                    <div className="font-medium">{m.user_name ?? u?.name ?? `User ${m.user_id}`}</div>
                    <div className="text-xs text-gray-500">{m.company_name ?? "-"} • {m.branch_name ?? "-"}</div>
                    <div className="text-xs text-gray-400 mt-1">Applied: {m.application_date ?? "-"}</div>
                    {m.reject_reason && <div className="text-xs text-red-600 mt-1">Alasan penolakan: {m.reject_reason}</div>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => onView(m.user_id, m.branch_id ?? null)} className="px-3 py-1 rounded border text-sm" disabled={isProcessing}>View</button>

                    <button onClick={() => openConfirm("approve", m.user_id, m.branch_id ?? null, m.user_name ?? u?.name ?? undefined, m.company_name ?? null)} className="px-3 py-1 rounded border bg-green-50 text-green-700 text-sm" disabled={isProcessing}>
                      {isProcessing ? "..." : "Approve"}
                    </button>

                    <button onClick={() => openConfirm("reject", m.user_id, m.branch_id ?? null, m.user_name ?? u?.name ?? undefined, m.company_name ?? null)} className="px-3 py-1 rounded border bg-red-50 text-red-700 text-sm" disabled={isProcessing}>
                      {isProcessing ? "..." : "Reject"}
                    </button>

                    <div className="text-xs text-gray-600">{m.member_tier ?? ""}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmActionModal
        open={confirmOpen}
        action={(confirmAction as "approve" | "reject") ?? "approve"}
        targetName={confirmTarget?.user_name}
        defaultReason={pending.find((p) => p.user_id === confirmTarget?.user_id && p.branch_id === confirmTarget?.branch_id && p.company_name === confirmTarget?.company_name)?.reject_reason ?? null}
        requireReason={true}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
