import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  addStaff as apiAddStaff,
  deleteReservation as apiDeleteReservation,
  fetchAll,
  removeStaff as apiRemoveStaff,
  saveTables as apiSaveTables,
  updateReservationStatusTable,
  updateTableOverride,
  upsertReservation,
} from "@/lib/guest-manager/api";
import type { Reservation, RestaurantTable, TableStatus } from "@/lib/guest-manager/types";
import { exportCSV } from "@/lib/guest-manager/helpers";
import { Dashboard } from "@/components/gm/Dashboard";
import { ReservationsTable } from "@/components/gm/ReservationsTable";
import { TableMap } from "@/components/gm/TableMap";
import { ReservationModal } from "@/components/gm/ReservationModal";
import { StaffModal } from "@/components/gm/StaffModal";
import { TableManagerModal } from "@/components/gm/TableManagerModal";
import { TableStatusModal } from "@/components/gm/TableStatusModal";

export const Route = createFileRoute("/_authenticated/")({
  component: GuestManager,
});

type PageId = "dashboard" | "reservations" | "tablemap";
const TITLES: Record<PageId, string> = {
  dashboard: "Dashboard",
  reservations: "All Reservations",
  tablemap: "Table Map",
};

function GuestManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState<PageId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [resModal, setResModal] = useState<{ editing: Reservation | null; type: "Reservation" | "Walk-In" } | null>(null);
  const [staffModal, setStaffModal] = useState(false);
  const [tableMgrOpen, setTableMgrOpen] = useState(false);
  const [tsModal, setTsModal] = useState<{ table: RestaurantTable; date: string } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["guest-manager"],
    queryFn: fetchAll,
  });

  const reservations = data?.reservations ?? [];
  const tables = data?.tables ?? [];
  const staff = data?.staff ?? [];

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["guest-manager"] });
  }

  async function run(promise: Promise<unknown>, successMsg: string) {
    try {
      await promise;
      refresh();
      toast.success(successMsg);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function handleSaveReservation(entry: Partial<Reservation> & { id?: string }) {
    await run(upsertReservation(entry), "Reservation saved");
    setResModal(null);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this entry?")) run(apiDeleteReservation(id), "Deleted");
  }

  async function handleApplyTableStatus(selected: TableStatus, linkId: string | null) {
    if (!tsModal) return;
    const t = tsModal.table;
    const ops: Promise<unknown>[] = [];
    ops.push(updateTableOverride(t.id, selected === "available" ? "" : selected === "unavailable" ? "unavailable" : ""));
    if (linkId) {
      const status = selected === "seated" ? "Seated" : selected === "reserved" ? "Confirmed" : undefined;
      const linked = reservations.find((r) => r.id === linkId);
      if (linked) ops.push(updateReservationStatusTable(linkId, status ?? linked.status, t.name));
    }
    await run(Promise.all(ops), `${t.name} updated`);
    setTsModal(null);
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  function go(p: PageId) {
    setPage(p);
    setSidebarOpen(false);
  }

  const todayBadge = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="gm-app">
      <Toaster position="bottom-right" richColors />

      {sidebarOpen && <div className="gm-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={`gm-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="gm-sidebar-logo">
          <h1>Guest Manager</h1>
          <p>⚡ Live cloud sync</p>
        </div>
        <nav className="gm-sidebar-nav">
          <div className="gm-nav-label">Main</div>
          {(Object.keys(TITLES) as PageId[]).map((p) => (
            <button key={p} className={`gm-nav-btn ${page === p ? "active" : ""}`} onClick={() => go(p)}>
              <span className="gm-icon">{p === "dashboard" ? "📊" : p === "reservations" ? "📋" : "🗺️"}</span>
              {TITLES[p]}
            </button>
          ))}
          <div className="gm-nav-label">Actions</div>
          <button className="gm-nav-btn" onClick={() => setResModal({ editing: null, type: "Reservation" })}>
            <span className="gm-icon">➕</span> Add Reservation
          </button>
          <button className="gm-nav-btn" onClick={() => setResModal({ editing: null, type: "Walk-In" })}>
            <span className="gm-icon">🚶</span> Log Walk-In
          </button>
          <div className="gm-nav-label">Tools</div>
          <button className="gm-nav-btn" onClick={() => setStaffModal(true)}>
            <span className="gm-icon">👥</span> Manage Staff
          </button>
          <button className="gm-nav-btn" onClick={() => exportCSV(reservations)}>
            <span className="gm-icon">📥</span> Export CSV
          </button>
          <button className="gm-nav-btn" onClick={() => window.print()}>
            <span className="gm-icon">🖨️</span> Print View
          </button>
          <button className="gm-nav-btn" onClick={handleSignOut}>
            <span className="gm-icon">🚪</span> Sign Out
          </button>
        </nav>
        <div className="gm-sidebar-footer">Guest Manager · powered by Lovable Cloud</div>
      </aside>

      <div className="gm-main">
        <div className="gm-topbar">
          <div className="gm-topbar-left">
            <button className="gm-menu-btn" onClick={() => setSidebarOpen((o) => !o)}>☰</button>
            <h2>{TITLES[page]}</h2>
            <span className="gm-date-badge">{todayBadge}</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="gm-btn gm-btn-gold" onClick={() => setResModal({ editing: null, type: "Walk-In" })}>
              🚶 Walk-In
            </button>
            <button className="gm-btn gm-btn-primary" onClick={() => setResModal({ editing: null, type: "Reservation" })}>
              ➕ Reservation
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="gm-page" style={{ color: "var(--gm-text-mid)" }}>Loading…</div>
        ) : isError ? (
          <div className="gm-page" style={{ color: "#dc2626" }}>
            Failed to load data. Please refresh.
          </div>
        ) : (
          <>
            {page === "dashboard" && <Dashboard reservations={reservations} />}
            {page === "reservations" && (
              <ReservationsTable
                reservations={reservations}
                onEdit={(r) => setResModal({ editing: r, type: r.type as "Reservation" | "Walk-In" })}
                onDelete={handleDelete}
              />
            )}
            {page === "tablemap" && (
              <TableMap
                tables={tables}
                reservations={reservations}
                onTableClick={(table, date) => setTsModal({ table, date })}
                onManageTables={() => setTableMgrOpen(true)}
                onNew={() => setResModal({ editing: null, type: "Reservation" })}
              />
            )}
          </>
        )}
      </div>

      {resModal && (
        <ReservationModal
          editing={resModal.editing}
          initialType={resModal.type}
          tables={tables}
          staff={staff}
          reservations={reservations}
          onClose={() => setResModal(null)}
          onSave={handleSaveReservation}
        />
      )}
      {staffModal && (
        <StaffModal
          staff={staff}
          onClose={() => setStaffModal(false)}
          onAdd={(name) => run(apiAddStaff(name), "Staff added")}
          onRemove={(id) => confirm("Remove this staff member?") && run(apiRemoveStaff(id), "Staff removed")}
        />
      )}
      {tableMgrOpen && (
        <TableManagerModal
          tables={tables}
          onClose={() => setTableMgrOpen(false)}
          onSave={async (rows, deletedIds) => {
            await run(apiSaveTables(rows, deletedIds), "Table config saved");
            setTableMgrOpen(false);
          }}
        />
      )}
      {tsModal && (
        <TableStatusModal
          table={tsModal.table}
          date={tsModal.date}
          reservations={reservations}
          onClose={() => setTsModal(null)}
          onApply={handleApplyTableStatus}
        />
      )}
    </div>
  );
}
