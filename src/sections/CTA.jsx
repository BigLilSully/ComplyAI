import React from "react";

export default function CTA() {
  return (
    <section id="toolkit" className="section focus-section" data-focus-section="toolkit">
      <div className="container">
        <div className="cta cta--subtle" role="region" aria-label="Start onboarding workflow">
          <h3>Start your onboarding workflow now</h3>
          <p>Run a free readiness assessment, then upload your next questionnaire to generate trusted answers fast.</p>
          <div className="row">
            <a className="btn" href="/login">Start Free Assessment</a>
            <a className="btn btn--ghost" href="/toolkit">Upload a Questionnaire</a>
          </div>
        </div>
      </div>
    </section>
  );
}
