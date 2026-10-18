# Epsilon OAuth Gateway

A lightweight, independent Cloudflare Worker gateway for Epsilon Social OAuth. This is **not an official Epsilon Social service**.

## What it does

- Displays a branded authorization preview at `GET /oauth/authorize`.
- Shows the OAuth client ID, requested scope values, callback URL, and whether `state` / PKCE parameters were supplied.
- Continues to Epsilon's official `https://epsilon.social/oauth/authorize` endpoint for the real login and final consent.
- Proxies app registration, token exchange, revocation, and account verification to Epsilon endpoints.

**The preview is not the final consent screen.** It cannot independently verify the app's identity or whether the callback URL is registered. Epsilon must perform those checks. It does not ask for or collect Epsilon passwords, and it does not fake a logged-in profile or avatar.

## Privacy and storage

The Worker stores no app registry, client secrets, authorization codes, user sessions, passwords, or access tokens. App registration and the returned client credentials are handled by Epsilon's API. Keep any returned `client_secret` on your application's backend; never expose it in frontend code.

## Deploy

1. In Cloudflare, set the Worker custom domain to `epsilon-social.oauth.reqeuss.com`.
2. Run `npm install`.
3. Run `npm run check`.
4. Run `npm run deploy`.
5. Open `https://epsilon-social.oauth.reqeuss.com/health`.

No KV namespace is required for this stateless gateway.

## Register an app

Example request (use only scopes that Epsilon actually supports):

```bash
curl -X POST https://epsilon-social.oauth.reqeuss.com/api/v1/apps \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "My application",
    "redirect_uris": ["https://app.example.com/oauth/callback"],
    "scopes": "read",
    "website": "https://app.example.com"
  }'
```

The response should come from Epsilon's registration API. Confirm the supported scope names and callback behavior against the live Epsilon instance before production use.

## OAuth flow

1. Register the app through `POST /api/v1/apps`.
2. Store the returned client ID and secret securely on the application's backend.
3. Redirect the browser to `https://epsilon-social.oauth.reqeuss.com/oauth/authorize?response_type=code&client_id=...&redirect_uri=...&scope=read&state=...`.
4. Review the preview, then click **Continue to official login**. The browser moves to Epsilon's own authorization endpoint.
5. Epsilon should return to the registered callback with the authorization code and the original `state`.
6. Exchange the code server-side via `POST /oauth/token`. Use PKCE when supported by the client and upstream server.

Use a cryptographically random `state` and verify it on the callback. Never trust an unverified callback or a scope just because the preview displays it.

## Endpoints

- `GET /` — gateway landing page
- `GET /health` — gateway status
- `GET /.well-known/oauth-authorization-server` — OAuth metadata
- `GET /.well-known/openid-configuration` — metadata alias
- `POST /api/v1/apps` — register an app at Epsilon
- `GET /oauth/authorize` — branded preview before official Epsilon login
- `POST /oauth/token` — exchange a code at Epsilon
- `POST /oauth/revoke` — revoke a token at Epsilon
- `GET /oauth/userinfo` — request the current account from Epsilon
- `GET /api/v1/apps/verify_credentials` — verify app credentials at Epsilon
