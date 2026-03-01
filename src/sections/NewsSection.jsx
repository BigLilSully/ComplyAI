import React from "react";

export default function NewsSection({
  title,
  intro,
  items,
  sectionId = "news",
  viewAllHref = null,
  viewAllLabel = "View all"
}) {
  return (
    <section id={sectionId} className="section focus-section" data-focus-section={sectionId}>
      <div className="container">
        <h2>{title}</h2>
        {intro ? <p className="section-intro">{intro}</p> : null}

        <div className="grid-3 grid-3--spaced">
          {items.map((item, index) => (
            <article key={index} className="feature news-card">
              <a className="news-card__link" href={item.link} target={item.link?.startsWith("http") ? "_blank" : undefined} rel={item.link?.startsWith("http") ? "noopener" : undefined}>
                <div className="news-meta">{item.date}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="news-link">{item.ctaLabel || "Learn more"}</span>
              </a>
            </article>
          ))}
        </div>

        {viewAllHref ? (
          <div className="hero-cta hero-cta--spaced">
            <a className="btn btn--ghost" href={viewAllHref}>
              {viewAllLabel}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
