import { useState } from "react";
import type { Reservation, RestaurantTable } from "@/lib/guest-manager/types";
import { getTableStatus, todayStr } from "@/lib/guest-manager/helpers";

const LABELS: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  seated: "Occupied",
  unavailable: "Unavailable",
};

export function TableMap({
  tables,
  reservations,
  onTableClick,
  onManageTables,
  onNew,
}: {
  tables: RestaurantTable[];
  reservations: Reservation[];
  onTableClick: (table: RestaurantTable, date: string) => void;
  onManageTables: () => void;
  onNew: () => void;
}) {
  const [mapDate, setMapDate] = useState(todayStr());

  const counts: Record<string, number> = { available: 0, reserved: 0, seated: 0, unavailable: 0 };
  tables.forEach((t) => {
    const s = getTableStatus(t, mapDate, reservations);
    counts[s] = (counts[s] || 0) + 1;
  });

  return (
    <div className="gm-page">
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ background: "white", borderRadius: 40, padding: "8px 18px", display: "flex", gap: 8, alignItems: "center" }}>
          <span>📅</span>
          <input
            type="date"
            value={mapDate}
            onChange={(e) => setMapDate(e.target.value)}
            style={{ border: "none", background: "transparent", fontFamily: "inherit" }}
          />
        </div>
        <button className="gm-btn gm-btn-primary" onClick={onManageTables}>⚙ Manage Tables</button>
        <button className="gm-btn gm-btn-gold" onClick={onNew}>➕ New</button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {Object.entries(counts).map(([s, n]) => (
          <div key={s} style={{ background: "white", borderRadius: 30, padding: "8px 16px" }}>
            {LABELS[s]} <b>{n}</b>
          </div>
        ))}
      </div>

      <div className="gm-card">
        <div className="gm-map-grid">
          {tables.map((t) => {
            const s = getTableStatus(t, mapDate, reservations);
            const linked = reservations.find(
              (r) =>
                r.table === t.name &&
                r.date === mapDate &&
                ["Confirmed", "Seated", "Pending"].includes(r.status),
            );
            return (
              <div
                key={t.id}
                className={`gm-table-slot gm-ts-${s}`}
                onClick={() => onTableClick(t, mapDate)}
              >
                <div className="gm-t-icon">{t.icon}</div>
                <div className="gm-t-name">{t.name}</div>
                <div>👥 {t.cap}</div>
                {linked && <div style={{ fontSize: 10, marginTop: 4 }}>🔗 {linked.name}</div>}
                <div style={{ marginTop: 4, fontSize: 12 }}>{LABELS[s]}</div>
              </div>
            );
          })}
        </div>
        <div className="gm-legend">
          <div>🟢 Available</div>
          <div>🔵 Reserved</div>
          <div>🟠 Occupied</div>
          <div>🔴 Unavailable</div>
          <div style={{ marginLeft: "auto" }}>💡 Tap a table to edit</div>
        </div>
      </div>
    </div>
  );
}
