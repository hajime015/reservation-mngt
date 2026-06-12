import type { Reservation } from "@/lib/guest-manager/types";
import { badgeClass, todayStr } from "@/lib/guest-manager/helpers";

function TypeBadge({ type }: { type: string }) {
  return type === "Walk-In" ? (
    <span className="gm-badge gm-badge-walkin">🚶 Walk-In</span>
  ) : (
    <span className="gm-badge gm-badge-reservation">📋 Rsvp</span>
  );
}

export function Dashboard({ reservations }: { reservations: Reservation[] }) {
  const today = todayStr();
  const todayRows = reservations.filter((r) => r.date === today);
  const totalPax = todayRows.reduce((s, r) => s + (Number(r.pax) || 0), 0);
  const conf = todayRows.filter((r) => r.status === "Confirmed").length;
  const seated = todayRows.filter((r) => r.status === "Seated").length;
  const walkIns = todayRows.filter((r) => r.type === "Walk-In").length;

  const statuses = ["Confirmed", "Seated", "Pending", "No-Show", "Cancelled"];
  const statusColors = ["#10b981", "#6366f1", "#f59e0b", "#f97316", "#ef4444"];
  const sCounts = statuses.map((s) => reservations.filter((r) => r.status === s).length);
  const maxS = Math.max(...sCounts, 1);

  const slots = ["12:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];
  const tCounts = slots.map(
    (s) => reservations.filter((r) => r.time && r.time.includes(s.slice(0, 5))).length,
  );
  const maxT = Math.max(...tCounts, 1);

  const kpis = [
    { v: todayRows.length, l: "Today" },
    { v: totalPax, l: "Pax" },
    { v: conf, l: "Confirmed" },
    { v: seated, l: "Seated" },
    { v: walkIns, l: "Walk-ins" },
    { v: reservations.length, l: "Total" },
  ];

  return (
    <div className="gm-page">
      <p className="gm-font-display" style={{ fontSize: 26, fontWeight: 700 }}>
        Good day 👋
      </p>
      <p style={{ marginBottom: 24, color: "var(--gm-text-mid)" }}>Today's snapshot</p>

      <div className="gm-kpi-grid">
        {kpis.map((k) => (
          <div className="gm-kpi-card" key={k.l}>
            <div className="gm-value">{k.v}</div>
            <div className="gm-label">{k.l}</div>
          </div>
        ))}
      </div>

      <div className="gm-two-col">
        <div className="gm-card gm-card-pad">
          <h4 className="gm-font-display" style={{ marginBottom: 16 }}>📊 Status</h4>
          {statuses.map((s, i) => (
            <div className="gm-bar-row" key={s}>
              <div className="gm-bar-label">{s}</div>
              <div className="gm-bar-track">
                <div
                  className="gm-bar-fill"
                  style={{ width: `${Math.round((sCounts[i] / maxS) * 100)}%`, background: statusColors[i] }}
                />
              </div>
              <div>{sCounts[i]}</div>
            </div>
          ))}
        </div>
        <div className="gm-card gm-card-pad">
          <h4 className="gm-font-display" style={{ marginBottom: 16 }}>🕐 Popular slots</h4>
          {slots.map((s, i) => (
            <div className="gm-bar-row" key={s}>
              <div className="gm-bar-label">{s}</div>
              <div className="gm-bar-track">
                <div
                  className="gm-bar-fill"
                  style={{ width: `${Math.round((tCounts[i] / maxT) * 100)}%`, background: "var(--gm-gold)" }}
                />
              </div>
              <div>{tCounts[i]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="gm-card">
        <div className="gm-card-header">
          <h3>Today's Guests</h3>
          <span className="gm-badge gm-badge-seated">{todayRows.length} entries</span>
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Type</th>
                <th>Time</th>
                <th>Pax</th>
                <th>Table</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {todayRows.length ? (
                todayRows.map((r) => (
                  <tr key={r.id}>
                    <td><b>{r.name}</b></td>
                    <td><TypeBadge type={r.type} /></td>
                    <td>{r.time}</td>
                    <td>{r.pax}</td>
                    <td>{r.table || "—"}</td>
                    <td><span className={`gm-badge ${badgeClass(r.status)}`}>{r.status}</span></td>
                    <td>{r.notes || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--gm-text-soft)" }}>
                    No entries today
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
