# Twitch 2K Quality Unlocker

Chrome extension that unlocks 2K (1440p) quality on Twitch **without VPN or proxy**.

![Extension Icon](icons/icon128.png)

## How It Works

Twitch restricts 2K quality by region. This extension modifies only the **playlist request** (~2 KB) — the actual video stream flows directly with zero latency impact.

Two `declarativeNetRequest` rules target `usher.ttvnw.net`:

| Rule | What it does |
|------|-------------|
| `X-Forwarded-For: ::1` | Bypasses geo-restriction check |
| `force_segment_node` + `force_manifest_node` | Routes to unrestricted CDN node |

> **Note:** The 2K option only appears when the **streamer** is broadcasting in 1440p+. If the streamer streams at 1080p, that remains the max quality.

## Installation

1. Download or clone this repository
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the downloaded folder

## Usage

1. Click the extension icon in the toolbar
2. Toggle the bypass **ON**
3. (Optional) Select a CDN region for best latency
4. **Refresh** any open Twitch stream
5. Check the quality selector — 1440p should now be available

## Files

```
├── manifest.json      # Extension config (Manifest V3)
├── background.js      # Service worker — bypass rules
├── popup.html         # Popup UI
├── popup.css          # Twitch-themed dark styles
├── popup.js           # Popup logic
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Credits

Technique based on [K-Twitch-Bypass](https://github.com/Kwabang/K-Twitch-Bypass).

## License

MIT
