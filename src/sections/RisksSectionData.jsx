import React from "react";
import { riskStats } from "../content/siteContent";

export default function RisksSectionData() {
  return (
    <section className="section focus-section" id="risks" data-focus-section="risks">
      <div className="container">
        <span className="badge" aria-label="Risks and Impact">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3l9 16H3L12 3z" stroke="#B45309" strokeWidth="1.4" fill="#FFF7ED"/>
            <path d="M12 9v5m0 3h.01" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span>Risks & Impact</span>
        </span>
        <h2>The cost of AI non‑compliance</h2>
        <p className="section-intro">
          Concrete exposure ranges from multi‑million dollar breach costs to percentage‑of‑revenue fines. These benchmarks
          help quantify what’s at stake when AI launches skip privacy, safety, and vendor guardrails.
        </p>

        <div className="grid-3 grid-3--spaced">
          {riskStats.map((stat, index) => (
            <article key={index} className="feature stat" role="article">
              <h3 className="stat-title">{stat.title}</h3>
              <div className="stat__value">{stat.value}</div>
              <div className="stat__caption">{stat.caption}</div>
              <p className="stat__desc">{stat.desc}</p>
              <div className="stat__source">
                <a href={stat.sourceUrl} target="_blank" rel="noopener noreferrer">{stat.sourceName}</a>
              </div>
            </article>
          ))}
        </div>

        <div className="hero-cta hero-cta--spaced">
          <a className="btn btn--ghost" href="/leadmagnet.pdf" download>Download the free PDF</a>
        </div>
      </div>
    </section>
  );
}
