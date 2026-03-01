import { useRef, useState } from "react";
import VerificationBadge from "./VerificationBadge";
import { questionnaireExamples } from "../content/siteContent";

// Build runtime question objects from siteContent claims.
// draftFn: uses policy title when a match exists, falls back to the pre-written claim.
const SAMPLE_QUESTIONS = questionnaireExamples.map((ex) => ({
  id: ex.id,
  text: ex.question,
  keywords: ex.keywords,
  category: ex.category,
  draftFn: (policies, auditCycles) => {
    if (ex.id === "q6") {
      // Audit question — pull from live data when available
      return auditCycles.length > 0
        ? `Yes. We run ${auditCycles.length} audit cycle(s) — ${auditCycles.map((c) => c.frequency).join(", ")} — with documented runs and evidence collection.`
        : ex.claim;
    }
    const matched = policies.find((p) =>
      ex.keywords.some((k) => p.title?.toLowerCase().includes(k))
    );
    // Interpolate policy title into the claim when a match exists
    return matched
      ? ex.claim.replace(
          /our ([A-Z][^.]+Policy)/,
          `our "${matched.title}" (${matched.status})`
        )
      : ex.claim;
  },
}));

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
