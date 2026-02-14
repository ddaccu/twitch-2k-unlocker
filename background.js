// ============================================================
// Twitch 2K Quality Unlocker — Background Service Worker
// ============================================================
// Manages state + injects content script on Twitch pages.
// The actual bypass is done by content.js (fetch interception).
// ============================================================

// ---- Startup: restore saved state ----

chrome.runtime.onInstalled.addListener(async () => {
    const data = await chrome.storage.local.get(["enabled", "proxyUrl"]);
    updateBadge(!!data.enabled);
});

chrome.runtime.onStartup.addListener(async () => {
    const data = await chrome.storage.local.get(["enabled"]);
    updateBadge(!!data.enabled);
});

function updateBadge(enabled) {
    chrome.action.setBadgeText({ text: enabled ? "ON" : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#9147FF" });
}

// ---- Messages from popup / content script ----

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
        if (msg.action === "enable") {
            await chrome.storage.local.set({
                enabled: true,
                proxyUrl: msg.proxyUrl || "",
            });
            updateBadge(true);
            sendResponse({ ok: true });
        } else if (msg.action === "disable") {
            await chrome.storage.local.set({ enabled: false });
            updateBadge(false);
            sendResponse({ ok: true });
        } else if (msg.action === "getStatus") {
            const data = await chrome.storage.local.get(["enabled", "proxyUrl"]);
            sendResponse({
                enabled: !!data.enabled,
                proxyUrl: data.proxyUrl || "",
            });
        }
    })();
    return true;
});
