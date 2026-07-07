// ==========================================
// CivicAI — Anonymous X (Twitter) Post Proxy
// ==========================================
// POST /api/tweet
// Body: { text: string, openAIKey?: string, xApiKey?: string, xApiSecret?: string, xAccessToken?: string, xAccessSecret?: string }
//
// Flow:
//  1. AI moderation check (OpenAI)
//  2. If SAFE, post to CivicAI's X account via X API v2 (OAuth 1.0a)

import crypto from 'crypto';

// ── OAuth 1.0a signing helper ──────────────────────────────────────────────
function buildOAuthHeader({ method, url, params, credentials }) {
  const oauthParams = {
    oauth_consumer_key:     credentials.apiKey,
    oauth_token:            credentials.accessToken,
    oauth_nonce:            crypto.randomBytes(16).toString('hex'),
    oauth_timestamp:        String(Math.floor(Date.now() / 1000)),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version:          '1.0',
  };

  // Merge all params for signing
  const allParams = { ...oauthParams, ...params };

  // Percent-encode and sort
  const sortedParams = Object.keys(allParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
    .join('&');

  const signingKey = `${encodeURIComponent(credentials.apiSecret)}&${encodeURIComponent(credentials.accessSecret)}`;
  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams.oauth_signature = signature;

  const headerValue = 'OAuth ' + Object.keys(oauthParams)
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ');

  return headerValue;
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const {
    text,
    openAIKey: clientOpenAIKey,
    xApiKey: clientXApiKey,
    xApiSecret: clientXApiSecret,
    xAccessToken: clientXAccessToken,
    xAccessSecret: clientXAccessSecret,
  } = req.body;

  if (!text || !text.trim()) return res.status(400).json({ error: 'Tweet text is required.' });
  if (text.length > 280) return res.status(400).json({ error: 'Tweet must be 280 characters or less.' });

  // ── 1. AI Moderation ───────────────────────────────────────────────────────
  const openAIKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || clientOpenAIKey;
  if (!openAIKey) return res.status(500).json({ error: 'OpenAI API key not configured for moderation.' });

  try {
    const moderationRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 10,
        messages: [
          {
            role: 'system',
            content: `You are a strict civic content moderator. 
Analyze the given message. Reply with exactly one word:
- "SAFE" if the message is a genuine civic opinion, complaint, or observation — even if it criticizes a politician, policy, or government, as long as it is factual or opinion-based and not hateful.
- "UNSAFE" if the message contains any of: hate speech, slurs, personal threats, sexual content, religious incitement, caste-based slurs, calls to violence, misinformation, or spam.
Reply ONLY with "SAFE" or "UNSAFE". Nothing else.`,
          },
          { role: 'user', content: text.trim() },
        ],
      }),
    });

    if (!moderationRes.ok) {
      throw new Error(`OpenAI moderation failed: ${moderationRes.status}`);
    }

    const modData = await moderationRes.json();
    const verdict = modData.choices?.[0]?.message?.content?.trim()?.toUpperCase();

    if (verdict !== 'SAFE') {
      return res.status(400).json({
        error: 'Your message was flagged by our AI moderation system. Please revise it to ensure it is respectful and does not contain hate speech, threats, or misinformation.',
        moderated: true,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: `Moderation error: ${err.message}` });
  }

  // ── 2. Post to X via OAuth 1.0a ────────────────────────────────────────────
  const credentials = {
    apiKey:      process.env.X_API_KEY       || clientXApiKey,
    apiSecret:   process.env.X_API_SECRET    || clientXApiSecret,
    accessToken: process.env.X_ACCESS_TOKEN  || clientXAccessToken,
    accessSecret:process.env.X_ACCESS_SECRET || clientXAccessSecret,
  };

  if (!credentials.apiKey || !credentials.apiSecret || !credentials.accessToken || !credentials.accessSecret) {
    return res.status(500).json({ error: 'X API credentials not configured.' });
  }

  try {
    const tweetUrl = 'https://api.twitter.com/2/tweets';
    const tweetBody = JSON.stringify({ text: text.trim() });

    const oauthHeader = buildOAuthHeader({
      method: 'POST',
      url: tweetUrl,
      params: {},
      credentials,
    });

    const tweetRes = await fetch(tweetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': oauthHeader,
      },
      body: tweetBody,
    });

    if (!tweetRes.ok) {
      const errData = await tweetRes.json().catch(() => ({}));
      throw new Error(errData?.detail || errData?.title || `X API Error: ${tweetRes.status}`);
    }

    const tweetData = await tweetRes.json();
    const tweetId = tweetData?.data?.id;
    const tweetLink = tweetId ? `https://twitter.com/i/web/status/${tweetId}` : null;

    return res.status(200).json({
      success: true,
      tweetId,
      tweetLink,
      message: 'Your anonymous civic message has been posted via CivicAI!',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to post tweet.' });
  }
}
