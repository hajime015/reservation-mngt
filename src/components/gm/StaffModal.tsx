import { useState } from "react";
import type { StaffMember } from "@/lib/guest-manager/types";

export function StaffModal({
  staff,
  onClose,
  onAdd,
  onRemove,
}: {
  staff: StaffMember[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState("");

  function add() {
    const n = name.trim();
    if (!n || staff.some((s) => s.name === n)) return;
    onAdd(n);
    setName("");
  }

  return (
    <div className="gm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gm-modal" style={{ maxWidth: 480 }}>
        <div className="gm-modal-head">
          <h3>👥 Manage Staff</h3>
          <button className="gm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="gm-modal-body">
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <input
              className="gm-input"
              placeholder="Staff name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <button className="gm-btn gm-btn-primary" onClick={add}>➕ Add</button>
          </div>
          {staff.length ? (
            staff.map((s) => (
              <div className="gm-staff-item" key={s.id}>
                <span>👤 {s.name}</span>
                <button className="gm-icon-btn gm-icon-btn-del" onClick={() => onRemove(s.id)}>🗑️</button>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--gm-text-soft)" }}>No staff yet</p>
          )}
          <p style={{ fontSize: 12, marginTop: 12, color: "var(--gm-text-soft)" }}>
            Removing won't change past assignments.
          </p>
        </div>
        <div className="gm-modal-footer">
          <button className="gm-btn gm-btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
