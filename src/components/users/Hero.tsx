'use client';

import React, { useEffect, useState } from 'react';

export default function Hero() {
  const [q, setQ] = useState('');

  useEffect(() => {
    function handleReset() {
      setQ('');
      // also notify UserList if needed (not necessary here),
      // but we listen to reset from UserList.
    }
    window.addEventListener('ekatalog:reset_search', handleReset);
    return () => {
      window.removeEventListener('ekatalog:reset_search', handleReset);
    };
  }, []);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-montserrat font-semibold">Team</h1>
        <p className="text-sm text-gray-500">Daftar admin pengelola ekatalog</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="search"
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              setQ(v);
              // dispatch search change to UserList
              window.dispatchEvent(
                new CustomEvent('ekatalog:search_change', { detail: v })
              );
            }}
            placeholder="Search name, phone or branch..."
            className="w-56 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          onClick={() => {
            // tell UserList to open AddUserModal
            window.dispatchEvent(new Event('ekatalog:open_add_user'));
          }}
          className="bg-[#2563EB] text-white px-3 py-2 rounded-md text-sm hover:opacity-95 transition"
        >
          Add New Member
        </button>
      </div>
    </div>
  );
}
