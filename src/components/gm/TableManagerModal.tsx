import { useState } from "react";
import type { RestaurantTable } from "@/lib/guest-manager/types";

const ICONS = ["🪑", "🚪", "🍹", "🎉"];

export function TableManagerModal({
  tables,
  onClose,
  onSave,
}: {
  tables: RestaurantTable[];
  onClose: () => void;
  onSave: (tables: RestaurantTable[], deletedIds: string[]) => void;
}) {
  const [rows, setRows] = useState<RestaurantTable[]>(() => tables.map((t) => ({ ...t })));
  const [deleted, setDeleted] = useState<string[]>([]);

  function update(i: number, patch: Partial<RestaurantTable>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  function add() {
    setRows((r) => [
      ...r,
      { id: `new-${Date.now()}`, name: "New Table", cap: 4, icon: "🪑", override: "", sort_order: r.length },
    ]);
  }

  function remove(i: number) {
    const row = rows[i];
    if (!confirm(`Remove ${row.name}?`)) return;
    if (!row.id.startsWith("new-")) setDeleted((d) => [...d, row.id]);
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  return (
    <div className="gm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gm-modal">
        <div className="gm-modal-head">
          <h3>⚙ Manage Tables</h3>
          <button className="gm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="gm-modal-body">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
            <p style={{ color: "var(--gm-text-mid)" }}>Edit name, capacity, icon &amp; override</p>
            <button className="gm-btn gm-btn-gold" onClick={add}>➕ Add Table</button>
          </div>
          <div className="gm-table-wrap">
            <table className="gm-table" style={{ minWidth: 460 }}>
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Cap</th>
                  <th>Override</th>
                  <th>Del</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t, i) => (
                  <tr key={t.id}>
                    <td>
                      <select className="gm-input" value={t.icon} onChange={(e) => update(i, { icon: e.target.value })}>
                        {ICONS.map((ic) => (
                          <option key={ic}>{ic}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input className="gm-input" value={t.name} onChange={(e) => update(i, { name: e.target.value })} />
                    </td>
                    <td>
                      <input
                        className="gm-input"
                        type="number"
                        style={{ width: 70 }}
                        value={t.cap}
                        onChange={(e) => update(i, { cap: Number(e.target.value) })}
                      />
                    </td>
                    <td>
                      <select
                        className="gm-input"
                        value={t.override || "auto"}
                        onChange={(e) => update(i, { override: e.target.value === "auto" ? "" : e.target.value })}
                      >
                        <option value="auto">Auto</option>
                        <option value="available">Always Avail</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </td>
                    <td>
                      <button className="gm-icon-btn gm-icon-btn-del" onClick={() => remove(i)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="gm-modal-footer">
          <button className="gm-btn gm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="gm-btn gm-btn-primary" onClick={() => onSave(rows, deleted)}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
