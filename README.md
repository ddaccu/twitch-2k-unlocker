# Twitch 2K Quality Unlocker

Chrome extension that unlocks 1440p+ quality region-locked streams on Twitch by proxying only auth requests through your own Cloudflare Worker.

## Features
- ✅ **Privacy:** You control the proxy (Cloudflare Worker).
- ✅ **Speed:** Direct video stream (zero added latency).
- ✅ **Free:** Uses Cloudflare Free Tier.

---

## 1. Deploy the Relay Worker

1. Create a free account at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up).
2. Go to **Compute (Workers)** → **Create Application** → **Create Worker**.
3. Name it (e.g., `twitch-relay`) → **Deploy**.
4. Click **Edit Code**.
5. Replace everything with the code from [`worker.js`](worker.js).
6. **Save and Deploy**.
7. Copy your Worker URL: `https://twitch-relay.yourname.workers.dev`

---

## 2. Install the Extension (Chrome/Edge/Brave)

1. Download the latest release `.zip` from [Releases](https://github.com/ddaccu/twitch-2k-unlocker/releases).
2. Unzip it.
3. Open `chrome://extensions/` → Enable **Developer Mode**.
4. Click **Load Unpacked** → Select the folder.
5. Click the extension icon → Paste your Worker URL → Toggle **ON**.

---

## Troubleshooting
- **No 1440p?** Ensure the streamer is actually broadcasting in 1440p (search for "2k streamer").
- **Extension not updating?** Reload the extension from `chrome://extensions/` if you updated the worker.

## License
MIT
