"use client";

import React, { useState, useCallback } from "react";
import ConfirmActionModal from "./ConfirmActionModal";

type MemberRecord = {
  user_id: number;
  user_name?: string;
  member_tier?: string;
  loyalty_points?: number;
  branch_id?: number;
  branch_name?: string;
  member_status?: string;
  application_date?: string | null;
  company_name?: string | null;
  company_address?: string | null;
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

type ActionBody =
  | { action: "approve"; user_id: number; admin_id: number }
  | { action: "reject"; user_id: number; admin_id: number; reject_reason: string | null };

export default function PendingModal({
  open,
  onClose,
  pending,
  users,
  onView,
}: {
  open: boolean;
  onClose: () => void;
  pending: MemberRecord[];
  users: User[];
  onView: (user_id: number) => void;
}) {
  const [processing, setProcessing] = useState<number | null>(null);

  // confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);
  const [confirmTargetName, setConfirmTargetName] = useState<string | undefined>(undefined);

  const openConfirm = useCallback((action: "approve" | "reject", user_id: number, user_name?: string) => {
    setConfirmAction(action);
    setConfirmTargetId(user_id);
    setConfirmTargetName(user_name);
    setConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmTargetId(null);
    setConfirmTargetName(undefined);
  }, []);

  const callAction = useCallback(
    async (action: "approve" | "reject", user_id: number, reason?: string | null) => {
      if (processing) return;
      setProcessing(user_id);
      try {
        const body: ActionBody =
          action === "approve"
            ? { action: "approve", user_id, admin_id: 1 }
            : { action: "reject", user_id, admin_id: 1, reject_reason: reason ?? null };

        const res = await fetch("/api/members/action", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || "action failed");
        }

        // re-fetch members and update snapshot
        try {
          const membersRes = await fetch("/api/members");
          if (membersRes.ok) {
            const data = await membersRes.json();
            try {
              localStorage.setItem("ekatalog_members_snapshot", JSON.stringify(data));
            } catch {
              // ignore localStorage failures
            }
            window.dispatchEvent(new Event("ekatalog:members_snapshot_update"));
          }
        } catch (e) {
          console.warn("failed to refresh members snapshot", e);
        }

        // toast sukses
        window.dispatchEvent(
          new CustomEvent("ekatalog:toast", {
            detail: {
              type: "success",
              message: action === "approve" ? "Applicant approved" : "Applicant rejected",
            },
          })
        );
      } catch (e) {
        console.error("PendingModal.callAction error:", e);
        window.dispatchEvent(
          new CustomEvent("ekatalog:toast", { detail: { type: "error", message: "Action failed" } })
        );
      } finally {
        setProcessing(null);
      }
    },
    [processing]
  );

  // called when ConfirmActionModal confirms
  const handleConfirm = useCallback(
    async (reason?: string | null) => {
      if (!confirmAction || !confirmTargetId) {
        closeConfirm();
        return;
      }
      await callAction(confirmAction, confirmTargetId, reason);
      closeConfirm();
    },
    [confirmAction, confirmTargetId, callAction, closeConfirm]
  );

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
        <div role="dialog" aria-modal="true" aria-label="Pending member applications" className="relative z-10 w-full max-w-xl bg-white rounded-lg shadow p-4">
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
                  <div key={m.user_id} className="flex items-center justify-between gap-3 p-3 border rounded">
                    <div>
                      <div className="font-medium">{m.user_name ?? u?.name ?? `User ${m.user_id}`}</div>
                      <div className="text-xs text-gray-500">{m.company_name ?? "-"} • {m.branch_name ?? "-"}</div>
                      <div className="text-xs text-gray-400 mt-1">Applied: {m.application_date ?? "-"}</div>
                      {m.reject_reason && <div className="text-xs text-red-600 mt-1">Alasan penolakan: {m.reject_reason}</div>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(m.user_id)}
                        className="px-3 py-1 rounded border text-sm"
                        disabled={isProcessing}
                        aria-label={`Lihat detail ${m.user_name ?? u?.name ?? m.user_id}`}
                      >
                        View
                      </button>

                      <button
                        onClick={() => openConfirm("approve", m.user_id, m.user_name ?? u?.name)}
                        className="px-3 py-1 rounded border bg-green-50 text-green-700 text-sm"
                        disabled={isProcessing}
                        aria-label={`Approve ${m.user_name ?? u?.name ?? m.user_id}`}
                      >
                        {isProcessing ? "..." : "Approve"}
                      </button>

                      <button
                        onClick={() => openConfirm("reject", m.user_id, m.user_name ?? u?.name)}
                        className="px-3 py-1 rounded border bg-red-50 text-red-700 text-sm"
                        disabled={isProcessing}
                        aria-label={`Reject ${m.user_name ?? u?.name ?? m.user_id}`}
                      >
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
      </div>

      <ConfirmActionModal
        open={confirmOpen}
        action={(confirmAction as "approve" | "reject") ?? "approve"}
        targetName={confirmTargetName}
        defaultReason={pending.find((p) => p.user_id === confirmTargetId)?.reject_reason ?? null}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />
    </>
  );
}
