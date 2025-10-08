// components/MemberApprovalTable.tsx
"use client"
import React, { useMemo, useState } from "react";

type Member = {
  id: string;
  avatar?: string;
  name: string;
  email: string;
  joinedAt: string;
  status: "pending" | "approved" | "rejected";
  note?: string;
};

const MOCK: Member[] = [
  { id: "m1", name: "Alya Putri", email: "alya@example.com", joinedAt: "2025-09-01", status: "pending" },
  { id: "m2", name: "Budi Santoso", email: "budi@example.com", joinedAt: "2025-08-12", status: "pending" },
  { id: "m3", name: "Citra Dewi", email: "citra@example.com", joinedAt: "2025-07-22", status: "approved" },
  { id: "m4", name: "Dimas Pratama", email: "dimas@example.com", joinedAt: "2025-09-05", status: "pending" },
  { id: "m5", name: "Erna S", email: "erna@example.com", joinedAt: "2025-06-30", status: "rejected" },
];

export default function MemberApprovalTable() {
  const [data, setData] = useState<Member[]>(MOCK);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [modalAction, setModalAction] = useState<"approve" | "reject" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q)
    );
  }, [data, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  function openModal(member: Member, action: "approve" | "reject") {
    setSelected(member);
    setModalAction(action);
  }

  function closeModal() {
    setSelected(null);
    setModalAction(null);
  }

  function confirmAction() {
    if (!selected || !modalAction) return;
    setData((prev) =>
      prev.map((m) =>
        m.id === selected.id ? { ...m, status: modalAction === "approve" ? "approved" : "rejected" } : m
      )
    );
    closeModal();
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <input
            className="px-3 py-2 border rounded-md focus:outline-none"
            placeholder="Search member name or email..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="text-sm text-slate-500">Showing {filtered.length} result(s)</div>
        </div>

        <div className="flex items-center gap-2">
          <select className="px-3 py-2 border rounded-md" onChange={(e) => {
            const v = e.target.value;
            if (v === "all") setData(MOCK); // keep mock simple
            if (v === "pending") setData(MOCK.filter(m => m.status === "pending"));
            if (v === "approved") setData(MOCK.filter(m => m.status === "approved"));
            if (v === "rejected") setData(MOCK.filter(m => m.status === "rejected"));
          }}>
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left text-slate-500 text-sm border-b">
              <th className="py-3 px-4">Member</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400">No members found.</td>
              </tr>
            )}

            {pageData.map((m) => (
              <tr key={m.id} className="border-b last:border-b-0">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={m.avatar ?? "/avatar-placeholder.png"}
                        alt={m.name}
                        className="w-12 h-12 object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{m.name}</div>
                      <div className="text-sm text-slate-400">Member ID: {m.id}</div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4 text-slate-600">{m.email}</td>
                <td className="py-4 px-4 text-slate-600">{m.joinedAt}</td>
                <td className="py-4 px-4">
                  <StatusChip status={m.status} />
                </td>

                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      disabled={m.status === "approved"}
                      onClick={() => openModal(m, "approve")}
                      className={`px-3 py-1 rounded-md text-sm border ${m.status === "approved" ? "opacity-50 cursor-not-allowed" : "hover:bg-green-50"}`}
                    >
                      Approve
                    </button>
                    <button
                      disabled={m.status === "rejected"}
                      onClick={() => openModal(m, "reject")}
                      className={`px-3 py-1 rounded-md text-sm border ${m.status === "rejected" ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50"}`}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-500">Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <div className="px-3 py-1 border rounded-md text-sm">{currentPage} / {pages}</div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, pages))}
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
            disabled={currentPage === pages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {selected && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal}></div>
          <div className="bg-white rounded-lg shadow-xl z-10 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">{modalAction === "approve" ? "Approve member" : "Reject member"}</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to <span className="font-medium">{modalAction}</span> member <span className="font-semibold">{selected.name}</span> ({selected.email})?
            </p>

            <div className="flex items-center gap-3 justify-end">
              <button onClick={closeModal} className="px-4 py-2 border rounded-md">Cancel</button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded-md font-medium ${modalAction === "approve" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
              >
                {modalAction === "approve" ? "Yes, approve" : "Yes, reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: Member["status"] }) {
  const map: Record<Member["status"], { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-50 text-yellow-800 border-yellow-100" },
    approved: { label: "Approved", className: "bg-green-50 text-green-800 border-green-100" },
    rejected: { label: "Rejected", className: "bg-red-50 text-red-800 border-red-100" },
  };

  const s = map[status];
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${s.className}`}>{s.label}</span>;
}
