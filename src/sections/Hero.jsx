import React from "react";

export default function Hero({ brand }) {
  return (
    <section className="hero focus-section" data-focus-section="hero">
      <div className="container">
        <span className="badge" aria-label="Quick-start AI Compliance">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z" stroke="#0B1B34" strokeWidth="1.6" fill="#E6F7F9"/>
            <path d="M9 12l2 2 4-4" stroke="#00A5A9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Quick-start AI Compliance</span>
        </span>
        <h1>Adopt AI safely—without slowing your team down</h1>
        <p>
          {brand} gives you practical checklists, templates, and guidance to meet privacy,
          IP, and safety expectations while shipping AI features fast.
        </p>
        <div className="hero-cta">
          <a className="btn" href="https://complyai.com/toolkit" target="_blank" rel="noopener">
            Get the Full AI Compliance Toolkit
          </a>
          <a className="btn btn--ghost" href="#learn">See what’s inside</a>
        </div>

        <div className="kpis" aria-label="Key benefits">
          <div className="card">
            <div className="n">60–80% faster</div>
            <div className="t">Time to first review</div>
          </div>
          <div className="card">
            <div className="n">↑ Confidence</div>
            <div className="t">Clear guardrails & ownership</div>
          </div>
          <div className="card">
            <div className="n">Zero‑to‑Policy</div>
            <div className="t">Ready-to-edit policy templates</div>
          </div>
        </div>
      </div>
    </section>
  );
}
