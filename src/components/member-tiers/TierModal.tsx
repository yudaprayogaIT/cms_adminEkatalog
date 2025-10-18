"use client";

import React, { useEffect, useState } from "react";

type Tier = {
  id?: number;
  name: string;
  min_points: number; // poin minimal untuk naik ke tier ini
  min_points_maintain?: number | null; // poin minimal yang harus dipertahankan (opsional)
  discount_rate: number; // disimpan sebagai desimal (mis. 0.05 untuk 5%)
  inactivity_penalty_points: number;
  inactivity_period_days: number;
  penalty_frequency_days: number;
};

export default function TierModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Tier | null;
  onSaved?: () => void;
}) {
  const [data, setData] = useState<Tier>({
    name: "",
    min_points: 0,
    min_points_maintain: null,
    discount_rate: 0,
    inactivity_penalty_points: 0,
    inactivity_period_days: 60,
    penalty_frequency_days: 7,
  });

  // show discount as percent in the input
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  useEffect(() => {
    if (initial) {
      setData({
        id: initial.id,
        name: initial.name ?? "",
        min_points: initial.min_points ?? 0,
        min_points_maintain: typeof initial.min_points_maintain !== "undefined" ? initial.min_points_maintain : null,
        discount_rate: typeof initial.discount_rate === "number" ? initial.discount_rate : 0,
        inactivity_penalty_points: initial.inactivity_penalty_points ?? 0,
        inactivity_period_days: initial.inactivity_period_days ?? 60,
        penalty_frequency_days: initial.penalty_frequency_days ?? 7,
      });
      setDiscountPercent((initial.discount_rate ?? 0) * 100);
    } else {
      setData({
        name: "",
        min_points: 0,
        min_points_maintain: null,
        discount_rate: 0,
        inactivity_penalty_points: 0,
        inactivity_period_days: 60,
        penalty_frequency_days: 7,
      });
      setDiscountPercent(0);
    }
  }, [initial, open]);

  if (!open) return null;

  function validate(): string | null {
    if (!data.name || data.name.trim().length === 0) return "Nama tier wajib diisi.";
    if (data.min_points < 0) return "Poin minimum tidak boleh negatif.";
    // if (data.min_points_maintain !== null && data.min_points_maintain < 0) return "Poin maintain tidak boleh negatif.";
    if (discountPercent < 0 || discountPercent > 100) return "Diskon harus antara 0% sampai 100%.";
    if (data.inactivity_penalty_points < 0) return "Pengurangan poin tidak boleh negatif.";
    if (data.inactivity_period_days <= 0) return "Batas waktu tidak aktif harus lebih dari 0 hari.";
    if (data.penalty_frequency_days <= 0) return "Periode pengurangan poin harus lebih dari 0 hari.";
    return null;
  }

  async function save(e?: React.FormEvent) {
    e?.preventDefault();

    const err = validate();
    if (err) {
      window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "error", message: err } }));
      return;
    }

    try {
      // convert percent -> decimal for API
      const payload: Tier = {
        ...data,
        discount_rate: Number((discountPercent / 100).toFixed(4)),
      };

      const method = payload.id ? "PUT" : "POST";
      const url = "/api/member-tiers";
      const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("save failed");
      window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "success", message: "Tier berhasil disimpan." } }));
      onSaved?.();
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "error", message: "Gagal menyimpan tier." } }));
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <form onSubmit={save} className="relative z-10 w-full max-w-lg bg-white rounded-xl p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{data.id ? "Ubah Tier Member" : "Tambah Tier Member"}</h3>
          {/* <button type="button" onClick={onClose} className="text-gray-600">Tutup</button> */}
        </div>

        <div className="grid gap-3">
          <div>
            <label className="text-xs text-gray-600">Nama Tier</label>
            <input
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Contoh: Bronze, Silver, Gold"
              className="border px-3 py-2 rounded w-full"
              required
              aria-label="Nama tier"
            />
            <div className="text-xs text-gray-400 mt-1">Nama tier akan ditampilkan ke pengguna (mis. Bronze, Silver).</div>
          </div>

          <div>
            <label className="text-xs text-gray-600">Poin minimal untuk naik tier</label>
            <input
              id="min-points"
              type="number"
              value={data.min_points}
              onChange={(e) => setData({ ...data, min_points: Number(e.target.value) })}
              placeholder="Contoh: 2500"
              className="border px-3 py-2 rounded w-full"
              aria-describedby="help-min-points"
            />
            <div id="help-min-points" className="text-xs text-gray-400 mt-1">Jumlah poin minimum yang harus dicapai pengguna agar naik ke tier ini.</div>
          </div>

          {/* <div>
            <label className="text-xs text-gray-600">Poin minimal untuk mempertahankan tier (opsional)</label>
            <input
              id="min-points-maintain"
              type="number"
              value={data.min_points_maintain ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setData({ ...data, min_points_maintain: v === "" ? null : Number(v) });
              }}
              placeholder="Biarkan kosong jika tidak ada"
              className="border px-3 py-2 rounded w-full"
            />
            <div className="text-xs text-gray-400 mt-1">Jika terisi, pengguna harus mempertahankan poin minimal ini agar tidak turun tier.</div>
          </div> */}

          <div>
            <label className="text-xs text-gray-600">Diskon untuk tier (%)</label>
            <input
              type="number"
              step="0.01"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              placeholder="Contoh: 5 (untuk 5%)"
              className="border px-3 py-2 rounded w-full"
            />
            <div className="text-xs text-gray-400 mt-1">Masukkan persentase diskon (mis. isi 5 untuk 5%). Nilai akan disimpan sebagai desimal (mis. 0.05).</div>
          </div>

          <div>
            <label className="text-xs text-gray-600">Pengurangan poin saat tidak aktif</label>
            <input
              id="inactivity_penalty_points"
              type="number"
              value={data.inactivity_penalty_points}
              onChange={(e) => setData({ ...data, inactivity_penalty_points: Number(e.target.value) })}
              placeholder="Contoh: 8"
              className="border px-3 py-2 rounded w-full"
            />
            <div className="text-xs text-gray-400 mt-1">Jumlah poin yang dikurangi ketika pengguna dinyatakan tidak aktif setelah periode tertentu.</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Batas waktu tidak aktif (hari)</label>
              <input
                id="inactivity_period_days"
                type="number"
                value={data.inactivity_period_days}
                onChange={(e) => setData({ ...data, inactivity_period_days: Number(e.target.value) })}
                className="border px-3 py-2 rounded w-full"
              />
              <div className="text-xs text-gray-400 mt-1">Jika pengguna tidak aktif selama X hari, penalty akan mulai diterapkan.</div>
            </div>

            <div>
              <label className="text-xs text-gray-600">Frekuensi pengurangan poin (hari)</label>
              <input
                id="penalty_frequency_days"
                type="number"
                value={data.penalty_frequency_days}
                onChange={(e) => setData({ ...data, penalty_frequency_days: Number(e.target.value) })}
                className="border px-3 py-2 rounded w-full"
              />
              <div className="text-xs text-gray-400 mt-1">Seberapa sering (dalam hari) poin akan dikurangi setelah periode tidak aktif tercapai.</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button>
          </div>
        </div>
      </form>
    </div>
  );
}
