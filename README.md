# Epsilon OAuth

OAuth 2.0 authorization broker for third-party apps, hosted as a Cloudflare Worker. Independent and unofficial; not affiliated with Epsilon Social.

## What is implemented

- Epsilon Social authorization-code login and server-side token exchange.
- User profile lookup through Epsilon Social `/oauth/userinfo`.
- Consent page showing the connected profile, avatar when available, app name and requested scopes.
- Registered clients with HTTPS redirect URI allowlists.
- One-time short-lived authorization codes, optional PKCE S256, expiring bearer tokens, userinfo and revocation endpoints.
- OAuth metadata at `/.well-known/oauth-authorization-server` and `/.well-known/openid-configuration`.

**The upstream Epsilon API must be tested against the actual app credentials before treating production as verified.** Its callback must match exactly.

## Cloudflare setup

1. Create a KV namespace and put its returned ID into `wrangler.toml` instead of `REPLACE_WITH_CLOUDFLARE_KV_NAMESPACE_ID`.
2. Set the Worker custom domain to `epsilon-social.oauth.reqeuss.com`.
3. In the Epsilon Social developer settings, register this exact callback URL:
   `https://epsilon-social.oauth.reqeuss.com/oauth/callback`
4. Configure the application ID and callback as Worker variables:
   - `EPSILON_CLIENT_ID`: the Epsilon Social app's client ID
   - `EPSILON_REDIRECT_URI`: `https://epsilon-social.oauth.reqeuss.com/oauth/callback`
   - `EPSILON_ISSUER_URL`: `https://epsilon.social`
5. Add secrets using Wrangler or the Cloudflare dashboard; never commit them:
   ```sh
   npx wrangler secret put EPSILON_CLIENT_SECRET
   npx wrangler secret put OAUTH_ADMIN_SECRET
   ```
6. Deploy with `npm run deploy`, then visit `/health`. It should report `configured: true`.

Build/check command: `npm run check`. Deploy command: `npm run deploy`.

## Register a client application

Call `POST /admin/clients` with the admin secret as a Bearer token. Use only HTTPS callback URLs you control.

```sh
curl -X POST https://epsilon-social.oauth.reqeuss.com/admin/clients \
  -H "Authorization: Bearer YOUR_OAUTH_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"name":"My app","redirect_uris":["https://app.example.com/oauth/callback"]}'
```

The response contains `client_id` and `client_secret`. Save the secret immediately; it is returned only once. Never put it in frontend code.

## OAuth flow for client apps

1. Generate a cryptographically random `state` (at least 16 URL-safe characters).
2. Redirect the user to:
   `/oauth/authorize?response_type=code&client_id=...&redirect_uri=...&scope=profile&state=...`
3. Prefer PKCE S256: include `code_challenge` and `code_challenge_method=S256`; save the matching verifier in the client app.
4. The user logs in on Epsilon Social, reviews the consent screen, then returns to the registered callback with `code` and `state`.
5. On your backend, exchange the code at `POST /oauth/token` using `grant_type=authorization_code`, `code`, `redirect_uri`, and client authentication. Include `code_verifier` if PKCE was used.
6. Fetch `GET /oauth/userinfo` with `Authorization: Bearer ACCESS_TOKEN`.

Example response from userinfo: `sub`, `username`, `name`, and `picture` (when Epsilon provides an HTTPS avatar URL).

## Security notes

- Client registration is protected by `OAUTH_ADMIN_SECRET`.
- The Worker stores client secret hashes, short-lived authorization codes and hashed access tokens in KV.
- The app's Epsilon client secret stays server-side.
- KV is eventually consistent; this simple implementation uses one-time random codes and deletion but is not a substitute for a strongly consistent authorization database under high concurrency.
- Only request scopes that your application genuinely needs. The current broker supports `profile` and `read`; verify the upstream Epsilon scope semantics before production use.
