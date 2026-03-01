import { useState } from "react";
import { readinessPaths } from "../content/siteContent";

// Check functions — ordered to match each path's actions array in siteContent.js.
// Content (labels, descriptions) lives in siteContent; logic lives here.
const PATH_CHECKS = {
  "soc2-lite": [
    ({ policies }) => policies.some((p) => ["usage", "security"].some((k) => p.title?.toLowerCase().includes(k))),
    ({ policies }) => policies.some((p) => ["data", "privacy"].some((k) => p.title?.toLowerCase().includes(k))),
    ({ policies }) => policies.some((p) => ["vendor", "model"].some((k) => p.title?.toLowerCase().includes(k))),
    ({ policies }) => policies.some((p) => ["incident", "response"].some((k) => p.title?.toLowerCase().includes(k))),
    ({ policies }) => policies.some((p) => ["prompt", "logging", "access"].some((k) => p.title?.toLowerCase().includes(k))),
    ({ controls }) => controls.length > 0,
    ({ auditCycles }) => auditCycles.length > 0,
    ({ auditRuns }) => auditRuns.some((r) => r.status === "complete"),
    ({ evidenceItems }) => evidenceItems.length > 0,
    ({ attestations }) => attestations.length > 0,
  ],
  "client-ready": [
    ({ policies }) => policies.some((p) => p.status === "published"),
    ({ policies, controls }) => {
      if (!policies.length) return false;
      const covered = new Set(controls.map((c) => c.policy_id).filter(Boolean));
      return policies.every((p) => covered.has(p.id));
    },
    ({ evidenceItems, controls }) => controls.length > 0 && evidenceItems.length > 0,
    ({ policies }) => policies.some((p) => ["vendor", "model"].some((k) => p.title?.toLowerCase().includes(k))),
    ({ policies }) => policies.some((p) => ["data", "privacy"].some((k) => p.title?.toLowerCase().includes(k))),
    ({ policies }) => policies.some((p) => ["incident", "response"].some((k) => p.title?.toLowerCase().includes(k))),
    ({ auditRuns }) => auditRuns.some((r) => r.status === "complete"),
    ({ evidenceItems }) => evidenceItems.length >= 5,
    ({ attestations }) => attestations.some((a) => a.signed_at),
    ({ auditCycles }) => auditCycles.some((c) => ["monthly", "quarterly"].includes(c.frequency)),
  ],
  "hipaa-basics": [
    ({ policies }) => policies.some((p) => ["data", "privacy", "phi"].some((k) => p.title?.toLowerCase().includes(k))),
    ({ policies }) => policies.some((p) => ["incident", "response"].some((k) => p.title?.toLowerCase().includes(k))),
    ({ policies }) => policies.some((p) => ["prompt", "logging", "access"].some((k) => p.title?.toLowerCase().includes(k))),
    ({ policies }) => policies.some((p) => ["vendor", "model"].some((k) => p.title?.toLowerCase().includes(k))),
    ({ controls }) => controls.length > 0,
    ({ evidenceItems }) => evidenceItems.length > 0,
    ({ attestations }) => attestations.length > 0,
    ({ auditCycles }) => auditCycles.length > 0,
    ({ auditRuns }) => auditRuns.some((r) => r.status === "complete"),
    ({ policies }) => policies.some((p) => ["usage", "security"].some((k) => p.title?.toLowerCase().includes(k))),
  ],
};

// Merge siteContent labels/descriptions with component check functions
const PATHS = Object.fromEntries(
  readinessPaths.map((path) => [
    path.label,
    {
      description: path.description,
      actions: path.actions.map((label, i) => ({
        label,
        check: PATH_CHECKS[path.id]?.[i] ?? (() => false),
      })),
    },
  ])
);

const PATH_KEYS = readinessPaths.map((p) => p.label);

export default function Readiness({
  policies = [],
  controls = [],
  auditCycles = [],
  auditRuns = [],
  attestations = [],
  evidenceItems = [],
}) {
  const [activePath, setActivePath] = useState(PATH_KEYS[0]);
  const path = PATHS[activePath];
  const ctx = { policies, controls, auditCycles, auditRuns, attestations, evidenceItems };

  const results = path.actions.map((action) => ({
    label: action.label,
    done: action.check(ctx),
  }));

  const score = results.filter((r) => r.done).length;
  const total = results.length;
  const pct = Math.round((score / total) * 100);

  const scoreColor =
    pct >= 80 ? "var(--cai-teal)" : pct >= 50 ? "var(--cai-gold)" : "#EF4444";

  return (
    <div className="dash-section-stack">

      {/* Path selector */}
      <section className="feature app-card">
        <h3>Readiness path</h3>
        <p>{path.description}</p>
        <div className="readiness-paths">
          {PATH_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`readiness-path-btn ${activePath === key ? "is-active" : ""}`}
              onClick={() => setActivePath(key)}
            >
              {key}
            </button>
          ))}
        </div>
      </section>

      {/* Score + actions */}
      <div className="dash-section-grid">

        <section className="feature app-card">
          <h3>Score</h3>
          <div className="readiness-score">
            <div className="readiness-score__ring" style={{ "--score-color": scoreColor }}>
              <span className="readiness-score__number">{score}</span>
              <span className="readiness-score__denom">/ {total}</span>
            </div>
            <div className="readiness-score__meta">
              <div className="readiness-score__pct" style={{ color: scoreColor }}>
                {pct}%
              </div>
              <div className="readiness-score__label">
                {pct >= 80 ? "Ready" : pct >= 50 ? "In progress" : "Getting started"}
              </div>
            </div>
          </div>
          <div className="readiness-bar">
            <div
              className="readiness-bar__fill"
              style={{ width: `${pct}%`, background: scoreColor }}
            />
          </div>
        </section>

        <section className="feature app-card">
          <h3>Top {total} actions</h3>
          <div className="readiness-actions">
            {results.map((r, i) => (
              <div key={i} className={`readiness-action ${r.done ? "is-done" : ""}`}>
                <span className="readiness-action__check" aria-hidden="true">
                  {r.done ? "✓" : "○"}
                </span>
                <span className="readiness-action__label">{r.label}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
