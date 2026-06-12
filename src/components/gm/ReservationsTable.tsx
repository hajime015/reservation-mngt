import { useState } from "react";
import type { Reservation } from "@/lib/guest-manager/types";
import { badgeClass } from "@/lib/guest-manager/helpers";

function TypeBadge({ type }: { type: string }) {
  return type === "Walk-In" ? (
    <span className="gm-badge gm-badge-walkin">🚶 Walk-In</span>
  ) : (
    <span className="gm-badge gm-badge-reservation">📋 Rsvp</span>
  );
}

export function ReservationsTable({
  reservations,
  onEdit,
  onDelete,
}: {
  reservations: Reservation[];
  onEdit: (r: Reservation) => void;
  onDelete: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const rows = reservations.filter(
    (r) =>
      (!date || r.date === date) &&
      (!type || r.type === type) &&
      (!status || r.status === status) &&
      (!q ||
        [r.name, r.phone, r.notes, r.table, r.staff]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())),
  );
  const totalPax = rows.reduce((s, r) => s + (Number(r.pax) || 0), 0);

  function clearFilters() {
    setQ("");
    setDate("");
    setType("");
    setStatus("");
  }

  return (
    <div className="gm-page">
      <div className="gm-card">
        <div className="gm-filter-bar">
          <div className="gm-search-wrap">
            <span style={{ position: "absolute", left: 14, top: 12 }}>🔍</span>
            <input
              type="text"
              placeholder="Search name, phone, notes…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <input
            type="date"
            className="gm-input"
            style={{ width: "auto" }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <select className="gm-input" style={{ width: "auto" }} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All Types</option>
            <option>Reservation</option>
            <option>Walk-In</option>
          </select>
          <select className="gm-input" style={{ width: "auto" }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option>Confirmed</option>
            <option>Seated</option>
            <option>Pending</option>
            <option>No-Show</option>
            <option>Cancelled</option>
          </select>
          <button className="gm-btn gm-btn-ghost" onClick={clearFilters}>✕ Clear</button>
        </div>
        <div className="gm-summary-bar">
          Showing {rows.length} of {reservations.length} · Total pax {totalPax}
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Pax</th>
                <th>Table</th>
                <th>Status</th>
                <th>Staff</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td><b>{r.name}</b></td>
                    <td>{r.phone || "—"}</td>
                    <td><TypeBadge type={r.type} /></td>
                    <td>{r.date}</td>
                    <td>{r.time}</td>
                    <td>{r.pax}</td>
                    <td>{r.table || "—"}</td>
                    <td><span className={`gm-badge ${badgeClass(r.status)}`}>{r.status}</span></td>
                    <td>{r.staff || "—"}</td>
                    <td>{r.notes || "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button className="gm-icon-btn gm-icon-btn-edit" onClick={() => onEdit(r)}>✏️</button>
                      <button className="gm-icon-btn gm-icon-btn-del" onClick={() => onDelete(r.id)}>🗑</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} style={{ textAlign: "center", color: "var(--gm-text-soft)" }}>
                    No reservations match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
