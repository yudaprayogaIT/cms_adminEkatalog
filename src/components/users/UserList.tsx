// src/components/users/UserList.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import UserCard from "./UserCard";
import AddMemberModal from "./AddUserModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type User = {
  id: number;
  cabang?: string; // legacy could be branch name or daerah or branch id string
  name: string;
  role: string;
  nomortelepon?: string;
  avatar?: string;
  // email?: string;
  gender?: "male" | "female" | string;
  username?: string;
  password?: string;
};

type Branch = { daerah: string; name: string };

const DATA_URL = "/data/users.json";
const SNAP_KEY = "ekatalog_users_snapshot";
const BRANCH_SNAP = "ekatalog_branches_snapshot";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters + pagination
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [cabangFilter, setCabangFilter] = useState<string>("All"); // stores daerah string or "All"
  const [search, setSearch] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(8);
  const [page, setPage] = useState<number>(1);

  // progressive "show all"
  const [displayCount, setDisplayCount] = useState<number>(16);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // undo (for user delete)
  const [lastDeleted, setLastDeleted] = useState<{
    item: User;
    timeoutId?: number;
  } | null>(null);

  // modal add/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<User | null>(null);

  // branches (for cabang select)
  const [branches, setBranches] = useState<Branch[]>([]);

  // confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");
  const confirmActionRef = useRef<(() => Promise<void>) | null>(null);

  // --- load branches (snapshot or file) ---
  useEffect(() => {
    async function loadBranches() {
      const raw = localStorage.getItem(BRANCH_SNAP);
      if (raw) {
        try {
          const list = JSON.parse(raw) as Branch[];
          setBranches(list.map((b) => ({ daerah: b.daerah, name: b.name })));
          return;
        } catch {
          // fallback
        }
      }
      try {
        const res = await fetch("/data/branches.json");
        if (res.ok) {
          const list = (await res.json()) as Branch[];
          setBranches(list.map((b) => ({ daerah: b.daerah, name: b.name })));
          try {
            localStorage.setItem(BRANCH_SNAP, JSON.stringify(list));
          } catch {}
        }
      } catch {
        // ignore
      }
    }
    loadBranches();
  }, []);

  // --- snapshot helpers ---
  function saveSnapshot(list: User[]) {
    try {
      localStorage.setItem(SNAP_KEY, JSON.stringify(list));
    } catch {}
    window.dispatchEvent(new Event("ekatalog:snapshot_update"));
  }

  async function fetchServerListAndSave() {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) return false;
      const data = (await res.json()) as User[];
      setUsers(data);
      saveSnapshot(data);
      return true;
    } catch {
      return false;
    }
  }

  // --- initial load users ---
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const snapRaw = localStorage.getItem(SNAP_KEY);
        if (snapRaw) {
          const snap = JSON.parse(snapRaw) as User[];
          if (!cancelled) setUsers(snap);
          setLoading(false);
          return;
        }
        const res = await fetch(DATA_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const base = (await res.json()) as User[];
        if (!cancelled) {
          setUsers(base);
          saveSnapshot(base);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          if (err instanceof Error) setError(err.message);
          else setError(String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // listen snapshot updates
  useEffect(() => {
    function handler() {
      const raw = localStorage.getItem(SNAP_KEY);
      if (!raw) return;
      try {
        setUsers(JSON.parse(raw) as User[]);
      } catch {}
    }
    window.addEventListener("ekatalog:snapshot_update", handler);
    return () =>
      window.removeEventListener("ekatalog:snapshot_update", handler);
  }, []);

  const roles = useMemo(() => {
    const s = new Set<string>();
    users.forEach((a) => s.add(a.role));
    return ["All", ...Array.from(s).sort()];
  }, [users]);

  // filtering (supports cabangFilter by daerah OR branch name OR legacy cabang)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((a) => {
      if (cabangFilter !== "All") {
        const selectedDaerah = cabangFilter;
        const branchObj = branches.find(
          (b) => String(b.daerah) === selectedDaerah
        );
        const matchesBranch =
          (branchObj &&
            (String(a.cabang) === String(branchObj.daerah) ||
              String(a.cabang) === branchObj.name)) ||
          (!branchObj && String(a.cabang) === selectedDaerah);
        if (!matchesBranch) return false;
      }
      if (roleFilter !== "All" && a.role !== roleFilter) return false;
      if (!q) return true;
      const inName = a.name.toLowerCase().includes(q);
      const inPhone = a.nomortelepon
        ? a.nomortelepon.toLowerCase().includes(q)
        : false;
      const inCabang = a.cabang
        ? String(a.cabang).toLowerCase().includes(q)
        : false;
      return inName || inPhone || inCabang;
    });
  }, [users, roleFilter, search, cabangFilter, branches]);

  // pagination + visible slice
  const totalPages =
    pageSize === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visible = useMemo(() => {
    if (pageSize === 0) return filtered.slice(0, displayCount);
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, displayCount]);

  // reset page on filters change
  useEffect(() => {
    setPage(1);
    if (pageSize === 0) setDisplayCount(16);
    setTimeout(() => {
      if (containerRef.current)
        containerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
  }, [roleFilter, search, pageSize, cabangFilter]);

  // observer for progressive load when pageSize === 0
  useEffect(() => {
    if (pageSize !== 0) {
      observerRef.current?.disconnect();
      observerRef.current = null;
      return;
    }
    const node = sentinelRef.current;
    if (!node) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const ent = entries[0];
        if (ent?.isIntersecting)
          setDisplayCount((cur) => Math.min(cur + 16, filtered.length));
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );
    observerRef.current.observe(node);
    return () => observerRef.current?.disconnect();
  }, [pageSize, filtered.length]);

  // API helpers
  async function tryApiDelete(id: number) {
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
  async function tryApiCreate(payload: Omit<User, "id">) {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      return (await res.json()) as User;
    } catch {
      return null;
    }
  }
  async function tryApiUpdate(payload: User) {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      return (await res.json()) as User;
    } catch {
      return null;
    }
  }

  // prompt delete User (with confirm)
  function promptDeleteUser(target: User) {
    setConfirmTitle("Hapus User");
    setConfirmDesc(
      `Yakin ingin menghapus user "${target.name}"? Aksi ini bisa dibatalkan selama beberapa detik via Undo.`
    );
    confirmActionRef.current = async () => {
      const next = users.filter((a) => a.id !== target.id);
      setUsers(next);
      saveSnapshot(next);

      if (lastDeleted?.timeoutId) window.clearTimeout(lastDeleted.timeoutId);
      const timeoutId = window.setTimeout(() => setLastDeleted(null), 8000);
      setLastDeleted({ item: target, timeoutId });

      const ok = await tryApiDelete(target.id);
      if (ok) await fetchServerListAndSave();
    };
    setConfirmOpen(true);
  }

  // undo delete user
  async function undoDelete() {
    if (!lastDeleted) return;
    const restored = [...users, lastDeleted.item].sort((x, y) => x.id - y.id);
    setUsers(restored);
    saveSnapshot(restored);
    if (lastDeleted.timeoutId) window.clearTimeout(lastDeleted.timeoutId);
    setLastDeleted(null);

    const created = await tryApiCreate({
      name: lastDeleted.item.name,
      role: lastDeleted.item.role,
      cabang: lastDeleted.item.cabang,
      nomortelepon: lastDeleted.item.nomortelepon,
      avatar: lastDeleted.item.avatar,
      // email: lastDeleted.item.email,
      gender: lastDeleted.item.gender,
      username: lastDeleted.item.username,
      password: lastDeleted.item.password,
    });
    if (created) await fetchServerListAndSave();
  }

  // edit modal
  function openEditModal(user: User) {
    setModalInitial(user);
    setModalOpen(true);
  }

  // confirm handlers
  function handleConfirmCancel() {
    confirmActionRef.current = null;
    setConfirmOpen(false);
  }
  async function handleConfirmOK() {
    setConfirmOpen(false);
    const fn = confirmActionRef.current;
    confirmActionRef.current = null;
    if (fn) await fn();
  }

  // footer helper
  function loadMore() {
    if (pageSize === 0)
      setDisplayCount((cur) => Math.min(cur + 16, filtered.length));
    else setPage((p) => Math.min(p + 1, totalPages));
  }
  function nextPage() {
    if (pageSize === 0)
      setDisplayCount((cur) => Math.min(cur + 16, filtered.length));
    else setPage((p) => Math.min(p + 1, totalPages));
    setTimeout(() => {
      if (containerRef.current)
        containerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
  }
  function prevPage() {
    if (pageSize === 0) setDisplayCount((cur) => Math.max(16, cur - 16));
    else setPage((p) => Math.max(1, p - 1));
    setTimeout(() => {
      if (containerRef.current)
        containerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
  }

  const startIndex = (() => {
    if (filtered.length === 0) return 0;
    if (pageSize === 0) return 1;
    return (page - 1) * pageSize + 1;
  })();
  const endIndex = (() => {
    if (filtered.length === 0) return 0;
    if (pageSize === 0) return Math.min(displayCount, filtered.length);
    return Math.min(page * pageSize, filtered.length);
  })();

  if (loading)
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        Loading users...
      </div>
    );
  if (error)
    return (
      <div className="py-8 text-center text-sm text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div ref={containerRef}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <label className="text-sm text-gray-600 ml-4">Cabang</label>
          <select
            value={cabangFilter}
            onChange={(e) => setCabangFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="All">All</option>
            {branches.map((b) => (
              <option key={b.daerah} value={String(b.daerah)}>
                {(b.daerah || "").replace(/\b\w/g, (c) => c.toUpperCase())} -{" "}
                {(b.name || "").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>

          <label className="text-sm text-gray-600 ml-4">Show</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value={0}>All</option>
            <option value={4}>4 per page</option>
            <option value={8}>8 per page</option>
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone or branch..."
            className="px-3 py-2 border rounded-md text-sm w-72"
          />
          <button
            onClick={() => {
              setSearch("");
              setRoleFilter("All");
              setCabangFilter("All");
            }}
            className="px-3 py-2 bg-gray-100 rounded-md text-sm"
          >
            Reset
          </button>
          <button
            onClick={() => {
              setModalInitial(null);
              setModalOpen(true);
            }}
            className="px-3 py-2 bg-[#2563EB] text-white rounded-md text-sm"
          >
            Add New User
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visible.map((a) => {
          const avatarFallback =
            a.gender === "female"
              ? "/images/avatars/avatarwoman_placeholder.png"
              : "/images/avatars/avatarman_placeholder.png";
          const avatarSrc =
            a.avatar ??
            avatarFallback ??
            "/images/avatars/avatar-placeholder.png";
          return (
            <UserCard
              key={a.id}
              id={a.id}
              name={a.name}
              role={a.role}
              cabang={a.cabang ?? ""}
              nomortelepon={a.nomortelepon ?? ""}
              avatar={avatarSrc}
              onDelete={() => promptDeleteUser(a)}
              onEdit={() => openEditModal(a)}
            />
          );
        })}
      </div>

      <div ref={sentinelRef} />

      {/* Undo banner */}
      {lastDeleted && (
        <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white px-4 py-2 rounded shadow flex items-center gap-3">
            <div>User “{lastDeleted.item.name}” dihapus</div>
            <button
              onClick={undoDelete}
              className="bg-white text-black px-3 py-1 rounded"
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIndex}-{endIndex} of {filtered.length} result
          {filtered.length !== 1 ? "s" : ""}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (pageSize === 0) setDisplayCount(16);
              else setPage(1);
            }}
            disabled={
              pageSize === 0
                ? displayCount <= 16 && filtered.length <= 16
                : page === 1
            }
            className="px-3 py-2 rounded-md border text-sm disabled:opacity-50"
          >
            First
          </button>
          <button
            onClick={prevPage}
            disabled={pageSize === 0 ? displayCount <= 16 : page === 1}
            className="px-3 py-2 rounded-md border text-sm disabled:opacity-50"
          >
            Prev
          </button>

          <div className="text-sm px-2">
            Page {pageSize === 0 ? Math.ceil(displayCount / 16) : page} /{" "}
            {pageSize === 0
              ? Math.max(1, Math.ceil(filtered.length / 16))
              : totalPages}
          </div>

          <button
            onClick={nextPage}
            disabled={endIndex >= filtered.length}
            className="px-3 py-2 rounded-md border text-sm disabled:opacity-50"
          >
            Next
          </button>

          {/* <button
            onClick={loadMore}
            disabled={endIndex >= filtered.length}
            className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
          >
            Load more
          </button> */}
        </div>
      </div>

      {/* Add/Edit modal */}
      <AddMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={modalInitial}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        description={confirmDesc}
        onConfirm={handleConfirmOK}
        onCancel={handleConfirmCancel}
        confirmLabel="Yes, delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
