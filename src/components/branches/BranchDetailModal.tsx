'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Branch = {
  id: number;
  daerah: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  pulau?: string;
  wilayah?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  branch?: Branch | null;
  onEdit?: (b: Branch) => void;
  onDelete?: (b: Branch) => void;
};

export default function BranchDetailModal({ open, onClose, branch, onEdit, onDelete }: Props) {
  if (!branch) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="branch-detail"
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
            className="relative z-10 w-full max-w-2xl h-full max-h-[50vh] bg-white rounded-2xl shadow-2xl overflow-auto"
            role="dialog"
            aria-modal="true"
            aria-label={`Detail cabang ${branch.name}`}
          >
            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{branch.name}</h2>
                  <div className="text-sm text-gray-500 mt-1">
                    {branch.daerah} {branch.wilayah ? `• ${branch.wilayah}` : ''}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ID: {branch.id}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onEdit?.(branch);
                    }}
                    className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(branch);
                    }}
                    className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:opacity-95"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Daerah</div>
                    <div className="text-sm text-gray-800">{branch.daerah}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Pulau</div>
                    <div className="text-sm text-gray-800">{branch.pulau ?? '-'}</div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="text-sm text-gray-800 whitespace-pre-line">{branch.address || '-'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Lat</div>
                    <div className="text-sm text-gray-800">{branch.lat ?? '-'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Lng</div>
                    <div className="text-sm text-gray-800">{branch.lng ?? '-'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-auto border-t pt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">Last updated: —</div>
                {/* <div>
                  <button onClick={onClose} className="px-3 py-2 rounded border text-sm">Close</button>
                </div> */}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
