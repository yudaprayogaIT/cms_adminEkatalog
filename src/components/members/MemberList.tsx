"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import MemberCard from "./MemberCard";
import AddMemberModal from "./AddMemberModal";
import MemberDetailModal from "./MemberDetailModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PendingModal from "./PendingModal";

type User = {
  id: number;
  name: string;
  phone?: string;
  profilePic?: string | null;
  cabang?: string;
  role?: string;
  gender?: string;
  username?: string;
  createdAt?: string;
};

type MemberRecord = {
  user_id: number;
  user_name?: string;
  member_tier?: string;
  loyalty_points?: number;
  branch_id?: number;
  branch_name?: string;
  member_status?: string;
  application_date?: string | null;
  company_name?: string | null;
  company_address?: string | null;
};

const USER_SNAP = "ekatalog_users_snapshot";
const MEMBER_SNAP = "ekatalog_members_snapshot";

export default function MemberList() {
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // modals
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [viewMember, setViewMember] = useState<MemberRecord | null>(null);

  // pending list modal
  const [pendingOpen, setPendingOpen] = useState(false);

  // confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");
  const confirmActionRef = useRef<(() => Promise<void>) | null>(null);

  // events from Hero
  useEffect(() => {
    function handleOpenAdd() {
      setAddOpen(true);
    }
    function handleSearchChange(ev: Event) {
      const d = (ev as CustomEvent<string>).detail;
      setSearch(typeof d === "string" ? d : "");
    }
    window.addEventListener("ekatalog:open_add_member", handleOpenAdd);
    window.addEventListener("ekatalog:members_search_change", handleSearchChange as EventListener);
    window.addEventListener("ekatalog:members_snapshot_update", loadMembersFromSnapshot);
    return () => {
      window.removeEventListener("ekatalog:open_add_member", handleOpenAdd);
      window.removeEventListener("ekatalog:members_search_change", handleSearchChange as EventListener);
      window.removeEventListener("ekatalog:members_snapshot_update", loadMembersFromSnapshot);
    };
  }, []);

  // load users & members (try snapshot -> api -> /data/*.json)
  async function loadUsers() {
    const snap = localStorage.getItem(USER_SNAP);
    if (snap) {
      try {
        setUsers(JSON.parse(snap));
      } catch {}
    }
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        try {
          localStorage.setItem(USER_SNAP, JSON.stringify(data));
        } catch {}
        return;
      }
    } catch {}
    try {
      const res = await fetch("/data/users.json");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        try {
          localStorage.setItem(USER_SNAP, JSON.stringify(data));
        } catch {}
      }
    } catch {}
  }

  async function loadMembers() {
    const snap = localStorage.getItem(MEMBER_SNAP);
    if (snap) {
      try {
        setMembers(JSON.parse(snap));
      } catch {}
    }
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
        try {
          localStorage.setItem(MEMBER_SNAP, JSON.stringify(data));
        } catch {}
        return;
      }
    } catch {}
    try {
      const res = await fetch("/data/members.json");
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
        try {
          localStorage.setItem(MEMBER_SNAP, JSON.stringify(data));
        } catch {}
      }
    } catch {}
  }

  function loadMembersFromSnapshot() {
    const raw = localStorage.getItem(MEMBER_SNAP);
    if (!raw) return;
    try {
      setMembers(JSON.parse(raw));
    } catch {}
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await Promise.all([loadUsers(), loadMembers()]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build display list strictly from members.json, but enrich with user data when available.
  const displayList = useMemo(() => {
    return members
      .map((m) => {
        const u = users.find((x) => x.id === m.user_id);
        // If user exists and role isn't Customer, skip (we want customers only)
        if (u && String(u.role).toLowerCase() !== "customer") return null;
        const user: User = u
          ? u
          : {
              id: m.user_id,
              name: m.user_name ?? "Unknown",
              phone: undefined,
              profilePic: undefined,
              cabang: undefined,
              role: "Customer",
            };
        return { user, member: m };
      })
      .filter(Boolean) as { user: User; member: MemberRecord }[];
  }, [members, users]);

  // filter by search and status
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayList.filter(({ user, member }) => {
      if (statusFilter !== "All") {
        const st = (member.member_status ?? "none").toLowerCase();
        if (statusFilter.toLowerCase() !== st) return false;
      }
      if (!q) return true;
      const inName = user.name?.toLowerCase().includes(q);
      const inPhone = (user.phone ?? "").toLowerCase().includes(q);
      const inCompany = (member.company_name ?? "").toLowerCase().includes(q);
      const inCabang = (user.cabang ?? "").toLowerCase().includes(q);
      return !!(inName || inPhone || inCompany || inCabang);
    });
  }, [displayList, search, statusFilter]);

  // pending items (for badge & modal)
  const pendingList = useMemo<MemberRecord[]>(
    () => displayList.filter(({ member }) => String(member.member_status).toLowerCase() === "pending").map(({ member }) => member),
    [displayList]
  );
  const pendingCount = pendingList.length;

  function openView(user: User, memberRec?: MemberRecord | null) {
    setViewUser(user);
    setViewMember(memberRec ?? null);
    setViewOpen(true);
  }

  // approve / reject (call API if exists, optimistic update local snapshot)
  async function approveMember(userId: number) {
  try {
    const res = await fetch("/api/members/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "approve", user_id: userId, admin_id: 1 }),
    });
    if (!res.ok) throw new Error("approve failed");
    const membersRes = await fetch("/api/members");
    if (membersRes.ok) {
      const data = await membersRes.json();
      localStorage.setItem(MEMBER_SNAP, JSON.stringify(data));
      window.dispatchEvent(new Event("ekatalog:members_snapshot_update"));
    }
    window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "success", message: "Applicant approved" } }));
  } catch (err) {
    console.warn(err);
    window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "error", message: "Approve failed" } }));
  }
}

async function rejectMember(userId: number, reason?: string | null) {
  try {
    const res = await fetch("/api/members/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reject", user_id: userId, admin_id: 1, reject_reason: reason ?? null }),
    });
    if (!res.ok) throw new Error("reject failed");
    // re-sync members snapshot
    const membersRes = await fetch("/api/members");
    if (membersRes.ok) {
      const data = await membersRes.json();
      localStorage.setItem(MEMBER_SNAP, JSON.stringify(data));
      window.dispatchEvent(new Event("ekatalog:members_snapshot_update"));
    }
    window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "success", message: "Applicant rejected" } }));
  } catch (err) {
    console.warn(err);
    window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "error", message: "Reject failed" } }));
  }
}


  // delete member application
  function promptDeleteMember(m: MemberRecord) {
    setConfirmTitle("Hapus Aplikasi Member");
    setConfirmDesc(`Yakin ingin menghapus aplikasi member "${m.user_name}"?`);
    confirmActionRef.current = async () => {
      const next = members.filter((x) => x.user_id !== m.user_id);
      setMembers(next);
      try {
        localStorage.setItem(MEMBER_SNAP, JSON.stringify(next));
      } catch {}
      try {
        await fetch("/api/members", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ user_id: m.user_id }),
        });
      } catch {}
      window.dispatchEvent(new Event("ekatalog:members_snapshot_update"));
    };
    setConfirmOpen(true);
  }

  async function handleConfirmOK() {
    setConfirmOpen(false);
    const fn = confirmActionRef.current;
    confirmActionRef.current = null;
    if (fn) await fn();
  }
  function handleConfirmCancel() {
    confirmActionRef.current = null;
    setConfirmOpen(false);
  }

  if (loading) return <div className="py-8 text-center text-sm text-gray-500">Loading members...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Member Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
            <option value="All">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setPendingOpen(true)}
              className="px-3 py-2 rounded-md border flex items-center gap-2"
              title={`${pendingCount} pending applicants`}
            >
              {/* simple list icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-sm">Pending</span>
            </button>
            {pendingCount > 0 && (
              <div className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingCount}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, company or branch..." className="px-3 py-2 border rounded-md text-sm" />
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                window.dispatchEvent(new Event("ekatalog:members_reset_search"));
              }}
              className="px-3 py-2 bg-gray-100 rounded-md text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(({ user, member }) => (
          <MemberCard
            key={user.id}
            id={user.id}
            name={user.name}
            role={user.role ?? "Customer"}
            cabang={user.cabang}
            phone={user.phone}
            profilePic={user.profilePic ?? undefined}
            status={member?.member_status ?? undefined}
            onClick={() => openView(user, member)}
          />
        ))}
      </div>

      <AddMemberModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onApplied={(m) => {
          setMembers((prev) => [m, ...prev]);
          try {
            localStorage.setItem(MEMBER_SNAP, JSON.stringify([m, ...members]));
          } catch {}
          window.dispatchEvent(new Event("ekatalog:members_snapshot_update"));
        }}
      />

      <MemberDetailModal open={viewOpen} onClose={() => setViewOpen(false)} user={viewUser ?? undefined} member={viewMember ?? undefined} onApprove={approveMember} onReject={rejectMember} />

      <PendingModal
        open={pendingOpen}
        onClose={() => setPendingOpen(false)}
        pending={pendingList}
        users={users}
        onView={(uid) => {
          const m = members.find((x) => x.user_id === uid) ?? null;
          const u = users.find((x) => x.id === uid);
          const userObj = u ?? { id: uid, name: m?.user_name ?? "Unknown" } as User;
          openView(userObj, m ?? undefined);
          setPendingOpen(false);
        }}
      />

      <ConfirmDialog open={confirmOpen} title={confirmTitle} description={confirmDesc} onConfirm={handleConfirmOK} onCancel={handleConfirmCancel} confirmLabel="Yes, delete" cancelLabel="Cancel" />
    </div>
  );
}
