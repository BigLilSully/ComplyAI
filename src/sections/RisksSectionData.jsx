import React from "react";
import { outcomeProofStats } from "../content/siteContent";

export default function RisksSectionData() {
  return (
    <section className="section focus-section" id="risks" data-focus-section="risks">
      <div className="container">
        <span className="badge" aria-label="Customer outcomes">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3l9 16H3L12 3z" stroke="#B45309" strokeWidth="1.4" fill="#FFF7ED"/>
            <path d="M12 9v5m0 3h.01" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span>Outcome Proof</span>
        </span>
        <h2>Proof teams can feel in the pipeline</h2>
        <p className="section-intro">
          Security questionnaires move faster when policy, evidence, and vendor risk checks are
          continuously prepared in one workflow.
        </p>

        <div className="grid-3 grid-3--spaced">
          {outcomeProofStats.map((stat, index) => (
            <article key={index} className="feature stat" role="article">
              <h3 className="stat-title">{stat.title}</h3>
              <div className="stat__value">{stat.value}</div>
              <div className="stat__caption">{stat.caption}</div>
              <p className="stat__desc">{stat.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
