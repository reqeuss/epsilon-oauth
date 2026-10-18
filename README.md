# Epsilon OAuth

An independent project exploring OAuth compatibility with [Epsilon Social](https://epsilon.social). This project is unofficial and is not affiliated with or endorsed by Epsilon Social.

## Compatibility status

The Cloudflare Worker API foundation is in the repository, but real Epsilon Social sign-in is **not enabled yet**. An open-source codebase does not automatically provide access to private production services, and this service cannot authenticate Epsilon accounts until a supported authorization flow and trusted identity endpoint are verified.

Until then, `/oauth/authorize`, `/oauth/token`, and `/oauth/userinfo` return `503 temporarily_unavailable`. This is intentional: the service must never fabricate a successful login or claim that an identity has been verified when it has not.

## Endpoints

- `GET /` or `/health` — service status
- `GET /.well-known/oauth-authorization-server` — OAuth metadata draft
- `GET /.well-known/openid-configuration` — OpenID Connect metadata draft
- `/oauth/authorize`, `/oauth/token`, `/oauth/userinfo` — reserved, disabled pending upstream integration

The metadata endpoints describe the planned interface only. This is not yet a production OAuth or OpenID Connect provider.

## Deploy on Cloudflare Workers

Requires Node.js and a Cloudflare account.

```bash
npm install
npx wrangler login
npm run check
npm run dev
npm run deploy
```

Check the deployed service at `https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/health`.

## Before enabling authentication

1. Verify the exact Epsilon Social source version and its login/session implementation.
2. Confirm whether a supported OAuth/OIDC endpoint or trusted server-side identity API exists.
3. Implement exact redirect URI allowlists, authorization-code expiry and one-time use, PKCE S256, state validation, token signature/audience/expiry checks, rate limits, and security tests.
4. Keep secrets in Cloudflare secrets, never in Git.

No license has been selected yet; add one after deciding the intended reuse terms.
