import { supabase } from "./supabaseClient";

export async function listWorkspaces(userId) {
  return supabase
    .from("memberships")
    .select("workspace_id, role, workspaces(id, name, created_at)")
    .eq("user_id", userId);
}

export async function createWorkspace(name, ownerId) {
  return supabase
    .from("workspaces")
    .insert({ name, owner_id: ownerId })
    .select()
    .single();
}

export async function listPolicies(workspaceId) {
  return supabase
    .from("policies")
    .select("id, title, status, created_at, updated_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
}

export async function createPolicy({ workspaceId, title, createdBy }) {
  return supabase
    .from("policies")
    .insert({
      workspace_id: workspaceId,
      title,
      status: "draft",
      created_by: createdBy
    })
    .select()
    .single();
}

export async function getPolicy(policyId) {
  return supabase
    .from("policies")
    .select("id, workspace_id, title, status, created_at, updated_at")
    .eq("id", policyId)
    .single();
}

export async function listPolicyVersions(policyId) {
  return supabase
    .from("policy_versions")
    .select("id, version, content, created_at, created_by")
    .eq("policy_id", policyId)
    .order("version", { ascending: false });
}

export async function createPolicyVersion({ policyId, content, createdBy }) {
  const { data: latest } = await supabase
    .from("policy_versions")
    .select("version")
    .eq("policy_id", policyId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latest?.version || 0) + 1;

  return supabase
    .from("policy_versions")
    .insert({
      policy_id: policyId,
      version: nextVersion,
      content,
      created_by: createdBy
    })
    .select()
    .single();
}

export async function generateControlsFromPolicy({ workspaceId, policyId, title }) {
  const controls = [
    {
      workspace_id: workspaceId,
      policy_id: policyId,
      title: `${title} — Owner assignment`,
      description: "Assign an owner accountable for this policy area.",
      control_type: "ownership",
      frequency: "quarterly"
    },
    {
      workspace_id: workspaceId,
      policy_id: policyId,
      title: `${title} — Evidence collection`,
      description: "Collect evidence for compliance each audit cycle.",
      control_type: "evidence",
      frequency: "monthly"
    },
    {
      workspace_id: workspaceId,
      policy_id: policyId,
      title: `${title} — Review cadence`,
      description: "Review policy effectiveness and update as needed.",
      control_type: "review",
      frequency: "quarterly"
    }
  ];

  return supabase.from("controls").insert(controls).select();
}

export async function listControls(workspaceId) {
  return supabase
    .from("controls")
    .select("id, title, description, control_type, frequency, policy_id")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
}

export async function createTask({ workspaceId, controlId, status = "open", dueDate, assignedTo }) {
  return supabase
    .from("tasks")
    .insert({
      workspace_id: workspaceId,
      control_id: controlId,
      status,
      due_date: dueDate || null,
      assigned_to: assignedTo || null
    })
    .select()
    .single();
}

export async function updateTask(taskId, patch) {
  return supabase
    .from("tasks")
    .update(patch)
    .eq("id", taskId)
    .select()
    .single();
}

export async function listAuditCycles(workspaceId) {
  return supabase
    .from("audit_cycles")
    .select("id, name, frequency, next_run_at, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
}

export async function listAuditRuns(workspaceId) {
  return supabase
    .from("audit_runs")
    .select("id, audit_cycle_id, period_start, period_end, status, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
}

export async function createAuditCycle({ workspaceId, name, frequency, nextRunAt }) {
  return supabase
    .from("audit_cycles")
    .insert({
      workspace_id: workspaceId,
      name,
      frequency,
      next_run_at: nextRunAt || null
    })
    .select()
    .single();
}

export async function runAuditCycle({ workspaceId, auditCycleId, periodStart, periodEnd }) {
  return supabase
    .from("audit_runs")
    .insert({
      workspace_id: workspaceId,
      audit_cycle_id: auditCycleId,
      period_start: periodStart || null,
      period_end: periodEnd || null,
      status: "scheduled"
    })
    .select()
    .single();
}

export async function getAuditRun(auditRunId) {
  return supabase
    .from("audit_runs")
    .select("*")
    .eq("id", auditRunId)
    .single();
}

export async function listAttestations(workspaceId) {
  return supabase
    .from("attestations")
    .select("id, audit_run_id, control_id, user_id, response, signed_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
}

export async function createAttestation({ workspaceId, auditRunId, controlId, userId, response, notes }) {
  return supabase
    .from("attestations")
    .insert({
      workspace_id: workspaceId,
      audit_run_id: auditRunId,
      control_id: controlId,
      user_id: userId,
      response,
      notes,
      signed_at: new Date().toISOString()
    })
    .select()
    .single();
}

export async function listEvidenceItems(workspaceId) {
  return supabase
    .from("evidence_items")
    .select("id, audit_run_id, control_id, file_url, uploaded_at")
    .eq("workspace_id", workspaceId)
    .order("uploaded_at", { ascending: false });
}

export async function addEvidenceItem({ workspaceId, auditRunId, controlId, fileUrl, metadata, uploadedBy }) {
  return supabase
    .from("evidence_items")
    .insert({
      workspace_id: workspaceId,
      audit_run_id: auditRunId,
      control_id: controlId || null,
      file_url: fileUrl,
      metadata: metadata || null,
      uploaded_by: uploadedBy
    })
    .select()
    .single();
}

export async function logAuditEvent({ workspaceId, actorId, entityType, entityId, action }) {
  return supabase
    .from("audit_events")
    .insert({
      workspace_id: workspaceId,
      actor_id: actorId,
      entity_type: entityType,
      entity_id: entityId,
      action
    })
    .select()
    .single();
}
