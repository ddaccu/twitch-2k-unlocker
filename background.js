// ============================================================
// Twitch 2K Quality Unlocker — Background Service Worker
// ============================================================
// Technique: modify usher.ttvnw.net playlist requests by:
//   1. Setting X-Forwarded-For: ::1 header (bypass geo-check)
//   2. Adding force_segment_node & force_manifest_node params
//      (route to a CDN that doesn't enforce quality caps)
// ============================================================

const RULE_HEADER = 1001;
const RULE_CDN = 1002;

// CDN nodes known to not enforce regional quality limits
const CDN_NODES = {
    auto: "akamai_korea",       // generic fallback
    us_west: "video-weaver.sjc06",
    us_east: "video-weaver.iad05",
    eu_west: "video-weaver.ams02",
    eu_east: "video-weaver.fra05",
    asia: "video-weaver.tyo05",
};

const SEGMENT_NODES = {
    auto: "akamai_korea",
    us_west: "limelight",
    us_east: "limelight",
    eu_west: "limelight",
    eu_east: "limelight",
    asia: "limelight",
};

// ---- Rule builders ----

function buildHeaderRule() {
    return {
        id: RULE_HEADER,
        priority: 1,
        action: {
            type: "modifyHeaders",
            requestHeaders: [
                {
                    operation: "set",
                    header: "X-Forwarded-For",
                    value: "::1",
                },
            ],
        },
        condition: {
            regexFilter: "^https://usher\\.ttvnw\\.net/api/channel/hls/.*",
            resourceTypes: ["xmlhttprequest"],
        },
    };
}

function buildCDNRule(manifestNode, segmentNode) {
    return {
        id: RULE_CDN,
        priority: 2,
        action: {
            type: "redirect",
            redirect: {
                transform: {
                    queryTransform: {
                        addOrReplaceParams: [
                            { key: "force_manifest_node", value: manifestNode },
                            { key: "force_segment_node", value: segmentNode },
                            { key: "allow_source", value: "true" },
                            { key: "allow_audio_only", value: "true" },
                        ],
                    },
                },
            },
        },
        condition: {
            regexFilter: "^https://usher\\.ttvnw\\.net/api/channel/hls/.*",
            resourceTypes: ["xmlhttprequest"],
        },
    };
}

// ---- Enable / Disable ----

async function enableBypass(cdnRegion = "auto") {
    const manifestNode = CDN_NODES[cdnRegion] || CDN_NODES.auto;
    const segmentNode = SEGMENT_NODES[cdnRegion] || SEGMENT_NODES.auto;

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [RULE_HEADER, RULE_CDN],
        addRules: [buildHeaderRule(), buildCDNRule(manifestNode, segmentNode)],
    });

    // Update icon to show active state
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#9147FF" }); // Twitch purple

    console.log("[Twitch 2K] Bypass ENABLED — CDN:", cdnRegion, "→", manifestNode);
}

async function disableBypass() {
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [RULE_HEADER, RULE_CDN],
    });

    chrome.action.setBadgeText({ text: "" });
    console.log("[Twitch 2K] Bypass DISABLED");
}

// ---- Startup: restore saved state ----

chrome.runtime.onInstalled.addListener(async () => {
    const data = await chrome.storage.local.get(["enabled", "cdnRegion"]);
    if (data.enabled) {
        await enableBypass(data.cdnRegion || "auto");
    }
});

chrome.runtime.onStartup.addListener(async () => {
    const data = await chrome.storage.local.get(["enabled", "cdnRegion"]);
    if (data.enabled) {
        await enableBypass(data.cdnRegion || "auto");
    }
});

// ---- Messages from popup ----

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    (async () => {
        if (msg.action === "enable") {
            await chrome.storage.local.set({ enabled: true, cdnRegion: msg.cdnRegion || "auto" });
            await enableBypass(msg.cdnRegion || "auto");
            sendResponse({ ok: true });
        } else if (msg.action === "disable") {
            await chrome.storage.local.set({ enabled: false });
            await disableBypass();
            sendResponse({ ok: true });
        } else if (msg.action === "getStatus") {
            const data = await chrome.storage.local.get(["enabled", "cdnRegion"]);
            sendResponse({ enabled: !!data.enabled, cdnRegion: data.cdnRegion || "auto" });
        }
    })();
    return true; // async response
});
