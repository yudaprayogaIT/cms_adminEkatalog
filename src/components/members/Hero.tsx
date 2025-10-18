"use client";

import React, { useState, useEffect } from "react";

export default function MembersHero() {
  const [q, setQ] = useState("");

  useEffect(() => {
    function handleReset() {
      setQ("");
    }
    window.addEventListener("ekatalog:members_reset_search", handleReset);
    return () => window.removeEventListener("ekatalog:members_reset_search", handleReset);
  }, []);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-montserrat font-semibold">Members</h1>
        <p className="text-sm text-gray-500">Daftar member & aplikasi membership</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="search"
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              setQ(v);
              window.dispatchEvent(new CustomEvent("ekatalog:members_search_change", { detail: v }));
            }}
            placeholder="Search name, phone, company or branch..."
            className="w-72 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* <button
          onClick={() => window.dispatchEvent(new Event("ekatalog:open_add_member"))}
          className="bg-[#2563EB] text-white px-3 py-2 rounded-md text-sm hover:opacity-95 transition"
        >
          New Member Application
        </button> */}
      </div>
    </div>
  );
}
