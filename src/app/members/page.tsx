import React from "react";
import MembersHero from "@/components/members/Hero";
import MemberList from "@/components/members/MemberList";
import ToastManager from "@/components/ui/ToastManager";

export const metadata = { title: "Members - Admin Pengelola Ekatalog" };

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <MembersHero />
      <div className="bg-white rounded-xl shadow p-6">
        <MemberList />
      </div>
      <ToastManager />
    </div>
  );
}
