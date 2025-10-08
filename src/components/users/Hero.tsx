// src/components/users/Hero.tsx
'use client';

import React, { useState } from 'react';
import AddMemberModal from './AddMemberModal';

export default function Hero() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-montserrat font-semibold">Team</h1>
        <p className="text-sm text-gray-500">Daftar admin pengelola ekatalog</p>
      </div>

      <div className="flex items-center gap-3">
        {/* <div className="relative">
          <input
            type="search"
            placeholder="Search name or email..."
            className="w-56 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div> */}
{/* 
        <button
          onClick={() => setOpen(true)}
          className="bg-[#2563EB] text-white px-3 py-2 rounded-md text-sm hover:opacity-95 transition"
        >
          Add New Member
        </button> */}
      </div>

      <AddMemberModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
