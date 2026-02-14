// ============================================================
// Twitch 2K Quality Unlocker — Cloudflare Worker Relay
// ============================================================
// Deploy this to Cloudflare Workers (free tier, 100k req/day).
// It proxies only the small GQL token + usher playlist requests
// through Cloudflare's edge, unlocking 2K quality options.
// The actual video stream flows directly to the viewer.
// ============================================================

const TWITCH_GQL = "https://gql.twitch.tv/gql";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export default {
    async fetch(request) {
        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        // Only accept POST
        if (request.method !== "POST") {
            return new Response(
                JSON.stringify({
                    name: "Twitch 2K Quality Unlocker Relay",
                    status: "running",
                    usage: "POST with {type:'gql'|'usher', ...}",
                }),
                { headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
            );
        }

        try {
            const payload = await request.json();

            // ---- GQL: Proxy PlaybackAccessToken request ----
            if (payload.type === "gql") {
                const headers = {
                    "Content-Type": "text/plain; charset=UTF-8",
                    "Client-ID": payload.clientId || "kimne78kx3ncx6brgo4mv6wki5h1ko",
                };
                if (payload.auth && payload.auth !== "undefined" && payload.auth !== "") {
                    headers["Authorization"] = payload.auth;
                }
                if (payload.deviceId) {
                    headers["Device-ID"] = payload.deviceId;
                }

                const resp = await fetch(TWITCH_GQL, {
                    method: "POST",
                    headers,
                    body: payload.body,
                });

                const body = await resp.text();
                return new Response(body, {
                    status: resp.status,
                    headers: {
                        "Content-Type": "application/json",
                        ...CORS_HEADERS,
                    },
                });
            }

            // ---- Usher: Proxy playlist manifest request ----
            if (payload.type === "usher") {
                if (!payload.url || !payload.url.includes("usher.ttvnw.net")) {
                    return new Response(
                        JSON.stringify({ error: "Invalid usher URL" }),
                        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
                    );
                }

                const resp = await fetch(payload.url, {
                    headers: { "User-Agent": "Mozilla/5.0" },
                });

                const body = await resp.text();
                return new Response(body, {
                    status: resp.status,
                    headers: {
                        "Content-Type": resp.headers.get("Content-Type") || "application/vnd.apple.mpegurl",
                        ...CORS_HEADERS,
                    },
                });
            }

            return new Response(
                JSON.stringify({ error: "Unknown type. Use 'gql' or 'usher'." }),
                { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
            );
        } catch (err) {
            return new Response(
                JSON.stringify({ error: err.message }),
                { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
            );
        }
    },
};
