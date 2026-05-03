import React, { useCallback, useEffect, useState } from "react";
import { resources } from "./config/resources";
import { emptyFor } from "./utils/format";
import { api } from "./services/api";
import { pushToast, setToastSetter } from "./services/toastService";
import ToastContainer from "./components/ui/ToastContainer";
import ConfirmDialog from "./components/ui/ConfirmDialog";
import MarkDoneModal from "./components/ui/MarkDoneModal";
import DeliveryModal from "./components/ui/DeliveryModal";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./components/dashboard/Dashboard";
import ListPage from "./pages/ListPage";

import "react-datepicker/dist/react-datepicker.css";

const nowLocal = () => new Date().toISOString().slice(0, 16);

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState(resources[0]);
  const [rows, setRows] = useState([]);
  const [dash, setDash] = useState({});
  const [pendingRows, setPendingRows] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [markDoneModal, setMarkDoneModal] = useState(null);
  const [deliveryModal, setDeliveryModal] = useState(null);

  const [lookups, setLookups] = useState({
    customers: [],
    "rate-cards": [],
    employees: [],
    "stock-items": [],
    "grinding-transactions": [],
  });

  useEffect(() => {
    setToastSetter(setToasts);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const dashboard = await api("dashboard/");
      setDash(dashboard);

      const gt = await api("grinding-transactions/");
      const allGrinding = gt.results || gt;

      setPendingRows(
        allGrinding.filter((r) => r.status === "pending" || r.status === "grinding_done")
      );

      if (active.key !== "dashboard") {
        const result = await api(active.key + "/");
        setRows(result.results || result);
      }

      const next = {};
      for (const key of Object.keys(lookups)) {
        try {
          const result = await api(key + "/");
          next[key] = result.results || result;
        } catch (_) {}
      }
      setLookups(next);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }, [active.key]);

  useEffect(() => {
    setForm(active.fields ? emptyFor(active.fields) : {});
    load();
  }, [active.key, load]);

  const handleSave = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    const body = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null) body[k] = v;
    });

    try {
      await api(active.key + "/", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setForm(emptyFor(active.fields));
      pushToast("success", "Saved!", `${active.label} record added successfully.`);
      load();
    } catch (e) {
      setError(String(e.message || e));
      pushToast("danger", "Error", String(e.message || e));
    }
  };

  const requestDelete = (row) => {
    setDeleteTarget({
      id: row.id,
      displayName:
        row.name ||
        row.title ||
        row.grain_name ||
        row.customer_name ||
        row.reference ||
        `#${row.id}`,
      resourceKey: active.key,
      resourceLabel: active.label,
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api(`${deleteTarget.resourceKey}/${deleteTarget.id}/`, {
        method: "DELETE",
      });

      pushToast(
        "warning",
        "Deleted",
        `${deleteTarget.resourceLabel} record ${deleteTarget.displayName} removed.`
      );

      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(String(e.message || e));
      pushToast("danger", "Delete failed", String(e.message || e));
    }
  };

  const openMarkDoneModal = (row) => {
    const actualRow =
      typeof row === "object"
        ? row
        : pendingRows.find((x) => x.id === row) || rows.find((x) => x.id === row);

    if (!actualRow?.id) {
      pushToast("danger", "Error", "Grinding transaction ID missing.");
      return;
    }

    setMarkDoneModal({
      id: actualRow.id,
      grinding_done_at: new Date().toISOString().slice(0, 16),
      final_weight_kg: actualRow.final_weight_kg || "",
    });
  };

  const submitMarkDone = async () => {
    try {
      await api(`grinding-transactions/${markDoneModal.id}/mark-done/`, {
        method: "POST",
        body: JSON.stringify({
          grinding_done_at: markDoneModal.grinding_done_at,
          final_weight_kg: markDoneModal.final_weight_kg || null,
        }),
      });

      pushToast("success", "Done!", `Order #${markDoneModal.id} marked as done.`);
      setMarkDoneModal(null);
      load();
    } catch (e) {
      pushToast("danger", "Error", String(e.message || e));
    }
  };

  const openDeliveryModal = (row) => {
    const actualRow = typeof row === "object" ? row : pendingRows.find((x) => x.id === row) || rows.find((x) => x.id === row);
    if (!actualRow?.id) {
      pushToast("danger", "Error", "Grinding transaction ID missing.");
      return;
    }

    setDeliveryModal({
      id: actualRow.id,
      delivered_at: new Date().toISOString().slice(0, 16),
      grinding_charge: actualRow.grinding_charge || 0,
      old_udhaar: actualRow.customer_opening_balance || actualRow.old_udhaar || 0,
      initial_weight_kg: actualRow.initial_weight_kg || 0,
      final_weight_kg: actualRow.final_weight_kg || actualRow.initial_weight_kg || 0,
      buyback_per_kg: actualRow.buyback_per_kg || 0,
      amount_paid: actualRow.amount_paid,
      old_udhaar_paid: "",
      buyback_type: "none",
      buyback_weight: "",
      buyback_rate: "",
    });
  };

  const submitDelivery = async () => {
    try {
      await api(`grinding-transactions/${deliveryModal.id}/deliver/`, {
        method: "POST",
        body: JSON.stringify({
          delivered_at: deliveryModal.delivered_at,
          amount_paid: deliveryModal.amount_paid || 0,
          old_udhaar_paid: deliveryModal.old_udhaar_paid || 0,
          buyback_type: deliveryModal.buyback_type || "none",
          buyback_weight: deliveryModal.buyback_weight || 0,
          buyback_rate: deliveryModal.buyback_rate || 0,
        }),
      });

      pushToast("success", "Delivered!", `Order #${deliveryModal.id} marked as delivered.`);
      setDeliveryModal(null);
      load();
    } catch (e) {
      pushToast("danger", "Error", String(e.message || e));
    }
  };

  const pendingCount = pendingRows.filter((r) => r.status === "pending").length;

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))}/>
      <MarkDoneModal value={markDoneModal} onChange={setMarkDoneModal} onClose={() => setMarkDoneModal(null)} onSubmit={submitMarkDone}/>
      <DeliveryModal value={deliveryModal} onChange={setDeliveryModal} onClose={() => setDeliveryModal(null)} onSubmit={submitDelivery}/>
      <ConfirmDialog open={Boolean(deleteTarget)} title={`Delete ${deleteTarget?.resourceLabel || "record"}?`}
        message={`Are you sure you want to delete ${deleteTarget?.displayName || "this record"}?`}
        confirmText="Yes, Delete" cancelText="No, Cancel" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)}/>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar open={sidebarOpen} active={active} onSelect={setActive} pendingCount={pendingCount} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          <Topbar sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} active={active} loading={loading} onRefresh={load}/>

          <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>
                  <i className={`bi ${active.icon} me-2`} />
                  {active.label}
                </h4>
                <div style={{ fontSize: 11.5, color: "#6c757d", marginTop: 2 }}>
                  {active.key === "dashboard" ? `Overview · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric",
                        month: "long",year: "numeric",})}` : `Manage ${active.label.toLowerCase()} records`}
                </div>
              </div>

              {active.key !== "dashboard" && (
                <span style={{ background: "#eef2ff", color: "#4361ee", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>
                  {rows.length} records
                </span>
              )}
            </div>

            {active.key === "dashboard" ? (
              <Dashboard data={dash} pendingRows={pendingRows} onMarkDone={openMarkDoneModal} onDeliver={openDeliveryModal}/>
            ) : (
              <ListPage resource={active} rows={rows} loading={loading} error={error} onSave={handleSave} onDelete={requestDelete} 
                onOpenMarkDone={openMarkDoneModal} onOpenDeliver={openDeliveryModal} lookups={lookups} form={form} setForm={setForm}/>
            )}
          </div>
        </div>
      </div>
    </>
  );
}