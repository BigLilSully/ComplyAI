import React from "react";

const features = [
  {
    title: "Policy & Disclosure Templates",
    body: "Editable AI policy, data usage disclosure, and incident response templates."
  },
  {
    title: "Risk & Vendor Checklists",
    body: "Lightweight forms to vet third-party AI tools, datasets, and model providers."
  },
  {
    title: "Bias / Safety Reviews",
    body: "Practical prompts to run fairness checks and red-team user flows."
  },
  {
    title: "Records & Audit Trails",
    body: "Simple logging for prompts, data sources, approvals, and versioning."
  },
  {
    title: "Training Materials",
    body: "Short modules to teach staff how to use AI responsibly."
  },
  {
    title: "Updates & Legal Signals",
    body: "Plain-English updates when regulations or platform rules change."
  }
];

export default function Toolkit(){
  return (
    <main id="main">
      <section className="section">
        <div className="container container--wide">
          <h2>What's inside the Toolkit</h2>
          <div className="grid-3 grid-toolkit">
            {features.map((f, i) => (
              <article key={i} className="feature" role="article">
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
