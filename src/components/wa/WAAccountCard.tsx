// src/components/wa/WAAccountCard.tsx
"use client";
import React from "react";

type WAAccount = {
  id: number;
  user_id?: number | null;
  name?: string;
  phone?: string; // note: use item.phone
  status?: "connected" | "disconnected" | string;
  last_login_at?: string | null;
  [key: string]: unknown;
};

type User = {
  id?: number;
  name?: string;
  phone?: string;
  phone_number?: string;
  cabang?: string;
  role?: string;
  [key: string]: any;
};

type Props = {
  item: WAAccount;
  user?: User | null;
  onConnectClick: (item: WAAccount) => void;
  onDisconnect: (id: number) => void;
  onDelete: (id: number) => void;
};

function formatDateMaybe(d?: string | null) {
  if (!d) return "-";
  const t = Date.parse(d);
  if (isNaN(t)) return d;
  return new Date(t).toLocaleString();
}

export default function WAAccountCard({
  item,
  user = null,
  onConnectClick,
  onDisconnect,
  onDelete,
}: Props) {
  const isConnected = item?.status === "connected";
  // prefer WA-account phone field, fallback to user.phone
  const displayPhone = item.phone ?? user?.phone ?? "-";
  const displayName = item.name ?? user?.name ?? "Unnamed";
  const displayCabang = user?.cabang ?? "";
  const displayRole = user?.role ?? "";

  return (
    <div className="bg-white rounded-2xl shadow p-6 min-h-[160px] flex flex-col justify-between border border-transparent hover:border-green-200 transition">
      <div>
        <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Wa Number <span className="font-medium">{displayPhone}</span>
          </div>
          {/* <div className="flex gap-2">
            {displayRole ? (
              <div className="ml-2 px-2 py-1 rounded-md bg-blue-50 text-xs text-blue-700 border border-blue-100">
                {displayRole}
              </div>
            ) : null}

            {displayCabang ? (
              <div className="px-2 py-1 rounded-md bg-gray-50 text-xs text-gray-700 border border-gray-100">
                {displayCabang}
              </div>
            ) : null}
          </div> */}
        </div>

        <h3 className="text-2xl font-medium mt-2">{displayName}</h3>
        <div className="text-sm text-gray-400">
          {displayRole} - {displayCabang}
        </div>

        <div className="text-sm text-gray-400 mt-2">
          Connected{" "}
          <span className="font-semibold">
            {formatDateMaybe(item.last_login_at)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <div
          className={`px-4 py-2 rounded-xl text-sm font-medium ${
            isConnected
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          Status: {isConnected ? "Connected" : "Disconnected"}
        </div>

        <button
          aria-label="delete account"
          className="ml-auto border border-orange-300 px-4 py-2 rounded-xl text-sm hover:bg-yellow-500 hover:text-white transition"
          onClick={() => onDelete(item.id)}
        >
          Delete
        </button>

        {isConnected ? (
          <button
            aria-label="disconnect account"
            className="border border-red-300 px-4 py-2 rounded-xl text-sm hover:bg-red-700 hover:text-white transition"
            onClick={() => onDisconnect(item.id)}
          >
            Disconnect
          </button>
        ) : (
          <button
            aria-label="connect account"
            className="border border-green-300 px-4 py-2 rounded-xl text-sm hover:bg-green-700 hover:text-white transition"
            onClick={() => onConnectClick(item)}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
