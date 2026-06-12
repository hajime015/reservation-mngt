import type { Reservation, RestaurantTable, TableStatus } from "./types";

export const STATUS_OPTIONS = ["Confirmed", "Seated", "Pending", "No-Show", "Cancelled"];

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function to12h(time24: string): string {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = ((h % 12) || 12).toString().padStart(2, "0");
  return `${h12}:${m.toString().padStart(2, "0")} ${ap}`;
}

export function to24h(time12: string): string {
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return "19:00";
  let hour = parseInt(match[1], 10);
  const mm = match[2];
  const ap = match[3].toUpperCase();
  if (ap === "PM" && hour !== 12) hour += 12;
  if (ap === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${mm}`;
}

const ACTIVE = ["Confirmed", "Seated", "Pending"];

export function getTableStatus(
  t: RestaurantTable,
  date: string,
  reservations: Reservation[],
): TableStatus {
  if (t.override === "available" || t.override === "unavailable") return t.override as TableStatus;
  const match = reservations.find(
    (r) => r.table === t.name && r.date === date && ACTIVE.includes(r.status),
  );
  if (!match) return "available";
  return match.status === "Seated" ? "seated" : "reserved";
}

export function badgeClass(status: string): string {
  const map: Record<string, string> = {
    Confirmed: "gm-badge-confirmed",
    Seated: "gm-badge-seated",
    Pending: "gm-badge-pending",
    "No-Show": "gm-badge-noshow",
    Cancelled: "gm-badge-cancelled",
  };
  return map[status] ?? "gm-badge-pending";
}

export function findRepeatGuest(
  name: string,
  phone: string,
  reservations: Reservation[],
  excludeId?: string,
): Reservation[] {
  const n = name.trim().toLowerCase();
  const p = phone.trim();
  if (!n && !p) return [];
  return reservations.filter(
    (r) =>
      r.id !== excludeId &&
      ((p && r.phone && r.phone.trim() === p) || (n && r.name.trim().toLowerCase() === n)),
  );
}

export function exportCSV(reservations: Reservation[]) {
  const headers = ["Name", "Phone", "Type", "Date", "Time", "Pax", "Table", "Status", "Staff", "Notes"];
  const rows = reservations.map((r) =>
    [r.name, r.phone, r.type, r.date, r.time, r.pax, r.table, r.status, r.staff, r.notes]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );
  const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `reservations_${todayStr()}.csv`;
  a.click();
}
