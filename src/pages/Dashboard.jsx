import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Questionnaires from "../components/Questionnaires";
import Readiness from "../components/Readiness";
import Vendors from "../components/Vendors";
import {
  addEvidenceItem,
  createAttestation,
  createAuditCycle,
  generateControlsFromPolicy,
  listAuditCycles,
  listAuditRuns,
  listAttestations,
  listControls,
  listEvidenceItems,
  logAuditEvent,
  runAuditCycle
} from "../lib/api";
import { useAuth } from "../context/AuthContext";

const policyTemplateSeeds = [
  {
    title: "AI Usage Policy",
    category: "Usage",
    description: "Define approved AI use cases, prohibited uses, and human oversight expectations.",
    content: "Scope, approved use cases, prohibited uses, human-in-the-loop requirements, and escalation paths."
  },
  {
    title: "Data Handling & Privacy Policy",
    category: "Data",
    description: "Clarify what data can be used in prompts, retention limits, and redaction rules.",
    content: "Data classification, PII handling, retention timelines, and redaction requirements."
  },
  {
    title: "Vendor & Model Governance Policy",
    category: "Vendors",
    description: "Set requirements for model providers, DPAs, and data residency.",
    content: "Approved vendors, due diligence checklist, data residency expectations, and contract requirements."
  },
  {
    title: "Prompt Logging & Access Policy",
    category: "Security",
    description: "Define logging scope, access controls, and auditability for prompts and outputs.",
    content: "Logging scope, access controls, retention windows, and review cadence."
  },
  {
    title: "AI Incident Response Policy",
    category: "Risk",
    description: "Outline response steps for data leakage, bias incidents, or model failures.",
    content: "Incident categories, response steps, notification requirements, and postmortem process."
  }
];

const TABS = [
  { id: "inbox",          label: "Inbox" },
  { id: "questionnaires", label: "Questionnaires" },
  { id: "policies",       label: "Policies" },
  { id: "evidence",       label: "Evidence" },
  { id: "vendors",        label: "Vendors" },
  { id: "readiness",      label: "Readiness" },
];
const TAB_IDS = new Set(TABS.map((tab) => tab.id));

export default function Dashboard({ brand }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(
    () => localStorage.getItem("activeWorkspaceId") || ""
  );
  const [templates, setTemplates] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [policyTitle, setPolicyTitle] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [controls, setControls] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [auditCycles, setAuditCycles] = useState([]);
  const [auditRuns, setAuditRuns] = useState([]);
  const [attestations, setAttestations] = useState([]);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [auditCycleName, setAuditCycleName] = useState("");
  const [auditCycleFrequency, setAuditCycleFrequency] = useState("monthly");
  const [runCycleId, setRunCycleId] = useState("");
  const [runPeriodStart, setRunPeriodStart] = useState("");
  const [runPeriodEnd, setRunPeriodEnd] = useState("");
  const [attestationRunId, setAttestationRunId] = useState("");
  const [attestationControlId, setAttestationControlId] = useState("");
  const [attestationResponse, setAttestationResponse] = useState("");
  const [evidenceRunId, setEvidenceRunId] = useState("");
  const [evidenceControlId, setEvidenceControlId] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");

  const activeWorkspace = useMemo(
    () => workspaces.find((ws) => ws.id === activeWorkspaceId),
    [workspaces, activeWorkspaceId]
  );

  // ── Data loading ────────────────────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true;

    async function loadWorkspaces() {
      if (!user) return;
      setLoading(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("memberships")
        .select("workspace_id, role, workspaces(id, name, created_at)")
        .eq("user_id", user.id);

      if (queryError) {
        if (!isMounted) return;
        setError(queryError.message);
        setWorkspaces([]);
        setLoading(false);
        return;
      }

      const mapped = (data || [])
        .map((row) => row.workspaces && {
          id: row.workspaces.id,
          name: row.workspaces.name,
          createdAt: row.workspaces.created_at,
          role: row.role
        })
        .filter(Boolean);

      if (!isMounted) return;
      setWorkspaces(mapped);
      if (!activeWorkspaceId && mapped.length) {
        setActiveWorkspaceId(mapped[0].id);
      }
      setLoading(false);
    }

    loadWorkspaces();
    return () => { isMounted = false; };
  }, [user, activeWorkspaceId]);

  useEffect(() => {
    let isMounted = true;

    async function loadTemplates() {
      if (!activeWorkspaceId) { setTemplates([]); return; }
      const { data, error: templateError } = await supabase
        .from("policy_templates")
        .select("id, title, category, description, content")
        .eq("workspace_id", activeWorkspaceId)
        .order("created_at", { ascending: true });

      if (!isMounted) return;
      setTemplates(templateError ? [] : (data || []));
    }

    loadTemplates();
    return () => { isMounted = false; };
  }, [activeWorkspaceId]);

  useEffect(() => {
    let isMounted = true;

    async function loadPolicies() {
      if (!activeWorkspaceId) { setPolicies([]); return; }
      const { data, error: policyError } = await supabase
        .from("policies")
        .select("id, title, status, created_at")
        .eq("workspace_id", activeWorkspaceId)
        .order("created_at", { ascending: false });

      if (!isMounted) return;
      setPolicies(policyError ? [] : (data || []));
    }

    loadPolicies();
    return () => { isMounted = false; };
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (activeWorkspaceId) localStorage.setItem("activeWorkspaceId", activeWorkspaceId);
  }, [activeWorkspaceId]);

  useEffect(() => {
    const applyHashTab = () => {
      const hashTab = window.location.hash.replace("#", "").trim();
      if (TAB_IDS.has(hashTab)) {
        setActiveTab(hashTab);
      }
    };

    applyHashTab();
    window.addEventListener("hashchange", applyHashTab);
    return () => window.removeEventListener("hashchange", applyHashTab);
  }, []);

  useEffect(() => {
    const hashTab = window.location.hash.replace("#", "").trim();
    if (activeTab && hashTab !== activeTab) {
      window.history.replaceState(null, "", `#${activeTab}`);
    }
  }, [activeTab]);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkspaceData() {
      if (!activeWorkspaceId) {
        setControls([]);
        setAuditCycles([]);
        setAuditRuns([]);
        setAttestations([]);
        setEvidenceItems([]);
        return;
      }

      const [controlsResp, cyclesResp, runsResp, attestationsResp, evidenceResp] =
        await Promise.all([
          listControls(activeWorkspaceId),
          listAuditCycles(activeWorkspaceId),
          listAuditRuns(activeWorkspaceId),
          listAttestations(activeWorkspaceId),
          listEvidenceItems(activeWorkspaceId)
        ]);

      if (!isMounted) return;
      setControls(controlsResp.data || []);
      setAuditCycles(cyclesResp.data || []);
      setAuditRuns(runsResp.data || []);
      setAttestations(attestationsResp.data || []);
      setEvidenceItems(evidenceResp.data || []);
    }

    loadWorkspaceData();
    return () => { isMounted = false; };
  }, [activeWorkspaceId]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleCreateWorkspace(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    const { data: workspace, error: createError } = await supabase
      .from("workspaces")
      .insert({ name: name.trim(), owner_id: user.id })
      .select()
      .single();

    if (createError) { setError(createError.message); setLoading(false); return; }

    const { error: membershipError } = await supabase
      .from("memberships")
      .insert({ workspace_id: workspace.id, user_id: user.id, role: "admin" });

    if (membershipError) { setError(membershipError.message); setLoading(false); return; }

    const { error: templateError } = await supabase
      .from("policy_templates")
      .insert(policyTemplateSeeds.map((t) => ({ workspace_id: workspace.id, ...t })));

    if (templateError) setError("Workspace created, but templates could not be added.");

    setName("");
    setWorkspaces((prev) => [
      ...prev,
      { id: workspace.id, name: workspace.name, createdAt: workspace.created_at, role: "admin" }
    ]);
    setActiveWorkspaceId(workspace.id);
    setLoading(false);
  }

  async function handleCreatePolicy(event) {
    event.preventDefault();
    if (!policyTitle.trim() || !activeWorkspaceId) return;
    setLoading(true);
    setError("");

    const { data: policy, error: policyError } = await supabase
      .from("policies")
      .insert({ workspace_id: activeWorkspaceId, title: policyTitle.trim(), status: "draft", created_by: user.id })
      .select()
      .single();

    if (policyError) { setError(policyError.message); setLoading(false); return; }

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    const content = selectedTemplate?.content || "Start drafting your policy here.";

    const { error: versionError } = await supabase
      .from("policy_versions")
      .insert({ policy_id: policy.id, version: 1, content, created_by: user.id });

    if (versionError) { setError(versionError.message); setLoading(false); return; }

    await logAuditEvent({ workspaceId: activeWorkspaceId, actorId: user.id, entityType: "policy", entityId: policy.id, action: "create" });

    setPolicies((prev) => [
      { id: policy.id, title: policy.title, status: policy.status, created_at: policy.created_at },
      ...prev
    ]);
    setPolicyTitle("");
    setSelectedTemplateId("");
    setLoading(false);
  }

  async function handleGenerateControls(event) {
    event.preventDefault();
    if (!selectedPolicyId || !activeWorkspaceId) return;
    setLoading(true);
    setError("");

    const policy = policies.find((p) => p.id === selectedPolicyId);
    const { data, error: controlsError } = await generateControlsFromPolicy({
      workspaceId: activeWorkspaceId,
      policyId: selectedPolicyId,
      title: policy?.title || "Policy"
    });

    if (controlsError) { setError(controlsError.message); setLoading(false); return; }

    await logAuditEvent({ workspaceId: activeWorkspaceId, actorId: user.id, entityType: "controls", entityId: selectedPolicyId, action: "generate" });

    setControls((prev) => [...(data || []), ...prev]);
    setSelectedPolicyId("");
    setLoading(false);
  }

  async function handleCreateAuditCycle(event) {
    event.preventDefault();
    if (!auditCycleName.trim() || !activeWorkspaceId) return;
    setLoading(true);
    setError("");

    const { data, error: cycleError } = await createAuditCycle({
      workspaceId: activeWorkspaceId,
      name: auditCycleName.trim(),
      frequency: auditCycleFrequency
    });

    if (cycleError) { setError(cycleError.message); setLoading(false); return; }

    await logAuditEvent({ workspaceId: activeWorkspaceId, actorId: user.id, entityType: "audit_cycle", entityId: data.id, action: "create" });

    setAuditCycles((prev) => [data, ...prev]);
    setAuditCycleName("");
    setAuditCycleFrequency("monthly");
    setLoading(false);
  }

  async function handleRunAudit(event) {
    event.preventDefault();
    if (!runCycleId || !activeWorkspaceId) return;
    setLoading(true);
    setError("");

    const { data, error: runError } = await runAuditCycle({
      workspaceId: activeWorkspaceId,
      auditCycleId: runCycleId,
      periodStart: runPeriodStart || null,
      periodEnd: runPeriodEnd || null
    });

    if (runError) { setError(runError.message); setLoading(false); return; }

    await logAuditEvent({ workspaceId: activeWorkspaceId, actorId: user.id, entityType: "audit_run", entityId: data.id, action: "create" });

    setAuditRuns((prev) => [data, ...prev]);
    setRunCycleId("");
    setRunPeriodStart("");
    setRunPeriodEnd("");
    setLoading(false);
  }

  async function handleCreateAttestation(event) {
    event.preventDefault();
    if (!attestationRunId || !attestationControlId || !activeWorkspaceId) return;
    setLoading(true);
    setError("");

    const { data, error: attestationError } = await createAttestation({
      workspaceId: activeWorkspaceId,
      auditRunId: attestationRunId,
      controlId: attestationControlId,
      userId: user.id,
      response: attestationResponse || "attested",
      notes: null
    });

    if (attestationError) { setError(attestationError.message); setLoading(false); return; }

    await logAuditEvent({ workspaceId: activeWorkspaceId, actorId: user.id, entityType: "attestation", entityId: data.id, action: "create" });

    setAttestations((prev) => [data, ...prev]);
    setAttestationRunId("");
    setAttestationControlId("");
    setAttestationResponse("");
    setLoading(false);
  }

  async function handleAddEvidence(event) {
    event.preventDefault();
    if (!evidenceRunId || !evidenceUrl.trim() || !activeWorkspaceId) return;
    setLoading(true);
    setError("");

    const { data, error: evidenceError } = await addEvidenceItem({
      workspaceId: activeWorkspaceId,
      auditRunId: evidenceRunId,
      controlId: evidenceControlId || null,
      fileUrl: evidenceUrl.trim(),
      metadata: null,
      uploadedBy: user.id
    });

    if (evidenceError) { setError(evidenceError.message); setLoading(false); return; }

    await logAuditEvent({ workspaceId: activeWorkspaceId, actorId: user.id, entityType: "evidence", entityId: data.id, action: "create" });

    setEvidenceItems((prev) => [data, ...prev]);
    setEvidenceRunId("");
    setEvidenceControlId("");
    setEvidenceUrl("");
    setLoading(false);
  }

  // ── Inbox derived data ───────────────────────────────────────────────────────

  const inboxAutoCollected = useMemo(() => {
    const items = [];
    auditRuns.slice(0, 3).forEach((r) =>
      items.push({ label: `Audit run · ${r.status}`, sub: r.period_start ? `${r.period_start} → ${r.period_end}` : "No period set" })
    );
    evidenceItems.slice(0, 3).forEach((e) =>
      items.push({ label: "Evidence uploaded", sub: e.file_url })
    );
    return items;
  }, [auditRuns, evidenceItems]);

  const inboxNeedsReview = useMemo(() => {
    const items = [];
    policies.filter((p) => p.status === "draft").forEach((p) =>
      items.push({ label: p.title, sub: "Draft — needs publish" })
    );
    auditRuns.filter((r) => r.status === "in_progress").forEach((r) =>
      items.push({ label: "Audit in progress", sub: r.period_start || "No period" })
    );
    attestations.filter((a) => !a.signed_at).forEach((a) =>
      items.push({ label: "Unsigned attestation", sub: a.response || "Pending signature" })
    );
    return items;
  }, [policies, auditRuns, attestations]);

  const inboxMissing = useMemo(() => {
    const items = [];
    const policiesWithControls = new Set(controls.map((c) => c.policy_id).filter(Boolean));
    policies.forEach((p) => {
      if (!policiesWithControls.has(p.id))
        items.push({ label: p.title, sub: "No controls generated" });
    });
    const controlsWithEvidence = new Set(evidenceItems.map((e) => e.control_id).filter(Boolean));
    controls.forEach((c) => {
      if (!controlsWithEvidence.has(c.id))
        items.push({ label: c.title, sub: "No evidence linked" });
    });
    if (auditCycles.length === 0)
      items.push({ label: "No audit cycles", sub: "Set one up in Readiness" });
    return items;
  }, [policies, controls, evidenceItems, auditCycles]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <main id="main" className="app-shell">

      {/* Header */}
      <div className="container app-header">
        <div>
          <h2>{brand} workspace</h2>
          <p>Policy automation starts here. Create a workspace or select one to continue.</p>
        </div>
      </div>

      {/* Workspace selector */}
      <div className="container app-grid">
        <section className="feature app-card">
          <h3>Your workspaces</h3>
          {loading && <p>Loading…</p>}
          {!loading && workspaces.length === 0 && (
            <p>No workspace yet. Create one below to get started.</p>
          )}
          <div className="workspace-list">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                type="button"
                className={`workspace-item ${ws.id === activeWorkspaceId ? "is-active" : ""}`}
                onClick={() => setActiveWorkspaceId(ws.id)}
              >
                <div>
                  <strong>{ws.name}</strong>
                  <span>{ws.role}</span>
                </div>
                {ws.id === activeWorkspaceId && (
                  <span className="workspace-pill">Active</span>
                )}
              </button>
            ))}
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
        </section>

        <section className="feature app-card">
          <h3>Create a workspace</h3>
          <p>Workspaces help you separate policies, controls, and audits by client or business unit.</p>
          <form onSubmit={handleCreateWorkspace} className="app-form">
            <label>
              Workspace name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corp"
                required
              />
            </label>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create workspace"}
            </button>
          </form>
        </section>
      </div>

      {/* Tab shell — only shown when a workspace is active */}
      {activeWorkspace && (
        <>
          {/* Tab bar */}
          <div className="container dash-tab-bar">
            <div className="dash-tab-bar__inner">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`dash-tab ${activeTab === tab.id ? "is-active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="dash-workspace-pill">
              {activeWorkspace.name} · {activeWorkspace.role}
            </span>
          </div>

          {/* ── INBOX ─────────────────────────────────────────────────────── */}
          {activeTab === "inbox" && (
            <div className="container dash-panel">
              <div className="inbox-grid">

                <div className="inbox-col">
                  <div className="inbox-col__header inbox-col__header--teal">
                    <span className="inbox-col__dot" />
                    Auto-collected
                  </div>
                  {inboxAutoCollected.length === 0 ? (
                    <p className="inbox-empty">Nothing collected yet. Run an audit or add evidence.</p>
                  ) : (
                    inboxAutoCollected.map((item, i) => (
                      <div key={i} className="inbox-item">
                        <strong>{item.label}</strong>
                        <span>{item.sub}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="inbox-col">
                  <div className="inbox-col__header inbox-col__header--gold">
                    <span className="inbox-col__dot inbox-col__dot--gold" />
                    Needs review
                  </div>
                  {inboxNeedsReview.length === 0 ? (
                    <p className="inbox-empty">Everything is up to date.</p>
                  ) : (
                    inboxNeedsReview.map((item, i) => (
                      <div key={i} className="inbox-item inbox-item--warn">
                        <strong>{item.label}</strong>
                        <span>{item.sub}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="inbox-col">
                  <div className="inbox-col__header inbox-col__header--red">
                    <span className="inbox-col__dot inbox-col__dot--red" />
                    Missing
                  </div>
                  {inboxMissing.length === 0 ? (
                    <p className="inbox-empty">No gaps identified.</p>
                  ) : (
                    inboxMissing.map((item, i) => (
                      <div key={i} className="inbox-item inbox-item--danger">
                        <strong>{item.label}</strong>
                        <span>{item.sub}</span>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ── QUESTIONNAIRES ────────────────────────────────────────────── */}
          {activeTab === "questionnaires" && (
            <div className="container dash-panel">
              <Questionnaires
                policies={policies}
                controls={controls}
                evidenceItems={evidenceItems}
                auditCycles={auditCycles}
                auditRuns={auditRuns}
                attestations={attestations}
                attestationRunId={attestationRunId}
                attestationControlId={attestationControlId}
                attestationResponse={attestationResponse}
                setAttestationRunId={setAttestationRunId}
                setAttestationControlId={setAttestationControlId}
                setAttestationResponse={setAttestationResponse}
                handleCreateAttestation={handleCreateAttestation}
                loading={loading}
              />
            </div>
          )}

          {/* ── POLICIES ──────────────────────────────────────────────────── */}
          {activeTab === "policies" && (
            <div className="container dash-panel">
              <div className="dash-section-grid">

                <section className="feature app-card">
                  <h3>Create policy</h3>
                  <form onSubmit={handleCreatePolicy} className="app-form">
                    <label>
                      Policy title
                      <input
                        type="text"
                        value={policyTitle}
                        onChange={(e) => setPolicyTitle(e.target.value)}
                        placeholder="AI Usage Policy"
                        required
                      />
                    </label>
                    <label>
                      Template (optional)
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                      >
                        <option value="">Start from blank</option>
                        {templates.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>{tpl.title}</option>
                        ))}
                      </select>
                    </label>
                    <button className="btn" type="submit" disabled={loading}>
                      {loading ? "Creating…" : "Create policy"}
                    </button>
                  </form>
                </section>

                <section className="feature app-card">
                  <h3>Policies ({policies.length})</h3>
                  {policies.length === 0 ? (
                    <p>No policies yet. Create one to get started.</p>
                  ) : (
                    <div className="policy-list">
                      {policies.map((p) => (
                        <div key={p.id} className="policy-item">
                          <div>
                            <strong>{p.title}</strong>
                            <span>{p.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="feature app-card">
                  <h3>Generate controls</h3>
                  <p>Auto-generate ownership, evidence, and review controls from a policy.</p>
                  <form onSubmit={handleGenerateControls} className="app-form">
                    <label>
                      Policy
                      <select
                        value={selectedPolicyId}
                        onChange={(e) => setSelectedPolicyId(e.target.value)}
                        required
                      >
                        <option value="">Select a policy</option>
                        {policies.map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </label>
                    <button className="btn" type="submit" disabled={loading}>
                      {loading ? "Generating…" : "Generate controls"}
                    </button>
                  </form>
                  {controls.length > 0 && (
                    <div className="policy-list" style={{ marginTop: "12px" }}>
                      {controls.map((ctrl) => (
                        <div key={ctrl.id} className="policy-item">
                          <div>
                            <strong>{ctrl.title}</strong>
                            <span>{ctrl.frequency || "unscheduled"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="feature app-card">
                  <h3>Policy templates</h3>
                  <p>Starter templates seeded when this workspace was created.</p>
                  {templates.length === 0 ? (
                    <p>No templates available.</p>
                  ) : (
                    <div className="template-list">
                      {templates.map((tpl) => (
                        <div key={tpl.id} className="template-item">
                          <div>
                            <strong>{tpl.title}</strong>
                            <span>{tpl.category}</span>
                          </div>
                          <p>{tpl.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

              </div>
            </div>
          )}

          {/* ── EVIDENCE ──────────────────────────────────────────────────── */}
          {activeTab === "evidence" && (
            <div className="container dash-panel">
              <div className="dash-section-grid">

                <section className="feature app-card">
                  <h3>Add evidence</h3>
                  <form onSubmit={handleAddEvidence} className="app-form">
                    <label>
                      Audit run
                      <select
                        value={evidenceRunId}
                        onChange={(e) => setEvidenceRunId(e.target.value)}
                        required
                      >
                        <option value="">Select audit run</option>
                        {auditRuns.map((run) => (
                          <option key={run.id} value={run.id}>
                            {run.status} · {run.period_start || "n/a"}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Control (optional)
                      <select
                        value={evidenceControlId}
                        onChange={(e) => setEvidenceControlId(e.target.value)}
                      >
                        <option value="">No control</option>
                        {controls.map((ctrl) => (
                          <option key={ctrl.id} value={ctrl.id}>{ctrl.title}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Evidence URL
                      <input
                        type="url"
                        value={evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        placeholder="https://..."
                        required
                      />
                    </label>
                    <button className="btn" type="submit" disabled={loading}>
                      {loading ? "Saving…" : "Add evidence"}
                    </button>
                  </form>
                </section>

                <section className="feature app-card">
                  <h3>Evidence items ({evidenceItems.length})</h3>
                  {evidenceItems.length === 0 ? (
                    <p>No evidence yet. Add a URL to link proof to a control.</p>
                  ) : (
                    <div className="policy-list">
                      {evidenceItems.map((item) => (
                        <div key={item.id} className="policy-item">
                          <div>
                            <strong>Evidence item</strong>
                            <span>{item.file_url}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

              </div>
            </div>
          )}

          {/* ── VENDORS ───────────────────────────────────────────────────── */}
          {activeTab === "vendors" && (
            <div className="container dash-panel">
              <Vendors />
            </div>
          )}

          {/* ── READINESS ─────────────────────────────────────────────────── */}
          {activeTab === "readiness" && (
            <div className="container dash-panel">
              <Readiness
                policies={policies}
                controls={controls}
                auditCycles={auditCycles}
                auditRuns={auditRuns}
                attestations={attestations}
                evidenceItems={evidenceItems}
              />

              {/* Audit cycle + run management below the score */}
              <div className="dash-section-grid" style={{ marginTop: "16px" }}>

                <section className="feature app-card">
                  <h3>Create audit cycle</h3>
                  <form onSubmit={handleCreateAuditCycle} className="app-form">
                    <label>
                      Cycle name
                      <input
                        type="text"
                        value={auditCycleName}
                        onChange={(e) => setAuditCycleName(e.target.value)}
                        placeholder="Monthly AI Compliance"
                        required
                      />
                    </label>
                    <label>
                      Frequency
                      <select
                        value={auditCycleFrequency}
                        onChange={(e) => setAuditCycleFrequency(e.target.value)}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                    <button className="btn" type="submit" disabled={loading}>
                      {loading ? "Creating…" : "Create audit cycle"}
                    </button>
                  </form>
                </section>

                <section className="feature app-card">
                  <h3>Audit cycles ({auditCycles.length})</h3>
                  {auditCycles.length === 0 ? (
                    <p>No audit cycles yet. Create one to start scheduling reviews.</p>
                  ) : (
                    <div className="policy-list">
                      {auditCycles.map((cycle) => (
                        <div key={cycle.id} className="policy-item">
                          <div>
                            <strong>{cycle.name}</strong>
                            <span>{cycle.frequency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="feature app-card">
                  <h3>Run audit</h3>
                  <form onSubmit={handleRunAudit} className="app-form">
                    <label>
                      Audit cycle
                      <select
                        value={runCycleId}
                        onChange={(e) => setRunCycleId(e.target.value)}
                        required
                      >
                        <option value="">Select cycle</option>
                        {auditCycles.map((cycle) => (
                          <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Period start
                      <input
                        type="date"
                        value={runPeriodStart}
                        onChange={(e) => setRunPeriodStart(e.target.value)}
                      />
                    </label>
                    <label>
                      Period end
                      <input
                        type="date"
                        value={runPeriodEnd}
                        onChange={(e) => setRunPeriodEnd(e.target.value)}
                      />
                    </label>
                    <button className="btn" type="submit" disabled={loading}>
                      {loading ? "Scheduling…" : "Run audit"}
                    </button>
                  </form>
                </section>

                <section className="feature app-card">
                  <h3>Audit runs ({auditRuns.length})</h3>
                  {auditRuns.length === 0 ? (
                    <p>No audit runs yet.</p>
                  ) : (
                    <div className="policy-list">
                      {auditRuns.map((run) => (
                        <div key={run.id} className="policy-item">
                          <div>
                            <strong>{run.status}</strong>
                            <span>{run.period_start || "n/a"} → {run.period_end || "n/a"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

              </div>
            </div>
          )}

        </>
      )}
    </main>
  );
}
