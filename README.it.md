# video-music-downloader

[English](README.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [Deutsch](README.de.md) · **Italiano**

App web semplice (Node.js + Express) per scaricare video di **YouTube**, **Facebook**
e **Instagram** in **MP4** o **MP3**.

- Incolla un link, il sito analizza il video e mostra le qualità disponibili.
- YouTube: scelta della risoluzione (fino alla migliore disponibile) + opzione MP3.
- Facebook / Instagram: download in MP4 (migliore qualità) + opzione MP3.
- Se il video richiede l'accesso (contenuto privato, riservato ai membri, con
  limite di età, verifica anti-bot, storia di Instagram, video di Facebook non
  pubblico), il sito lo segnala chiaramente invece di bloccarsi.

## Lingue

L'interfaccia è disponibile in **francese, inglese, spagnolo, portoghese
brasiliano, tedesco e italiano**. Alla prima visita l'app segue la lingua del
browser; se non è supportata, torna all'**inglese**. Un selettore di lingua in
cima alla pagina permette di forzare la scelta, che viene poi memorizzata (nel
`localStorage`).

## Come funziona

- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) si occupa dell'estrazione e del download.
  Il binario viene installato automaticamente dalla dipendenza `youtube-dl-exec`.
- [`ffmpeg`](https://ffmpeg.org/) unisce audio + video e converte in MP3.
  Il binario proviene dalla dipendenza `ffmpeg-static` (nessuna installazione di sistema necessaria).
- Il server non memorizza nulla in modo permanente: `yt-dlp` scrive un file
  temporaneo, il server lo trasmette al browser e lo elimina al termine del trasferimento.

## Requisiti

- Node.js 18 o successivo.
- **Solo macOS / Linux:** un **Python 3.10 o successivo** installato nel sistema. Su queste
  piattaforme, il binario `yt-dlp` installato richiede un interprete Python separato per
  funzionare (la build Windows è autonoma, quindi lì non si applica). Verifica con
  `python3 --version`; su macOS, `brew install python3` se troppo vecchio.

## Installazione

```bash
npm install
```

Se i binari non vengono scaricati (script di installazione bloccati):

```bash
node node_modules/ffmpeg-static/install.js
node node_modules/youtube-dl-exec/scripts/postinstall.js
```

## Avvio

```bash
npm start
```

Poi apri http://localhost:3000

Variabili d'ambiente:

- `PORT`: porta di ascolto (predefinita `3000`).

## Limitazioni note

| Piattaforma | Senza accesso |
|---|---|
| YouTube | La maggior parte dei video pubblici. Bloccato: limite di età, video privati, verifica anti-bot occasionale. |
| Facebook | Solo video **pubblici**. Qualsiasi contenuto privato / di gruppo / riservato agli amici richiede i cookie di accesso. |
| Instagram | I reel e i post pubblici a volte funzionano; Instagram richiede spesso l'accesso anche per i contenuti pubblici. Storie: accesso **sempre** obbligatorio. |

## Nota legale

Strumento destinato a un uso personale. Scaricare contenuti di terzi può violare le
condizioni d'uso delle piattaforme e la normativa sul diritto d'autore a seconda
dell'uso che se ne fa.
