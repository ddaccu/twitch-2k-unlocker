// ============================================================
// Twitch 2K Quality Unlocker — Content Script (injector)
// ============================================================
// Injects the page-level fetch interceptor into Twitch pages.
// Content scripts can't directly override window.fetch, so we
// inject a <script> tag that runs in the page's JS context.
// ============================================================

(async function () {
    // Get current state from background
    const state = await chrome.runtime.sendMessage({ action: "getStatus" });
    if (!state.enabled) return;

    // Inject the page script with the proxy URL
    // Cache-bust with timestamp to avoid stale cached versions
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("page.js") + "?v=" + Date.now();
    script.dataset.proxyUrl = state.proxyUrl || "";
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => script.remove();
})();
