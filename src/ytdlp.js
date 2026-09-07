// Enveloppe autour du binaire yt-dlp : sonde d'infos (JSON) et telechargement fichier.

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import { t, DEFAULT_LOCALE } from './i18n.js';

const require = createRequire(import.meta.url);
const youtubedl = require('youtube-dl-exec');
const ffmpegPath = require('ffmpeg-static');

export const YT_DLP_PATH = youtubedl.constants.YOUTUBE_DL_PATH;
export const FFMPEG_PATH = ffmpegPath;
export const DOWNLOAD_DIR = path.join(os.tmpdir(), 'vmd-downloads');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const COMMON_FLAGS = {
  noWarnings: true,
  noPlaylist: true,
  noCheckCertificates: true,
  userAgent: USER_AGENT,
};

export async function ensureDownloadDir() {
  await mkdir(DOWNLOAD_DIR, { recursive: true });
}

// Sonde une URL et renvoie les metadonnees + la liste des qualites proposees.
// `locale` ne sert qu'a traduire les libelles de qualite ("meilleure qualite", "audio seul").
export async function probe(url, locale = DEFAULT_LOCALE) {
  const info = await youtubedl(url, {
    ...COMMON_FLAGS,
    dumpSingleJson: true,
  });

  if (info._type === 'playlist' && Array.isArray(info.entries)) {
    const entry = info.entries.find((e) => e && e.formats);
    if (!entry) {
      throw Object.assign(new Error('no playable entry'), { stderr: 'no video could be found' });
    }
    return shapeInfo(entry, locale);
  }
  return shapeInfo(info, locale);
}

function shapeInfo(info, locale = DEFAULT_LOCALE) {
  const heights = new Set();
  for (const f of info.formats || []) {
    const hasVideo = f.vcodec && f.vcodec !== 'none';
    if (hasVideo && f.height) heights.add(f.height);
  }

  const sortedHeights = [...heights].sort((a, b) => b - a);
  const qualities = [];

  if (sortedHeights.length > 0) {
    for (const h of sortedHeights) {
      qualities.push({ id: `video-${h}`, kind: 'video', label: `MP4 ${labelForHeight(h)}`, height: h, ext: 'mp4' });
    }
  } else {
    qualities.push({ id: 'video-best', kind: 'video', label: t(locale, 'quality.videoBest'), height: null, ext: 'mp4' });
  }

  const hasAudio = (info.formats || []).some((f) => f.acodec && f.acodec !== 'none');
  if (hasAudio || sortedHeights.length > 0) {
    qualities.push({ id: 'audio-mp3', kind: 'audio', label: t(locale, 'quality.audioOnly'), height: null, ext: 'mp3' });
  }

  return {
    id: info.id,
    title: info.title || 'video',
    uploader: info.uploader || info.channel || info.uploader_id || null,
    durationSeconds: info.duration || null,
    thumbnail: info.thumbnail || null,
    isLive: Boolean(info.is_live),
    webpageUrl: info.webpage_url || null,
    extractor: info.extractor_key || info.extractor || null,
    qualities,
  };
}

function labelForHeight(h) {
  if (h >= 4320) return '8K';
  if (h >= 2160) return '4K';
  if (h >= 1440) return '1440p (2K)';
  if (h >= 1080) return '1080p';
  if (h >= 720) return '720p HD';
  if (h >= 480) return '480p';
  if (h >= 360) return '360p';
  if (h >= 240) return '240p';
  return `${h}p`;
}

function formatSelector(quality) {
  if (quality.kind === 'audio') return 'bestaudio/best';
  if (quality.height) {
    const h = quality.height;
    return (
      `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/` +
      `bestvideo[height<=${h}]+bestaudio/` +
      `best[height<=${h}]/best`
    );
  }
  return 'bestvideo*+bestaudio/best';
}

function sanitizeFilename(name) {
  return (
    String(name)
      .normalize('NFKD')
      .replace(/[^\w\s.-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120) || 'video'
  );
}

// Telecharge la video dans un fichier temporaire et renvoie son chemin.
// yt-dlp ecrit un vrai fichier (seekable) puis ffmpeg fusionne/convertit sans souci.
export function downloadToFile({ url, quality, title }) {
  const isAudio = quality.kind === 'audio';
  const ext = isAudio ? 'mp3' : 'mp4';
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const base = path.join(DOWNLOAD_DIR, token);

  const args = [
    '--no-warnings',
    '--no-playlist',
    '--no-check-certificates',
    '--no-part',
    '--user-agent',
    USER_AGENT,
    '--ffmpeg-location',
    FFMPEG_PATH,
    '--newline',
    '-f',
    formatSelector(quality),
    '-o',
    `${base}.%(ext)s`,
  ];

  if (isAudio) {
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
  } else {
    args.push('--merge-output-format', 'mp4');
  }

  args.push('--', url);

  return new Promise((resolve, reject) => {
    const child = spawn(YT_DLP_PATH, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    let stdout = '';

    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
      if (stderr.length > 64_000) stderr = stderr.slice(-64_000);
    });

    child.on('error', (err) => reject(Object.assign(err, { stderr: stderr || err.message })));

    child.on('close', async (code) => {
      if (code !== 0) {
        reject(Object.assign(new Error(`yt-dlp exited ${code}`), { stderr: stderr || stdout }));
        return;
      }
      try {
        const files = await readdir(DOWNLOAD_DIR);
        const match = files.find((f) => f.startsWith(token));
        if (!match) {
          reject(Object.assign(new Error('output file missing'), { stderr: stdout || 'aucun fichier produit' }));
          return;
        }
        resolve({
          path: path.join(DOWNLOAD_DIR, match),
          filename: `${sanitizeFilename(title)}.${ext}`,
          contentType: isAudio ? 'audio/mpeg' : 'video/mp4',
        });
      } catch (err) {
        reject(Object.assign(err, { stderr: err.message }));
      }
    });

    // Filet de securite : on ne laisse pas yt-dlp tourner indefiniment.
    const killTimer = setTimeout(() => child.kill('SIGKILL'), 10 * 60 * 1000);
    child.on('close', () => clearTimeout(killTimer));
  });
}
