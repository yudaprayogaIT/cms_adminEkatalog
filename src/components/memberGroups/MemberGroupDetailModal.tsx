// src/components/memberGroups/MemberGroupDetailModal.tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

type Company = {
  company_name?: string | null;
  company_address?: string | null;
  member_tier?: string | null;
  loyalty_points?: number | null;
  branch_id?: number | null;
  branch_name?: string | null;
  member_status?: string | null;
  application_date?: string | null;
  approved_rejected_date?: string | null;
  approved_rejected_by_admin_id?: number | null;
  reject_reason?: string | null;
};

type MemberEntry = {
  user_id: number;
  user_name?: string;
  companies: Company[];
  profilePic?: string | null;
};

export default function MemberGroupDetailModal({
  open,
  onClose,
  member,
}: {
  open: boolean;
  onClose: () => void;
  member?: MemberEntry | null;
}) {
  if (!member) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
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
            className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label={`Member groups for ${member.user_name}`}
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <div className="w-65 h-65 rounded overflow-hidden bg-gray-100">
                  <Image
                    src={
                      member.profilePic ??
                      "/images/avatars/avatarman_placeholder.png"
                    }
                    width={800}
                    height={800}
                    alt={member.user_name ?? ""}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="rounded-lg p-4">
                  <div className="text-lg font-semibold">
                    {member.user_name}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    User ID: {member.user_id}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Companies: {member.companies.length}
                  </div>
                </div>
              </div>

              <div className="col-span-2 overflow-y-auto max-h-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-3">
                <h3 className="font-medium">{member.companies.length > 1 ? "Companies" : "Company"} Group Member</h3>

                {member.companies.length === 0 ? (
                  <div className="text-sm text-gray-500 mt-3">
                    No company records.
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {member.companies.map((c, idx) => (
                      <div
                        key={`${member.user_id}-${idx}`}
                        className="border rounded p-3 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-medium">
                            {c.company_name ?? "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {c.company_address ?? "-"}
                          </div>

                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>Tier: {c.member_tier ?? "-"}</div>
                            <div>Points: {c.loyalty_points ?? "-"}</div>
                            <div>Branch: {c.branch_name ?? "-"}</div>
                            <div>
                              Status:{" "}
                              <span className="font-medium">
                                {c.member_status ?? "-"}
                              </span>
                            </div>
                            <div>Applied: {c.application_date ?? "-"}</div>
                            {c.reject_reason ? (
                              <div className="col-span-2 text-xs text-red-600">
                                Reject reason: {c.reject_reason}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {/* placeholder actions - you can wire them to existing approve/reject API */}
                          {/* <button className="px-3 py-1 rounded border text-sm bg-green-50 text-green-700">View</button> */}
                          <button
                            className={`px-3 py-1 rounded border text-sm ${
                              c.member_status === "Active"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : c.member_status === "Approved"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : c.member_status === "Pending"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-700"
                                : c.member_status === "Rejected"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}
                          >
                            {c.member_status ?? "-"}
                          </button>
                          {/* <div className="text-xs text-gray-400">{c.branch_id ?? "-"}</div> */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded border">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
