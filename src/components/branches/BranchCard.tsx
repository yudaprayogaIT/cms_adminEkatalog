'use client';

import React from 'react';

export default function BranchCard({
  id,
  daerah,
  name,
  address,
  pulau,
  onDelete,
  onEdit,
}: {
  id?: number;
  daerah: string;
  name: string;
  address: string;
  pulau?: string;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col text-left relative overflow-hidden">
      <div className="text-sm font-semibold text-gray-800 mb-1">{name}</div>
      <div className="text-xs text-gray-500 mb-2">{daerah.charAt(0).toUpperCase() + daerah.slice(1).toLowerCase()}</div>
      <div className="text-xs text-gray-400 mb-3 line-clamp-3">{address}</div>
      <div className="mt-auto flex gap-2">
        <button onClick={onEdit} className="text-xs px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50">Edit</button>
        <button onClick={onDelete} className="text-xs px-3 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 hover:bg-red-100">Remove</button>
      </div>
    </div>
  );
}
