import { useState } from "react";
import type { Reservation, RestaurantTable, TableStatus } from "@/lib/guest-manager/types";
import { getTableStatus } from "@/lib/guest-manager/helpers";

const OPTS: { key: TableStatus; label: string }[] = [
  { key: "available", label: "✅ Available" },
  { key: "reserved", label: "📋 Reserved" },
  { key: "seated", label: "🪑 Occupied" },
  { key: "unavailable", label: "🚫 Unavailable" },
];

export function TableStatusModal({
  table,
  date,
  reservations,
  onClose,
  onApply,
}: {
  table: RestaurantTable;
  date: string;
  reservations: Reservation[];
  onClose: () => void;
  onApply: (selectedKey: TableStatus, linkedReservationId: string | null) => void;
}) {
  const current = getTableStatus(table, date, reservations);
  const [selected, setSelected] = useState<TableStatus>(current);
  const linked = reservations.find((r) => r.table === table.name && r.date === date);
  const [linkId, setLinkId] = useState<string>(linked?.id ?? "");

  const candidates = reservations.filter(
    (r) => r.date === date && ["Confirmed", "Pending"].includes(r.status),
  );

  return (
    <div className="gm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gm-modal" style={{ maxWidth: 480 }}>
        <div className="gm-modal-head">
          <h3>{table.icon} {table.name}</h3>
          <button className="gm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="gm-modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {OPTS.map((o) => (
              <button
                key={o.key}
                onClick={() => setSelected(o.key)}
                style={{
                  padding: 12,
                  borderRadius: 20,
                  cursor: "pointer",
                  fontWeight: 600,
                  background: "var(--gm-cream)",
                  border: `2px solid ${selected === o.key ? "var(--gm-gold)" : "var(--gm-border)"}`,
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 6, color: "var(--gm-text-mid)" }}>
              🔗 Link to reservation
            </label>
            <select className="gm-input" value={linkId} onChange={(e) => setLinkId(e.target.value)}>
              <option value="">— Link to reservation —</option>
              {candidates.map((r) => (
                <option key={r.id} value={r.id}>{r.name} · {r.time}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="gm-modal-footer">
          <button className="gm-btn gm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="gm-btn gm-btn-primary" onClick={() => onApply(selected, linkId || null)}>Apply</button>
        </div>
      </div>
    </div>
  );
}
