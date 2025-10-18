"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmActionModal({
  open,
  action,
  targetName,
  onCancel,
  onConfirm,
  defaultReason,
  requireReason = false,
}: {
  open: boolean;
  action: "approve" | "reject";
  targetName?: string;
  onCancel: () => void;
  onConfirm: (reason?: string | null) => void | Promise<void>;
  defaultReason?: string | null;
  requireReason?: boolean;
}) {
  // hooks (top-level)
  const [reason, setReason] = useState<string>(defaultReason ?? "");
  const [processing, setProcessing] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showError, setShowError] = useState(false); // keeps error text visible
  const [shake, setShake] = useState(false); // triggers shake animation

  useEffect(() => {
    if (open) {
      setReason(defaultReason ?? "");
      setProcessing(false);
      setTouched(false);
      setShowError(false);
      setShake(false);
    }
  }, [open, defaultReason]);

  if (!open) return null;

  const title = action === "approve" ? "Konfirmasi Approve" : "Konfirmasi Reject";
  const description =
    action === "approve"
      ? `Anda akan menyetujui aplikasi member dari "${targetName ?? "user"}". Lanjutkan?`
      : requireReason
      ? `Anda akan menolak aplikasi member dari "${targetName ?? "user"}". Alasan penolakan wajib diisi.`
      : `Anda akan menolak aplikasi member dari "${targetName ?? "user"}". Mohon isi alasan penolakan (opsional).`;

  const reasonRequiredForThisAction = action === "reject" && requireReason;
  const reasonTrimmed = reason.trim();
  const isReasonValid = !reasonRequiredForThisAction || reasonTrimmed.length > 0;

  async function handleConfirm() {
    // validation: if required and empty, show error + shake
    if (reasonRequiredForThisAction && reasonTrimmed.length === 0) {
      setTouched(true);
      setShowError(true);
      // trigger a short shake animation
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      return;
    }

    try {
      setProcessing(true);
      await Promise.resolve(
        onConfirm(action === "reject" ? (reasonTrimmed === "" ? null : reasonTrimmed) : undefined)
      );
    } catch (e) {
      console.error("confirm action error", e);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />

      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <button onClick={onCancel} className="text-gray-600">Close</button>
        </div>

        {action === "reject" && (
          <div className="mt-4">
            <label className="text-xs text-gray-600 flex items-center gap-1">
              Alasan penolakan
              {reasonRequiredForThisAction && <span className="text-red-600">*</span>}
            </label>

            {/* wrapper yang di-shake saat invalid */}
            <motion.div
              animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
              className="mt-1"
            >
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setTouched(true)}
                className={`w-full border rounded px-3 py-2 text-sm ${touched && !isReasonValid ? "border-red-500" : ""}`}
                rows={4}
                placeholder="Tuliskan alasan penolakan..."
                aria-invalid={!isReasonValid}
                aria-required={reasonRequiredForThisAction}
              />
            </motion.div>

            {/* error text: muncul dengan AnimatePresence */}
            <AnimatePresence>
              {touched && !isReasonValid && (
                <motion.div
                  key="reject-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="text-xs text-red-600 mt-2"
                >
                  Alasan penolakan wajib diisi.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} disabled={processing} className="px-4 py-2 border rounded">Batal</button>
          <button
            onClick={handleConfirm}
            disabled={processing || (action === "reject" && reasonRequiredForThisAction && !isReasonValid)}
            className={`cursor-pointer px-4 py-2 rounded text-white ${action === "approve" ? "bg-green-600" : "bg-red-600"} ${processing ? "opacity-70 cursor-wait" : ""}`}
          >
            {processing ? "Processing..." : action === "approve" ? "Confirm Approve" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
