# Epsilon OAuth Gateway

A lightweight, independent Cloudflare Worker gateway for Epsilon Social OAuth. This is **not an official Epsilon Social service**.

## What it does

- Displays a branded authorization preview at `GET /oauth/authorize`.
- Rejects duplicated OAuth parameters, unsafe callback URLs, malformed PKCE challenges, and PKCE methods other than `S256` before forwarding the request.
- Shows the OAuth client ID, requested scope values, callback URL, and whether `state` / PKCE parameters were supplied.
- Continues to Epsilon's official `https://epsilon.social/oauth/authorize` endpoint for the real login and final consent.
- Proxies app registration, token exchange, revocation, and account verification to Epsilon endpoints.

**The preview is not the final consent screen.** It cannot independently verify the app's identity or whether the callback URL is registered. Epsilon must perform those checks. It does not ask for or collect Epsilon passwords, and it does not fake a logged-in profile or avatar.

## Privacy and storage

The Worker stores no app registry, client secrets, authorization codes, user sessions, passwords, or access tokens. App registration and the returned client credentials are handled by Epsilon's API. Keep any returned `client_secret` on your application's backend; never expose it in frontend code.

## Configure `EPSILON_ACCESS_TOKEN`

The Worker reads `EPSILON_ACCESS_TOKEN` from the Cloudflare Worker environment. It is used server-side for `POST /api/v1/apps` and `GET /api/v1/apps/verify_credentials`; it is never returned to callers. Do not put the real token in source code, `wrangler.toml`, frontend JavaScript, or a committed `.env` file.

### Cloudflare production secret

```bash
npx wrangler secret put EPSILON_ACCESS_TOKEN
```

Paste the token when prompted. Then deploy:

```bash
npm install
npm run check
npm run deploy
```

You can also add it in **Cloudflare Dashboard → Workers & Pages → epsilon-oauth → Settings → Variables and Secrets → Add → Secret**, with the name exactly `EPSILON_ACCESS_TOKEN`.

### Local development

Create a local `.dev.vars` file (Wrangler reads this automatically):

```dotenv
EPSILON_ACCESS_TOKEN=replace_with_your_token
```

`.dev.vars` is ignored by Git. Never commit the real token. Then run `npm run dev`.

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

## Troubleshooting: Content Security Policy (CSP)

If the browser reports errors such as:

```text
Content-Security-Policy: ... script-src ... refused to execute an inline script
```

first identify which host returned the HTML and CSP header. This gateway's preview HTML is served by the Worker; after the user clicks **Continue to Epsilon**, the browser loads `https://epsilon.social/oauth/authorize`, whose CSP is controlled by the Epsilon server. The gateway cannot change that response's CSP from its own Worker, and the gateway intentionally does not strip or weaken Epsilon's security headers.

The upstream Epsilon repository defines its production policy in `config/initializers/content_security_policy.rb` and tests the expected script hashes in `spec/requests/content_security_policy_spec.rb`. It calculates hashes for the inline scripts `theme-selection.js`, `epsilon-in-app-context.js`, and `epsilon-locale-refresh.js`. If the browser reports a different hash, possible causes include:

- the HTML contains inline script content that does not match the hashes in the response header;
- the deployed application is serving mismatched versions of its layout, inline scripts, or CSP configuration;
- a browser extension or another client-side tool injected a script into the page.

### Safe diagnostic steps

1. Open DevTools → **Network**, reload the authorization page, and select the main document request to `epsilon.social`.
2. Inspect the **Response Headers** and note the actual `Content-Security-Policy` header.
3. Inspect the response HTML and identify the exact inline script associated with the violation. Check whether the script is part of the deployed Epsilon source or was injected by an extension; test in a clean/private browser profile with extensions disabled.
4. Compare the deployed code with the upstream CSP configuration and inline-script files. Rebuild and deploy a consistent version, then run the project's CSP tests.
5. If the problem reproduces on the official instance, report the affected URL, browser console message, CSP header, and the matching source files to the Epsilon maintainers: [epsilon-social/epsilon](https://github.com/epsilon-social/epsilon).

Do **not** add arbitrary hashes, enable `'unsafe-inline'` in production, or remove the CSP header as a workaround. Hashes only authorize exact script contents, and weakening the policy can expose users to script injection. A fix belongs in the upstream Epsilon deployment when the rejected script is served by `epsilon.social`.

## Upstream project and attribution

This gateway is an independent integration and is not endorsed by or affiliated with the Epsilon Social maintainers. Epsilon Social source code is available at [github.com/epsilon-social/epsilon](https://github.com/epsilon-social/epsilon). The upstream repository is licensed under **GNU Affero General Public License v3.0 (AGPL-3.0)**; review its [LICENSE](https://github.com/epsilon-social/epsilon/blob/main/LICENSE) before redistributing or incorporating upstream code. Assets copied from the upstream project are documented in `public/assets/README.md`. Epsilon Social names and logos remain their respective owners' marks.

If this gateway or a fix would be useful upstream, open an issue or pull request with a reproducible report and a minimal patch. Do not imply that maintainers have accepted or endorsed this project unless they explicitly confirm it.

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
