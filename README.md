# video-music-downloader

**English** · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [Deutsch](README.de.md) · [Italiano](README.it.md)

A simple web app (Node.js + Express) to download **YouTube**, **Facebook** and
**Instagram** videos as **MP4** or **MP3**.

- Paste a link, the site analyses the video and shows the available qualities.
- YouTube: pick the resolution (up to the best available) + an MP3 option.
- Facebook / Instagram: MP4 download (best quality) + an MP3 option.
- If the video requires a login (private content, members-only, age-restricted,
  bot check, Instagram story, non-public Facebook video), the site says so
  clearly instead of crashing.

## Languages

The interface is available in **French, English, Spanish, Brazilian Portuguese,
German and Italian**. On first visit the app follows the browser language; if it
is not supported it falls back to **English**. A language selector at the top of
the page overrides the choice and remembers it (stored in `localStorage`).

## How it works

- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) does the extraction and download.
  The binary is installed automatically by the `youtube-dl-exec` dependency.
- [`ffmpeg`](https://ffmpeg.org/) merges audio + video and converts to MP3.
  The binary comes from the `ffmpeg-static` dependency (no system install needed).
- The server stores nothing permanently: `yt-dlp` writes a temporary file, the
  server streams it to the browser and deletes it once the transfer ends.

## Requirements

- Node.js 18 or later.
- **macOS / Linux only:** a system **Python 3.10 or later**. On these platforms the `yt-dlp`
  binary that gets installed needs a separately-installed Python interpreter to run (the
  Windows build is self-contained, so this doesn't apply there). Check with `python3 --version`;
  on macOS, `brew install python3` if it's too old.

## Installation

```bash
npm install
```

If the binaries are not downloaded (install scripts blocked):

```bash
node node_modules/ffmpeg-static/install.js
node node_modules/youtube-dl-exec/scripts/postinstall.js
```

## Running

```bash
npm start
```

Then open http://localhost:3000

Environment variables:

- `PORT`: listening port (default `3000`).

## Known limitations

| Platform | Without a login |
|---|---|
| YouTube | Most public videos. Blocked: age-restricted, private videos, occasional bot check. |
| Facebook | **Public** videos only. Any private / group / friends-only content requires login cookies. |
| Instagram | Public reels and posts sometimes work; Instagram often requires a login even for public content. Stories: login **always** required. |

## Legal note

Tool intended for personal use. Downloading third-party content may violate the
platforms' terms of service and copyright law depending on how it is used.
