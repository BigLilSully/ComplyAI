/* Simple email sender API for the lead magnet.
 * Requires environment variables:
 * - RESEND_API_KEY: API key from https://resend.com
 * - FROM_EMAIL: verified sender email, e.g., "ComplyAI <no-reply@yourdomain.com>"
 */
// Load environment variables and dependencies
import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { Resend } from 'resend';
import validator from 'validator';

// Resolve ESM-friendly __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app and JSON body parsing
const app = express();
app.use(express.json());

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL;
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = new Set(
  [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:3000'
  ]
    .concat(
      allowedOriginsEnv
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    )
);

if (!resendApiKey) {
  console.warn('[WARN] RESEND_API_KEY is not set. Emails cannot be sent.');
}
if (!fromEmail) {
  console.warn('[WARN] FROM_EMAIL is not set. Emails cannot be sent.');
}

// Instantiate Resend client if an API key exists
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const jsonError = (res, status, message, code = 'error') =>
  res.status(status).json({ error: { message, code } });

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => jsonError(res, 429, 'Too many requests', 'rate_limited')
});

const corsOptions = {
  origin: (origin, callback) => {
    if (origin && allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
};

const enforceAllowedOrigins = (req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || !allowedOrigins.has(origin)) {
    return jsonError(res, 403, 'Origin not allowed', 'cors_not_allowed');
  }
  return next();
};

app.use('/api', enforceAllowedOrigins);
app.use('/api', apiLimiter);
app.use('/api', cors(corsOptions));

// POST /api/send-lead: email the lead magnet PDF to the provided address
app.post('/api/send-lead', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return jsonError(res, 400, 'Email is required', 'invalid_email');
    }
    if (!validator.isEmail(email)) {
      return jsonError(res, 400, 'Email is invalid', 'invalid_email');
    }

    if (!resend || !fromEmail) {
      // For development without keys, simulate success to unblock UI
      return res.status(200).json({ ok: true, simulated: true });
    }

    // Load the PDF from the public folder
    const pdfPath = path.resolve(__dirname, '../public/leadmagnet.pdf'); // expected PDF path
    const pdfBuffer = await readFile(pdfPath).catch(() => null);

    if (!pdfBuffer) {
      return jsonError(
        res,
        500,
        'Lead magnet PDF not found. Place file at public/leadmagnet.pdf',
        'file_missing'
      );
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
      return jsonError(res, 502, 'Failed to send email', 'email_failed');
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonError(res, 500, 'Unexpected error', 'unexpected_error');
  }
});

app.use('/api', (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err?.message === 'Not allowed by CORS') {
    return jsonError(res, 403, 'Origin not allowed', 'cors_not_allowed');
  }
  console.error(err);
  return jsonError(res, 500, 'Unexpected error', 'unexpected_error');
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`[server] Lead magnet email API listening on http://localhost:${port}`);
});
