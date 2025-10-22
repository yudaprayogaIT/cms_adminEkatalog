// src/components/wa/WAList.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import WAAccountCard from './WAAccountCard';

type WAItem = {
  id: number | string;
  user_id?: number | string | null;
  [key: string]: unknown;
};

type User = {
  id: number | string;
  [key: string]: unknown;
};

type Props = {
  items: WAItem[];
  users?: User[]; // daftar users (opsional) — bisa dikirim dari page.tsx
  onConnectClick: (item: WAItem) => void;
  onDisconnect: (id: number) => void;
  onDelete: (id: number) => void;
  pageSize?: number;
};

export default function WAList({
  items,
  users = [],
  onConnectClick,
  onDisconnect,
  onDelete,
  pageSize = 10,
}: Props) {
  // map user_id -> user for quick lookup
  const userMap = useMemo(() => {
    const m = new Map<number, User>();
    users.forEach((u) => {
      if (u?.id != null) m.set(Number(u.id), u);
    });
    return m;
  }, [users]);

  // pagination state
  const [page, setPage] = useState<number>(1);

  // reset to page 1 whenever items length or pageSize changes (fresh fetch)
  useEffect(() => {
    setPage(1);
  }, [items.length, pageSize]);

  const totalItems = items.length;
  const effectivePageSize = pageSize <= 0 ? Math.max(totalItems, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const startIndex = (page - 1) * effectivePageSize;
  const endIndex = Math.min(startIndex + effectivePageSize, totalItems);
  const visible = items.slice(startIndex, endIndex);

  const goToPage = (p: number) => {
    const next = Math.max(1, Math.min(totalPages, p));
    setPage(next);
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visible.map((it: WAItem) => {
          const user = it?.user_id ? userMap.get(Number(it.user_id)) ?? null : null;
          return (
            <WAAccountCard
              key={String(it.id)}
              item={it}
              user={user}
              onConnectClick={onConnectClick}
              onDisconnect={onDisconnect}
              onDelete={onDelete}
            />
          );
        })}
      </div>

      {/* Pagination footer */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} result{totalItems !== 1 ? 's' : ''}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => goToPage(1)} disabled={page === 1} className="px-3 py-2 rounded-md border text-sm disabled:opacity-50">First</button>
          <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="px-3 py-2 rounded-md border text-sm disabled:opacity-50">Prev</button>

          <div className="text-sm px-2">Page {page} / {totalPages}</div>

          <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="px-3 py-2 rounded-md border text-sm disabled:opacity-50">Next</button>
          <button onClick={() => goToPage(totalPages)} disabled={page >= totalPages} className="px-3 py-2 rounded-md border text-sm disabled:opacity-50">Last</button>
        </div>
      </div>
    </div>
  );
}
