// Vercel serverless function — handles token exchange server-side
// File: /api/token.js

export default async function handler(req, res) {
  // Allow CORS from your site
  res.setHeader('Access-Control-Allow-Origin', 'https://dennisfx-82td.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, code_verifier, redirect_uri } = req.body;

  if (!code || !code_verifier || !redirect_uri) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const tokenRes = await fetch('https://auth.deriv.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        client_id:     '33scAN1TBU9sHqZPKckm9',
        code:          code,
        code_verifier: code_verifier,
        redirect_uri:  redirect_uri
      })
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({ error: data.error, error_description: data.error_description });
    }

    return res.status(200).json(data);
  } catch(e) {
    return res.status(500).json({ error: 'Token exchange failed', message: e.message });
  }
}

