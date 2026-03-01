import React from "react";

export default function Hero({ brand }) {
  return (
    <section className="hero focus-section" data-focus-section="hero">
      <div className="container">
        <span className="badge" aria-label="Security questionnaire automation">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z" stroke="#0B1B34" strokeWidth="1.6" fill="#E6F7F9"/>
            <path d="M9 12l2 2 4-4" stroke="#00A5A9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Questionnaire-first security copilot</span>
        </span>
        <h1>Answer security questionnaires in minutes.</h1>
        <p>
          {brand}: Policies + evidence + vendor checks, continuously audit-ready.
        </p>
        <div className="hero-cta">
          <a className="btn" href="/login">
            Start Free Assessment
          </a>
          <a className="btn btn--ghost" href="/toolkit">Upload a Questionnaire</a>
        </div>

        <div className="kpis" aria-label="Key benefits">
          <div className="card">
            <div className="n">Minutes, not days</div>
            <div className="t">Questionnaire turnaround</div>
          </div>
          <div className="card">
            <div className="n">Continuously ready</div>
            <div className="t">Policy and evidence in sync</div>
          </div>
          <div className="card">
            <div className="n">Fewer deal stalls</div>
            <div className="t">Security responses that close</div>
          </div>
        </div>
      </div>
    </section>
  );
}
