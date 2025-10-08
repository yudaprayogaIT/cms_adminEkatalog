// src/components/layout/Header.tsx
'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import useClickOutside from '@/lib/useClickOutside';

export default function Header() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useClickOutside(ref, () => setOpen(false));

  return (
    <header className="w-full bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-xl font-montserrat font-semibold text-gray-800">Dashboard Admin</h1>

      <div className="flex items-center gap-6">
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((s) => !s)}
            className="relative p-2 rounded hover:bg-gray-100"
            aria-expanded={open}
            aria-label="Notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-gray-700">
              <path d="M15 17h5l-1.405-1.405C18.21 14.79 18 13.918 18 13V8a6 6 0 10-12 0v5c0 .918-.21 1.79-.595 2.595L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1">3</span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg ring-1 ring-black/5 z-30"
              >
                <div className="p-3">
                  <div className="text-sm font-medium">Notifications</div>
                  <div className="mt-2 space-y-2">
                    <div className="text-xs text-gray-600">- Pesan system: ...</div>
                    <div className="text-xs text-gray-600">- New member request</div>
                    <div className="text-xs text-gray-600">- Promo activated</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
          <Image src="/images/userProfile.png" alt="avatar" width={36} height={36} className="rounded-full border border-gray-300" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">Admin</span>
            <span className="text-xs text-gray-500">Superuser</span>
          </div>
        </div>
      </div>
    </header>
  );
}
