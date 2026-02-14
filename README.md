# Twitch 2K Quality Unlocker

Chrome extension that unlocks 2K (1440p) quality on Twitch **without VPN**.

## How It Works

Twitch restricts 1440p quality by region. This extension proxies **only the playlist metadata** (~2 KB) through a Cloudflare Worker you deploy — the actual video stream flows directly with **zero latency impact**.

```
Browser                    Cloudflare Worker (US)         Twitch
  │                              │                          │
  ├─ PlaybackAccessToken req ───►├─ forward to GQL ────────►│
  │◄─ US-region token ──────────┤◄─ token response ────────┤
  │                              │                          │
  ├─ Usher playlist req ────────►├─ forward to usher ──────►│
  │◄─ playlist w/ 1440p ────────┤◄─ playlist response ─────┤
  │                              │                          │
  ├─ Video stream (direct, no proxy) ──────────────────────►│
```

> **Note:** 1440p only appears if the **streamer** broadcasts in 1440p+ with Enhanced Broadcasting enabled.

---

## Setup Guide

### Step 1 — Deploy the Relay Worker (free, 5 min)

1. Go to [**dash.cloudflare.com/sign-up**](https://dash.cloudflare.com/sign-up) and create a free account
2. In the left sidebar, click **Compute** → **Workers & Pages**
3. Click the blue **Create application** button (top right)
4. Click **Start with Hello World!**
5. Name it `twitch-relay` → click **Deploy**
6. You'll land on the Worker's dashboard. Click **Edit code** (top right)
7. **Delete all** the default code in the editor
8. Open the file [`worker.js`](worker.js) from this repo and **copy its entire contents**
9. **Paste** into the Cloudflare editor
10. Click **Save and deploy** (or Ctrl+S)
11. Your Worker URL is shown at the top — it looks like:
    ```
    https://twitch-relay.YOUR-NAME.workers.dev
    ```
    **Copy this URL** — you'll need it in Step 3.

> ✅ Free tier gives you **100,000 requests/day** — more than enough for personal use.

---

### Step 2 — Install the Extension

1. Download the latest `.zip` from [**Releases**](https://github.com/ddaccu/twitch-2k-unlocker/releases)
2. Extract the ZIP to any folder
3. Open Chrome → go to `chrome://extensions/`
4. Enable **Developer mode** (toggle in the top right)
5. Click **Load unpacked** → select the extracted folder

---

### Step 3 — Configure & Use

1. Click the extension icon (puzzle piece → Twitch 2K)
2. Paste your Worker URL from Step 1 into the **Worker URL** field
3. Toggle the switch **ON**
4. **Refresh** any Twitch stream page (Ctrl+Shift+R)
5. Click the ⚙️ gear icon on the video player → **1440p** should now appear

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No 1440p option | The streamer must be broadcasting in 1440p+. Try a known 1440p streamer. |
| "Proxy failed" in console | Check that the Worker URL is correct and starts with `https://`. Open the URL in a browser — it should show `"status":"running"`. |
| Extension not updating | Remove it from `chrome://extensions/`, then **Load unpacked** again from the folder. |
| Still no 1440p | Your Cloudflare edge might be in a restricted region. In Cloudflare dashboard, go to Worker Settings → try enabling **Smart Placement**. |

---

## Files

```
├── manifest.json       Extension config (Manifest V3)
├── background.js       Service worker — state management
├── content.js          Injects page.js into Twitch pages
├── page.js             Fetch interceptor — routes metadata through proxy
├── popup.html/css/js   Extension popup UI
├── worker.js           Cloudflare Worker relay (deploy separately)
└── icons/              Extension icons
```

## Credits

Inspired by [TTV LOL PRO](https://github.com/younesaassila/ttv-lol-pro) and [K-Twitch-Bypass](https://github.com/Kwabang/K-Twitch-Bypass).

## License

MIT
