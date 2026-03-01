import { useState } from "react";

const CRITICALITY_ORDER = ["Critical", "High", "Medium", "Low"];

const INITIAL_VENDORS = [
  { id: 1, name: "OpenAI", criticality: "Critical", renewal: "2025-12-01", status: "Active" },
  { id: 2, name: "AWS", criticality: "Critical", renewal: "2026-06-01", status: "Active" },
  { id: 3, name: "Google Workspace", criticality: "High", renewal: "2026-01-15", status: "Active" },
];

export default function Vendors() {
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [form, setForm] = useState({
    name: "",
    criticality: "High",
    renewal: "",
    status: "Active",
  });
  const [nextId, setNextId] = useState(INITIAL_VENDORS.length + 1);
  const [editingId, setEditingId] = useState(null);

  function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId !== null) {
      setVendors((prev) =>
        prev.map((v) => (v.id === editingId ? { ...v, ...form } : v))
      );
      setEditingId(null);
    } else {
      setVendors((prev) => [...prev, { id: nextId, ...form }]);
      setNextId((n) => n + 1);
    }
    setForm({ name: "", criticality: "High", renewal: "", status: "Active" });
  }

  function startEdit(vendor) {
    setForm({
      name: vendor.name,
      criticality: vendor.criticality,
      renewal: vendor.renewal,
      status: vendor.status,
    });
    setEditingId(vendor.id);
  }

  function cancelEdit() {
    setForm({ name: "", criticality: "High", renewal: "", status: "Active" });
    setEditingId(null);
  }

  function removeVendor(id) {
    setVendors((prev) => prev.filter((v) => v.id !== id));
    if (editingId === id) cancelEdit();
  }

  const sorted = [...vendors].sort(
    (a, b) =>
      CRITICALITY_ORDER.indexOf(a.criticality) -
      CRITICALITY_ORDER.indexOf(b.criticality)
  );

  return (
    <div className="dash-section-grid">

      {/* Add / Edit form */}
      <section className="feature app-card">
        <h3>{editingId !== null ? "Edit vendor" : "Add vendor"}</h3>
        <form onSubmit={handleAdd} className="app-form">
          <label>
            Vendor name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Acme AI"
              required
            />
          </label>
          <label>
            Criticality
            <select
              value={form.criticality}
              onChange={(e) => setForm((f) => ({ ...f, criticality: e.target.value }))}
            >
              {CRITICALITY_ORDER.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Renewal date
            <input
              type="date"
              value={form.renewal}
              onChange={(e) => setForm((f) => ({ ...f, renewal: e.target.value }))}
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="Active">Active</option>
              <option value="Under review">Under review</option>
              <option value="Expired">Expired</option>
            </select>
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn" type="submit">
              {editingId !== null ? "Save changes" : "Add vendor"}
            </button>
            {editingId !== null && (
              <button className="btn btn--ghost" type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Vendor list */}
      <section className="feature app-card">
        <h3>Vendors ({vendors.length})</h3>
        {sorted.length === 0 ? (
          <p>No vendors yet. Add one to start tracking risk and renewals.</p>
        ) : (
          <div className="vendor-list">
            {sorted.map((v) => {
              const isExpired =
                v.renewal && new Date(v.renewal) < new Date();
              return (
                <div
                  key={v.id}
                  className={`vendor-row ${editingId === v.id ? "is-editing" : ""}`}
                >
                  <div className="vendor-row__main">
                    <strong className="vendor-row__name">{v.name}</strong>
                    <div className="vendor-row__badges">
                      <span className={`crit-badge crit-badge--${v.criticality.toLowerCase().replace(" ", "-")}`}>
                        {v.criticality}
                      </span>
                      <span className={`status-badge status-badge--${v.status.toLowerCase().replace(" ", "-")}`}>
                        {v.status}
                      </span>
                    </div>
                  </div>
                  <div className="vendor-row__meta">
                    {v.renewal ? (
                      <span className={isExpired ? "vendor-row__renewal--expired" : "vendor-row__renewal"}>
                        {isExpired ? "Expired" : "Renews"} {v.renewal}
                      </span>
                    ) : (
                      <span className="vendor-row__renewal">No renewal date</span>
                    )}
                    <div className="vendor-row__actions">
                      <button
                        type="button"
                        className="vendor-action-btn"
                        onClick={() => startEdit(v)}
                        aria-label={`Edit ${v.name}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="vendor-action-btn vendor-action-btn--danger"
                        onClick={() => removeVendor(v.id)}
                        aria-label={`Remove ${v.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
