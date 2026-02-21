/* Simple email sender API for the lead magnet.
 * Requires environment variables:
 * - RESEND_API_KEY: API key from https://resend.com
 * - FROM_EMAIL: verified sender email, e.g., "ComplyAI <no-reply@yourdomain.com>"
 */
// Load environment variables and dependencies
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { Resend } from 'resend';
// Node 18+ has global fetch; if older, consider adding `node-fetch`.

// Resolve ESM-friendly __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app and JSON body parsing
const app = express();
app.use(express.json());

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL;

if (!resendApiKey) {
  console.warn('[WARN] RESEND_API_KEY is not set. Emails cannot be sent.');
}
if (!fromEmail) {
  console.warn('[WARN] FROM_EMAIL is not set. Emails cannot be sent.');
}

// Instantiate Resend client if an API key exists
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// POST /api/send-lead: email the lead magnet PDF to the provided address
app.post('/api/send-lead', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!resend || !fromEmail) {
      // For development without keys, simulate success to unblock UI
      return res.status(200).json({ ok: true, simulated: true });
    }

    // Load the PDF from the public folder
    const pdfPath = path.resolve(__dirname, '../public/leadmagnet.pdf'); // expected PDF path
    const pdfBuffer = await readFile(pdfPath).catch(() => null);

    if (!pdfBuffer) {
      return res.status(500).json({ error: 'Lead magnet PDF not found. Place file at public/leadmagnet.pdf' });
    }

    const filename = 'ComplyAI-Top-10-AI-Compliance-Mistakes.pdf';

    // Send email with the PDF attached
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your ComplyAI Lead Magnet',
      text: 'Thanks for your interest! Your PDF is attached. — ComplyAI',
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'Failed to send email' });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
});

// One-shot AI news fetch (non-streaming)
app.get('/api/news', async (req, res) => {
  try{
    const q = (req.query.q && String(req.query.q).trim()) || 'latest AI news';

    const mapResult = (arr) => arr.filter(Boolean).map(r => ({
      title: r.title,
      url: r.url,
      source: r.source || r.provider,
      date: r.date || r.published_date || r.datePublished || null,
      snippet: r.snippet || r.description || r.content || ''
    }));

    const providers = {
      tavily: async () => {
        const key = process.env.TAVILY_API_KEY; if(!key) return null;
        const resp = await fetch('https://api.tavily.com/search', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
          body: JSON.stringify({ query: q, topic: 'news', max_results: 10 })
        }); if(!resp.ok) return null; const data = await resp.json();
        return mapResult((data?.results||[]).map(r => ({ title:r.title, url:r.url, source:r.source, date:r.published_date, snippet:r.snippet })));
      },
      serper: async () => {
        const key = process.env.SERPER_API_KEY; if(!key) return null;
        const resp = await fetch('https://google.serper.dev/news', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-KEY': key },
          body: JSON.stringify({ q, num: 10 })
        }); if(!resp.ok) return null; const data = await resp.json();
        return mapResult((data?.news||[]).map(r => ({ title:r.title, url:r.link, source:r.source, date:r.date, snippet:r.snippet })));
      },
      bing: async () => {
        const key = process.env.BING_API_KEY; if(!key) return null;
        const u = new URL('https://api.bing.microsoft.com/v7.0/news/search');
        u.searchParams.set('q', q); u.searchParams.set('originalImg', 'true'); u.searchParams.set('count','20');
        const resp = await fetch(u, { headers: { 'Ocp-Apim-Subscription-Key': key } }); if(!resp.ok) return null;
        const data = await resp.json();
        return mapResult((data?.value||[]).map(r => ({ title:r.name, url:r.url, source:r.provider?.[0]?.name, date:r.datePublished, snippet:r.description })));
      }
    };

    let results = [];
    for (const name of Object.keys(providers)){
      const r = await providers[name]();
      if (Array.isArray(r) && r.length){ results = r; break; }
    }

    if (!results.length){
      // Fallback examples if no provider or network
      results = [
        { title:'Breakthrough in open-source AI model efficiency', url:'#', source:'ComplyAI Digest', date:new Date().toISOString().slice(0,10), snippet:'Researchers demonstrate improved inference techniques reducing compute costs.' },
        { title:'Major platform updates AI safety policies', url:'#', source:'ComplyAI Digest', date:new Date().toISOString().slice(0,10), snippet:'New guidelines for content moderation and developer usage.' },
        { title:'Industry report: AI adoption trends in 2025', url:'#', source:'ComplyAI Digest', date:new Date().toISOString().slice(0,10), snippet:'Survey reveals rapid growth across sectors with emphasis on governance.' }
      ];
    }

    return res.json({ ok:true, items: results });
  }catch(err){
    console.error(err);
    return res.status(500).json({ ok:false, error:'Failed to fetch news' });
  }
});

// Live AI regulations/laws news via Server-Sent Events (SSE)
// Supports multiple providers if API keys are present; otherwise streams simulated items.
// Env options (set in .env):
// - TAVILY_API_KEY      (https://tavily.com)
// - SERPER_API_KEY      (https://serper.dev)
// - BING_API_KEY        (https://www.microsoft.com/bing/apis/bing-news-search-api)
// Optional query param `q` overrides the default search.
app.get('/api/news/stream', async (req, res) => {
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const query = (req.query.q && String(req.query.q)) || [
    'AI regulation',
    'AI law',
    'EU AI Act',
    'AI governance rules',
    'AI compliance',
    'GDPR AI',
    'NIST AI RMF',
    'US AI Executive Order',
    'FTC AI enforcement',
    'AI transparency law'
  ].join(' OR ');

  const providers = {
    tavily: async () => {
      const key = process.env.TAVILY_API_KEY;
      if (!key) return null;
      const resp = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ query, topic: 'news', max_results: 10 })
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      const results = (data?.results || []).map(r => ({
        title: r.title,
        url: r.url,
        source: r.source,
        date: r.published_date || r.date || null,
        snippet: r.snippet || r.content || ''
      }));
      return results;
    },
    serper: async () => {
      const key = process.env.SERPER_API_KEY;
      if (!key) return null;
      const resp = await fetch('https://google.serper.dev/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': key },
        body: JSON.stringify({ q: query, num: 10 })
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      const results = (data?.news || []).map(r => ({
        title: r.title,
        url: r.link,
        source: r.source,
        date: r.date,
        snippet: r.snippet || ''
      }));
      return results;
    },
    bing: async () => {
      const key = process.env.BING_API_KEY;
      if (!key) return null;
      const u = new URL('https://api.bing.microsoft.com/v7.0/news/search');
      u.searchParams.set('q', query);
      u.searchParams.set('originalImg', 'true');
      u.searchParams.set('count', '20');
      const resp = await fetch(u, { headers: { 'Ocp-Apim-Subscription-Key': key } });
      if (!resp.ok) return null;
      const data = await resp.json();
      const results = (data?.value || []).map(r => ({
        title: r.name,
        url: r.url,
        source: r.provider?.[0]?.name,
        date: r.datePublished,
        snippet: r.description || ''
      }));
      return results;
    }
  };

  const keywords = [
    'regulation', 'regulations', 'law', 'laws', 'act', 'policy', 'policies',
    'compliance', 'governance', 'enforcement', 'guidance', 'framework', 'standard',
    'gdpr', 'ccpa', 'ai act', 'nist', 'ftc', 'ofcom', 'eu', 'uk', 'us', 'doj', 'privacy', 'safety'
  ];
  const looksRelevant = (t = '', s = '') => {
    const hay = (t + ' ' + s).toLowerCase();
    return keywords.some(k => hay.includes(k));
  };

  const fetchOnce = async () => {
    try {
      // Try providers in order
      for (const name of Object.keys(providers)) {
        const results = await providers[name]();
        if (Array.isArray(results) && results.length) return results;
      }
    } catch (e) {
      // ignore and fall back
    }
    // Fallback: simulated items (no external network or keys)
    return [
      {
        title: 'EU AI Act implementation timeline and obligations',
        url: 'https://example.com/eu-ai-act-timeline',
        source: 'ComplyAI Briefing',
        date: new Date().toISOString().slice(0,10),
        snippet: 'Key dates, high-risk system requirements, and provider obligations under the EU AI Act.'
      },
      {
        title: 'NIST AI RMF: Mapping organizational controls',
        url: 'https://example.com/nist-ai-rmf-controls',
        source: 'ComplyAI Guide',
        date: new Date().toISOString().slice(0,10),
        snippet: 'How to align development practices to the NIST AI Risk Management Framework.'
      },
      {
        title: 'FTC signals focus on AI marketing and deception',
        url: 'https://example.com/ftc-ai-enforcement',
        source: 'ComplyAI Update',
        date: new Date().toISOString().slice(0,10),
        snippet: 'Recent actions suggest increased scrutiny of AI claims and consumer protection.'
      }
    ];
  };

  const seen = new Set();
  let closed = false;
  req.on('close', () => { closed = true; });

  // Helper to emit SSE events
  const emit = (event, data) => {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch { /* noop */ }
  };

  emit('hello', { ok: true, query });

  const pushBatch = async () => {
    const results = await fetchOnce();
    for (const n of results) {
      if (closed) return;
      if (!n?.url) continue;
      if (seen.has(n.url)) continue;
      if (!looksRelevant(n.title, n.snippet)) continue;
      seen.add(n.url);
      emit('news', n);
    }
    emit('heartbeat', { t: Date.now() });
  };

  // Initial batch
  await pushBatch();

  // Poll every 60s for new items (deduped)
  const interval = setInterval(() => { pushBatch().catch(() => {}); }, 60000);
  req.on('close', () => {
    clearInterval(interval);
    try { res.end(); } catch {}
  });
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`[server] Lead magnet email API listening on http://localhost:${port}`);
});
