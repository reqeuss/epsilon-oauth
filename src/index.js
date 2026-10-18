const VERSION = "1.3.0";
const EPSILON = "https://epsilon.social";
const CSS = `
:root{color-scheme:dark;--bg:#0b1020;--surface:#11182b;--surface-2:#151e33;--line:#26324b;--text:#f7f9ff;--muted:#9caac2;--blue:#4571ff;--blue-hover:#5b82ff;--green:#7ee0bd}
*{box-sizing:border-box}
html{min-height:100%;background:var(--bg)}
body{margin:0;min-height:100vh;padding:28px 18px 24px;background:radial-gradient(ellipse at 50% -15%,#233c78 0,transparent 42%),linear-gradient(180deg,#0c1223,#090d18 70%);color:var(--text);font:15px/1.55 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;flex-direction:column;align-items:center}
a{color:inherit}
.topbar{width:min(100%,1000px);display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 auto 48px}
.brand{display:flex;align-items:center;gap:11px;text-decoration:none;font-size:17px;font-weight:760;letter-spacing:-.03em}
.mark{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:var(--blue);color:#fff;font-size:25px;font-weight:650;box-shadow:0 6px 24px #3159d944}
.brand-sub{display:block;color:#8290aa;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
.secure{display:inline-flex;align-items:center;gap:8px;color:#b9c7de;font-size:12px;font-weight:650}
.secure-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px #7ee0bd18}
main{width:min(100%,520px);margin:0 auto}
.card{overflow:hidden;border:1px solid #26334e;border-radius:24px;background:linear-gradient(160deg,#141d32f5,#101727f7);box-shadow:0 28px 100px #0006}
.card-head{padding:32px 34px 25px;text-align:center;border-bottom:1px solid #27334a}
.app-icon{width:64px;height:64px;margin:0 auto 19px;display:grid;place-items:center;border:1px solid #6488ff70;border-radius:20px;background:linear-gradient(145deg,#4d79ff,#3458d8);color:white;font-size:34px;font-weight:650;box-shadow:0 10px 30px #3159d933}
.eyebrow{display:inline-flex;align-items:center;gap:7px;margin-bottom:12px;color:#91aaff;font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
h1{margin:0 auto 12px;max-width:390px;font-size:clamp(27px,6vw,35px);line-height:1.14;letter-spacing:-.055em;font-weight:760}
.lead{max-width:390px;margin:0 auto;color:#aab6cc;font-size:14px;line-height:1.7}
.card-body{padding:25px 34px 30px}
.section-label{margin:0 0 12px;color:#8e9db7;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
.info{overflow:hidden;border:1px solid #2b3853;border-radius:15px;background:#0c1323}
.info-row{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:15px 16px;border-bottom:1px solid #253149}
.info-row:last-child{border-bottom:0}
.info-label{flex:0 0 108px;color:#91a0ba;font-size:12px}
.info-value{min-width:0;text-align:right;color:#edf2ff;font-size:13px;font-weight:620;overflow-wrap:anywhere}
.client-id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#d9e2ff}
.permissions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:6px}
.permission{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border:1px solid #3b4e7b;border-radius:999px;background:#1b2a4b;color:#d5e0ff;font-size:11px;font-weight:700}
.permission:before{content:"";width:5px;height:5px;border-radius:50%;background:#85a1ff}
.notice{display:flex;align-items:flex-start;gap:10px;margin-top:16px;padding:13px 14px;border:1px solid #34466a;border-radius:13px;background:#131e34;color:#aebbd3;font-size:12px;line-height:1.65}
.notice-icon{flex:0 0 auto;color:#8eabff;font-size:15px;font-weight:800}
.actions{display:grid;gap:10px;margin-top:22px}
.cta{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:49px;padding:13px 18px;border:0;border-radius:13px;background:var(--blue);color:white;font:inherit;font-size:14px;font-weight:760;text-align:center;text-decoration:none;transition:background .15s,transform .15s}
.cta:hover{background:var(--blue-hover);transform:translateY(-1px)}
.cta:focus-visible,.secondary:focus-visible{outline:3px solid #a9bbff;outline-offset:3px}
.secondary{display:flex;align-items:center;justify-content:center;min-height:42px;color:#aab7cf;text-align:center;text-decoration:none;font-size:13px;font-weight:600}
.secondary:hover{color:white}
.footer{width:min(100%,520px);margin:22px auto 0;color:#77849d;text-align:center;font-size:11px;line-height:1.8}
.footer a{color:#9daed0;text-decoration:underline;text-underline-offset:3px}
.home-card{padding:34px}
.home-card h1{margin:14px 0;text-align:left;max-width:none}
.home-card .lead{margin:0;text-align:left;max-width:none}
.home-grid{display:grid;gap:10px;margin:24px 0}
.home-item{display:flex;gap:12px;padding:14px;border:1px solid #293651;border-radius:14px;background:#10182a}
.home-item-icon{display:grid;place-items:center;flex:0 0 34px;height:34px;border-radius:11px;background:#1c2b4e;color:#a9bcff;font-weight:800}
.home-item strong{display:block;margin-bottom:3px;font-size:13px}
.home-item span{display:block;color:#9eacc4;font-size:12px;line-height:1.6}
.notice.error{border-color:#713b4b;background:#291823;color:#ffd3dc}
@media(max-width:520px){body{padding:18px 12px}.topbar{margin-bottom:28px}.brand{font-size:15px}.mark{width:35px;height:35px}.card-head{padding:28px 20px 23px}.card-body{padding:22px 20px 24px}.info-row{gap:10px;padding:13px}.info-label{flex-basis:94px}.home-card{padding:24px 20px}.secure{font-size:11px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{transition:none!important;scroll-behavior:auto!important}}
`;
function json(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", ...headers } });
}
function esc(value = "") {
  return String(value).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; });
}
function page(title, body, status = 200) {
  return new Response('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#0b1020"><title>' + esc(title) + ' · Epsilon OAuth</title><style>' + CSS + '</style></head><body><header class="topbar"><a class="brand" href="/" aria-label="Epsilon OAuth, accueil"><span class="mark" aria-hidden="true">ε</span><span>Epsilon Social<span class="brand-sub">Autorisation d’application</span></span></a><span class="secure"><span class="secure-dot"></span>Connexion sécurisée</span></header><main>' + body + '</main><footer class="footer">Portail indépendant, non officiel. Votre mot de passe et votre consentement final restent sur <a href="https://epsilon.social" rel="noreferrer">epsilon.social</a>.<br>Ne saisissez jamais votre mot de passe sur ce domaine.</footer></body></html>', {
    status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" }
  });
}
function cors(headers = {}) {
  return { "access-control-allow-origin": "*", "access-control-allow-headers": "Authorization, Content-Type, Accept", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-expose-headers": "Content-Type", "vary": "Origin", ...headers };
}
async function proxy(request, path, env, useAppToken = false) {
  const incoming = new URL(request.url);
  const target = new URL(path, EPSILON);
  target.search = incoming.search;
  const headers = new Headers(request.headers);
  ["host", "cf-connecting-ip", "x-forwarded-for", "connection", "content-length"].forEach(function (name) { headers.delete(name); });
  if (useAppToken && request.method !== "OPTIONS" && request.method !== "HEAD") {
    if (!request.headers.get("content-type")) headers.delete("content-type");
    if (headers.has("authorization")) headers.delete("authorization");
    if (env && env.EPSILON_ACCESS_TOKEN) headers.set("authorization", "Bearer " + env.EPSILON_ACCESS_TOKEN);
  }
  const init = { method: request.method, headers, redirect: "manual" };
  if (!["GET", "HEAD"].includes(request.method)) init.body = await request.arrayBuffer();
  const upstream = await fetch(target.toString(), init);
  const out = new Headers(upstream.headers);
  Object.entries(cors()).forEach(function (entry) { out.set(entry[0], entry[1]); });
  out.set("cache-control", "no-store");
  out.set("x-content-type-options", "nosniff");
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: out });
}
function authorizationPage(requestUrl) {
  const incoming = new URL(requestUrl);
  const params = incoming.searchParams;
  const clientId = params.get("client_id") || "";
  const redirectUri = params.get("redirect_uri") || "";
  const responseType = params.get("response_type") || "";
  const scope = params.get("scope") || "";
  const state = params.get("state") || "";
  const codeChallenge = params.get("code_challenge") || "";
  const codeChallengeMethod = params.get("code_challenge_method") || "";
  const problems = [];
  for (const name of ["client_id", "redirect_uri", "response_type", "scope", "state", "code_challenge", "code_challenge_method"]) {
    if (params.getAll(name).length > 1) problems.push("Paramètre dupliqué : " + name);
  }
  if (!clientId) problems.push("client_id manquant");
  if (!redirectUri) problems.push("redirect_uri manquant");
  if (responseType !== "code") problems.push("response_type doit être code");
  let parsed = null;
  try {
    parsed = new URL(redirectUri);
    const localHost = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && localHost)) problems.push("redirect_uri doit utiliser HTTPS (HTTP autorisé uniquement en local)");
    if (parsed.username || parsed.password) problems.push("redirect_uri ne doit pas contenir d’identifiants");
    if (parsed.hash) problems.push("redirect_uri ne doit pas contenir de fragment");
  } catch (_) { problems.push("redirect_uri invalide"); }
  if (params.has("code_challenge_method") && !params.has("code_challenge")) problems.push("code_challenge_method fourni sans code_challenge");
  if (params.has("code_challenge") && !params.has("code_challenge_method")) problems.push("code_challenge_method manquant (utilise S256)");
  if (codeChallenge && !/^[A-Za-z0-9._~-]{43,128}$/.test(codeChallenge)) problems.push("code_challenge PKCE invalide");
  if (codeChallengeMethod && codeChallengeMethod !== "S256") problems.push("Seule la méthode PKCE S256 est acceptée");
  if (problems.length) {
    return page("Requête invalide", '<section class="card"><div class="card-head"><div class="app-icon" aria-hidden="true">!</div><div class="eyebrow">Vérification de sécurité</div><h1>Impossible de continuer</h1><p class="lead">La demande reçue contient des paramètres incomplets ou invalides.</p></div><div class="card-body"><div class="notice error"><span class="notice-icon">!</span><span>' + esc(problems.join(" · ")) + '</span></div><div class="actions"><a class="cta" href="https://epsilon.social" rel="noreferrer">Ouvrir Epsilon Social ↗</a><a class="secondary" href="/">Retour au portail</a></div></div></section>', 400);
  }
  const target = new URL("/oauth/authorize", EPSILON);
  for (const name of ["response_type", "client_id", "redirect_uri", "scope", "state", "code_challenge", "code_challenge_method", "nonce", "prompt"]) {
    if (params.has(name)) target.searchParams.set(name, params.get(name));
  }
  const scopeItems = scope.split(/[\s+]+/).filter(Boolean);
  const scopeMarkup = scopeItems.length ? '<span class="permissions">' + scopeItems.map(function (item) { return '<span class="permission">' + esc(item) + '</span>'; }).join("") + '</span>' : '<span>Aucune permission indiquée</span>';
  const redirectDisplay = parsed.origin + parsed.pathname + parsed.search;
  const security = '<span style="color:' + (state ? '#7ee0bd' : '#ffbd80') + '">' + (state ? '✓ État de sécurité fourni' : '⚠ Aucun état de sécurité') + '</span>';
  const pkce = codeChallenge ? '✓ Protection PKCE S256' : 'Non détectée';
  const body = '<section class="card"><div class="card-head"><div class="app-icon" aria-hidden="true">ε</div><div class="eyebrow">Demande d’autorisation</div><h1>Continuer avec Epsilon&nbsp;?</h1><p class="lead">Une application souhaite se connecter à Epsilon Social. Vérifie les informations ci-dessous avant de continuer.</p></div><div class="card-body"><p class="section-label">Détails de la demande</p><div class="info"><div class="info-row"><span class="info-label">Application</span><span class="info-value">Client OAuth</span></div><div class="info-row"><span class="info-label">Identifiant</span><span class="info-value client-id">' + esc(clientId) + '</span></div><div class="info-row"><span class="info-label">Permissions</span><span class="info-value">' + scopeMarkup + '</span></div><div class="info-row"><span class="info-label">Retour après connexion</span><span class="info-value">' + esc(redirectDisplay) + '</span></div><div class="info-row"><span class="info-label">État de sécurité</span><span class="info-value">' + security + '</span></div><div class="info-row"><span class="info-label">Protection PKCE</span><span class="info-value">' + esc(pkce) + '</span></div></div><div class="notice"><span class="notice-icon">i</span><span>La connexion et l’écran de consentement final s’ouvriront sur <strong>epsilon.social</strong>. Ce portail ne vous demandera jamais votre mot de passe. Vérifie que l’adresse de retour correspond bien à l’application attendue.</span></div><div class="actions"><a class="cta" href="' + esc(target.toString()) + '" rel="noreferrer">Continuer vers Epsilon <span aria-hidden="true">↗</span></a><a class="secondary" href="https://epsilon.social" rel="noreferrer">Annuler et quitter</a></div></div></section>';
  return page("Autoriser une application", body);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
    if (url.pathname === "/health" && request.method === "GET") return json({ service: "Epsilon OAuth Gateway", version: VERSION, status: "online", upstream: EPSILON, clientStorage: "none", routes: ["POST /api/v1/apps", "GET /oauth/authorize", "POST /oauth/token", "POST /oauth/revoke", "GET /oauth/userinfo"] }, 200, cors());
    if (url.pathname === "/" && request.method === "GET") return page("Passerelle OAuth", '<section class="card home-card"><div class="eyebrow">Epsilon Social · OAuth 2.0</div><h1>Connecte tes applications en toute clarté.</h1><p class="lead">Ce portail accompagne les demandes d’autorisation des applications compatibles avec Epsilon Social.</p><div class="home-grid"><div class="home-item"><div class="home-item-icon">↗</div><div><strong>Connexion officielle</strong><span>La connexion et le consentement final restent sur epsilon.social.</span></div></div><div class="home-item"><div class="home-item-icon">⌁</div><div><strong>Permissions visibles</strong><span>Consulte l’identifiant de l’application, les permissions et l’adresse de retour avant de continuer.</span></div></div><div class="home-item"><div class="home-item-icon">✓</div><div><strong>Pas de mot de passe ici</strong><span>Cette passerelle ne collecte ni mot de passe, ni session Epsilon, ni jeton utilisateur.</span></div></div></div><a class="cta" href="https://epsilon.social" rel="noreferrer">Découvrir Epsilon Social ↗</a><a class="secondary" href="/health">État du service</a></section>');
    if ((url.pathname === "/.well-known/oauth-authorization-server" || url.pathname === "/.well-known/openid-configuration") && request.method === "GET") return json({ issuer: url.origin, authorization_endpoint: url.origin + "/oauth/authorize", token_endpoint: url.origin + "/oauth/token", app_registration_endpoint: url.origin + "/api/v1/apps", revocation_endpoint: url.origin + "/oauth/revoke", userinfo_endpoint: url.origin + "/oauth/userinfo", response_types_supported: ["code"], grant_types_supported: ["authorization_code"], code_challenge_methods_supported: ["S256"] }, 200, cors());
    if (url.pathname === "/api/v1/apps" && request.method === "POST") {
      if (!env || !env.EPSILON_ACCESS_TOKEN) return json({ error: "server_configuration_error", message: "EPSILON_ACCESS_TOKEN manquant. Configure-le comme secret Cloudflare ou dans .dev.vars en local." }, 503, cors());
      return proxy(request, "/api/v1/apps", env, true);
    }
    if (url.pathname === "/oauth/authorize" && request.method === "GET") return authorizationPage(request.url);
    if (url.pathname === "/oauth/token" && request.method === "POST") return proxy(request, "/oauth/token", env);
    if (url.pathname === "/oauth/revoke" && request.method === "POST") return proxy(request, "/oauth/revoke", env);
    if (url.pathname === "/oauth/userinfo" && request.method === "GET") return proxy(request, "/api/v1/accounts/verify_credentials", env);
    if (url.pathname === "/api/v1/apps/verify_credentials" && request.method === "GET") {
      if (!env || !env.EPSILON_ACCESS_TOKEN) return json({ error: "server_configuration_error", message: "EPSILON_ACCESS_TOKEN manquant. Configure-le comme secret Cloudflare ou dans .dev.vars en local." }, 503, cors());
      return proxy(request, "/api/v1/apps/verify_credentials", env, true);
    }
    if (["/api/v1/apps", "/oauth/token", "/oauth/revoke"].includes(url.pathname)) return json({ error: "method_not_allowed" }, 405, { ...cors(), allow: "POST" });
    if (["/oauth/authorize", "/oauth/userinfo", "/api/v1/apps/verify_credentials"].includes(url.pathname)) return json({ error: "method_not_allowed" }, 405, { ...cors(), allow: "GET" });
    return json({ error: "not_found", message: "Route non prise en charge par la passerelle." }, 404, cors());
  }
};
