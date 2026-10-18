# Epsilon OAuth Gateway

A lightweight Cloudflare Worker gateway for the official Epsilon Social (Mastodon-compatible) OAuth API. Independent and unofficial.

## Design

**OAuth clients are registered by Epsilon Social, not stored in this Worker.** The Worker keeps no client registry, client secrets, authorization codes, user sessions, or access tokens.

The Worker forwards:
- `POST /api/v1/apps` → Epsilon app registration API
- `GET /oauth/authorize` → redirects to Epsilon's own authorization/consent page
- `POST /oauth/token` → Epsilon token endpoint
- `POST /oauth/revoke` → Epsilon revocation endpoint
- `GET /oauth/userinfo` → Epsilon userinfo endpoint
- `GET /api/v1/apps/verify_credentials` → Epsilon app verification endpoint

The profile, avatar, login, requested scopes, and consent screen are provided by Epsilon itself. This gateway does not imitate or duplicate Epsilon's login screen.

## Deploy

1. In Cloudflare, set the Worker custom domain to `epsilon-social.oauth.reqeuss.com`.
2. Run `npm install`.
3. Run `npm run check`.
4. Run `npm run deploy`.
5. Open `https://epsilon-social.oauth.reqeuss.com/health`.

No KV namespace or Worker secrets are required for this proxy implementation.

## Register an app

Send a request to the gateway; it is forwarded to Epsilon's official `POST /api/v1/apps` endpoint. Epsilon returns the real `client_id` and `client_secret`.

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

Keep the returned `client_secret` on your application's backend. Never expose it in frontend code. Register only callback URLs you control.

## OAuth flow

1. Register the application with `POST /api/v1/apps`.
2. Store Epsilon's returned `client_id` and `client_secret securely.
3. Redirect the user to `https://epsilon-social.oauth.reqeuss.com/oauth/authorize?response_type=code&client_id=...&redirect_uri=...&scope=read&state=...`. The Worker redirects the browser to Epsilon's own authorization screen.
4. Epsilon sends the user back to the exact `redirect_uri` registered for the app, with `code` and `state`.
5. From the application's backend, send `POST /oauth/token` with `grant_type=authorization_code`, `code`, `client_id`, `client_secret`, and the same `redirect_uri`. Include `code_verifier` when using PKCE.
6. Use the returned bearer token with `GET /oauth/userinfo` or Epsilon's supported API endpoints.

Epsilon's API behavior and supported scopes should be verified against the live instance before production use. The gateway transparently forwards upstream status codes and response bodies.

## Endpoints

- `GET /` — gateway landing page
- `GET /health` — gateway status
- `GET /.well-known/oauth-authorization-server` — gateway endpoint metadata
- `POST /api/v1/apps` — register an app at Epsilon
- `GET /oauth/authorize` — redirect to Epsilon
- `POST /oauth/token` — exchange a code at Epsilon
- `POST /oauth/revoke` — revoke at Epsilon
- `GET /oauth/userinfo` — fetch profile from Epsilon
- `GET /api/v1/apps/verify_credentials` — verify app credentials at Epsilon
