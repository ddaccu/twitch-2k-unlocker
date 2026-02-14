// ============================================================
// Twitch 2K Quality Unlocker — Page-Level Fetch Interceptor
// ============================================================
// Runs in the page's JS context (injected by content.js).
// Monkey-patches window.fetch to intercept:
//   1. PlaybackAccessToken GQL requests → proxy through relay
//   2. Usher playlist requests → proxy through relay
// Only these tiny metadata requests go through the proxy.
// The actual video stream (video-weaver) flows directly.
// ============================================================

(function () {
    "use strict";

    const TAG = "[Twitch 2K]";
    const scriptEl = document.currentScript;
    const PROXY_URL = scriptEl?.dataset?.proxyUrl || "";

    if (!PROXY_URL) {
        console.warn(TAG, "No proxy URL configured. Bypass will not work.");
        return;
    }

    // Ensure proxy URL ends without trailing slash
    const proxyBase = PROXY_URL.replace(/\/+$/, "");

    const NATIVE_FETCH = window.fetch.bind(window);
    const USHER_HOST = "usher.ttvnw.net";

    console.log(TAG, "Fetch interceptor active. Proxy:", proxyBase);

    window.fetch = async function (input, init) {
        try {
            const url =
                typeof input === "string"
                    ? input
                    : input instanceof URL
                        ? input.href
                        : input instanceof Request
                            ? input.url
                            : "";

            // ---- 1. Intercept PlaybackAccessToken GQL requests ----
            if (url.includes("gql.twitch.tv/gql")) {
                let bodyText = null;
                if (init?.body) {
                    bodyText =
                        typeof init.body === "string"
                            ? init.body
                            : new TextDecoder().decode(init.body);
                } else if (input instanceof Request) {
                    const clone = input.clone();
                    bodyText = await clone.text();
                }

                if (bodyText && bodyText.includes("PlaybackAccessToken")) {
                    console.log(TAG, "Intercepted PlaybackAccessToken request");

                    // Extract headers from original request
                    const headers = extractHeaders(input, init);

                    // Bundle everything into request body (no custom headers = no CORS preflight)
                    const proxyPayload = JSON.stringify({
                        type: "gql",
                        body: bodyText,
                        clientId: headers["Client-ID"] || headers["client-id"] || "kimne78kx3ncx6brgo4mv6wki5h1ko",
                        auth: headers["Authorization"] || headers["authorization"] || "",
                        deviceId: headers["Device-ID"] || headers["device-id"] || "",
                    });

                    try {
                        const proxyResponse = await NATIVE_FETCH(proxyBase, {
                            method: "POST",
                            body: proxyPayload,
                        });

                        if (proxyResponse.ok) {
                            console.log(TAG, "PlaybackAccessToken proxied successfully");
                            return proxyResponse;
                        } else {
                            console.warn(TAG, "Proxy returned", proxyResponse.status);
                        }
                    } catch (err) {
                        console.warn(TAG, "Proxy failed for GQL, falling back to direct:", err);
                    }
                }
            }

            // ---- 2. Intercept Usher playlist requests ----
            if (url.includes(USHER_HOST)) {
                console.log(TAG, "Intercepted Usher request");

                const proxyPayload = JSON.stringify({
                    type: "usher",
                    url: url,
                });

                try {
                    const proxyResponse = await NATIVE_FETCH(proxyBase, {
                        method: "POST",
                        body: proxyPayload,
                    });

                    if (proxyResponse.ok) {
                        console.log(TAG, "Usher request proxied successfully");
                        return proxyResponse;
                    } else {
                        console.warn(TAG, "Proxy returned", proxyResponse.status);
                    }
                } catch (err) {
                    console.warn(TAG, "Proxy failed for Usher, falling back to direct:", err);
                }
            }
        } catch (err) {
            console.error(TAG, "Fetch interceptor error:", err);
        }

        // Fallback: use the original fetch
        return NATIVE_FETCH(input, init);
    };

    function extractHeaders(input, init) {
        const result = {};
        let headers = init?.headers;
        if (!headers && input instanceof Request) {
            headers = input.headers;
        }
        if (headers instanceof Headers) {
            headers.forEach((value, key) => {
                result[key] = value;
            });
        } else if (typeof headers === "object" && headers !== null) {
            Object.entries(headers).forEach(([key, value]) => {
                result[key] = value;
            });
        }
        return result;
    }
})();
