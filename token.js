export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { code, code_verifier: codeVerifier, redirect_uri: redirectUri } = req.body || {};
  const clientId = process.env.DERIV_OAUTH_CLIENT_ID;
  const registeredRedirectUri = process.env.DERIV_OAUTH_REDIRECT_URI;

  if (!clientId || !registeredRedirectUri) {
    return res.status(500).json({ error: 'oauth_not_configured' });
  }

  if (!code || !codeVerifier || redirectUri !== registeredRedirectUri) {
    return res.status(400).json({ error: 'invalid_oauth_request' });
  }

  try {
    const response = await fetch('https://auth.deriv.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code,
        code_verifier: codeVerifier,
        redirect_uri: registeredRedirectUri,
      }),
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: 'token_exchange_failed' });
  }
}
