import React from "react";
import { features } from "../content/siteContent";

export default function Features() {
  return (
    <section id="learn" className="section focus-section" data-focus-section="features">
      <div className="container">
        <h2>What the copilot does daily</h2>
        <div className="grid-3 grid-3--spaced">
          {features.map((feature, index) => (
            <article key={index} className="feature" role="article">
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
