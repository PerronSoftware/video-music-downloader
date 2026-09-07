// Internationalisation cote serveur : resolution de langue + catalogue de messages.
// Le catalogue cote client vit dans public/i18n.js (memes langues, cles differentes).

export const SUPPORTED_LOCALES = ['fr', 'en', 'es', 'pt-BR', 'de', 'it'];
export const DEFAULT_LOCALE = 'en';

// Ramene une etiquette de langue quelconque ('EN-us', 'pt', 'pt_BR', ...) vers une
// locale supportee, ou null si rien ne correspond.
export function normalizeLocale(tag) {
  if (!tag || typeof tag !== 'string') return null;
  const clean = tag.trim().toLowerCase().replace('_', '-');
  if (!clean) return null;
  for (const loc of SUPPORTED_LOCALES) {
    if (loc.toLowerCase() === clean) return loc;
  }
  const primary = clean.split('-')[0];
  for (const loc of SUPPORTED_LOCALES) {
    if (loc.toLowerCase().split('-')[0] === primary) return loc;
  }
  return null;
}

// Parse un en-tete Accept-Language en liste d'etiquettes triees par qualite decroissante.
export function parseAcceptLanguage(header) {
  if (!header || typeof header !== 'string') return [];
  return header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      let q = 1;
      for (const p of params) {
        const m = /q=([0-9.]+)/.exec(p.trim());
        if (m) q = Number.parseFloat(m[1]);
      }
      return { tag: (tag || '').trim(), q: Number.isFinite(q) ? q : 1 };
    })
    .filter((x) => x.tag && x.tag !== '*')
    .sort((a, b) => b.q - a.q)
    .map((x) => x.tag);
}

// Ordre de priorite : choix explicite (param `lang`) > Accept-Language > DEFAULT_LOCALE.
export function resolveLocale({ explicit, acceptLanguage } = {}) {
  const fromExplicit = normalizeLocale(explicit);
  if (fromExplicit) return fromExplicit;
  for (const tag of parseAcceptLanguage(acceptLanguage)) {
    const match = normalizeLocale(tag);
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}

const MESSAGES = {
  en: {
    genericSite: 'The site',
    info: { empty: 'Paste a video link.' },
    platform: { unsupported: 'Unrecognized link. Only YouTube, Facebook and Instagram are supported.' },
    live: 'This video is a live stream in progress and cannot be downloaded.',
    download: { badLink: 'Invalid or unsupported link.', badQuality: 'Requested quality is invalid.' },
    error: {
      auth:
        "{platform} requires you to sign in to view this video (private content, members-only, " +
        'age-restricted, or a bot check). It cannot be downloaded without being logged in.',
      geo: "This video is blocked in the server's region.",
      unavailable: 'This video no longer exists or has been removed.',
      unsupported:
        "Could not extract a video from this link. Make sure it points to a public {platform} " +
        'video (not a profile, a story or a feed).',
      network: 'Network problem while contacting {platform}. Try again in a moment.',
      unknown: 'The download failed. Technical detail: {detail}',
    },
    quality: { videoBest: 'MP4 (best quality)', audioOnly: 'MP3 (audio only)' },
  },
  fr: {
    genericSite: 'Le site',
    info: { empty: 'Colle un lien de vidéo.' },
    platform: { unsupported: 'Lien non reconnu. Seuls YouTube, Facebook et Instagram sont pris en charge.' },
    live: 'Cette vidéo est un direct en cours : elle ne peut pas être téléchargée.',
    download: { badLink: 'Lien invalide ou non pris en charge.', badQuality: 'Qualité demandée invalide.' },
    error: {
      auth:
        "{platform} exige une connexion pour accéder à cette vidéo (contenu privé, réservé aux " +
        "membres, limite d'âge, ou vérification anti-robot). Elle ne peut pas être téléchargée sans " +
        'être connecté.',
      geo: 'Cette vidéo est bloquée dans la région du serveur.',
      unavailable: "Cette vidéo n'existe plus ou a été supprimée.",
      unsupported:
        "Impossible d'extraire une vidéo depuis ce lien. Vérifie qu'il pointe bien vers une vidéo " +
        '{platform} publique (et pas un profil, une story ou un flux).',
      network: 'Problème réseau en contactant {platform}. Réessaie dans un instant.',
      unknown: 'Le téléchargement a échoué. Détail technique : {detail}',
    },
    quality: { videoBest: 'MP4 (meilleure qualité)', audioOnly: 'MP3 (audio seul)' },
  },
  es: {
    genericSite: 'El sitio',
    info: { empty: 'Pega un enlace de vídeo.' },
    platform: { unsupported: 'Enlace no reconocido. Solo se admiten YouTube, Facebook e Instagram.' },
    live: 'Este vídeo es una transmisión en directo en curso y no se puede descargar.',
    download: { badLink: 'Enlace no válido o no admitido.', badQuality: 'La calidad solicitada no es válida.' },
    error: {
      auth:
        '{platform} exige iniciar sesión para ver este vídeo (contenido privado, solo para miembros, ' +
        'restringido por edad o verificación anti-robot). No se puede descargar sin haber iniciado sesión.',
      geo: 'Este vídeo está bloqueado en la región del servidor.',
      unavailable: 'Este vídeo ya no existe o ha sido eliminado.',
      unsupported:
        'No se pudo extraer ningún vídeo de este enlace. Asegúrate de que apunte a un vídeo público ' +
        'de {platform} (y no a un perfil, una historia o un feed).',
      network: 'Problema de red al contactar con {platform}. Vuelve a intentarlo en un momento.',
      unknown: 'La descarga falló. Detalle técnico: {detail}',
    },
    quality: { videoBest: 'MP4 (mejor calidad)', audioOnly: 'MP3 (solo audio)' },
  },
  'pt-BR': {
    genericSite: 'O site',
    info: { empty: 'Cole um link de vídeo.' },
    platform: { unsupported: 'Link não reconhecido. Apenas YouTube, Facebook e Instagram são suportados.' },
    live: 'Este vídeo é uma transmissão ao vivo em andamento e não pode ser baixado.',
    download: { badLink: 'Link inválido ou não suportado.', badQuality: 'A qualidade solicitada é inválida.' },
    error: {
      auth:
        'O {platform} exige login para ver este vídeo (conteúdo privado, exclusivo para membros, ' +
        'com restrição de idade ou verificação anti-robô). Não é possível baixá-lo sem estar conectado.',
      geo: 'Este vídeo está bloqueado na região do servidor.',
      unavailable: 'Este vídeo não existe mais ou foi removido.',
      unsupported:
        'Não foi possível extrair um vídeo deste link. Verifique se ele aponta para um vídeo público ' +
        'do {platform} (e não para um perfil, um story ou um feed).',
      network: 'Problema de rede ao contatar o {platform}. Tente novamente em instantes.',
      unknown: 'O download falhou. Detalhe técnico: {detail}',
    },
    quality: { videoBest: 'MP4 (melhor qualidade)', audioOnly: 'MP3 (somente áudio)' },
  },
  de: {
    genericSite: 'Die Seite',
    info: { empty: 'Füge einen Video-Link ein.' },
    platform: { unsupported: 'Link nicht erkannt. Es werden nur YouTube, Facebook und Instagram unterstützt.' },
    live: 'Dieses Video ist ein laufender Livestream und kann nicht heruntergeladen werden.',
    download: { badLink: 'Ungültiger oder nicht unterstützter Link.', badQuality: 'Angeforderte Qualität ist ungültig.' },
    error: {
      auth:
        '{platform} erfordert eine Anmeldung, um dieses Video anzusehen (privater Inhalt, nur für ' +
        'Mitglieder, Altersbeschränkung oder Bot-Prüfung). Es kann nicht ohne Anmeldung heruntergeladen werden.',
      geo: 'Dieses Video ist in der Region des Servers gesperrt.',
      unavailable: 'Dieses Video existiert nicht mehr oder wurde entfernt.',
      unsupported:
        'Aus diesem Link konnte kein Video extrahiert werden. Stelle sicher, dass er auf ein ' +
        'öffentliches {platform}-Video verweist (kein Profil, keine Story, kein Feed).',
      network: 'Netzwerkproblem beim Kontaktieren von {platform}. Versuche es gleich noch einmal.',
      unknown: 'Der Download ist fehlgeschlagen. Technisches Detail: {detail}',
    },
    quality: { videoBest: 'MP4 (beste Qualität)', audioOnly: 'MP3 (nur Audio)' },
  },
  it: {
    genericSite: 'Il sito',
    info: { empty: 'Incolla un link di un video.' },
    platform: { unsupported: 'Link non riconosciuto. Sono supportati solo YouTube, Facebook e Instagram.' },
    live: 'Questo video è una diretta in corso e non può essere scaricato.',
    download: { badLink: 'Link non valido o non supportato.', badQuality: 'La qualità richiesta non è valida.' },
    error: {
      auth:
        "{platform} richiede l'accesso per vedere questo video (contenuto privato, riservato ai " +
        "membri, con limite di età o verifica anti-bot). Non può essere scaricato senza aver effettuato l'accesso.",
      geo: 'Questo video è bloccato nella regione del server.',
      unavailable: 'Questo video non esiste più o è stato rimosso.',
      unsupported:
        'Impossibile estrarre un video da questo link. Verifica che punti a un video pubblico di ' +
        '{platform} (e non a un profilo, una storia o un feed).',
      network: 'Problema di rete durante il contatto con {platform}. Riprova tra un momento.',
      unknown: 'Il download non è riuscito. Dettaglio tecnico: {detail}',
    },
    quality: { videoBest: 'MP4 (migliore qualità)', audioOnly: 'MP3 (solo audio)' },
  },
};

// Recupere une chaine traduite par cle pointee ('error.auth'), avec repli sur l'anglais
// puis sur la cle brute, et interpole les {jetons} depuis params.
export function t(locale, key, params = {}) {
  const loc = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const pick = (l) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), MESSAGES[l]);
  let str = pick(loc);
  if (str == null) str = pick(DEFAULT_LOCALE);
  if (str == null) return key;
  return str.replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? String(params[k]) : m));
}
