const VERSION = "1.2.0";
const EPSILON = "https://epsilon.social";
const CSS = "body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at 50% 0%,#292b32,transparent 52%),#101114;color:#f5f5f6;font:15px/1.55 Inter,system-ui,sans-serif}main{box-sizing:border-box;width:min(100%,620px);padding:clamp(24px,5vw,42px);border:1px solid #34353d;border-radius:24px;background:#17181df5;box-shadow:0 25px 90px #0007}.brand{display:flex;align-items:center;gap:12px;font-weight:800}.mark{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:#b9ff5c;color:#15170f;font-size:25px}.eyebrow{margin-top:30px;color:#b9ff5c;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}h1{font-size:clamp(30px,6vw,42px);line-height:1.08;letter-spacing:-.05em;margin:9px 0 12px}p{color:#b5b6c0;line-height:1.7}.panel{margin:22px 0;padding:17px;border:1px solid #34353d;border-radius:15px;background:#1c1d23}.row{padding:12px 0;border-bottom:1px solid #303139}.row:first-child{padding-top:0}.row:last-child{padding-bottom:0;border:0}.label{display:block;margin-bottom:5px;color:#92939e;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.value{overflow-wrap:anywhere;color:#f1f1f3;font-size:14px}.pills{display:flex;gap:7px;flex-wrap:wrap;margin-top:7px}.pill{padding:5px 9px;border:1px solid #46513a;border-radius:999px;background:#242b1e;color:#b9ff5c;font-size:12px}.cta{display:block;width:100%;padding:14px;margin-top:12px;border:0;border-radius:12px;background:#b9ff5c;color:#15170f;font:inherit;font-weight:850;text-align:center;text-decoration:none}.secondary{display:block;margin-top:16px;color:#bfc0c8;text-align:center;font-size:13px}.foot{margin-top:24px;padding-top:16px;border-top:1px solid #303139;color:#858691;font-size:12px;line-height:1.7}.notice{padding:12px 14px;border:1px solid #574c2d;border-radius:12px;background:#292419;color:#e8d9ac;font-size:13px}a{color:#b9ff5c}code{overflow-wrap:anywhere}";
function json(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", ...headers } });
}
function esc(value = "") {
  return String(value).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; });
}
function page(title, body, status = 200) {
  return new Response('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="robots" content="noindex,nofollow"><title>' + esc(title) + ' · Epsilon OAuth</title><style>' + CSS + '</style></head><body><main><div class="brand"><span class="mark" aria-hidden="true">ε</span><span>Epsilon OAuth</span></div>' + body + '<div class="foot">Service indépendant non officiel. Votre mot de passe et votre consentement sont gérés uniquement sur <a href="https://epsilon.social">epsilon.social</a>. Cette passerelle ne stocke ni comptes, ni secrets clients, ni jetons.</div></main></body></html>', {
    status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" }
  });
}
function cors(headers = {}) {
  return { "access-control-allow-origin": "*", "access-control-allow-headers": "Authorization, Content-Type, Accept", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-expose-headers": "Content-Type", "vary": "Origin", ...headers };
}
async function proxy(request, path) {
  const incoming = new URL(request.url);
  const target = new URL(path, EPSILON);
  target.search = incoming.search;
  const headers = new Headers(request.headers);
  ["host", "cf-connecting-ip", "x-forwarded-for", "connection", "content-length"].forEach(function (name) { headers.delete(name); });
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
  const singleValueParams = ["client_id", "redirect_uri", "response_type", "scope", "state", "code_challenge", "code_challenge_method"];
  for (const name of singleValueParams) {
    if (params.getAll(name).length > 1) problems.push("paramètre dupliqué : " + name);
  }
  if (!clientId) problems.push("client_id manquant");
  if (!redirectUri) problems.push("redirect_uri manquant");
  if (responseType !== "code") problems.push("response_type doit être code");
  let parsed = null;
  try {
    parsed = new URL(redirectUri);
    const localHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname === "[::1]";
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && localHost)) problems.push("redirect_uri doit utiliser HTTPS (HTTP est autorisé uniquement en local)");
    if (parsed.username || parsed.password) problems.push("redirect_uri ne doit pas contenir d’identifiants");
    if (parsed.hash) problems.push("redirect_uri ne doit pas contenir de fragment");
  } catch (_) { problems.push("redirect_uri invalide"); }
  if (params.has("code_challenge_method") && !params.has("code_challenge")) problems.push("code_challenge_method fourni sans code_challenge");
  if (params.has("code_challenge") && !params.has("code_challenge_method")) problems.push("code_challenge_method manquant (utilise S256)");
  if (codeChallenge && (!/^[A-Za-z0-9._~-]{43,128}$/.test(codeChallenge))) problems.push("code_challenge PKCE invalide");
  if (codeChallengeMethod && codeChallengeMethod !== "S256") problems.push("seule la méthode PKCE S256 est acceptée");
  if (problems.length) {
    return page("Requête OAuth invalide", '<div class="eyebrow">Vérification de la demande</div><h1>Impossible de continuer.</h1><p>La demande OAuth est incomplète ou contient des paramètres invalides.</p><div class="notice">' + esc(problems.join(" · ")) + '</div><p>Reviens à l’application qui a lancé la connexion et vérifie sa configuration OAuth.</p><a class="cta" href="https://epsilon.social">Ouvrir Epsilon Social ↗</a>', 400);
  }
  const target = new URL("/oauth/authorize", EPSILON);
  for (const name of ["response_type", "client_id", "redirect_uri", "scope", "state", "code_challenge", "code_challenge_method", "nonce", "prompt"]) {
    if (params.has(name)) target.searchParams.set(name, params.get(name));
  }
  const scopeItems = scope.split(/[\s+]+/).filter(Boolean);
  const scopeMarkup = scopeItems.length ? '<div class="pills">' + scopeItems.map(function (item) { return '<span class="pill">' + esc(item) + '</span>'; }).join("") + '</div>' : '<p style="margin:6px 0 0">Aucun scope explicitement indiqué.</p>';
  const redirectDisplay = parsed.origin + parsed.pathname + parsed.search;
  const body = '<div class="eyebrow">Autorisation d’application</div><h1>Continuer avec Epsilon ?</h1><p>Vérifie la demande avant de poursuivre. La connexion et l’écran final d’autorisation s’ouvriront sur le site officiel d’Epsilon Social.</p><div class="panel"><div class="row"><span class="label">Application</span><div class="value">Client OAuth · <code>' + esc(clientId) + '</code></div></div><div class="row"><span class="label">Permissions demandées</span>' + scopeMarkup + '</div><div class="row"><span class="label">Adresse de retour</span><div class="value">' + esc(redirectDisplay) + '</div></div><div class="row"><span class="label">État de sécurité</span><div class="value">' + (state ? "Paramètre state présent" : "Aucun paramètre state détecté") + ' · ' + (codeChallenge ? "PKCE présent" : "PKCE non détecté") + '</div></div>' + (codeChallenge ? '<div class="row"><span class="label">Protection PKCE</span><div class="value">Activée (' + esc(codeChallengeMethod || "méthode non précisée") + ')</div></div>' : '') + '</div><div class="notice">Cette page affiche les paramètres reçus ; elle ne confirme pas à elle seule l’identité réelle de l’application ni la validité finale de l’URL de retour. Epsilon effectuera ses propres vérifications.</div><a class="cta" href="' + esc(target.toString()) + '" rel="noreferrer">Continuer vers la connexion officielle ↗</a><a class="secondary" href="https://epsilon.social" rel="noreferrer">Annuler et revenir à Epsilon Social</a>';
  return page("Autorisation", body);
}
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
    if (url.pathname === "/health" && request.method === "GET") return json({ service: "Epsilon OAuth Gateway", version: VERSION, status: "online", upstream: EPSILON, clientStorage: "none", routes: ["POST /api/v1/apps", "GET /oauth/authorize", "POST /oauth/token", "POST /oauth/revoke", "GET /oauth/userinfo"] }, 200, cors());
    if (url.pathname === "/" && request.method === "GET") return page("Passerelle OAuth", '<div class="eyebrow">OAuth · Epsilon Social</div><h1>Une connexion claire. Un consentement officiel.</h1><p>Une passerelle indépendante pour relier des applications à Epsilon Social. Examine la demande ici, puis connecte-toi et confirme les autorisations directement sur epsilon.social.</p><div class="panel"><div class="row"><span class="label">Enregistrement</span><div class="value">Les applications sont enregistrées par l’API Epsilon.</div></div><div class="row"><span class="label">Connexion</span><div class="value">La page de connexion officielle reste sur epsilon.social.</div></div><div class="row"><span class="label">Confidentialité</span><div class="value">Aucun compte, mot de passe, secret client ou jeton stocké dans ce Worker.</div></div></div><a class="cta" href="https://epsilon.social">Ouvrir Epsilon Social ↗</a><a class="secondary" href="/health">État du service</a>');
    if ((url.pathname === "/.well-known/oauth-authorization-server" || url.pathname === "/.well-known/openid-configuration") && request.method === "GET") return json({ issuer: url.origin, authorization_endpoint: url.origin + "/oauth/authorize", token_endpoint: url.origin + "/oauth/token", app_registration_endpoint: url.origin + "/api/v1/apps", revocation_endpoint: url.origin + "/oauth/revoke", userinfo_endpoint: url.origin + "/oauth/userinfo", response_types_supported: ["code"], grant_types_supported: ["authorization_code"], code_challenge_methods_supported: ["S256"] }, 200, cors());
    if (url.pathname === "/api/v1/apps" && request.method === "POST") return proxy(request, "/api/v1/apps");
    if (url.pathname === "/oauth/authorize" && request.method === "GET") return authorizationPage(request.url);
    if (url.pathname === "/oauth/token" && request.method === "POST") return proxy(request, "/oauth/token");
    if (url.pathname === "/oauth/revoke" && request.method === "POST") return proxy(request, "/oauth/revoke");
    if (url.pathname === "/oauth/userinfo" && request.method === "GET") return proxy(request, "/api/v1/accounts/verify_credentials");
    if (url.pathname === "/api/v1/apps/verify_credentials" && request.method === "GET") return proxy(request, "/api/v1/apps/verify_credentials");
    if (["/api/v1/apps", "/oauth/token", "/oauth/revoke"].includes(url.pathname)) return json({ error: "method_not_allowed" }, 405, { ...cors(), allow: "POST" });
    if (["/oauth/authorize", "/oauth/userinfo", "/api/v1/apps/verify_credentials"].includes(url.pathname)) return json({ error: "method_not_allowed" }, 405, { ...cors(), allow: "GET" });
    return json({ error: "not_found", message: "Route non prise en charge par la passerelle." }, 404, cors());
  }
};