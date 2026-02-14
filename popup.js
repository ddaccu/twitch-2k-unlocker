// ============================================================
// Twitch 2K Quality Unlocker — Popup Script
// ============================================================

const toggle = document.getElementById("toggle");
const proxyInput = document.getElementById("proxy-url");
const statusEl = document.getElementById("status");
const setupLink = document.getElementById("setup-link");

// ---- Load saved state ----

chrome.runtime.sendMessage({ action: "getStatus" }, (res) => {
    if (!res) return;
    toggle.checked = res.enabled;
    proxyInput.value = res.proxyUrl || "";
    updateStatusText(res.enabled);
});

// ---- Toggle handler ----

toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    const proxyUrl = proxyInput.value.trim();

    if (enabled && !proxyUrl) {
        toggle.checked = false;
        proxyInput.focus();
        proxyInput.style.borderColor = "#f55";
        setTimeout(() => (proxyInput.style.borderColor = ""), 1500);
        return;
    }

    const action = enabled ? "enable" : "disable";
    chrome.runtime.sendMessage({ action, proxyUrl }, () => {
        updateStatusText(enabled);
    });
});

// ---- Save proxy URL on blur ----

proxyInput.addEventListener("blur", () => {
    const proxyUrl = proxyInput.value.trim();
    chrome.storage.local.set({ proxyUrl });
});

// ---- Status text ----

function updateStatusText(enabled) {
    statusEl.classList.remove("active", "inactive");
    if (enabled) {
        statusEl.textContent = "Active — 2K quality unlocked";
        statusEl.classList.add("active");
    } else {
        statusEl.textContent = "Disabled";
        statusEl.classList.add("inactive");
    }
}

// ---- Setup link ----

setupLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({
        url: "https://github.com/ddaccu/twitch-2k-unlocker#deploy-the-relay-worker",
    });
});
