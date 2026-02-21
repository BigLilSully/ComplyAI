import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
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
    content:
      "Scope, approved use cases, prohibited uses, human-in-the-loop requirements, and escalation paths."
  },
  {
    title: "Data Handling & Privacy Policy",
    category: "Data",
    description: "Clarify what data can be used in prompts, retention limits, and redaction rules.",
    content:
      "Data classification, PII handling, retention timelines, and redaction requirements."
  },
  {
    title: "Vendor & Model Governance Policy",
    category: "Vendors",
    description: "Set requirements for model providers, DPAs, and data residency.",
    content:
      "Approved vendors, due diligence checklist, data residency expectations, and contract requirements."
  },
  {
    title: "Prompt Logging & Access Policy",
    category: "Security",
    description: "Define logging scope, access controls, and auditability for prompts and outputs.",
    content:
      "Logging scope, access controls, retention windows, and review cadence."
  },
  {
    title: "AI Incident Response Policy",
    category: "Risk",
    description: "Outline response steps for data leakage, bias incidents, or model failures.",
    content:
      "Incident categories, response steps, notification requirements, and postmortem process."
  }
];

export default function Dashboard({ brand }) {
  const { user, signOut } = useAuth();
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

  const activeWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === activeWorkspaceId),
    [workspaces, activeWorkspaceId]
  );

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
    return () => {
      isMounted = false;
    };
  }, [user, activeWorkspaceId]);

  useEffect(() => {
    let isMounted = true;

    async function loadTemplates() {
      if (!activeWorkspaceId) {
        setTemplates([]);
        return;
      }
      const { data, error: templateError } = await supabase
        .from("policy_templates")
        .select("id, title, category, description, content")
        .eq("workspace_id", activeWorkspaceId)
        .order("created_at", { ascending: true });

      if (!isMounted) return;
      if (templateError) {
        setTemplates([]);
        return;
      }
      setTemplates(data || []);
    }

    loadTemplates();
    return () => {
      isMounted = false;
    };
  }, [activeWorkspaceId]);

  useEffect(() => {
    let isMounted = true;

    async function loadPolicies() {
      if (!activeWorkspaceId) {
        setPolicies([]);
        return;
      }
      const { data, error: policyError } = await supabase
        .from("policies")
        .select("id, title, status, created_at")
        .eq("workspace_id", activeWorkspaceId)
        .order("created_at", { ascending: false });

      if (!isMounted) return;
      if (policyError) {
        setPolicies([]);
        return;
      }
      setPolicies(data || []);
    }

    loadPolicies();
    return () => {
      isMounted = false;
    };
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (activeWorkspaceId) {
      localStorage.setItem("activeWorkspaceId", activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

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

      const [
        controlsResp,
        cyclesResp,
        runsResp,
        attestationsResp,
        evidenceResp
      ] = await Promise.all([
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
    return () => {
      isMounted = false;
    };
  }, [activeWorkspaceId]);

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

    if (createError) {
      setError(createError.message);
      setLoading(false);
      return;
    }

    const { error: membershipError } = await supabase
      .from("memberships")
      .insert({ workspace_id: workspace.id, user_id: user.id, role: "admin" });

    if (membershipError) {
      setError(membershipError.message);
      setLoading(false);
      return;
    }

    const templateRows = policyTemplateSeeds.map((template) => ({
      workspace_id: workspace.id,
      ...template
    }));

    const { error: templateError } = await supabase
      .from("policy_templates")
      .insert(templateRows);

    if (templateError) {
      setError("Workspace created, but templates could not be added.");
    }

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
      .insert({
        workspace_id: activeWorkspaceId,
        title: policyTitle.trim(),
        status: "draft",
        created_by: user.id
      })
      .select()
      .single();

    if (policyError) {
      setError(policyError.message);
      setLoading(false);
      return;
    }

    const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);
    const content = selectedTemplate?.content || "Start drafting your policy here.";

    const { error: versionError } = await supabase
      .from("policy_versions")
      .insert({
        policy_id: policy.id,
        version: 1,
        content,
        created_by: user.id
      });

    if (versionError) {
      setError(versionError.message);
      setLoading(false);
      return;
    }

    await logAuditEvent({
      workspaceId: activeWorkspaceId,
      actorId: user.id,
      entityType: "policy",
      entityId: policy.id,
      action: "create"
    });

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

    const policy = policies.find((item) => item.id === selectedPolicyId);
    const { data, error: controlsError } = await generateControlsFromPolicy({
      workspaceId: activeWorkspaceId,
      policyId: selectedPolicyId,
      title: policy?.title || "Policy"
    });

    if (controlsError) {
      setError(controlsError.message);
      setLoading(false);
      return;
    }

    await logAuditEvent({
      workspaceId: activeWorkspaceId,
      actorId: user.id,
      entityType: "controls",
      entityId: selectedPolicyId,
      action: "generate"
    });

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

    if (cycleError) {
      setError(cycleError.message);
      setLoading(false);
      return;
    }

    await logAuditEvent({
      workspaceId: activeWorkspaceId,
      actorId: user.id,
      entityType: "audit_cycle",
      entityId: data.id,
      action: "create"
    });

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

    if (runError) {
      setError(runError.message);
      setLoading(false);
      return;
    }

    await logAuditEvent({
      workspaceId: activeWorkspaceId,
      actorId: user.id,
      entityType: "audit_run",
      entityId: data.id,
      action: "create"
    });

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

    if (attestationError) {
      setError(attestationError.message);
      setLoading(false);
      return;
    }

    await logAuditEvent({
      workspaceId: activeWorkspaceId,
      actorId: user.id,
      entityType: "attestation",
      entityId: data.id,
      action: "create"
    });

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

    if (evidenceError) {
      setError(evidenceError.message);
      setLoading(false);
      return;
    }

    await logAuditEvent({
      workspaceId: activeWorkspaceId,
      actorId: user.id,
      entityType: "evidence",
      entityId: data.id,
      action: "create"
    });

    setEvidenceItems((prev) => [data, ...prev]);
    setEvidenceRunId("");
    setEvidenceControlId("");
    setEvidenceUrl("");
    setLoading(false);
  }

  return (
    <main id="main" className="app-shell">
      <div className="container app-header">
        <div>
          <h2>{brand} workspace</h2>
          <p>Policy automation starts here. Create a workspace or select one to continue.</p>
        </div>
      </div>

      <div className="container app-grid">
        <section className="feature app-card">
          <h3>Your workspaces</h3>
          {loading && <p>Loading…</p>}
          {!loading && workspaces.length === 0 && (
            <p>No workspace yet. Create one below to get started.</p>
          )}
          <div className="workspace-list">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                className={`workspace-item ${workspace.id === activeWorkspaceId ? "is-active" : ""}`}
                onClick={() => setActiveWorkspaceId(workspace.id)}
              >
                <div>
                  <strong>{workspace.name}</strong>
                  <span>{workspace.role}</span>
                </div>
                <span className="workspace-pill">Active</span>
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
                onChange={(event) => setName(event.target.value)}
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

      {activeWorkspace && (
        <div className="container app-stack">
          <section className="feature app-card">
            <h3>Active workspace</h3>
            <p>
              <strong>{activeWorkspace.name}</strong> • Role: {activeWorkspace.role}
            </p>
            <p>Next: add policy templates, controls, and audit cycles.</p>
          </section>
          <section className="feature app-card">
            <h3>Policy templates</h3>
            {templates.length === 0 ? (
              <p>No templates yet. Create a workspace to seed starter templates.</p>
            ) : (
              <div className="template-list">
                {templates.map((template) => (
                  <div key={template.id} className="template-item">
                    <div>
                      <strong>{template.title}</strong>
                      <span>{template.category}</span>
                    </div>
                    <p>{template.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="feature app-card">
            <h3>Policies</h3>
            <form onSubmit={handleCreatePolicy} className="app-form">
              <label>
                Policy title
                <input
                  type="text"
                  value={policyTitle}
                  onChange={(event) => setPolicyTitle(event.target.value)}
                  placeholder="AI Usage Policy"
                  required
                />
              </label>
              <label>
                Template (optional)
                <select
                  value={selectedTemplateId}
                  onChange={(event) => setSelectedTemplateId(event.target.value)}
                >
                  <option value="">Start from blank</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.title}
                    </option>
                  ))}
                </select>
              </label>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create policy"}
              </button>
            </form>
            {policies.length === 0 ? (
              <p>No policies yet. Create one to get started.</p>
            ) : (
              <div className="policy-list">
                {policies.map((policy) => (
                  <div key={policy.id} className="policy-item">
                    <div>
                      <strong>{policy.title}</strong>
                      <span>{policy.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="feature app-card">
            <h3>Controls</h3>
            <form onSubmit={handleGenerateControls} className="app-form">
              <label>
                Generate from policy
                <select
                  value={selectedPolicyId}
                  onChange={(event) => setSelectedPolicyId(event.target.value)}
                  required
                >
                  <option value="">Select a policy</option>
                  {policies.map((policy) => (
                    <option key={policy.id} value={policy.id}>
                      {policy.title}
                    </option>
                  ))}
                </select>
              </label>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Generating…" : "Generate controls"}
              </button>
            </form>
            {controls.length === 0 ? (
              <p>No controls yet. Generate them from a policy.</p>
            ) : (
              <div className="policy-list">
                {controls.map((control) => (
                  <div key={control.id} className="policy-item">
                    <div>
                      <strong>{control.title}</strong>
                      <span>{control.frequency || "unscheduled"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="feature app-card">
            <h3>Audit cycles</h3>
            <form onSubmit={handleCreateAuditCycle} className="app-form">
              <label>
                Cycle name
                <input
                  type="text"
                  value={auditCycleName}
                  onChange={(event) => setAuditCycleName(event.target.value)}
                  placeholder="Monthly AI Compliance"
                  required
                />
              </label>
              <label>
                Frequency
                <select
                  value={auditCycleFrequency}
                  onChange={(event) => setAuditCycleFrequency(event.target.value)}
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
            {auditCycles.length === 0 ? (
              <p>No audit cycles yet.</p>
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
            <h3>Audit runs</h3>
            <form onSubmit={handleRunAudit} className="app-form">
              <label>
                Audit cycle
                <select
                  value={runCycleId}
                  onChange={(event) => setRunCycleId(event.target.value)}
                  required
                >
                  <option value="">Select cycle</option>
                  {auditCycles.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>
                      {cycle.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Period start
                <input
                  type="date"
                  value={runPeriodStart}
                  onChange={(event) => setRunPeriodStart(event.target.value)}
                />
              </label>
              <label>
                Period end
                <input
                  type="date"
                  value={runPeriodEnd}
                  onChange={(event) => setRunPeriodEnd(event.target.value)}
                />
              </label>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Scheduling…" : "Run audit"}
              </button>
            </form>
            {auditRuns.length === 0 ? (
              <p>No audit runs yet.</p>
            ) : (
              <div className="policy-list">
                {auditRuns.map((run) => (
                  <div key={run.id} className="policy-item">
                    <div>
                      <strong>{run.status}</strong>
                      <span>{run.period_start || "n/a"} to {run.period_end || "n/a"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="feature app-card">
            <h3>Attestations</h3>
            <form onSubmit={handleCreateAttestation} className="app-form">
              <label>
                Audit run
                <select
                  value={attestationRunId}
                  onChange={(event) => setAttestationRunId(event.target.value)}
                  required
                >
                  <option value="">Select audit run</option>
                  {auditRuns.map((run) => (
                    <option key={run.id} value={run.id}>
                      {run.status} • {run.period_start || "n/a"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Control
                <select
                  value={attestationControlId}
                  onChange={(event) => setAttestationControlId(event.target.value)}
                  required
                >
                  <option value="">Select control</option>
                  {controls.map((control) => (
                    <option key={control.id} value={control.id}>
                      {control.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Response
                <input
                  type="text"
                  value={attestationResponse}
                  onChange={(event) => setAttestationResponse(event.target.value)}
                  placeholder="attested"
                />
              </label>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Saving…" : "Submit attestation"}
              </button>
            </form>
            {attestations.length === 0 ? (
              <p>No attestations yet.</p>
            ) : (
              <div className="policy-list">
                {attestations.map((attestation) => (
                  <div key={attestation.id} className="policy-item">
                    <div>
                      <strong>{attestation.response || "attested"}</strong>
                      <span>{attestation.signed_at ? "signed" : "pending"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="feature app-card">
            <h3>Evidence</h3>
            <form onSubmit={handleAddEvidence} className="app-form">
              <label>
                Audit run
                <select
                  value={evidenceRunId}
                  onChange={(event) => setEvidenceRunId(event.target.value)}
                  required
                >
                  <option value="">Select audit run</option>
                  {auditRuns.map((run) => (
                    <option key={run.id} value={run.id}>
                      {run.status} • {run.period_start || "n/a"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Control (optional)
                <select
                  value={evidenceControlId}
                  onChange={(event) => setEvidenceControlId(event.target.value)}
                >
                  <option value="">No control</option>
                  {controls.map((control) => (
                    <option key={control.id} value={control.id}>
                      {control.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Evidence URL
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(event) => setEvidenceUrl(event.target.value)}
                  placeholder="https://..."
                  required
                />
              </label>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Saving…" : "Add evidence"}
              </button>
            </form>
            {evidenceItems.length === 0 ? (
              <p>No evidence yet.</p>
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
      )}
    </main>
  );
}
