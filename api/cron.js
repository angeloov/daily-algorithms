const { Resend } = require('resend');
const algorithms = require('../data/algorithms.js');

module.exports = async function handler(req, res) {
  // Check if environment variables are configured
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY environment variable is missing.' });
  }
  if (!process.env.RECIPIENT_EMAIL) {
    return res.status(500).json({ error: 'RECIPIENT_EMAIL environment variable is missing.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  // Check the authorization header to prevent unauthorized runs
  // Vercel Cron sends a secret along with the request that we can verify
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Calculate which algorithm to send based on the current date
    const today = new Date();
    // Days since UNIX epoch
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    const algorithmIndex = daysSinceEpoch % algorithms.length;
    
    const algorithm = algorithms[algorithmIndex];

    const { data, error } = await resend.emails.send({
      from: 'Daily Algorithm <onboarding@resend.dev>', // You can change this if you verify a domain on Resend
      to: [process.env.RECIPIENT_EMAIL],
      subject: `Daily C++ Algorithm: ${algorithm.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2563eb;">${algorithm.name}</h2>
          <p style="font-size: 16px; line-height: 1.5;">${algorithm.description}</p>
          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto;">
            <pre style="margin: 0; font-family: monospace; font-size: 14px; color: #1e293b;"><code>${
              // HTML escape for safety
              algorithm.code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
            }</code></pre>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 32px;">Sent automatically via Vercel Cron Jobs.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error });
    }

    return res.status(200).json({ message: 'Email sent successfully!', data });
  } catch (error) {
    console.error('Unhandled error:', error);
    return res.status(500).json({ error: error.message });
  }
};
