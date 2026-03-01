import React from "react";
import { aboutHighlights } from "../content/siteContent";

export default function AboutSection({ brand }) {
  return (
    <section id="about" className="section focus-section" data-focus-section="about">
      <div className="container">
        <h2>Built for B2B SaaS teams and agencies</h2>
        <p className="section-intro">
          {brand} is designed for teams that need to pass buyer security reviews quickly
          without building a large internal compliance function.
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
