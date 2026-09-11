# video-music-downloader

[English](README.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · **Deutsch** · [Italiano](README.it.md)

Einfache Web-App (Node.js + Express) zum Herunterladen von **YouTube**-,
**Facebook**- und **Instagram**-Videos als **MP4** oder **MP3**.

- Link einfügen, die Seite analysiert das Video und zeigt die verfügbaren Qualitäten an.
- YouTube: Auswahl der Auflösung (bis zur besten verfügbaren) + MP3-Option.
- Facebook / Instagram: MP4-Download (beste Qualität) + MP3-Option.
- Wenn das Video eine Anmeldung erfordert (privater Inhalt, nur für Mitglieder,
  Altersbeschränkung, Bot-Prüfung, Instagram-Story, nicht öffentliches
  Facebook-Video), weist die Seite deutlich darauf hin, statt abzustürzen.

## Sprachen

Die Oberfläche ist auf **Französisch, Englisch, Spanisch, brasilianischem
Portugiesisch, Deutsch und Italienisch** verfügbar. Beim ersten Besuch richtet
sich die App nach der Browsersprache; wird diese nicht unterstützt, fällt sie auf
**Englisch** zurück. Über eine Sprachauswahl oben auf der Seite lässt sich die
Wahl erzwingen, die dann gespeichert wird (im `localStorage`).

## Funktionsweise

- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) übernimmt Extraktion und Download.
  Die Binärdatei wird automatisch von der Abhängigkeit `youtube-dl-exec` installiert.
- [`ffmpeg`](https://ffmpeg.org/) führt Audio + Video zusammen und konvertiert nach MP3.
  Die Binärdatei stammt aus der Abhängigkeit `ffmpeg-static` (keine Systeminstallation nötig).
- Der Server speichert nichts dauerhaft: `yt-dlp` schreibt eine temporäre Datei,
  der Server streamt sie an den Browser und löscht sie nach Abschluss der Übertragung.

## Voraussetzungen

- Node.js 18 oder neuer.
- **Nur macOS / Linux:** ein systemweit installiertes **Python 3.10 oder neuer**. Auf diesen
  Plattformen benötigt die installierte `yt-dlp`-Binärdatei einen separaten Python-Interpreter,
  um zu laufen (der Windows-Build ist eigenständig, das gilt dort also nicht). Prüfen mit
  `python3 --version`; unter macOS bei Bedarf `brew install python3`.

## Installation

```bash
npm install
```

Falls die Binärdateien nicht heruntergeladen werden (Install-Skripte blockiert):

```bash
node node_modules/ffmpeg-static/install.js
node node_modules/youtube-dl-exec/scripts/postinstall.js
```

## Starten

```bash
npm start
```

Dann http://localhost:3000 öffnen

Umgebungsvariablen:

- `PORT`: Port, auf dem gelauscht wird (Standard `3000`).

## Bekannte Einschränkungen

| Plattform | Ohne Anmeldung |
|---|---|
| YouTube | Die meisten öffentlichen Videos. Blockiert: Altersbeschränkung, private Videos, gelegentliche Bot-Prüfung. |
| Facebook | Nur **öffentliche** Videos. Jeder private / Gruppen- / nur-für-Freunde-Inhalt erfordert Anmelde-Cookies. |
| Instagram | Öffentliche Reels und Beiträge funktionieren manchmal; Instagram verlangt oft auch für öffentliche Inhalte eine Anmeldung. Stories: Anmeldung **immer** erforderlich. |

## Rechtlicher Hinweis

Werkzeug für den persönlichen Gebrauch. Das Herunterladen von Inhalten Dritter kann
je nach Verwendung gegen die Nutzungsbedingungen der Plattformen und das
Urheberrecht verstoßen.
