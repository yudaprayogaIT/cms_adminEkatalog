"use client";

import React, { useEffect, useMemo, useState } from "react";
import MemberGroupDetailModal from "./MemberGroupDetailModal";
import MemberGroupCard from "./MemberGroupcard";

type Company = {
  company_name?: string | null;
  company_address?: string | null;
  member_tier?: string | null;
  loyalty_points?: number | null;
  branch_id?: number | null;
  branch_name?: string | null;
  member_status?: string | null;
  application_date?: string | null;
  approved_rejected_date?: string | null;
  approved_rejected_by_admin_id?: number | null;
  reject_reason?: string | null;
};

type MemberEntry = {
  user_id: number;
  user_name?: string;
  profilePic?: string | null;
  is_phone_verified_otp?: boolean;
  companies: Company[];
};

type User = {
  id: number;
  name: string;
  profilePic?: string | null;
  phone?: string;
  role?: string;
  cabang?: string;
};

const SNAP = "ekatalog_members_snapshot";
const USER_SNAP = "ekatalog_users_snapshot";

export default function MemberGroupsList() {
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openUser, setOpenUser] = useState<MemberEntry | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      const snap = localStorage.getItem(SNAP);
      if (snap) {
        try { setMembers(JSON.parse(snap)); } catch {}
      }

      try {
        const res = await fetch("/api/members");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) { setMembers(data); try { localStorage.setItem(SNAP, JSON.stringify(data)); } catch {} }
          return;
        }
      } catch {
        // ignore
      }

      try {
        const res2 = await fetch("/data/members.json");
        if (res2.ok) {
          const data = await res2.json();
          if (!cancelled) { setMembers(data); try { localStorage.setItem(SNAP, JSON.stringify(data)); } catch {} }
        }
      } catch {}
    }

    async function loadUsers() {
      const snap = localStorage.getItem(USER_SNAP);
      if (snap) {
        try { setUsers(JSON.parse(snap)); } catch {}
      }

      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) { setUsers(data); try { localStorage.setItem(USER_SNAP, JSON.stringify(data)); } catch {} }
          return;
        }
      } catch {}

      try {
        const res2 = await fetch("/data/users.json");
        if (res2.ok) {
          const data = await res2.json();
          if (!cancelled) { setUsers(data); try { localStorage.setItem(USER_SNAP, JSON.stringify(data)); } catch {} }
        }
      } catch {}
    }

    (async () => {
      setLoading(true);
      await Promise.all([loadMembers(), loadUsers()]);
      if (!cancelled) setLoading(false);
    })();

    function snapHandler() {
      const raw = localStorage.getItem(SNAP);
      if (raw) { try { setMembers(JSON.parse(raw)); } catch {} }
      const rawUsers = localStorage.getItem(USER_SNAP);
      if (rawUsers) { try { setUsers(JSON.parse(rawUsers)); } catch {} }
    }
    window.addEventListener("ekatalog:members_snapshot_update", snapHandler);

    return () => {
      cancelled = true;
      window.removeEventListener("ekatalog:members_snapshot_update", snapHandler);
    };
  }, []);

  const flattened = useMemo(() => {
    const userMap = new Map<number, User>();
    users.forEach((u) => userMap.set(u.id, u));

    const out = members.map((m) => {
      const u = userMap.get(m.user_id);
      return {
        user_id: m.user_id,
        user_name: m.user_name ?? u?.name ?? `User ${m.user_id}`,
        profilePic: m.profilePic ?? u?.profilePic ?? null,
        companies: Array.isArray(m.companies) ? m.companies : [],
        raw: m,
      };
    });

    // debug: tunjukkan flattened di console -> pastikan profilePic terisi
    // buka devtools Console untuk melihat ini
    // eslint-disable-next-line no-console
    console.debug("memberGroups.flattened", out);

    return out;
  }, [members, users]);

  if (loading) return <div className="py-8 text-center text-sm text-gray-500">Loading member groups...</div>;
  if (flattened.length === 0) return <div className="py-8 text-center text-sm text-gray-500">No member groups found.</div>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {flattened.map((m) => (
          <MemberGroupCard
            key={`mg-${m.user_id}`}
            id={m.user_id}
            name={m.user_name}
            companyCount={m.companies.length}
            profilePic={m.profilePic ?? undefined}
            onClick={() =>
              setOpenUser({
                user_id: m.user_id,
                user_name: m.user_name,
                profilePic: m.profilePic ?? null,
                companies: m.companies,
              })
            }
          />
        ))}
      </div>

      <MemberGroupDetailModal open={!!openUser} onClose={() => setOpenUser(null)} member={openUser ?? undefined} />
    </>
  );
}
