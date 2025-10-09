// src/components/users/UserCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';

export default function UserCard({
  id,
  cabang,
  name,
  role,
  nomortelepon,
  avatar,
  // onDelete,
  // onEdit,
  onClick,
}: {
  id?: number;
  cabang: string;
  name: string;
  role: string;
  nomortelepon: string;
  avatar: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onClick?: () => void;
}) {
  return (
    <div
      data-id={id ?? ''}
      onClick={() => onClick?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(); }}
      className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center relative overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('/images/pattern.png')] bg-contain" />
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg mb-4">
        <Image src={avatar} alt={name} width={1000} height={1000} className="object-cover w-full h-full" />
      </div>

      <div className="text-lg font-medium text-gray-800">{name}</div>
      <div className="text-sm text-gray-400 mt-1">{role} {cabang ? `- ${cabang}` : ''}</div>
      {/* <div className="text-xs text-gray-400 mt-2">{cabang} - {name}</div> */}
      <div className="text-sm text-gray-400 mt-2">{nomortelepon}</div>

      {/* <div className="mt-4 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          className="text-xs px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
          type="button"
        >
          Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          className="text-xs px-3 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
          type="button"
        >
          Remove
        </button>
      </div> */}
    </div>
  );
}
