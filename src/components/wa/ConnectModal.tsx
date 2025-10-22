// src/components/wa/ConnectModal.tsx
'use client';
import React, { useState } from 'react';
import Image from 'next/image';

type Account = {
  id: number;
  name?: string;
  phone?: string;
  [key: string]: unknown;
};

type Props = {
  open: boolean;
  account: Account | null;
  onClose: () => void;
  onMarkConnected: (id: number) => Promise<void>;
};

export default function ConnectModal({ open, account, onClose, onMarkConnected }: Props) {
  const [qrShown, setQrShown] = useState(false);
  // static QR SVG data URL (placeholder). Ganti nanti dengan dynamic QR image.
  const staticQr = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 260 260'>
    <rect width='100%' height='100%' fill='#fff'/>
    <rect x='20' y='20' width='60' height='60' fill='#111'/>
    <rect x='180' y='20' width='60' height='60' fill='#111'/>
    <rect x='20' y='180' width='60' height='60' fill='#111'/>
    <g fill='#111'>
      <rect x='100' y='100' width='20' height='20'/>
      <rect x='130' y='100' width='10' height='20'/>
      <rect x='100' y='130' width='40' height='10'/>
      <rect x='160' y='140' width='20' height='20'/>
      <rect x='50' y='50' width='10' height='10'/>
      <rect x='70' y='130' width='15' height='15'/>
    </g>
  </svg>
  `)}`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-lg w-[92%] max-w-lg p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">Connect Whatsapp Account</h3>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Open <strong>WhatsApp</strong> in your smartphone</li>
            <li>Click on the <strong>3-dots icon</strong> on the top right corner</li>
            <li>Select <strong>Whatsapp Web</strong></li>
            <li>After that <strong>Scan the QR Code</strong> below</li>
          </ol>
        </div>

        <div className="mt-4 border rounded p-4 min-h-[200px] flex flex-col items-center justify-center">
          {!qrShown ? (
            <button
              className="px-4 py-2 rounded-full bg-gradient-to-r from-green-300 to-green-500 text-white"
              onClick={() => setQrShown(true)}
            >
              GENERATE QR CODE
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Image src={staticQr} alt="QR Placeholder" className="w-48 h-48 bg-white p-2 shadow" />
              <div className="text-sm text-gray-500">Scan this QR using WhatsApp Web scanner</div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="px-4 py-2 rounded border" onClick={onClose}>Close</button>
          <button
            className="px-4 py-2 rounded bg-green-600 text-white"
            onClick={async () => {
              if (!account) return;
              await onMarkConnected(account.id);
              setQrShown(false);
              onClose();
            }}
          >
            Mark as connected
          </button>
        </div>
      </div>
    </div>
  );
}
