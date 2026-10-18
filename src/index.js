const DEFAULT_CALLBACK = "https://example.com/oauth/callback";
const VERSION = "0.2.0";

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      ...extra,
    },
  });
}

function page(title, body, status = 200) {
  return new Response(`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="theme-color" content="#101114">
<title>${title} · Epsilon OAuth</title>
<style>
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#101114;color:#f4f4f5}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:28px;background:radial-gradient(ellipse at 50% 0%,#27282f 0,transparent 48%),#101114}
main{width:min(100%,620px);border:1px solid #34353d;background:rgba(22,23,27,.94);border-radius:26px;padding:clamp(25px,6vw,48px);box-shadow:0 28px 100px #0006}
.brand{display:flex;align-items:center;gap:12px;font-weight:750;letter-spacing:-.03em;font-size:19px}
.mark{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:#b9ff5c;color:#14160f;font-weight:900;font-size:22px}
.eyebrow{color:#b9ff5c;font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;margin:34px 0 12px}
h1{font-size:clamp(32px,7vw,48px);line-height:1.04;letter-spacing:-.055em;margin:0 0 18px}
p{color:#b4b5be;line-height:1.7;margin:0 0 18px}
.panel{border:1px solid #35363e;border-radius:15px;padding:16px;margin:24px 0;background:#191a1f}
.label{font-size:11px;color:#92939e;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
.value{font-size:13px;overflow-wrap:anywhere;color:#e7e7eb}
a.cta{display:flex;justify-content:center;align-items:center;gap:10px;width:100%;padding:15px 18px;background:#b9ff5c;color:#11140b;border-radius:13px;font-weight:800;text-decoration:none;margin-top:24px}
a.cta:hover{background:#ccff8a}a{color:#b9ff5c}
.foot{font-size:12px;color:#777984;margin-top:26px;line-height:1.6}
.pill{display:inline-flex;align-items:center;gap:7px;border:1px solid #3b3c43;border-radius:999px;padding:7px 10px;font-size:12px;color:#c7c8ce}
.dot{width:7px;height:7px;background:#b9ff5c;border-radius:50%}
</style></head>
<body><main>
<div class="brand"><span class="mark">ε</span><span>Epsilon OAuth</span><span class="pill"><span class="dot"></span>Service indépendant</span></div>
<div class="eyebrow">Authentification · OAuth 2.0</div>
${body}
<div class="foot">Projet non officiel, indépendant d’Epsilon Social. Vos identifiants secrets ne doivent jamais être publiés dans le navigateur ou dans le dépôt GitHub.</div>
</main></body></html>`, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    },
  });
}

function safeState(value) {
  return typeof value === "string" && value.length >= 16 && value.length <= 512 && /^[A-Za-z0-9._~-]+$/.test(value);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") {
      return json({ error: "method_not_allowed" }, 405, { allow: "GET, HEAD" });
    }

    if (url.pathname === "/health") {
      return json({
        service: "Epsilon OAuth",
        version: VERSION,
        status: "online",
        mode: "epsilon-social-oauth-redirect",
        configured: Boolean(env.EPSILON_CLIENT_ID),
        callback_uri: env.EPSILON_REDIRECT_URI || DEFAULT_CALLBACK,
        note: "This service starts an Epsilon Social OAuth flow. The callback and code-to-token exchange are handled by the configured client application.",
      });
    }

    if (url.pathname === "/") {
      const configured = Boolean(env.EPSILON_CLIENT_ID);
      const body = `<h1>Connectez vos applications à Epsilon.</h1>
<p>Un point d’entrée indépendant pour démarrer une authentification sur Epsilon Social. La connexion et le consentement se déroulent sur le site Epsilon lui-même.</p>
<div class="panel"><div class="label">URI de redirection configurée</div><div class="value">${(env.EPSILON_REDIRECT_URI || DEFAULT_CALLBACK).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div></div>
${configured ? '<p>La configuration de l’application est présente. L’application cliente doit appeler <code>/login</code> avec son propre paramètre <code>state</code> imprévisible, puis vérifier ce même état dans son callback.</p><div class="panel"><div class="label">Point d’entrée OAuth</div><div class="value">/login?state=VALEUR_ALEATOIRE_GENEREE_PAR_LE_CLIENT</div></div>' : '<p>Le service répond correctement, mais il manque la variable serveur <code>EPSILON_CLIENT_ID</code>. Aucun secret ne doit être ajouté au code source.</p>'}
<div class="foot">Ce projet ne prétend pas être un fournisseur OAuth officiel ni créer une session à votre place. L’application cliente doit vérifier <code>state</code> et échanger le code sur son serveur.</div>`;
      return page("Connexion", body);
    }

    if (url.pathname === "/login") {
      const clientId = env.EPSILON_CLIENT_ID;
      if (!clientId) return json({ error: "server_misconfigured", error_description: "EPSILON_CLIENT_ID is not configured." }, 503);
      const state = url.searchParams.get("state");
      if (!safeState(state)) {
        return page("État requis", `<h1>Une vérification est nécessaire.</h1><p>La demande de connexion doit contenir un paramètre <code>state</code> aléatoire généré par l’application cliente. Retournez dans l’application qui vous a envoyé ici et réessayez.</p><a class="cta" href="/">Retour</a>`, 400);
      }

      const issuer = (env.EPSILON_ISSUER_URL || "https://epsilon.social").replace(/\/$/, "");
      let issuerUrl;
      try {
        issuerUrl = new URL(issuer);
        if (issuerUrl.protocol !== "https:" || issuerUrl.hostname !== "epsilon.social") {
          return json({ error: "invalid_server_configuration", error_description: "EPSILON_ISSUER_URL must use https://epsilon.social." }, 500);
        }
      } catch {
        return json({ error: "invalid_server_configuration" }, 500);
      }

      const redirectUri = env.EPSILON_REDIRECT_URI || DEFAULT_CALLBACK;
      let callback;
      try {
        callback = new URL(redirectUri);
        if (callback.protocol !== "https:" || callback.username || callback.password) {
          return json({ error: "invalid_server_configuration", error_description: "EPSILON_REDIRECT_URI must be a valid HTTPS callback without embedded credentials." }, 500);
        }
      } catch {
        return json({ error: "invalid_server_configuration" }, 500);
      }

      const authorize = new URL("/oauth/authorize", issuerUrl.origin);
      authorize.searchParams.set("client_id", clientId);
      authorize.searchParams.set("response_type", "code");
      authorize.searchParams.set("redirect_uri", callback.toString());
      authorize.searchParams.set("scope", "read");
      authorize.searchParams.set("state", state);

      const challenge = url.searchParams.get("code_challenge");
      const method = url.searchParams.get("code_challenge_method");
      if (challenge || method) {
        if (!challenge || method !== "S256" || !/^[A-Za-z0-9_-]{43}$/.test(challenge)) {
          return json({ error: "invalid_request", error_description: "PKCE requires a valid S256 code_challenge." }, 400);
        }
        authorize.searchParams.set("code_challenge", challenge);
        authorize.searchParams.set("code_challenge_method", "S256");
      }

      return new Response(null, {
        status: 302,
        headers: {
          location: authorize.toString(),
          "cache-control": "no-store",
          "referrer-policy": "no-referrer",
          "x-content-type-options": "nosniff",
        },
      });
    }

    if (url.pathname === "/oauth/authorize" || url.pathname === "/oauth/token" || url.pathname === "/oauth/userinfo" ||
        url.pathname === "/.well-known/oauth-authorization-server" || url.pathname === "/.well-known/openid-configuration") {
      return json({
        error: "not_an_oauth_provider",
        error_description: "This project starts an OAuth login with Epsilon Social; it does not issue its own authorization codes or tokens.",
        login_endpoint: url.origin + "/login",
      }, 501);
    }

    return json({ error: "not_found" }, 404);
  },
};
