import express from 'express';
import fetch from 'node-fetch';
import crypto from 'node:crypto';

const app = express();

// Your Google client ID/secret
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// The redirect URI MUST exactly match one configured in Google Cloud Console
const REDIRECT_URI = 'https://auth.openai.com/api/accounts/callback/google';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Step 1: redirect user to Google with correct parameters
app.get('/auth/google', (req, res) => {
  const state = crypto.randomUUID();
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', [
    'openid',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ].join(' '));
  url.searchParams.set('access_type', 'online');
  url.searchParams.set('state', state);
  url.searchParams.set('nonce', crypto.randomUUID());
  res.redirect(url.toString());
});

// Step 2: handle the callback and exchange code for tokens
app.get('/api/accounts/callback/google', async (req, res) => {
  const { code } = req.query;
  const resp = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
  const tokens = await resp.json();
  // tokens.id_token contains user info; validate it here
  res.json(tokens);
});

app.listen(3000, () => console.log('Server listening on http://localhost:3000'));
