// ============================================================
// Twitch 2K Quality Unlocker — Popup Script
// ============================================================

const toggleEl = document.getElementById("toggleBypass");
const statusEl = document.getElementById("statusText");
const cdnSelect = document.getElementById("cdnRegion");

// ---- Init: load current state ----

statusEl.classList.add("checking");

chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
    if (!response) return;

    statusEl.classList.remove("checking");

    toggleEl.checked = response.enabled;
    cdnSelect.value = response.cdnRegion || "auto";

    updateStatusText(response.enabled);
});

// ---- Toggle handler ----

toggleEl.addEventListener("change", () => {
    const enabled = toggleEl.checked;

    if (enabled) {
        chrome.runtime.sendMessage(
            { action: "enable", cdnRegion: cdnSelect.value },
            () => updateStatusText(true)
        );
    } else {
        chrome.runtime.sendMessage({ action: "disable" }, () =>
            updateStatusText(false)
        );
    }
});

// ---- CDN region change ----

cdnSelect.addEventListener("change", () => {
    if (!toggleEl.checked) return;

    // Re-enable with new CDN region
    chrome.runtime.sendMessage({
        action: "enable",
        cdnRegion: cdnSelect.value,
    });
});

// ---- Helpers ----

function updateStatusText(enabled) {
    statusEl.classList.remove("active", "inactive", "checking");

    if (enabled) {
        statusEl.textContent = "Active — 2K quality unlocked";
        statusEl.classList.add("active");
    } else {
        statusEl.textContent = "Disabled";
        statusEl.classList.add("inactive");
    }
}
