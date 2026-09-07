// Detection de plateforme a partir d'une URL + messages d'erreur lisibles.

import { t, DEFAULT_LOCALE } from './i18n.js';

const PLATFORM_PATTERNS = [
  {
    id: 'youtube',
    label: 'YouTube',
    hosts: [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'music.youtube.com',
      'youtu.be',
      'youtube-nocookie.com',
    ],
  },
  {
    id: 'facebook',
    label: 'Facebook',
    hosts: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'web.facebook.com', 'fb.watch', 'fb.com'],
  },
  {
    id: 'instagram',
    label: 'Instagram',
    hosts: ['instagram.com', 'www.instagram.com', 'instagr.am'],
  },
];

export function detectPlatform(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  for (const platform of PLATFORM_PATTERNS) {
    if (platform.hosts.some((h) => h.replace(/^www\./, '') === host)) {
      return { id: platform.id, label: platform.label };
    }
  }
  return null;
}

// Traduit un stderr brut de yt-dlp en message clair pour l'utilisateur, dans `locale`.
// Retourne { code, message } ; code sert au front pour styliser (ex: "auth").
export function explainError(stderr = '', platformLabel, locale = DEFAULT_LOCALE) {
  const text = String(stderr).toLowerCase();
  const platform = platformLabel || t(locale, 'genericSite');

  const authNeedle = [
    'sign in to confirm your age',
    'sign in to confirm you',
    "confirm you're not a bot",
    'confirm you are not a bot',
    'login required',
    'log in',
    'requires authentication',
    'you need to log in',
    'private video',
    'this video is private',
    'private account',
    'this post is private',
    'account is private',
    'restricted video',
    'members-only',
    'this content isn',
    'requested content is not available',
    'use --cookies',
    'cookies',
    'rate-limit reached',
    'login_required',
    'empty media response',
  ];
  if (authNeedle.some((n) => text.includes(n))) {
    return { code: 'auth', message: t(locale, 'error.auth', { platform }) };
  }

  if (text.includes('is not available in your country') || text.includes('geo') || text.includes('blocked in your country')) {
    return { code: 'geo', message: t(locale, 'error.geo') };
  }

  if (
    text.includes('video unavailable') ||
    text.includes('this video is unavailable') ||
    text.includes('content is no longer available') ||
    text.includes('removed') ||
    text.includes('has been terminated') ||
    text.includes('404')
  ) {
    return { code: 'unavailable', message: t(locale, 'error.unavailable') };
  }

  if (text.includes('unsupported url') || text.includes('no video could be found') || text.includes('unable to extract')) {
    return { code: 'unsupported', message: t(locale, 'error.unsupported', { platform }) };
  }

  if (text.includes('timed out') || text.includes('timeout') || text.includes('network')) {
    return { code: 'network', message: t(locale, 'error.network', { platform }) };
  }

  // Repli : on renvoie une version courte du vrai message pour le debug.
  const firstLine = String(stderr).split('\n').find((l) => l.trim() && !l.startsWith('[')) || String(stderr).split('\n')[0] || '';
  return { code: 'unknown', message: t(locale, 'error.unknown', { detail: firstLine.trim().slice(0, 300) }) };
}
