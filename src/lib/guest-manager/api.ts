import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_STAFF,
  DEFAULT_TABLES,
  type Reservation,
  type RestaurantTable,
  type StaffMember,
} from "./types";

export async function fetchAll(): Promise<{
  reservations: Reservation[];
  tables: RestaurantTable[];
  staff: StaffMember[];
}> {
  const [resR, tabR, staffR] = await Promise.all([
    supabase.from("reservations").select("*").order("date", { ascending: false }).order("time"),
    supabase.from("restaurant_tables").select("*").order("sort_order"),
    supabase.from("staff").select("*").order("name"),
  ]);
  if (resR.error) throw resR.error;
  if (tabR.error) throw tabR.error;
  if (staffR.error) throw staffR.error;

  let tables = (tabR.data ?? []) as RestaurantTable[];
  let staff = (staffR.data ?? []) as StaffMember[];

  // Seed defaults on first run
  if (tables.length === 0) {
    const { data, error } = await supabase
      .from("restaurant_tables")
      .insert(DEFAULT_TABLES)
      .select("*");
    if (!error && data) tables = data as RestaurantTable[];
  }
  if (staff.length === 0) {
    const { data, error } = await supabase
      .from("staff")
      .insert(DEFAULT_STAFF.map((name) => ({ name })))
      .select("*");
    if (!error && data) staff = data as StaffMember[];
  }

  return {
    reservations: (resR.data ?? []) as Reservation[],
    tables,
    staff,
  };
}

export async function upsertReservation(entry: Partial<Reservation> & { id?: string }) {
  const payload = {
    name: entry.name ?? "",
    phone: entry.phone ?? "",
    type: entry.type ?? "Reservation",
    date: entry.date!,
    time: entry.time ?? "",
    pax: entry.pax ?? 1,
    table: entry.table ?? "",
    status: entry.status ?? "Confirmed",
    staff: entry.staff ?? "",
    notes: entry.notes ?? "",
    arrival: entry.arrival ?? "",
  };
  if (entry.id) {
    const { error } = await supabase.from("reservations").update(payload).eq("id", entry.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("reservations").insert(payload);
    if (error) throw error;
  }
}

export async function deleteReservation(id: string) {
  const { error } = await supabase.from("reservations").delete().eq("id", id);
  if (error) throw error;
}

export async function addStaff(name: string) {
  const { error } = await supabase.from("staff").insert({ name });
  if (error) throw error;
}

export async function removeStaff(id: string) {
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) throw error;
}

export async function saveTables(tables: RestaurantTable[], deletedIds: string[]) {
  if (deletedIds.length) {
    const { error } = await supabase.from("restaurant_tables").delete().in("id", deletedIds);
    if (error) throw error;
  }
  for (const [i, t] of tables.entries()) {
    const payload = { name: t.name, cap: t.cap, icon: t.icon, override: t.override, sort_order: i };
    if (t.id.startsWith("new-")) {
      const { error } = await supabase.from("restaurant_tables").insert(payload);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("restaurant_tables").update(payload).eq("id", t.id);
      if (error) throw error;
    }
  }
}

export async function updateTableOverride(id: string, override: string) {
  const { error } = await supabase.from("restaurant_tables").update({ override }).eq("id", id);
  if (error) throw error;
}

export async function updateReservationStatusTable(id: string, status: string, table: string) {
  const { error } = await supabase.from("reservations").update({ status, table }).eq("id", id);
  if (error) throw error;
}
