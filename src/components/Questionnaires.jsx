import { useRef, useState } from "react";
import VerificationBadge from "./VerificationBadge";

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    text: "Do you have a written information security policy?",
    keywords: ["usage", "security"],
    draftFn: (policies) => {
      const p = policies.find((p) =>
        ["usage", "security"].some((k) => p.title?.toLowerCase().includes(k))
      );
      return p
        ? `Yes. We maintain an approved "${p.title}" (status: ${p.status}).`
        : "We are currently documenting our information security policies.";
    },
  },
  {
    id: 2,
    text: "How do you handle customer data and what retention periods apply?",
    keywords: ["data", "privacy"],
    draftFn: (policies) => {
      const p = policies.find((p) =>
        ["data", "privacy"].some((k) => p.title?.toLowerCase().includes(k))
      );
      return p
        ? `Customer data handling is governed by our "${p.title}". Retention periods and PII handling are documented within.`
        : "Data handling procedures are being formalized. We follow industry-standard retention practices.";
    },
  },
  {
    id: 3,
    text: "Do you have an incident response plan for security events?",
    keywords: ["incident", "response"],
    draftFn: (policies) => {
      const p = policies.find((p) =>
        ["incident", "response"].some((k) => p.title?.toLowerCase().includes(k))
      );
      return p
        ? `Yes. Our "${p.title}" defines incident categories, response steps, notification requirements, and postmortem processes.`
        : "An incident response plan is in development. Security events are escalated through our dedicated support channel.";
    },
  },
  {
    id: 4,
    text: "How do you manage third-party vendors and AI model providers?",
    keywords: ["vendor", "model", "governance"],
    draftFn: (policies) => {
      const p = policies.find((p) =>
        ["vendor", "model"].some((k) => p.title?.toLowerCase().includes(k))
      );
      return p
        ? `Third-party vendors are governed by our "${p.title}", covering due diligence, DPAs, and data residency requirements.`
        : "Vendor management procedures are being established. We require Data Processing Agreements with all data processors.";
    },
  },
  {
    id: 5,
    text: "How are access controls and prompt logging managed for AI systems?",
    keywords: ["prompt", "logging", "access"],
    draftFn: (policies) => {
      const p = policies.find((p) =>
        ["prompt", "logging", "access"].some((k) => p.title?.toLowerCase().includes(k))
      );
      return p
        ? `Access controls and logging are governed by our "${p.title}", which defines scope, retention windows, and review cadence.`
        : "Access control policies are in progress. We limit AI system access to authorized personnel.";
    },
  },
  {
    id: 6,
    text: "Do you conduct regular audits of AI system usage and compliance?",
    keywords: ["audit", "compliance"],
    draftFn: (policies, auditCycles) => {
      return auditCycles.length > 0
        ? `Yes. We run ${auditCycles.length} audit cycle(s) — ${auditCycles.map((c) => c.frequency).join(", ")} — with documented runs and evidence collection.`
        : "We are establishing recurring audit cycles. Quarterly compliance reviews are planned.";
    },
  },
];

function getVerificationState(question, policies, evidenceItems) {
  const hasPolicy = policies.some((p) =>
    question.keywords.some((k) => p.title?.toLowerCase().includes(k))
  );
  if (!hasPolicy) return "unverified";
  return evidenceItems.length > 0 ? "verified" : "partial";
}

export default function Questionnaires({
  policies = [],
  controls = [],
  evidenceItems = [],
  auditCycles = [],
  auditRuns = [],
  attestations = [],
  attestationRunId,
  attestationControlId,
  attestationResponse,
  setAttestationRunId,
  setAttestationControlId,
  setAttestationResponse,
  handleCreateAttestation,
  loading,
}) {
  const [uploadedQuestions, setUploadedQuestions] = useState(null);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 3);
      setUploadedQuestions(
        lines.map((text, i) => ({
          id: i + 1,
          text,
          keywords: [],
          draftFn: (p) => {
            const match = p[0];
            return match
              ? `Based on our "${match.title}": [Answer pending team review]`
              : "Our team is reviewing this question and will provide a detailed response.";
          },
        }))
      );
    };
    reader.readAsText(file);
  }

  const questions = uploadedQuestions ?? SAMPLE_QUESTIONS;

  return (
    <div className="dash-section-stack">

      {/* Upload area */}
      <section className="feature app-card">
        <h3>Upload questionnaire</h3>
        <p>Upload a .txt or .csv file with one question per line. Answers are drafted from your policy and evidence library.</p>
        <div
          className={`q-upload ${fileName ? "q-upload--loaded" : ""}`}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          aria-label="Upload questionnaire file"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.csv"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <span className="q-upload__icon" aria-hidden="true">
            {fileName ? "📄" : "↑"}
          </span>
          <strong className="q-upload__name">
            {fileName || "Drop file or click to upload"}
          </strong>
          <span className="q-upload__hint">
            {fileName ? "Click to replace" : ".txt or .csv — one question per line"}
          </span>
        </div>
      </section>

      {/* Question list */}
      <section className="feature app-card">
        <div className="q-list-header">
          <h3 style={{ margin: 0 }}>
            {fileName ? `${questions.length} questions` : "Sample questionnaire"}
          </h3>
          {!fileName && (
            <span className="q-sample-label">Sample — upload yours to replace</span>
          )}
        </div>
        <div className="q-list">
          {questions.map((q) => {
            const verState = getVerificationState(q, policies, evidenceItems);
            const drafted = q.draftFn(policies, auditCycles);
            return (
              <div key={q.id} className="q-item">
                <div className="q-item__top">
                  <span className="q-item__question">{q.text}</span>
                  <VerificationBadge state={verState} />
                </div>
                <div className="q-item__answer-label">Drafted answer</div>
                <div className="q-item__answer">{drafted}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Team sign-offs */}
      <section className="feature app-card">
        <h3>Team sign-offs</h3>
        <p>Collect signed confirmations from team members for specific controls.</p>
        <form onSubmit={handleCreateAttestation} className="app-form">
          <label>
            Audit run
            <select
              value={attestationRunId}
              onChange={(e) => setAttestationRunId(e.target.value)}
              required
            >
              <option value="">Select audit run</option>
              {auditRuns.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.status} · {r.period_start || "n/a"}
                </option>
              ))}
            </select>
          </label>
          <label>
            Control
            <select
              value={attestationControlId}
              onChange={(e) => setAttestationControlId(e.target.value)}
              required
            >
              <option value="">Select control</option>
              {controls.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </label>
          <label>
            Response
            <input
              type="text"
              value={attestationResponse}
              onChange={(e) => setAttestationResponse(e.target.value)}
              placeholder="attested"
            />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Saving…" : "Submit sign-off"}
          </button>
        </form>
        {attestations.length > 0 && (
          <div className="policy-list" style={{ marginTop: "12px" }}>
            {attestations.map((a) => (
              <div key={a.id} className="policy-item">
                <div>
                  <strong>{a.response || "attested"}</strong>
                  <span>{a.signed_at ? "Signed" : "Pending"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
