const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data, null, 2), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", ...headers } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "Authorization, Content-Type", "access-control-max-age": "600" } });
    if (request.method !== "GET" && request.method !== "POST") return json({ error: "method_not_allowed" }, 405, { allow: "GET, POST, OPTIONS" });
    if (url.pathname === "/" || url.pathname === "/health") return json({ service: "Epsilon OAuth", status: "online", version: "0.1.0", integration: "pending", identity_provider_configured: Boolean(env.EPSILON_ISSUER_URL), note: "Real Epsilon Social authentication is not enabled until a supported identity endpoint is verified." });
    if (url.pathname === "/.well-known/oauth-authorization-server") return json({ issuer: url.origin, authorization_endpoint: url.origin + "/oauth/authorize", token_endpoint: url.origin + "/oauth/token", response_types_supported: ["code"], grant_types_supported: ["authorization_code"], code_challenge_methods_supported: ["S256"], status: "integration_pending" });
    if (url.pathname === "/.well-known/openid-configuration") return json({ issuer: url.origin, authorization_endpoint: url.origin + "/oauth/authorize", token_endpoint: url.origin + "/oauth/token", userinfo_endpoint: url.origin + "/oauth/userinfo", response_types_supported: ["code"], code_challenge_methods_supported: ["S256"], status: "integration_pending" });
    if (["/oauth/authorize", "/oauth/token", "/oauth/userinfo"].includes(url.pathname)) return json({ error: "temporarily_unavailable", error_description: "Epsilon Social identity-provider integration has not been verified. No authentication was performed." }, 503);
    return json({ error: "not_found" }, 404);
  }
};
