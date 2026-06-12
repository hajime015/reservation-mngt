import { useEffect, useMemo, useState } from "react";
import type { Reservation, RestaurantTable, StaffMember } from "@/lib/guest-manager/types";
import {
  STATUS_OPTIONS,
  findRepeatGuest,
  to12h,
  to24h,
  todayStr,
} from "@/lib/guest-manager/helpers";

interface FormState {
  name: string;
  phone: string;
  date: string;
  time: string;
  pax: number;
  table: string;
  status: string;
  staff: string;
  notes: string;
}

export function ReservationModal({
  editing,
  initialType,
  tables,
  staff,
  reservations,
  onClose,
  onSave,
}: {
  editing: Reservation | null;
  initialType: "Reservation" | "Walk-In";
  tables: RestaurantTable[];
  staff: StaffMember[];
  reservations: Reservation[];
  onClose: () => void;
  onSave: (entry: Partial<Reservation> & { id?: string }) => void;
}) {
  const [type, setType] = useState<"Reservation" | "Walk-In">(
    editing ? (editing.type as "Reservation" | "Walk-In") : initialType,
  );
  const [form, setForm] = useState<FormState>(() =>
    editing
      ? {
          name: editing.name,
          phone: editing.phone,
          date: editing.date,
          time: to24h(editing.time),
          pax: editing.pax,
          table: editing.table,
          status: editing.status,
          staff: editing.staff,
          notes: editing.notes,
        }
      : {
          name: "",
          phone: "",
          date: todayStr(),
          time: "19:00",
          pax: 2,
          table: "",
          status: initialType === "Walk-In" ? "Seated" : "Confirmed",
          staff: "",
          notes: "",
        },
  );
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function switchType(t: "Reservation" | "Walk-In") {
    setType(t);
    set("status", t === "Walk-In" ? "Seated" : "Confirmed");
  }

  const repeats = useMemo(
    () => findRepeatGuest(form.name, form.phone, reservations, editing?.id),
    [form.name, form.phone, reservations, editing],
  );

  const conflict = useMemo(() => {
    if (!form.table) return null;
    return reservations.find(
      (r) =>
        r.id !== editing?.id &&
        r.table === form.table &&
        r.date === form.date &&
        ["Confirmed", "Seated", "Pending"].includes(r.status),
    );
  }, [form.table, form.date, reservations, editing]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSave() {
    if (!form.date || !form.time) {
      alert("Date and time are required");
      return;
    }
    setSaving(true);
    onSave({
      id: editing?.id,
      name: form.name.trim() || (type === "Walk-In" ? "Walk-in Guest" : ""),
      phone: form.phone.trim(),
      type,
      date: form.date,
      time: to12h(form.time),
      pax: Number(form.pax) || 1,
      table: form.table,
      status: form.status,
      staff: form.staff,
      notes: form.notes,
    });
  }

  return (
    <div className="gm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gm-modal">
        <div className="gm-modal-head">
          <h3>{editing ? "Edit Entry" : "New Entry"}</h3>
          <button className="gm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="gm-modal-body">
          <div className="gm-type-toggle">
            <button
              className={`gm-type-opt ${type === "Reservation" ? "gm-active-res" : ""}`}
              onClick={() => switchType("Reservation")}
            >
              📋 Reservation
            </button>
            <button
              className={`gm-type-opt ${type === "Walk-In" ? "gm-active-wi" : ""}`}
              onClick={() => switchType("Walk-In")}
            >
              🚶 Walk-In
            </button>
          </div>

          {repeats.length > 0 && (
            <div className="gm-repeat-alert">
              ⭐ Repeat guest — {repeats.length} previous visit{repeats.length > 1 ? "s" : ""} on record.
            </div>
          )}
          {conflict && (
            <div className="gm-repeat-alert" style={{ background: "#fff1f0", borderLeftColor: "#dc2626", color: "#991b1b" }}>
              ⚠️ {form.table} already has “{conflict.name}” at {conflict.time} on this date.
            </div>
          )}

          <div className="gm-form-row">
            <div className="gm-form-group">
              <label>Name</label>
              <input className="gm-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="gm-form-group">
              <label>Phone</label>
              <input className="gm-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="gm-form-row">
            <div className="gm-form-group">
              <label>Date</label>
              <input className="gm-input" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div className="gm-form-group">
              <label>Time</label>
              <input className="gm-input" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
            </div>
          </div>
          <div className="gm-form-row">
            <div className="gm-form-group">
              <label>Pax</label>
              <input className="gm-input" type="number" min={1} value={form.pax} onChange={(e) => set("pax", Number(e.target.value))} />
            </div>
            <div className="gm-form-group">
              <label>Table</label>
              <select className="gm-input" value={form.table} onChange={(e) => set("table", e.target.value)}>
                <option value="">-- Select --</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="gm-form-row">
            <div className="gm-form-group">
              <label>Status</label>
              <select className="gm-input" value={form.status} onChange={(e) => set("status", e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="gm-form-group">
              <label>Staff</label>
              <select className="gm-input" value={form.staff} onChange={(e) => set("staff", e.target.value)}>
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="gm-form-group">
            <label>Notes</label>
            <textarea className="gm-input" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
        <div className="gm-modal-footer">
          <button className="gm-btn gm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="gm-btn gm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
