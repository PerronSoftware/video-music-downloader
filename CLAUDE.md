# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page web app (Node.js + Express, ES modules) that takes a YouTube / Facebook / Instagram
URL, shows the available qualities, and downloads the video as MP4 or MP3. All media handling is
delegated to the `yt-dlp` and `ffmpeg` binaries.

## Commands

```bash
npm install          # also downloads the yt-dlp + ffmpeg binaries via postinstall scripts
npm start             # serve on http://localhost:3000 (PORT env var overrides)
npm run dev           # same, with --watch reload
```

Requires Node.js 18+. There is **no test suite and no linter** configured.

On macOS/Linux, a system **Python 3.10+ (CPython)** is also required at runtime.
`youtube-dl-exec` downloads the generic `yt-dlp` GitHub release asset on Unix (see
`YOUTUBE_DL_FILENAME` in its `src/constants.js` — no OS-specific suffix is applied outside
`win32`), and that particular asset is a zipimport binary that needs an external Python
interpreter to run — unlike the Windows `.exe`, which is a self-contained PyInstaller build.
The package's own `preinstall.mjs` only checks for Python `>=3.9` (`YOUTUBE_DL_SKIP_PYTHON_CHECK=1`
skips it entirely), which can pass while yt-dlp itself then refuses to start on 3.9. Verify with
`python3 --version`; on macOS, `brew install python3` if it's too old.

On boot, `server.js` runs `checkBinary()` for yt-dlp and ffmpeg but only **warns** — the
server still listens even if the binaries are missing or unresponsive, and requests then
fail at probe/download time.

If `npm install` reports install scripts were blocked (`allowScripts`), the binaries won't exist.
Run them manually:

```bash
node node_modules/ffmpeg-static/install.js
node node_modules/youtube-dl-exec/scripts/preinstall.mjs
node node_modules/youtube-dl-exec/scripts/postinstall.js
```

Verify: `node_modules/youtube-dl-exec/bin/yt-dlp --version` and `node_modules/ffmpeg-static/ffmpeg -version`.

## Architecture

Four source files, two API endpoints:

- **[server.js](server.js)** — Express wiring. Serves `public/` statically and exposes:
  - `POST /api/info` — body `{ url, lang? }`. Resolves a locale (see Internationalisation), detects
    platform, calls `probe(url, locale)`, returns `{ platform, info }` or
    `{ platform, error: { code, message } }` with HTTP 422 on extraction failure. Live streams are
    rejected here.
  - `GET /api/download` — query `url`, `quality` (a quality id), `title`, `lang`. Calls
    `downloadToFile()`, then streams the temp file to the client with `Content-Disposition: attachment`
    and deletes it on stream close. Errors before the first byte become a 422 JSON body; errors
    mid-stream destroy the connection.
- **[src/ytdlp.js](src/ytdlp.js)** — the only module that touches the binaries.
  - `probe(url, locale)` runs `yt-dlp --dump-single-json` (via the `youtube-dl-exec` package,
    buffered, with `--no-playlist`) and reshapes the result in `shapeInfo(info, locale)`: it
    collapses `info.formats` down to the set of distinct video **heights** and builds the
    `qualities[]` list the UI renders. `locale` is used only to translate the two free-text quality
    labels (`quality.videoBest`, `quality.audioOnly`); the height labels are language-neutral.
    If yt-dlp still returns a `playlist` type, `probe()` picks the first entry that has `formats`.
    An `audio-mp3` quality is added whenever any audio-bearing format exists or any video height
    was found.
  - `downloadToFile({ url, quality, title })` spawns the `yt-dlp` binary directly, writes to
    `os.tmpdir()/vmd-downloads/<token>.%(ext)s`, then globs that token back to find the produced
    file. Resolves `{ path, filename, contentType }`.
  - Binary paths: `YT_DLP_PATH` from `youtube-dl-exec`'s constants, `FFMPEG_PATH` from `ffmpeg-static`.
- **[src/platforms.js](src/platforms.js)** —
  - `detectPlatform(url)` matches the URL hostname against a fixed host allowlist. Returns `null`
    (→ 400) for anything else.
  - `explainError(stderr, platformLabel, locale)` lowercases the raw yt-dlp stderr and
    substring-matches it into `{ code, message }` (`auth` / `geo` / `unavailable` / `unsupported` /
    `network` / `unknown`). This is the single place login-required / private / age-gated cases get
    turned into the user-facing (localized) message — the `code` drives UI styling, the `message`
    comes from the `src/i18n.js` catalog.
- **[src/i18n.js](src/i18n.js)** — server-side i18n. `SUPPORTED_LOCALES` (`fr`, `en`, `es`, `pt-BR`,
  `de`, `it`), `DEFAULT_LOCALE = 'en'`, `resolveLocale({ explicit, acceptLanguage })`,
  `normalizeLocale()`, `parseAcceptLanguage()`, and `t(locale, key, params)` over a nested
  `MESSAGES` catalog (dotted keys, `{token}` interpolation, falls back to `en` then the raw key).
- **[public/](public/)** — vanilla HTML/CSS/JS, no build step.
  - `i18n.js` — client i18n, loaded **before** `app.js`. Exposes `window.i18n` with its own
    `MESSAGES` catalog (UI strings, keyed differently from the server's), `detectLocale()`,
    `getLocale()`/`setLocale()`, `onChange()`, and `applyStatic()` which walks `[data-i18n]` /
    `[data-i18n-html]` / `[data-i18n-attr]` nodes in `index.html`. The chosen locale is persisted in
    `localStorage` under `vmd-lang`.
  - `app.js` posts to `/api/info` (with `lang`), renders the card, and for downloads uses `fetch()`
    + `res.blob()` + a synthetic `<a download>` click so a late JSON error can be shown instead of
    navigating the browser to raw JSON. On a language change it re-submits the form so the
    server-rendered quality labels come back in the new language.

### Quality id scheme (contract between the two sides)

`shapeInfo()` emits ids and `server.js`'s `parseQualityId()` parses them — keep them in sync.
`parseQualityId()` only accepts `audio-mp3`, `video-best`, or `video-<2-4 digits>`; anything
else is a 400. `formatSelector()` in `src/ytdlp.js` turns the parsed id into the `-f` string:

- `video-<height>` — e.g. `video-1080`. Four-tier fallback chain, mp4/m4a first:
  `bestvideo[height<=N][ext=mp4]+bestaudio[ext=m4a] / bestvideo[height<=N]+bestaudio / best[height<=N] / best`,
  plus `--merge-output-format mp4`.
- `video-best` — `bestvideo*+bestaudio/best` + `--merge-output-format mp4`. Used when the source
  exposes no per-format height (common for Facebook/Instagram).
- `audio-mp3` — `-f bestaudio/best` + `-x --audio-format mp3 --audio-quality 0`.

The download endpoint does **not** re-probe; it trusts the id and rebuilds the selector from it.

## Internationalisation

Supported locales: `fr`, `en`, `es`, `pt-BR`, `de`, `it`. **English is the default / fallback**
for anything unsupported.

- **Locale resolution** (server, `resolveLocale()`): explicit `lang` param (body on `/api/info`,
  query on `/api/download`) → `Accept-Language` header → `en`. `normalizeLocale()` folds regional
  tags to a supported one (`fr-CA` → `fr`, any `pt*` → `pt-BR`).
- **Two independent catalogs**, kept in sync by hand: [src/i18n.js](src/i18n.js) `MESSAGES` holds
  server strings (error codes, quality labels, input validation); [public/i18n.js](public/i18n.js)
  `MESSAGES` holds static UI + client-side dynamic strings. Adding a user-facing string means adding
  it in **all six languages** in the right catalog.
- **Client flow**: `i18n.js` runs first, picks the locale (`localStorage` `vmd-lang` → browser →
  `en`), sets `<html lang>`. `app.js` calls `i18n.applyStatic()`, populates `<select id="lang">`
  from `LOCALE_NAMES`, and on `change` calls `i18n.setLocale()` which re-applies translations and
  re-submits the analyse form.
- **READMEs**: [README.md](README.md) is the canonical English one; `README.<locale>.md` mirror it
  (`README.fr.md`, `README.es.md`, `README.pt-BR.md`, `README.de.md`, `README.it.md`). Each starts
  with the same language-nav line. Keep all seven in sync when the setup/limitations change.

## Design constraints worth knowing

- **Downloads go via a temp file, never a pipe to the HTTP response.** The `ffmpeg-static` build here
  segfaults (exit `-11`) when muxing a fragmented MP4 to a non-seekable pipe. Writing a normal
  seekable file and streaming that afterwards is the deliberate workaround; don't "optimize" it back
  to `-o -`.
- Format selectors are expressed as height buckets (`height<=N`), not concrete `format_id`s, because
  format ids expire between the probe and the download.
- `yt-dlp` calls pass a desktop Chrome `--user-agent` and `--no-check-certificates`; a 10-minute
  kill-timer bounds each download.
- Both endpoints always return the detected `platform` alongside errors so the UI can style by
  platform even on failure.
- `explainError()` in `src/platforms.js` substring-matches lowercased stderr in a fixed order —
  `auth` is checked first and its needle list is broad (matches bare `cookies`, `log in`, rate
  limits). Add new needles to the right bucket; order matters. The needles match yt-dlp's English
  stderr and are **not** localized; only the returned `message` is.
- `explainError`'s `unknown` fallback interpolates a truncated raw stderr line into the localized
  `error.unknown` string for debugging.
- User-facing strings now flow through the i18n catalogs (see Internationalisation) — never hardcode
  a literal message in `server.js` / `src/*.js` / `public/app.js`; add a catalog key instead.

## Known inconsistencies

- `package.json` has two `"license"` keys (`GPL-3.0` then `MIT`; JSON keeps the last). The `LICENSE`
  file is GPL-3.0. Treat GPL-3.0 as authoritative unless told otherwise.
- Dependency ranges in `package.json` (`youtube-dl-exec ^3.0.22`, `ffmpeg-static ^5.2.0`) differ
  from the pinned versions in the `allowScripts` block (`3.1.15`, `5.3.0`), which are what actually
  install.
