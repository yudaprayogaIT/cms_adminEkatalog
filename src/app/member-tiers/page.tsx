import React from "react";
import ToastManager from "@/components/ui/ToastManager";
import TierList from "@/components/member-tiers/TierList";

export const metadata = { title: "Member Tiers - Admin Ekatalog" };

export default function MemberTiersPage() {
  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Member Tiers</h1>
          <p className="text-sm text-gray-500">Atur batas poin, diskon, dan penalty untuk tiap tier.</p>
        </div>
      </header>

      <div className="bg-white p-6 rounded-xl shadow">
        <TierList />
      </div>

      <ToastManager />
    </div>
  );
}
