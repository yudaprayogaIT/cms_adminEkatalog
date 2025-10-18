"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

type User = {
  id: number;
  name: string;
  role: string;
  cabang?: string;
  phone?: string;
  profilePic?: string;
  email?: string;
  gender?: "male" | "female" | string;
  username?: string;
  // optional address fields
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  // membership fields (optional)
  member_status?: string;
  loyalty_points?: number;
  member_since?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onEdit?: (u: User) => void;
  onDelete?: (u: User) => void;
};

export default function UserDetailModal({
  open,
  onClose,
  user,
  onEdit,
  onDelete,
}: Props) {
  if (!user) return null;

  const profilePic =
    user.profilePic ??
    (user.gender === "female"
      ? "/images/avatars/avatarwoman_placeholder.png"
      : "/images/avatars/avatarman_placeholder.png");

  const isCustomer = String(user.role).toLowerCase() === "customer";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="user-detail"
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
            className={`relative z-10 w-full max-w-2xl h-full ${isCustomer ? "max-h-145" : "max-h-95"} bg-white rounded-2xl shadow-2xl overflow-hidden`}
            role="dialog"
            aria-modal="true"
            aria-label={`Detail ${user.name}`}
          >
            <div className="flex items-center justify-center gap-6 p-6">
              {/* LEFT: image */}
              <div className="rounded-lg overflow-hidden bg-gray-100 flex flex-1 items-center justify-center h-72">
                <Image
                  src={profilePic}
                  width={1000}
                  height={1000}
                  alt={user.name}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* RIGHT: details */}
              <div className="flex flex-col gap-4 flex-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {user.name}
                    </h2>
                    <div className="text-sm text-gray-500 mt-1">
                      {user.role}{" "}
                      {user.cabang ? `• ${String(user.cabang)}` : ""}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ID: {user.id}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit?.(user)}
                      className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete?.(user)}
                      className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:opacity-95"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Username</div>
                      <div className="text-sm text-gray-800">
                        {user.username ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="text-sm text-gray-800">
                        {user.phone ?? "-"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Gender</div>
                      <div className="text-sm text-gray-800">
                        {user.gender ?? "-"}
                      </div>
                    </div>

                    {/* Show email if present */}
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="text-sm text-gray-800">
                        {user.email ?? "-"}
                      </div>
                    </div>

                    {/* If user is a Customer, show address block */}
                    {isCustomer && (
                      <div className="md:col-span-2">
                        <div className="text-xs text-gray-500">Alamat</div>
                        <div className="text-sm text-gray-800 mt-1">
                          {user.address ? (
                            <>
                              <div>{user.address}{", "}
                                {user.city ? `${user.city}` : ""} {user.postal_code ? ` ${user.postal_code}` : ""},
                              {" "}{user.country ?? ""}</div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-400">-</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* If customer has membership info show it */}
                    {isCustomer && (user.member_status || typeof user.loyalty_points === 'number') && (
                      <>
                        <div>
                          <div className="text-xs text-gray-500">Member Status</div>
                          <div className="text-sm text-gray-800">{user.member_status ?? '-'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Loyalty Points</div>
                          <div className="text-sm text-gray-800">{user.loyalty_points ?? 0}</div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-gray-500">Notes</div>
                    <div className="text-sm text-gray-700 mt-1">
                      -
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t pt-4 flex flex-col items-start justify-between gap-1">
                  <div className="text-sm text-gray-500">Created At: {user.createdAt ?? "-"}</div>
                  <div className="text-sm text-gray-500">Last updated: {user.updatedAt ?? "-"}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
