module.exports = async function handler(req, res) {
  // Helper for sending JSON
  const sendJson = (statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  try {
    console.log('--- CRON JOB STARTED ---');
    const { Resend } = require('resend');
    const algorithms = require('../data/algorithms.js');
    
    console.log('Checking environment variables...');
    if (!process.env.RESEND_API_KEY) {
      console.log('ERROR: RESEND_API_KEY missing');
      return sendJson(500, { error: 'RESEND_API_KEY environment variable is missing.' });
    }
    if (!process.env.RECIPIENT_EMAIL) {
      console.log('ERROR: RECIPIENT_EMAIL missing');
      return sendJson(500, { error: 'RECIPIENT_EMAIL environment variable is missing.' });
    }
    console.log('Environment variables present.');

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log('Checking authorization...');
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('ERROR: Unauthorized. Provided header:', authHeader);
      return sendJson(401, { error: 'Unauthorized' });
    }
    console.log('Authorization passed.');

    const today = new Date();
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    const algorithmIndex = daysSinceEpoch % algorithms.length;
    
    const algorithm = algorithms[algorithmIndex];
    console.log(`Prepared algorithm: ${algorithm.name}`);

    console.log('Attempting to send email via Resend...');
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
      return sendJson(500, { error });
    }

    return sendJson(200, { message: 'Email sent successfully!', data });
  } catch (error) {
    console.error('Crash Caught:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Function crashed unexpectedly.', 
      message: error.message, 
      stack: error.stack 
    }));
  }
};
