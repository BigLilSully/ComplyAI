import React from "react";
import { aboutHighlights } from "../content/siteContent";

export default function AboutSection({ brand }) {
  return (
    <section id="about" className="section focus-section" data-focus-section="about">
      <div className="container">
        <h2>About {brand}</h2>
        <p className="section-intro">
          {brand} helps teams align AI innovation with privacy, safety, and disclosure expectations.
          The goal is simple: give you lightweight guardrails that move at product speed.
        </p>
        <div className="grid-3 grid-3--spaced">
          {aboutHighlights.map((item, index) => (
            <article key={index} className="feature about-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
