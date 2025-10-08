// src/components/ui/ConfirmDialog.tsx
'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description = '',
  confirmLabel = 'Yes',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="bg-white rounded-lg shadow-lg p-5 z-10 w-full max-w-md"
          >
            <div className="mb-3">
              <div className="text-lg font-semibold">{title}</div>
              {description && <div className="text-sm text-gray-600 mt-1">{description}</div>}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={onCancel} className="px-3 py-2 rounded border text-sm">
                {cancelLabel}
              </button>
              <button onClick={onConfirm} className="px-3 py-2 rounded bg-red-600 text-white text-sm">
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
