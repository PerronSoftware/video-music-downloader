import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, createReadStream, statSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { execFile } from 'node:child_process';

import { detectPlatform, explainError } from './src/platforms.js';
import { probe, downloadToFile, ensureDownloadDir, YT_DLP_PATH, FFMPEG_PATH } from './src/ytdlp.js';
import { resolveLocale, t } from './src/i18n.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Analyse d'une URL : renvoie metadonnees + qualites disponibles ---
app.post('/api/info', async (req, res) => {
  const locale = resolveLocale({ explicit: req.body?.lang, acceptLanguage: req.headers['accept-language'] });
  const url = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
  if (!url) {
    return res.status(400).json({ error: { code: 'input', message: t(locale, 'info.empty') } });
  }

  const platform = detectPlatform(url);
  if (!platform) {
    return res.status(400).json({
      error: { code: 'platform', message: t(locale, 'platform.unsupported') },
    });
  }

  try {
    const info = await probe(url, locale);

    if (info.isLive) {
      return res.status(422).json({
        error: { code: 'live', message: t(locale, 'live') },
      });
    }

    res.json({ platform, info });
  } catch (err) {
    const detail = err?.stderr || err?.message || '';
    const explained = explainError(detail, platform.label, locale);
    console.error(`[info] ${platform.id} echec:`, detail.split('\n').slice(0, 3).join(' | '));
    res.status(422).json({ platform, error: explained });
  }
});

// --- Telechargement : yt-dlp produit un fichier temporaire, on le streame puis on l'efface ---
app.get('/api/download', async (req, res) => {
  const locale = resolveLocale({ explicit: req.query.lang, acceptLanguage: req.headers['accept-language'] });
  const url = typeof req.query.url === 'string' ? req.query.url.trim() : '';
  const qualityId = typeof req.query.quality === 'string' ? req.query.quality : '';
  const title = typeof req.query.title === 'string' ? req.query.title : 'video';

  const platform = detectPlatform(url);
  if (!url || !platform) {
    return res.status(400).json({ error: { code: 'platform', message: t(locale, 'download.badLink') } });
  }

  const quality = parseQualityId(qualityId);
  if (!quality) {
    return res.status(400).json({ error: { code: 'quality', message: t(locale, 'download.badQuality') } });
  }

  let filePath = null;
  try {
    const result = await downloadToFile({ url, quality, title });
    filePath = result.path;

    const { size } = statSync(filePath);
    res.status(200);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Length', size);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${asciiFilename(result.filename)}"; filename*=UTF-8''${encodeURIComponent(result.filename)}`,
    );

    const stream = createReadStream(filePath);
    stream.on('error', (err) => {
      console.error('[download] read error:', err.message);
      res.destroy(err);
    });
    const cleanup = () => {
      if (!filePath) return;
      const p = filePath;
      filePath = null;
      unlink(p).catch(() => {});
    };
    stream.on('close', cleanup);
    res.on('close', () => stream.destroy());

    stream.pipe(res);
  } catch (err) {
    const detail = err?.stderr || err?.message || '';
    const explained = explainError(detail, platform.label, locale);
    console.error(`[download] ${platform.id} echec:`, detail.split('\n').slice(-4).join(' | ').slice(0, 400));
    if (filePath) unlink(filePath).catch(() => {});
    if (!res.headersSent) res.status(422).json({ platform, error: explained });
    else res.destroy(err);
  }
});

function parseQualityId(id) {
  if (id === 'audio-mp3') return { kind: 'audio', height: null };
  if (id === 'video-best') return { kind: 'video', height: null };
  const m = /^video-(\d{2,4})$/.exec(id);
  if (m) return { kind: 'video', height: Number(m[1]) };
  return null;
}

function asciiFilename(name) {
  return name.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
}

// --- Verification des binaires au demarrage ---
function checkBinary(label, bin, args) {
  return new Promise((resolve) => {
    if (!existsSync(bin)) {
      console.warn(`  ! ${label} introuvable : ${bin}`);
      return resolve(false);
    }
    execFile(bin, args, (err, stdout) => {
      if (err) {
        console.warn(`  ! ${label} present mais ne repond pas : ${err.message}`);
        resolve(false);
      } else {
        console.log(`  - ${label} : ${String(stdout).trim().split('\n')[0]}`);
        resolve(true);
      }
    });
  });
}

app.listen(PORT, async () => {
  await ensureDownloadDir();
  console.log(`\nvideos-music-downloader`);
  console.log(`  http://localhost:${PORT}\n`);
  await checkBinary('yt-dlp', YT_DLP_PATH, ['--version']);
  await checkBinary('ffmpeg', FFMPEG_PATH, ['-version']);
  console.log('');
});
