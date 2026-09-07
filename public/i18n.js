// Internationalisation cote client : detection navigateur + selecteur + catalogue UI.
// Le choix est memorise dans localStorage ('vmd-lang') et prime sur la langue du navigateur.
// Langues non supportees -> repli sur l'anglais.

(function () {
  const SUPPORTED_LOCALES = ['fr', 'en', 'es', 'pt-BR', 'de', 'it'];
  const DEFAULT_LOCALE = 'en';
  const STORAGE_KEY = 'vmd-lang';
  const LOCALE_NAMES = {
    fr: 'Français',
    en: 'English',
    es: 'Español',
    'pt-BR': 'Português (Brasil)',
    de: 'Deutsch',
    it: 'Italiano',
  };

  const MESSAGES = {
    en: {
      docTitle: 'Video downloader — YouTube, Facebook, Instagram',
      headerTitle: 'Video downloader',
      headerSub:
        'Paste a <strong>YouTube</strong>, <strong>Facebook</strong> or <strong>Instagram</strong> ' +
        'link to grab it as MP4 or MP3.',
      analyze: 'Analyze',
      chooseFormat: 'Choose a format',
      footerNote:
        'Some videos (private, members-only, age-restricted, Instagram stories, non-public Facebook ' +
        'content) require sign-in and cannot be downloaded: the site tells you clearly when that happens.',
      footerFine: "Personal-use tool. Respect copyright and the platforms' terms of service.",
      langLabel: 'Language',
      analyzing: 'Analyzing',
      analyzeFailed: 'Analysis failed.',
      serverDown: 'Network error: the server is not responding.',
      workingAudio: 'Extracting audio and converting to MP3… (this may take a moment)',
      workingVideo: 'Preparing the video… (merging audio + video, this may take a moment)',
      downloadFailed: 'The download failed.',
      downloadDone: 'Done: {name} ({size})',
      downloadNetworkError: 'Network error during the download.',
      videoFallback: 'Video',
      unitB: 'B',
      unitKB: 'KB',
      unitMB: 'MB',
      unitGB: 'GB',
    },
    fr: {
      docTitle: 'Téléchargeur vidéo — YouTube, Facebook, Instagram',
      headerTitle: 'Téléchargeur vidéo',
      headerSub:
        'Colle un lien <strong>YouTube</strong>, <strong>Facebook</strong> ou <strong>Instagram</strong> ' +
        'pour le récupérer en MP4 ou MP3.',
      analyze: 'Analyser',
      chooseFormat: 'Choisis un format',
      footerNote:
        "Certaines vidéos (privées, réservées aux membres, limite d'âge, stories Instagram, contenus " +
        'Facebook non publics) exigent une connexion et ne peuvent pas être téléchargées : le site te le ' +
        'signale alors clairement.',
      footerFine: "Outil à usage personnel. Respecte le droit d'auteur et les conditions des plateformes.",
      langLabel: 'Langue',
      analyzing: 'Analyse en cours',
      analyzeFailed: 'Analyse impossible.',
      serverDown: 'Erreur réseau : le serveur ne répond pas.',
      workingAudio: "Extraction de l’audio et conversion en MP3… (cela peut prendre un moment)",
      workingVideo: 'Préparation de la vidéo… (fusion audio + vidéo, cela peut prendre un moment)',
      downloadFailed: 'Le téléchargement a échoué.',
      downloadDone: 'Terminé : {name} ({size})',
      downloadNetworkError: 'Erreur réseau pendant le téléchargement.',
      videoFallback: 'Vidéo',
      unitB: 'o',
      unitKB: 'Ko',
      unitMB: 'Mo',
      unitGB: 'Go',
    },
    es: {
      docTitle: 'Descargador de vídeos — YouTube, Facebook, Instagram',
      headerTitle: 'Descargador de vídeos',
      headerSub:
        'Pega un enlace de <strong>YouTube</strong>, <strong>Facebook</strong> o <strong>Instagram</strong> ' +
        'para descargarlo en MP4 o MP3.',
      analyze: 'Analizar',
      chooseFormat: 'Elige un formato',
      footerNote:
        'Algunos vídeos (privados, solo para miembros, con restricción de edad, historias de Instagram, ' +
        'contenido de Facebook no público) requieren iniciar sesión y no se pueden descargar: el sitio te ' +
        'lo indica claramente cuando ocurre.',
      footerFine: 'Herramienta de uso personal. Respeta los derechos de autor y las condiciones de las plataformas.',
      langLabel: 'Idioma',
      analyzing: 'Analizando',
      analyzeFailed: 'No se pudo analizar.',
      serverDown: 'Error de red: el servidor no responde.',
      workingAudio: 'Extrayendo el audio y convirtiendo a MP3… (esto puede tardar un momento)',
      workingVideo: 'Preparando el vídeo… (combinando audio + vídeo, esto puede tardar un momento)',
      downloadFailed: 'La descarga falló.',
      downloadDone: 'Listo: {name} ({size})',
      downloadNetworkError: 'Error de red durante la descarga.',
      videoFallback: 'Vídeo',
      unitB: 'B',
      unitKB: 'KB',
      unitMB: 'MB',
      unitGB: 'GB',
    },
    'pt-BR': {
      docTitle: 'Baixador de vídeos — YouTube, Facebook, Instagram',
      headerTitle: 'Baixador de vídeos',
      headerSub:
        'Cole um link do <strong>YouTube</strong>, <strong>Facebook</strong> ou <strong>Instagram</strong> ' +
        'para baixá-lo em MP4 ou MP3.',
      analyze: 'Analisar',
      chooseFormat: 'Escolha um formato',
      footerNote:
        'Alguns vídeos (privados, exclusivos para membros, com restrição de idade, stories do Instagram, ' +
        'conteúdo não público do Facebook) exigem login e não podem ser baixados: o site avisa claramente ' +
        'quando isso acontece.',
      footerFine: 'Ferramenta de uso pessoal. Respeite os direitos autorais e os termos das plataformas.',
      langLabel: 'Idioma',
      analyzing: 'Analisando',
      analyzeFailed: 'Não foi possível analisar.',
      serverDown: 'Erro de rede: o servidor não responde.',
      workingAudio: 'Extraindo o áudio e convertendo para MP3… (isso pode levar um momento)',
      workingVideo: 'Preparando o vídeo… (juntando áudio + vídeo, isso pode levar um momento)',
      downloadFailed: 'O download falhou.',
      downloadDone: 'Concluído: {name} ({size})',
      downloadNetworkError: 'Erro de rede durante o download.',
      videoFallback: 'Vídeo',
      unitB: 'B',
      unitKB: 'KB',
      unitMB: 'MB',
      unitGB: 'GB',
    },
    de: {
      docTitle: 'Video-Downloader — YouTube, Facebook, Instagram',
      headerTitle: 'Video-Downloader',
      headerSub:
        'Füge einen <strong>YouTube</strong>-, <strong>Facebook</strong>- oder <strong>Instagram</strong>-Link ' +
        'ein, um ihn als MP4 oder MP3 zu speichern.',
      analyze: 'Analysieren',
      chooseFormat: 'Wähle ein Format',
      footerNote:
        'Manche Videos (privat, nur für Mitglieder, Altersbeschränkung, Instagram-Stories, nicht öffentliche ' +
        'Facebook-Inhalte) erfordern eine Anmeldung und können nicht heruntergeladen werden: Die Seite weist ' +
        'dich dann deutlich darauf hin.',
      footerFine: 'Werkzeug für den persönlichen Gebrauch. Beachte das Urheberrecht und die Nutzungsbedingungen der Plattformen.',
      langLabel: 'Sprache',
      analyzing: 'Analyse läuft',
      analyzeFailed: 'Analyse fehlgeschlagen.',
      serverDown: 'Netzwerkfehler: Der Server antwortet nicht.',
      workingAudio: 'Audio wird extrahiert und in MP3 umgewandelt… (das kann einen Moment dauern)',
      workingVideo: 'Video wird vorbereitet… (Audio + Video werden zusammengeführt, das kann einen Moment dauern)',
      downloadFailed: 'Der Download ist fehlgeschlagen.',
      downloadDone: 'Fertig: {name} ({size})',
      downloadNetworkError: 'Netzwerkfehler während des Downloads.',
      videoFallback: 'Video',
      unitB: 'B',
      unitKB: 'KB',
      unitMB: 'MB',
      unitGB: 'GB',
    },
    it: {
      docTitle: 'Downloader di video — YouTube, Facebook, Instagram',
      headerTitle: 'Downloader di video',
      headerSub:
        'Incolla un link di <strong>YouTube</strong>, <strong>Facebook</strong> o <strong>Instagram</strong> ' +
        'per scaricarlo in MP4 o MP3.',
      analyze: 'Analizza',
      chooseFormat: 'Scegli un formato',
      footerNote:
        "Alcuni video (privati, riservati ai membri, con limite di età, storie di Instagram, contenuti " +
        "Facebook non pubblici) richiedono l'accesso e non possono essere scaricati: il sito te lo segnala " +
        'chiaramente quando accade.',
      footerFine: "Strumento per uso personale. Rispetta il diritto d'autore e le condizioni delle piattaforme.",
      langLabel: 'Lingua',
      analyzing: 'Analisi in corso',
      analyzeFailed: 'Analisi non riuscita.',
      serverDown: 'Errore di rete: il server non risponde.',
      workingAudio: 'Estrazione dell’audio e conversione in MP3… (può richiedere un momento)',
      workingVideo: 'Preparazione del video… (unione di audio + video, può richiedere un momento)',
      downloadFailed: 'Il download non è riuscito.',
      downloadDone: 'Completato: {name} ({size})',
      downloadNetworkError: 'Errore di rete durante il download.',
      videoFallback: 'Video',
      unitB: 'B',
      unitKB: 'KB',
      unitMB: 'MB',
      unitGB: 'GB',
    },
  };

  function normalizeLocale(tag) {
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

  function detectLocale() {
    try {
      const saved = normalizeLocale(localStorage.getItem(STORAGE_KEY));
      if (saved) return saved;
    } catch (e) {
      /* localStorage indisponible */
    }
    const cands =
      navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (const c of cands) {
      const m = normalizeLocale(c);
      if (m) return m;
    }
    return DEFAULT_LOCALE;
  }

  let current = detectLocale();
  const listeners = [];

  function t(key, params) {
    const str =
      (MESSAGES[current] && MESSAGES[current][key]) ??
      (MESSAGES[DEFAULT_LOCALE] && MESSAGES[DEFAULT_LOCALE][key]);
    if (str == null) return key;
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? String(params[k]) : m));
  }

  function getLocale() {
    return current;
  }

  function setLocale(loc) {
    const next = normalizeLocale(loc) || DEFAULT_LOCALE;
    current = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* ignore */
    }
    document.documentElement.lang = next;
    applyStatic();
    for (const fn of listeners) {
      try {
        fn(next);
      } catch (e) {
        /* ignore */
      }
    }
  }

  function onChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  // Traduit les noeuds marques : [data-i18n] -> textContent, [data-i18n-html] -> innerHTML,
  // [data-i18n-attr="attr:key,attr2:key2"] -> setAttribute.
  function applyStatic(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.getAttribute('data-i18n-attr')
        .split(',')
        .forEach((pair) => {
          const idx = pair.indexOf(':');
          if (idx === -1) return;
          const attr = pair.slice(0, idx).trim();
          const key = pair.slice(idx + 1).trim();
          if (attr && key) el.setAttribute(attr, t(key));
        });
    });
  }

  document.documentElement.lang = current;

  window.i18n = {
    SUPPORTED_LOCALES,
    DEFAULT_LOCALE,
    LOCALE_NAMES,
    normalizeLocale,
    detectLocale,
    t,
    getLocale,
    setLocale,
    onChange,
    applyStatic,
  };
})();
