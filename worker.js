// ============================================================
// Twitch 2K Quality Unlocker — Cloudflare Worker Relay
// ============================================================
// Deploy this to Cloudflare Workers (free tier, 100k req/day).
// It proxies only the small GQL token + usher playlist requests
// through Cloudflare's US edge, unlocking 2K quality options.
// The actual video stream flows directly to the viewer.
// ============================================================

const TWITCH_GQL = "https://gql.twitch.tv/gql";
const USHER_BASE = "https://usher.ttvnw.net";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
};

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        const url = new URL(request.url);

        try {
            // ---- /gql — Proxy PlaybackAccessToken request ----
            if (url.pathname === "/gql") {
                const body = await request.text();
                const clientId =
                    request.headers.get("X-TTV-Client-ID") || "kimne78kx3ncx6brgo4mv6wki5h1ko";
                const auth = request.headers.get("X-TTV-Auth") || "";
                const deviceId = request.headers.get("X-TTV-Device-ID") || "";

                const headers = {
                    "Content-Type": "text/plain; charset=UTF-8",
                    "Client-ID": clientId,
                };
                if (auth && auth !== "undefined") headers["Authorization"] = auth;
                if (deviceId) headers["Device-ID"] = deviceId;

                const resp = await fetch(TWITCH_GQL, {
                    method: "POST",
                    headers,
                    body,
                });

                return new Response(resp.body, {
                    status: resp.status,
                    headers: {
                        "Content-Type": resp.headers.get("Content-Type") || "application/json",
                        ...CORS_HEADERS,
                    },
                });
            }

            // ---- /usher — Proxy playlist manifest request ----
            if (url.pathname === "/usher") {
                const targetUrl = url.searchParams.get("url");
                if (!targetUrl || !targetUrl.includes("usher.ttvnw.net")) {
                    return new Response("Invalid usher URL", {
                        status: 400,
                        headers: CORS_HEADERS,
                    });
                }

                const resp = await fetch(targetUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0",
                    },
                });

                return new Response(resp.body, {
                    status: resp.status,
                    headers: {
                        "Content-Type":
                            resp.headers.get("Content-Type") ||
                            "application/vnd.apple.mpegurl",
                        ...CORS_HEADERS,
                    },
                });
            }

            // ---- Default: show info ----
            return new Response(
                JSON.stringify({
                    name: "Twitch 2K Quality Unlocker Relay",
                    endpoints: ["/gql", "/usher"],
                    info: "This worker relays Twitch metadata requests for 2K quality unlock.",
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...CORS_HEADERS,
                    },
                }
            );
        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
                status: 500,
                headers: { "Content-Type": "application/json", ...CORS_HEADERS },
            });
        }
    },
};
