"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import MemberCard from "./MemberCard";
import AddMemberModal from "./AddMemberModal";
import MemberDetailModal from "./MemberDetailModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PendingModal from "./PendingModal";

type UserFromMembersJson = {
  user_id: number;
  user_name?: string;
  is_phone_verified_otp?: boolean;
  companies?: CompanyRecord[];
};

type CompanyRecord = {
  company_name?: string | null;
  company_address?: string | null;
  member_tier?: string;
  loyalty_points?: number | null;
  branch_id?: number | null;
  branch_name?: string;
  member_status?: string;
  member_since?: string | null;
  last_activity_date?: string | null;
  application_date?: string | null;
  approved_rejected_date?: string | null;
  approved_rejected_by_admin_id?: number | null;
  reject_reason?: string | null;
};

type User = {
  id: number;
  name: string;
  phone?: string;
  profilePic?: string | null;
  cabang?: string;
  role?: string;
  gender?: string;
};

type FlatItem = {
  user: User;
  company: CompanyRecord & { branch_id?: number | null; user_name?: string | undefined };
};

const USER_SNAP = "ekatalog_users_snapshot";
const MEMBER_SNAP = "ekatalog_members_snapshot";

function makeKey(userId: number | string, branchId: number | string | null | undefined, companyName?: string | null) {
  const b = branchId ?? "no-branch";
  const name = (companyName ?? "")
    .toString()
    .trim()
    .replace(/[^a-z0-9\-_. ]/gi, "") // strip weird chars
    .replace(/\s+/g, "_")
    .slice(0, 60);
  return `${userId}-${b}-${name || "company"}`;
}

export default function MemberList() {
  const [users, setUsers] = useState<User[]>([]);
  const [rawMembers, setRawMembers] = useState<UserFromMembersJson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // modals
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<FlatItem | null>(null);

  // pending modal
  const [pendingOpen, setPendingOpen] = useState(false);

  // confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");
  const confirmActionRef = useRef<(() => Promise<void>) | null>(null);

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

  // load users (snapshot -> api -> /data/users.json)
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

  // load members (snapshot -> api -> /data/members.json)
  async function loadMembers() {
    const snap = localStorage.getItem(MEMBER_SNAP);
    if (snap) {
      try {
        setRawMembers(JSON.parse(snap));
      } catch {}
    }
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        const data = await res.json();
        setRawMembers(data);
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
        setRawMembers(data);
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
      setRawMembers(JSON.parse(raw));
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

  // flatten into one card per company
  const displayList = useMemo<FlatItem[]>(() => {
    const list: FlatItem[] = [];
    for (const u of rawMembers) {
      const comps = Array.isArray(u.companies) ? u.companies : [];
      for (const c of comps) {
        // enrich from users snapshot if exists
        const matchedUser = users.find((x) => x.id === u.user_id);
        if (matchedUser && String(matchedUser.role).toLowerCase() !== "customer") {
          // skip non-customer users
          continue;
        }
        const userObj: User = matchedUser
          ? matchedUser
          : {
              id: u.user_id,
              name: u.user_name ?? `User ${u.user_id}`,
              phone: undefined,
              profilePic: undefined,
              cabang: c.branch_name,
              role: "Customer",
            };

        list.push({
          user: userObj,
          company: { ...c, branch_id: c.branch_id, user_name: u.user_name },
        });
      }
    }
    return list;
  }, [rawMembers, users]);

  // filters
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayList.filter(({ user, company }) => {
      if (statusFilter !== "All") {
        const st = String(company.member_status ?? "none").toLowerCase();
        if (statusFilter.toLowerCase() !== st) return false;
      }
      if (!q) return true;
      const inName = String(user.name ?? "").toLowerCase().includes(q);
      const inCompany = String(company.company_name ?? "").toLowerCase().includes(q);
      const inBranch = String(company.branch_name ?? "").toLowerCase().includes(q);
      const inPhone = String(user.phone ?? "").toLowerCase().includes(q);
      return inName || inCompany || inBranch || inPhone;
    });
  }, [displayList, search, statusFilter]);

  // pending list
  const pendingList = useMemo(
    () => displayList.filter((it) => String(it.company.member_status ?? "").toLowerCase() === "pending").map((it) => ({ user_id: it.user.id, user_name: it.user.name, branch_id: it.company.branch_id, branch_name: it.company.branch_name, company_name: it.company.company_name, application_date: it.company.application_date, member_tier: it.company.member_tier, reject_reason: it.company.reject_reason })),
    [displayList]
  );
  const pendingCount = pendingList.length;

  function openView(item: FlatItem) {
    setViewItem(item);
    setViewOpen(true);
  }

  // approve/reject handlers using API
  async function approveMember(userId: number, branchId?: number | null) {
    try {
      const body = { action: "approve", user_id: userId, branch_id: branchId ?? null, admin_id: 1 };
      const res = await fetch("/api/members", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("approve failed");
      const membersRes = await fetch("/api/members");
      if (membersRes.ok) {
        const data = await membersRes.json();
        setRawMembers(data);
        try { localStorage.setItem(MEMBER_SNAP, JSON.stringify(data)); } catch {}
        window.dispatchEvent(new Event("ekatalog:members_snapshot_update"));
      }
      window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "success", message: "Applicant approved" } }));
    } catch (err) {
      console.warn(err);
      window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "error", message: "Approve failed" } }));
    }
  }

  async function rejectMember(userId: number, branchId?: number | null, reason?: string | null) {
    try {
      const body = { action: "reject", user_id: userId, branch_id: branchId ?? null, admin_id: 1, reject_reason: reason ?? null };
      const res = await fetch("/api/members", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("reject failed");
      const membersRes = await fetch("/api/members");
      if (membersRes.ok) {
        const data = await membersRes.json();
        setRawMembers(data);
        try { localStorage.setItem(MEMBER_SNAP, JSON.stringify(data)); } catch {}
        window.dispatchEvent(new Event("ekatalog:members_snapshot_update"));
      }
      window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "success", message: "Applicant rejected" } }));
    } catch (err) {
      console.warn(err);
      window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "error", message: "Reject failed" } }));
    }
  }

  // delete application
  function promptDeleteMember(item: FlatItem) {
    setConfirmTitle("Hapus Aplikasi Member");
    setConfirmDesc(`Yakin ingin menghapus aplikasi "${item.company.company_name}" milik ${item.user.name}?`);
    confirmActionRef.current = async () => {
      try {
        const branch_id = item.company.branch_id ?? null;
        await fetch("/api/members", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ user_id: item.user.id, branch_id }),
        });
      } catch {}
      try {
        const membersRes = await fetch("/api/members");
        if (membersRes.ok) {
          const data = await membersRes.json();
          setRawMembers(data);
          try { localStorage.setItem(MEMBER_SNAP, JSON.stringify(data)); } catch {}
          window.dispatchEvent(new Event("ekatalog:members_snapshot_update"));
        }
      } catch {}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-sm">Pending</span>
            </button>
            {pendingCount > 0 && <div className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{pendingCount}</div>}
          </div>

          <div className="flex items-center gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, company or branch..." className="px-3 py-2 border rounded-md text-sm" />
            <button onClick={() => { setSearch(""); setStatusFilter("All"); window.dispatchEvent(new Event("ekatalog:members_reset_search")); }} className="px-3 py-2 bg-gray-100 rounded-md text-sm">Reset</button>
            <button onClick={() => setAddOpen(true)} className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">Add Application</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((it) => (
          <MemberCard
            key={makeKey(it.user.id, it.company.branch_id, it.company.company_name)}
            id={it.user.id}
            name={it.user.name}
            role={it.user.role ?? "Customer"}
            cabang={it.company.branch_name ?? it.user.cabang}
            phone={it.user.phone}
            profilePic={it.user.profilePic ?? undefined}
            status={it.company.member_status ?? undefined}
            company_name={it.company.company_name ?? undefined}
            member_tier={it.company.member_tier ?? undefined}
            onClick={() => openView(it)}
          />
        ))}
      </div>

      <AddMemberModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onApplied={async (payload) => {
          try {
            const res = await fetch("/api/members", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error("submit failed");
            const membersRes = await fetch("/api/members");
            if (membersRes.ok) {
              const data = await membersRes.json();
              setRawMembers(data);
              try { localStorage.setItem(MEMBER_SNAP, JSON.stringify(data)); } catch {}
            }
            window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "success", message: "Application submitted" } }));
          } catch (e) {
            console.warn(e);
            window.dispatchEvent(new CustomEvent("ekatalog:toast", { detail: { type: "error", message: "Submit failed" } }));
          } finally {
            setAddOpen(false);
          }
        }}
      />

      <MemberDetailModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        user={viewItem ? { id: viewItem.user.id, name: viewItem.user.name, phone: viewItem.user.phone } : undefined}
        member={viewItem ? { ...viewItem.company, user_id: viewItem.user.id, user_name: viewItem.user.name } : undefined}
        onApprove={async (uid, branchId) => await approveMember(uid, branchId)}
        onReject={async (uid, branchId, reason) => await rejectMember(uid, branchId, reason)}
      />

      <PendingModal
        open={pendingOpen}
        onClose={() => setPendingOpen(false)}
        pending={pendingList}
        users={users}
        onView={(uid, branchId) => {
          const found = displayList.find((d) => d.user.id === uid && Number(d.company.branch_id) === Number(branchId));
          if (found) {
            setViewItem(found);
            setViewOpen(true);
          }
          setPendingOpen(false);
        }}
        onApprove={approveMember}
        onReject={rejectMember}
      />

      <ConfirmDialog open={confirmOpen} title={confirmTitle} description={confirmDesc} onConfirm={handleConfirmOK} onCancel={handleConfirmCancel} confirmLabel="Yes, delete" cancelLabel="Cancel" />
    </div>
  );
}
