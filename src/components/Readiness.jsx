import { useState } from "react";

const PATHS = {
  "SOC 2 Lite": {
    description: "Core trust services criteria for security, availability, and confidentiality.",
    actions: [
      {
        label: "AI Usage Policy created",
        check: ({ policies }) =>
          policies.some((p) => ["usage", "security"].some((k) => p.title?.toLowerCase().includes(k))),
      },
      {
        label: "Data Handling & Privacy Policy created",
        check: ({ policies }) =>
          policies.some((p) => ["data", "privacy"].some((k) => p.title?.toLowerCase().includes(k))),
      },
      {
        label: "Vendor & Model Governance Policy created",
        check: ({ policies }) =>
          policies.some((p) => ["vendor", "model"].some((k) => p.title?.toLowerCase().includes(k))),
      },
      {
        label: "Incident Response Policy created",
        check: ({ policies }) =>
          policies.some((p) => ["incident", "response"].some((k) => p.title?.toLowerCase().includes(k))),
      },
      {
        label: "Prompt Logging & Access Policy created",
        check: ({ policies }) =>
          policies.some((p) => ["prompt", "logging", "access"].some((k) => p.title?.toLowerCase().includes(k))),
      },
      {
        label: "Controls generated from at least one policy",
        check: ({ controls }) => controls.length > 0,
      },
      {
        label: "Audit cycle scheduled",
        check: ({ auditCycles }) => auditCycles.length > 0,
      },
      {
        label: "At least one audit run completed",
        check: ({ auditRuns }) => auditRuns.some((r) => r.status === "complete"),
      },
      {
        label: "Evidence collected for controls",
        check: ({ evidenceItems }) => evidenceItems.length > 0,
      },
      {
        label: "Team attestations collected",
        check: ({ attestations }) => attestations.length > 0,
      },
    ],
  },

  "Client-Ready": {
    description: "Everything a buyer needs to complete a vendor security review.",
    actions: [
      {
        label: "At least one policy published",
        check: ({ policies }) => policies.some((p) => p.status === "published"),
      },
      {
        label: "All policies have controls mapped",
        check: ({ policies, controls }) => {
          if (!policies.length) return false;
          const covered = new Set(controls.map((c) => c.policy_id).filter(Boolean));
          return policies.every((p) => covered.has(p.id));
        },
      },
      {
        label: "Evidence linked to controls",
        check: ({ evidenceItems, controls }) =>
          controls.length > 0 && evidenceItems.length > 0,
      },
      {
        label: "Vendor governance policy exists",
        check: ({ policies }) =>
          policies.some((p) => ["vendor", "model"].some((k) => p.title?.toLowerCase().includes(k))),
      },
      {
        label: "Data handling policy exists",
        check: ({ policies }) =>
          policies.some((p) => ["data", "privacy"].some((k) => p.title?.toLowerCase().includes(k))),
      },
      {
        label: "Incident response policy exists",
        check: ({ policies }) =>
          policies.some((p) => ["incident", "response"].some((k) => p.title?.toLowerCase().includes(k))),
      },
      {
        label: "Audit run completed",
        check: ({ auditRuns }) => auditRuns.some((r) => r.status === "complete"),
      },
      {
        label: "5 or more evidence items collected",
        check: ({ evidenceItems }) => evidenceItems.length >= 5,
      },
      {
        label: "Team sign-offs collected",
        check: ({ attestations }) => attestations.some((a) => a.signed_at),
      },
      {
        label: "Recurring audit cycle scheduled",
        check: ({ auditCycles }) =>
          auditCycles.some((c) => ["monthly", "quarterly"].includes(c.frequency)),
      },
    ],
  },

  "HIPAA Basics": {
    description: "Foundational controls for handling protected health information (PHI).",
    actions: [
      {
        label: "PHI data handling policy created",
        check: ({ policies }) =>
          policies.some((p) => ["data", "privacy", "phi"].some((k) => p.title?.toLowerCase().includes(k))),
      },
      {
        label: "Incident response plan in place",
        check: ({ policies }) =>
          policies.some((p) => ["incident", "response"].some((k) => p.title?.toLowerCase().includes(k))),
      },
      {
        label: "Access control & logging policy exists",
        check: ({ policies }) =>
          policies.some((p) => ["prompt", "logging", "access"].some((k) => p.title?.toLowerCase().includes(k))),
      },
      {
        label: "Vendor (BAA) governance policy created",
        check: ({ policies }) =>
          policies.some((p) => ["vendor", "model"].some((k) => p.title?.toLowerCase().includes(k))),
      },
      {
        label: "Controls generated for access and logging",
        check: ({ controls }) => controls.length > 0,
      },
      {
        label: "Evidence of access controls collected",
        check: ({ evidenceItems }) => evidenceItems.length > 0,
      },
      {
        label: "Workforce attestations collected",
        check: ({ attestations }) => attestations.length > 0,
      },
      {
        label: "Audit cycle defined",
        check: ({ auditCycles }) => auditCycles.length > 0,
      },
      {
        label: "Audit run completed",
        check: ({ auditRuns }) => auditRuns.some((r) => r.status === "complete"),
      },
      {
        label: "AI usage policy documents approved use cases",
        check: ({ policies }) =>
          policies.some((p) => ["usage", "security"].some((k) => p.title?.toLowerCase().includes(k))),
      },
    ],
  },
};

const PATH_KEYS = Object.keys(PATHS);

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
          <h3>Top 10 actions</h3>
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
