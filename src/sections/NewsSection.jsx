import React, { useEffect, useRef, useState } from "react";

export default function NewsSection({ title, intro, items, brand, layout = "grid" }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const updatesCloseTimer = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    // TODO: send `email` to your backend/service here for updates
  }

  useEffect(() => {
    if (submitted && open) {
      if (updatesCloseTimer.current) clearTimeout(updatesCloseTimer.current);
      updatesCloseTimer.current = setTimeout(() => {
        setOpen(false);
        updatesCloseTimer.current = null;
      }, 5000);
    }
    return () => {
      if (updatesCloseTimer.current) {
        clearTimeout(updatesCloseTimer.current);
        updatesCloseTimer.current = null;
      }
    };
  }, [submitted, open]);

  const updatesBlock = (
    <div className="cta cta--compact" role="region" aria-label="Get updates">
      <div className="cta-row">
        <div className="cta-copy">
          <h3>Get updates from {brand}</h3>
          <p>Be the first to hear about new templates and guidance.</p>
        </div>
        <button
          className="btn btn--ghost"
          type="button"
          onClick={() => { setOpen((value) => !value); setSubmitted(false); }}
          aria-expanded={open}
          aria-controls="email-capture"
        >
          {open ? "Close" : "Get updates via email"}
        </button>
      </div>

      {open && (
        <div id="email-capture" className="email-form" role="region" aria-label="Email capture">
          {submitted ? (
            <div className="email-form__success" role="status">
              {"Thanks! We'll keep you posted."}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="email-form__row">
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                aria-label="Email address"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button className="btn" type="submit">Notify me</button>
              <button className="btn btn--ghost" type="button" onClick={() => setOpen(false)}>Close</button>
            </form>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section id="news" className="section focus-section" data-focus-section="news">
      <div className="container">
        <h2>{title}</h2>

        {layout === "split" ? (
          <div className="news-layout">
            <div className="news-main">
              <div className="grid-2 grid-3--spaced">
                {items.map((item, index) => (
                  <article key={index} className="feature news-card">
                    <a className="news-card__link" href={item.link} target="_blank" rel="noopener">
                      <div className="news-meta">{item.date}</div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                      <span className="news-link">View update</span>
                    </a>
                  </article>
                ))}
              </div>
            </div>
            <aside className="news-sidebar">
              <p className="section-intro">{intro}</p>
              {updatesBlock}
            </aside>
          </div>
        ) : (
          <>
            <p className="section-intro">{intro}</p>
            <div className="grid-3 grid-3--spaced">
              {items.map((item, index) => (
                <article key={index} className="feature news-card">
                  <a className="news-card__link" href={item.link} target="_blank" rel="noopener">
                    <div className="news-meta">{item.date}</div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <span className="news-link">View update</span>
                  </a>
                </article>
              ))}
            </div>
            {updatesBlock}
          </>
        )}
      </div>
    </section>
  );
}
