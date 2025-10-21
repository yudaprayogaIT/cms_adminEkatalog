"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import ConfirmActionModal from "./ConfirmActionModal";

type User = {
  id: number;
  name: string;
  phone?: string;
  profilePic?: string | null;
  cabang?: string;
  role?: string;
  gender?: string;
};

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
  member_since?: string | null;
  reject_reason?: string | null;
};

function makeKey(
  userId: number | string,
  branchId: number | string | null | undefined,
  companyName?: string | null
) {
  const b = branchId ?? "no-branch";
  const name = (companyName ?? "")
    .toString()
    .trim()
    .replace(/[^a-z0-9\-_. ]/gi, "")
    .replace(/\s+/g, "_")
    .slice(0, 60);
  return `${userId}-${b}-${name || "company"}`;
}

export default function MemberDetailModal({
  open,
  onClose,
  user,
  member,
  onApprove,
  onReject,
}: {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  member?: MemberRecord | null;
  onApprove?: (
    userId: number,
    branchId?: number | null
  ) => void | Promise<void>;
  onReject?: (
    userId: number,
    branchId?: number | null,
    reason?: string | null
  ) => void | Promise<void>;
}) {
  const [processing, setProcessing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "reject" | null
  >(null);

  if (!user || !member) return null;

  const profile =
    user.profilePic ??
    (user.gender === "female"
      ? "/images/avatars/avatarwoman_placeholder.png"
      : "/images/avatars/avatarman_placeholder.png");

  function openConfirm(action: "approve" | "reject") {
    setConfirmAction(action);
    setConfirmOpen(true);
  }

  async function handleConfirm(reason?: string | null) {
    if (!confirmAction) {
      setConfirmOpen(false);
      return;
    }
    try {
      setProcessing(true);
      if (confirmAction === "approve") {
        if (onApprove)
          await Promise.resolve(onApprove(user.id, member.branch_id ?? null));
      } else {
        if (onReject)
          await Promise.resolve(
            onReject(user.id, member.branch_id ?? null, reason ?? null)
          );
      }
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      console.error("MemberDetailModal action error:", err);
      setConfirmOpen(false);
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  }

  function handleCancelConfirm() {
    setConfirmOpen(false);
    setConfirmAction(null);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={makeKey(user.id, member.branch_id, member.company_name)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1 flex flex-col items-center gap-3">
                <div className="w-40 h-40 rounded overflow-hidden bg-gray-100">
                  <Image
                    src={user.profilePic ?? "/images/avatars/avatarman_placeholder.png"}
                    width={800}
                    height={800}
                    alt={user.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="text-lg font-semibold">{user.name}</div>
                <div className="text-sm text-gray-500">
                  {user.role} {user.cabang ? `• ${user.cabang}` : ""}
                </div>
                <div className="text-sm text-gray-500">{user.phone}</div>
              </div>

              <div className="col-span-2">
                <h3 className="font-medium">Application & Member Data</h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Company</div>
                    <div className="text-gray-800">
                      {member.company_name ?? "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Branch</div>
                    <div className="text-gray-800">
                      {member.branch_name ?? "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Tier</div>
                    <div className="text-gray-800">
                      {member.member_tier ?? "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Points</div>
                    <div className="text-gray-800">
                      {member.loyalty_points ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Applied</div>
                    <div className="text-gray-800">
                      {member.application_date ?? "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="text-gray-800">
                      {member.member_status ?? "-"}
                    </div>
                  </div>

                  {member.reject_reason && (
                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-500">
                        Alasan Penolakan
                      </div>
                      <div className="text-sm text-red-600 mt-1">
                        {member.reject_reason}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-2">
                  {String(member.member_status).toLowerCase() === "pending" && (
                    <>
                      <button
                        onClick={() => openConfirm("approve")}
                        className="px-4 py-2 rounded border bg-green-50"
                        disabled={processing}
                      >
                        {processing && confirmAction === "approve"
                          ? "Processing..."
                          : "Approve"}
                      </button>
                      <button
                        onClick={() => openConfirm("reject")}
                        className="px-4 py-2 rounded border bg-red-50"
                        disabled={processing}
                      >
                        {processing && confirmAction === "reject"
                          ? "Processing..."
                          : "Reject"}
                      </button>
                    </>
                  )}

                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded border ml-auto"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <ConfirmActionModal
        key={`confirm-${makeKey(
          user.id,
          member.branch_id,
          member.company_name
        )}-${confirmAction ?? "none"}`}
        open={confirmOpen}
        action={confirmAction ?? "approve"}
        targetName={user.name}
        defaultReason={member?.reject_reason ?? null}
        requireReason={true}
        onCancel={handleCancelConfirm}
        onConfirm={handleConfirm}
      />
    </AnimatePresence>
  );
}
