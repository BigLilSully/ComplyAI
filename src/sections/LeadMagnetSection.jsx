import React, { useEffect, useRef, useState } from "react";

export default function LeadMagnetSection() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const closeTimer = useRef(null);

  function triggerDownload() {
    try {
      const anchor = document.createElement("a");
      anchor.href = "/leadmagnet.pdf";
      anchor.download = "ComplyAI-Top-10-AI-Compliance-Mistakes.pdf";
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch {
      // noop
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    triggerDownload();
    setSubmitted(true);

    try {
      const resp = await fetch("/api/send-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data?.error) {
        throw new Error(data?.error || "Failed to send email");
      }
      setEmail("");
    } catch (err) {
      setError(err.message || "We could not email the file.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (submitted && open) {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        setOpen(false);
        closeTimer.current = null;
      }, 5000);
    }
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    };
  }, [submitted, open]);

  return (
    <section className="section focus-section" data-focus-section="lead-magnet">
      <div className="container">
        <div className="cta lead-cta" role="region" aria-label="Lead Magnet">
          <div className="lm">
            <div className="lm__content">
              <span className="badge" aria-label="Free PDF">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z" stroke="#D4AF37" strokeWidth="1.6" fill="rgba(212,175,55,.15)"/>
                  <path d="M9 12l2 2 4-4" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Free PDF</span>
              </span>
              <h3 className="lm__title">Top 10 AI Compliance Mistakes to Avoid in 2025</h3>
              <p className="lm__desc">Actionable guardrails and real examples to prevent costly missteps.</p>
              <ul className="lm__list">
                <li className="lm__item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M20 6L9 17l-5-5" stroke="#00A5A9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Fines exposure and regulatory triggers explained
                </li>
                <li className="lm__item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M20 6L9 17l-5-5" stroke="#00A5A9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Vendor/DPAs quick checklist to ship safely
                </li>
                <li className="lm__item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M20 6L9 17l-5-5" stroke="#00A5A9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Bias, leakage, and security pitfalls to avoid
                </li>
              </ul>
            </div>
            <div className="lm__actions">
              <button
                className="btn btn--xl btn--gold"
                type="button"
                onClick={() => { setOpen((value) => !value); setSubmitted(false); }}
                aria-expanded={open}
                aria-controls="lead-magnet-capture"
              >
                Get the free PDF File
              </button>
              <div className="lm__trust">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M6 10V7a6 6 0 1112 0v3M5 10h14v9a2 2 0 01-2 2H7a2 2 0 01-2-2v-9z" stroke="rgba(230,238,247,.9)" strokeWidth="1.5"/></svg>
                No spam. Unsubscribe anytime.
              </div>
            </div>
          </div>

          {open && (
            <div id="lead-magnet-capture" className="email-form" role="region" aria-label="Lead Magnet email capture">
              {submitted ? (
                <div className="email-form__success" role="status">
                  {error
                    ? (
                        <>
                          Your download started. We couldn’t email you just now.<br />
                          You can also download it here: <a href="/leadmagnet.pdf" download>Download PDF</a>
                        </>
                      )
                    : (
                        <>
                          Thanks! Your PDF is downloading. We’ve also emailed you a copy.
                          <br />If it doesn’t start, use this link: <a href="/leadmagnet.pdf" download>Download PDF</a>
                        </>
                      )
                  }
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
                  <button className="btn btn--gold" type="submit" disabled={loading}>
                    {loading ? "Sending…" : "Send me the PDF File"}
                  </button>
                  <button className="btn btn--ghost" type="button" onClick={() => setOpen(false)}>Close</button>
                  {error && <div role="alert" className="form-error">{error}</div>}
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
