import React, { useState } from "react"; // useState: simple UI + form state

const BRAND = "ComplyAI"; // change to "CompyAI" if desired

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

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <span className="badge" aria-label="Early access">
          ✅ <span>Quick-start AI Compliance</span>
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
            <div className="n">↓ 60–80%</div>
            <div className="t">Time to first review</div>
          </div>
          <div className="card">
            <div className="n">↑ Confidence</div>
            <div className="t">Clear guardrails & ownership</div>
          </div>
          <div className="card">
            <div className="n">Zero-to-Policy</div>
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
function EmailCapture(){
  const [open, setOpen] = useState(false);   // show/hide the form
  const [email, setEmail] = useState("");    // user input value
  const [submitted, setSubmitted] = useState(false); // submitted state

  function handleSubmit(e){
    e.preventDefault();         // don't reload the page
    setSubmitted(true);         // show confirmation
    // TODO: send `email` to your backend/service here for updates
  }

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
              className="btn btn--ghost"          /* CTA: updates */
              type="button"
              onClick={() => { setOpen(v => !v); setSubmitted(false); }} // toggle form
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
                <form onSubmit={handleSubmit} className="email-form__row"> {/* submit shows success */}
                  <input
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    aria-label="Email address"
                    required
                    value={email}               // controlled input
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
function LeadMagnetSection(){
  const [open, setOpen] = useState(false);   // show/hide the form
  const [email, setEmail] = useState("");    // user input value
  const [submitted, setSubmitted] = useState(false); // submitted state

  function handleSubmit(e){
    e.preventDefault();         // don't reload the page
    setSubmitted(true);         // show confirmation
    // TODO: send `email` to your backend/service and email the PDF
  }

  return (
    <section className="section">
      <div className="container">
        <div className="cta lead-cta" role="region" aria-label="Lead Magnet">
          <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
            <div style={{textAlign:'left'}}>
              <h3 style={{marginBottom:6}}>TOP 10  AI COMPLIANCE  MISTAKES TO  AVOID IN 2025</h3>
              <p style={{margin:0}}>Enter your email to get the PDF delivered.</p>
            </div>
            <button
              className="btn btn--xl btn--gold"  /* big + bold button */
              type="button"
              onClick={() => { setOpen(v => !v); setSubmitted(false); }}
              aria-expanded={open}
              aria-controls="lead-magnet-capture"
            >
              Get the PDF File
            </button>
          </div>

          {open && (
            <div id="lead-magnet-capture" className="email-form" role="region" aria-label="Lead Magnet email capture">
              {submitted ? (
                <div className="email-form__success" role="status">
                  Thanks! The PDF File is on the way.
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
                  <button className="btn btn--gold" type="submit">Send me the PDF File</button>
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

export default function App(){
  return (
    <>
      <Navbar />
      <Hero />
      <LeadMagnetSection /> {/* New: bold lead magnet section */}
      <EmailCapture /> {/* New: email signup section */}
      <div className="divider" />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </>
  );
}
