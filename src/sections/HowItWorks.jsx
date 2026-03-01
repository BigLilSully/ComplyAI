import React from "react";
import { howItWorksSteps } from "../content/siteContent";

export default function HowItWorks() {
  return (
    <section className="section focus-section" data-focus-section="how-it-works">
      <div className="container">
        <h2>How it works in 3 steps</h2>
        <ol className="steps-list">
          {howItWorksSteps.map((step, index) => (
            <li key={index}>
              <strong>{step.title}</strong> {step.body}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
