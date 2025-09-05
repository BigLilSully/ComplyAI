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

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`[server] Lead magnet email API listening on http://localhost:${port}`);
});
