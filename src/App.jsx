// App entry: page layout and interactive sections
import React, { useState, useEffect, useRef } from "react";

const BRAND = "ComplyAI"; // brand label

// Top navigation with brand and quick access links
function Navbar() {
  return (
    <nav>
      <div className="container nav-inner">
        <div className="brand">
          <img src="/assets/complyai-logo.png" alt={`${BRAND} logo`} />
          <span className="word">{BRAND}</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a className="btn btn--ghost" href="#toolkit">Toolkit</a>
          <a className="btn" href="https://complyai.com/toolkit" target="_blank" rel="noopener">Get the Toolkit</a>
        </div>
      </div>
    </nav>
  );
}

// Hero: core pitch, benefits, and primary CTAs
function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <span className="badge" aria-label="Quick-start AI Compliance">
          {/* Shield icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z" stroke="#0B1B34" strokeWidth="1.6" fill="#E6F7F9"/>
            <path d="M9 12l2 2 4-4" stroke="#00A5A9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Quick-start AI Compliance</span>
        </span>
        <h1>Adopt AI safely—without slowing your team down</h1>
        <p>
          {BRAND} gives you practical checklists, templates, and guidance to meet privacy,
          IP, and safety expectations while shipping AI features fast.
        </p>
        <div className="hero-cta">
          <a className="btn" href="https://complyai.com/toolkit" target="_blank" rel="noopener">
            Get the Full AI Compliance Toolkit
          </a>
          <a className="btn btn--ghost" href="#learn">See what’s inside</a>
        </div>

        <div className="kpis" aria-label="Key benefits">
          <div className="card">
            <div className="n">60–80% faster</div>
            <div className="t">Time to first review</div>
          </div>
          <div className="card">
            <div className="n">↑ Confidence</div>
            <div className="t">Clear guardrails & ownership</div>
          </div>
          <div className="card">
            <div className="n">Zero‑to‑Policy</div>
            <div className="t">Ready-to-edit policy templates</div>
          </div>
        </div>
      </div>
    </section>
  );
}

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

// Feature grid listing toolkit contents
function Features() {
  return (
    <section id="learn" className="section">
      <div className="container">
        <h2>What’s inside the Toolkit</h2>
        <div className="grid-3">
          {features.map((f, i) => (
            <article key={i} className="feature" role="article">
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// Process overview with four simple steps
function HowItWorks() {
  return (
    <section className="section">
      <div className="container">
        <h2>How it works</h2>
        <ol style={{ paddingLeft: 18, margin: 0, display:"grid", gap: 10 }}>
          <li><strong>Install guardrails fast.</strong> Import the templates and adapt the disclosure copy.</li>
          <li><strong>Review high-impact use cases.</strong> Run the quick checklists before launch.</li>
          <li><strong>Capture lightweight records.</strong> Keep prompts, datasets, & approvals in one place.</li>
          <li><strong>Train your team.</strong> Ship the 30-minute intro to responsible AI use.</li>
        </ol>
      </div>
    </section>
  );
}

// Simple email capture section (updates only)
// Collapsible updates form (client-only placeholder)
function EmailCapture(){
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const updatesCloseTimer = useRef(null);

  function handleSubmit(e){
    e.preventDefault();
    setSubmitted(true);
    // TODO: send `email` to your backend/service here for updates
  }

  // Auto-close the updates form 5s after success
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

  return (
    <section className="section">
      <div className="container">
        <div className="cta" role="region" aria-label="Get updates">
          <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
            <div style={{textAlign:'left'}}>
              <h3 style={{marginBottom:6}}>Get updates from {BRAND}</h3>
              <p style={{margin:0}}>Be the first to hear about new templates and guidance.</p>
            </div>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => { setOpen(v => !v); setSubmitted(false); }}
              aria-expanded={open}
              aria-controls="email-capture"
            >
              {open ? 'Close' : 'Get updates via email'}
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
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className="btn" type="submit">Notify me</button>
                  <button className="btn btn--ghost" type="button" onClick={() => setOpen(false)}>Close</button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Lead Magnet CTA in its own section with larger, bolder button
// Lead magnet: hybrid flow (instant download + email copy)
function LeadMagnetSection(){
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const closeTimer = useRef(null);

  // Starts a direct download of the PDF for immediate access
  function triggerDownload(){
    try{
      const a = document.createElement('a');
      a.href = '/leadmagnet.pdf';
      a.download = 'ComplyAI-Top-10-AI-Compliance-Mistakes.pdf';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }catch{ /* noop */ }
  }

  // Handles form submission: triggers download, then requests email delivery
  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1) Start the download immediately for best UX
    triggerDownload();
    setSubmitted(true);

    // 2) Fire-and-forget email send (show error if it fails, but don't block)
    try{
      const resp = await fetch('/api/send-lead',{
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await resp.json().catch(() => ({}));
      if(!resp.ok || data?.error){
        throw new Error(data?.error || 'Failed to send email');
      }
      setEmail("");
    }catch(err){
      setError(err.message || 'We could not email the file.');
    }finally{
      setLoading(false);
    }
  }

  // Auto-close the form 5s after success
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
    <section className="section">
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
              <h3 style={{margin:'10px 0 6px'}}>Top 10 AI Compliance Mistakes to Avoid in 2025</h3>
              <p style={{margin:0}}>Actionable guardrails and real examples to prevent costly missteps.</p>
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
                onClick={() => { setOpen(v => !v); setSubmitted(false); }}
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
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className="btn btn--gold" type="submit" disabled={loading}>
                    {loading ? 'Sending…' : 'Send me the PDF File'}
                  </button>
                  <button className="btn btn--ghost" type="button" onClick={() => setOpen(false)}>Close</button>
                  {error && <div role="alert" style={{color:'#B91C1C', fontWeight:700}}>{error}</div>}
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Secondary CTA section linking to the Toolkit
function CTA() {
  return (
    <section id="toolkit" className="section">
      <div className="container">
        <div className="cta" role="region" aria-label="Get the Toolkit">
          <h3>Stay ahead of AI regulations—get the Toolkit</h3>
          <p>Practical checklists and templates to make safe AI adoption the default.</p>
          <div className="row">
            <a className="btn" href="https://complyai.com/toolkit" target="_blank" rel="noopener">
              Get the Full AI Compliance Toolkit
            </a>
            <a className="btn btn--ghost" href="https://complyai.com" target="_blank" rel="noopener">
              Learn more at ComplyAI.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// Site footer with brand and copyright
function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="row">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src="/assets/complyai-logo.png" alt={`${BRAND} logo`} height="28" />
            <strong>{BRAND}</strong>
          </div>
          <div>© {new Date().getFullYear()} {BRAND}. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}

// Main app composition and section order
export default function App(){
  return (
    <>
      <Navbar />
      {/* Main landmark for skip-link */}
      <main id="main">
        <Hero />
        <RisksSectionData />
        <LeadMagnetSection />
        <div className="divider" />
        <Features />
        <HowItWorks />
        <CTA />
        <EmailCapture />
      </main>
      <Footer />
    </>
  );
}

// Data-driven risks section with sourced figures
// Data-backed risk section with sourced figures and links
function RisksSectionData(){
  const stats = [
    {
      title: 'Average data breach cost',
      value: '$4.45M',
      caption: 'Global average per incident (2023)',
      desc: 'Investigation, notifications, legal, and lost business.',
      sourceName: 'IBM Cost of a Data Breach',
      sourceUrl: 'https://www.ibm.com/reports/data-breach'
    },
    {
      title: 'GDPR administrative fines',
      value: 'Up to €20M or 4%',
      caption: 'of global annual turnover',
      desc: 'For severe infringements under Art. 83(5).',
      sourceName: 'GDPR Art. 83',
      sourceUrl: 'https://gdpr.eu/article-83-administrative-fines/'
    },
    {
      title: 'EU AI Act penalties',
      value: 'Up to €35M or 7%',
      caption: 'for prohibited uses',
      desc: 'Lower tiers apply to other obligations.',
      sourceName: 'EU AI Act (summary)',
      sourceUrl: 'https://artificialintelligenceact.eu/fines/'
    },
    {
      title: 'Biometric privacy (BIPA)',
      value: '$1k–$5k',
      caption: 'per violation statutory damages',
      desc: 'Plus notable settlements (e.g., $650M in FB case).',
      sourceName: '740 ILCS 14/20',
      sourceUrl: 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=3004&ChapterID=57'
    },
    {
      title: '“AI‑washing” enforcement (SEC)',
      value: '$400k',
      caption: 'combined fines in 2024 action',
      desc: 'Misleading AI claims drew charges against two advisers.',
      sourceName: 'SEC Press Release 2024-38',
      sourceUrl: 'https://www.sec.gov/news/press-release/2024-38'
    },
    {
      title: 'CCPA/CPRA civil penalties',
      value: '$2.5k–$7.5k',
      caption: 'per violation; $100–$750 private right (breaches)',
      desc: 'Enforcement by CA AG/CPPA; private suits for breaches.',
      sourceName: 'Cal. Civ. Code §1798.155/§1798.150',
      sourceUrl: 'https://oag.ca.gov/privacy/ccpa'
    }
  ];

  return (
    <section className="section" id="risks">
      <div className="container">
        <span className="badge" aria-label="Risks and Impact">
          {/* Alert icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3l9 16H3L12 3z" stroke="#B45309" strokeWidth="1.4" fill="#FFF7ED"/>
            <path d="M12 9v5m0 3h.01" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span>Risks & Impact</span>
        </span>
        <h2>The cost of AI non‑compliance</h2>
        <p style={{maxWidth:780}}>
          Concrete exposure ranges from multi‑million dollar breach costs to percentage‑of‑revenue fines. These benchmarks
          help quantify what’s at stake when AI launches skip privacy, safety, and vendor guardrails.
        </p>

        <div className="grid-3" style={{marginTop:16}}>
          {stats.map((s, i) => (
            <article key={i} className="feature stat" role="article">
              <h3 style={{marginBottom:10}}>{s.title}</h3>
              <div className="stat__value">{s.value}</div>
              <div className="stat__caption">{s.caption}</div>
              <p style={{marginTop:10}}>{s.desc}</p>
              <div className="stat__source">
                <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer">{s.sourceName}</a>
              </div>
            </article>
          ))}
        </div>

        <div className="hero-cta" style={{marginTop:18}}>
          <a className="btn" href="https://complyai.com/toolkit" target="_blank" rel="noopener">Get the Toolkit</a>
          <a className="btn btn--ghost" href="/leadmagnet.pdf" download>Download the free PDF</a>
        </div>
      </div>
    </section>
  );
}
// Legacy copy-driven risk section (kept for reference)
function RisksSectionLegacy(){
  return (
    <section className="section" id="risks">
      <div className="container">
        <span className="badge" aria-label="Risks and Impact">
          {/* Alert icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3l9 16H3L12 3z" stroke="#B45309" strokeWidth="1.4" fill="#FFF7ED"/>
            <path d="M12 9v5m0 3h.01" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span>Risks & Impact</span>
        </span>
        <h2>The cost of AI non‑compliance</h2>
        <p style={{maxWidth:780}}>
          Skipping guardrails can turn experiments into liabilities. These are the common failure modes that
          slow launches, trigger investigations, and erode customer trust.
        </p>
        <div className="grid-3" style={{marginTop:16}}>
          <article className="feature">
            <h3>Regulatory fines</h3>
            <p>Enforcement under privacy, consumer protection, or the AI Act can lead to costly penalties and mandated remediation.</p>
          </article>
          <article className="feature">
            <h3>Data leaks & IP loss</h3>
            <p>Unvetted prompts and training data can expose personal data or trade secrets through model outputs or logs.</p>
          </article>
          <article className="feature">
            <h3>Bias & discrimination</h3>
            <p>Unchecked outputs can disadvantage protected classes, driving complaints, takedowns, and reputational damage.</p>
          </article>
          <article className="feature">
            <h3>Security incidents</h3>
            <p>Prompt injection and supply‑chain risks in third‑party models can cause account takeover or data exfiltration.</p>
          </article>
          <article className="feature">
            <h3>Contract & vendor risk</h3>
            <p>Missing DPAs, unclear data rights, or ToS violations can break deals and force costly re‑work late in the cycle.</p>
          </article>
          <article className="feature">
            <h3>Brand & customer trust</h3>
            <p>Public incidents travel fast. Trust takes months to rebuild and impacts sales cycles and retention.</p>
          </article>
        </div>
        <div className="hero-cta" style={{marginTop:18}}>
          <a className="btn" href="https://complyai.com/toolkit" target="_blank" rel="noopener">Get the Toolkit</a>
          <a className="btn btn--ghost" href="/leadmagnet.pdf" download>Download the free PDF</a>
        </div>
      </div>
    </section>
  );
}
