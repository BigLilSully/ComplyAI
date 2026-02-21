import React from "react";

export default function News(){
  const items = [
    {
      title: 'EU AI Act: Implementation timeline and obligations',
      source: 'ComplyAI Briefing',
      date: '2025-09-01',
      snippet: 'Key dates, high‑risk system requirements, and provider obligations under the EU AI Act.',
      url: '#'
    },
    {
      title: 'NIST AI RMF: Practical control mapping for teams',
      source: 'ComplyAI Guide',
      date: '2025-08-18',
      snippet: 'How to align development practices to the NIST AI Risk Management Framework.',
      url: '#'
    },
    {
      title: 'FTC focus areas for AI enforcement',
      source: 'ComplyAI Update',
      date: '2025-08-02',
      snippet: 'Signals around AI marketing claims, consumer deception, and disclosures.',
      url: '#'
    }
  ];

  return (
    <main id="main">
      <section className="section">
        <div className="container">
          <h2 style={{marginBottom:6}}>Latest AI News</h2>
          <p style={{marginTop:0}}>Curated updates presented as separate articles.</p>

          <div style={{display:'grid', gridTemplateColumns:'1fr', gap:14, marginTop:14}}>
            {items.map((n, i) => (
              <article key={n.url || i} className="feature" role="article">
                <h3 style={{marginBottom: 6}}>{n.title}</h3>
                <div style={{color:"var(--cai-muted-on-dark)", fontSize: ".95rem", marginBottom: 8}}>
                  {n.source ? `${n.source} — ` : ''}{n.date || ''}
                </div>
                {n.snippet && <p style={{marginBottom: 12}}>{n.snippet}</p>}
                {n.url && <a className="btn btn--ghost" href={n.url}>Read more</a>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
