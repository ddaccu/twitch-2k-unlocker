# Twitch 2K Quality Unlocker (iPad/iOS & Desktop)

Unlocks 1440p+ quality region-locked streams on Twitch by proxying only auth requests through your own Cloudflare Worker.

## Features
- ✅ **Privacy:** You control the proxy (Cloudflare Worker).
- ✅ **Speed:** Direct video stream (zero added latency).
- ✅ **Free:** Uses Cloudflare Free Tier.
- ✅ **Cross-Platform:** Works on Desktop (Chrome/Edge) and iOS/iPad (Safari).

---

## 1. Setup Relay (Required for all devices)

1. Create a free account at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up).
2. Go to **Compute (Workers)** → **Create Application** → **Create Worker**.
3. Name it (e.g., `twitch-relay`) → **Deploy**.
4. Click **Edit Code**.
5. Replace everything with the code from [`worker.js`](worker.js).
6. **Save and Deploy**.
7. Copy your Worker URL: `https://twitch-relay.yourname.workers.dev`

---

## 2. Install on Desktop (Chrome/Edge/Brave)

1. Download the latest release `.zip` from [Releases](https://github.com/ddaccu/twitch-2k-unlocker/releases).
2. Unzip it.
3. Open `chrome://extensions/` → Enable **Developer Mode**.
4. Click **Load Unpacked** → Select the folder.
5. Click the extension icon → Paste your Worker URL → Toggle **ON**.

---

## 3. Install on iPad/iPhone (Safari)

Using the **Userscripts** extension (free & open-source).

1. Install [**Userscripts**](https://apps.apple.com/us/app/userscripts/id1463298887) from the App Store.
2. Go to **Settings** → **Safari** → **Extensions** → Enable **Userscripts**.
   - Make sure to set "All Websites" permission to **Allow** or **Ask**.
3. Open the **Userscripts app** and set a directory for your scripts (any folder in iCloud/On My iPad).
4. Create a new file in that folder named `twitch-2k.user.js`.
5. Copy the code from [`userscript.js`](userscript.js) into that file.
6. **IMPORTANT:** inside the file, find the line:
   ```javascript
   const WORKER_URL = "YOUR_WORKER_URL_HERE";
   ```
   Replace `YOUR_WORKER_URL_HERE` with your actual Worker URL from Step 1.
7. Open Twitch in **Safari**, tap the `Aa` (or puzzle) icon in the address bar → ensure Userscripts is active.

---

## Troubleshooting
- **No 1440p?** Ensure the streamer is actually broadcasting in 1440p (search for "2k streamer").
- **iPad not working?** Check that the `WORKER_URL` inside the script is correct and starts with `https://`.
- **Desktop stale?** Reload the extension from `chrome://extensions/` if you updated the worker.

## License
MIT
