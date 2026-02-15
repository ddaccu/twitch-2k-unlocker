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

## Setup

### 1. Deploy the Relay Worker

1. Create a free [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. Go to **Workers & Pages** → **Create Worker**
3. Give it a name (e.g. `twitch-relay`)
4. Replace the default code with the contents of [`worker.js`](worker.js)
5. Click **Deploy**
6. Copy the worker URL (e.g. `https://twitch-relay.yourname.workers.dev`)

> Free tier: 100,000 requests/day — more than enough for personal use.

### 2. Install the Extension

1. Download from [Releases](https://github.com/ddaccu/twitch-2k-unlocker/releases)
2. Unzip
3. Chrome → `chrome://extensions/` → enable **Developer mode**
4. Click **Load unpacked** → select the unzipped folder

### 3. Configure

1. Click the extension icon
2. Paste your Worker URL
3. Toggle **ON**
4. **Refresh** any Twitch stream → 1440p should appear in quality settings

## Files

```
├── manifest.json     # Extension config (Manifest V3)
├── background.js     # Service worker — state management
├── content.js        # Content script — injects page.js
├── page.js           # Fetch interceptor — routes metadata through proxy
├── popup.html/css/js # Extension popup UI
├── worker.js         # Cloudflare Worker relay (deploy separately)
└── icons/            # Extension icons
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No 1440p option | Streamer must be broadcasting in 1440p+ |
| Worker URL error | Make sure URL starts with `https://` |
| Still blocked | Try deploying worker to a US region in Cloudflare dashboard |

## Credits

Inspired by [TTV LOL PRO](https://github.com/younesaassila/ttv-lol-pro) and [K-Twitch-Bypass](https://github.com/Kwabang/K-Twitch-Bypass).

## License

MIT
