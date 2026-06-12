export interface Reservation {
  id: string;
  name: string;
  phone: string;
  type: string; // 'Reservation' | 'Walk-In'
  date: string; // yyyy-mm-dd
  time: string; // 'hh:mm AM/PM'
  pax: number;
  table: string;
  status: string; // Confirmed | Seated | Pending | No-Show | Cancelled
  staff: string;
  notes: string;
  arrival: string;
}

export interface RestaurantTable {
  id: string;
  name: string;
  cap: number;
  icon: string;
  override: string; // '' | 'available' | 'unavailable'
  sort_order: number;
}

export interface StaffMember {
  id: string;
  name: string;
}

export type TableStatus = "available" | "reserved" | "seated" | "unavailable";

export const DEFAULT_TABLES: Omit<RestaurantTable, "id">[] = [
  { name: "Table 1", cap: 2, icon: "🪑", override: "", sort_order: 0 },
  { name: "Table 2", cap: 2, icon: "🪑", override: "", sort_order: 1 },
  { name: "Table 3", cap: 4, icon: "🪑", override: "", sort_order: 2 },
  { name: "Table 4", cap: 4, icon: "🪑", override: "", sort_order: 3 },
  { name: "Table 5", cap: 4, icon: "🪑", override: "", sort_order: 4 },
  { name: "Private Room", cap: 12, icon: "🚪", override: "", sort_order: 5 },
  { name: "Bar Area", cap: 8, icon: "🍹", override: "", sort_order: 6 },
];

export const DEFAULT_STAFF = ["Ana Cruz", "Ben Reyes", "Carlo Diaz"];
