const form = document.getElementById('form');
const urlInput = document.getElementById('url');
const analyzeBtn = document.getElementById('analyze');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const thumbEl = document.getElementById('thumb');
const badgeEl = document.getElementById('badge');
const titleEl = document.getElementById('title');
const detailsEl = document.getElementById('details');
const qualitiesEl = document.getElementById('qualities');
const dlNote = document.getElementById('dlNote');
const langSel = document.getElementById('lang');

let current = null; // { url, info, platform }

// --- Selecteur de langue ---
i18n.applyStatic();
for (const loc of i18n.SUPPORTED_LOCALES) {
  const opt = document.createElement('option');
  opt.value = loc;
  opt.textContent = i18n.LOCALE_NAMES[loc] || loc;
  langSel.appendChild(opt);
}
langSel.value = i18n.getLocale();
langSel.addEventListener('change', () => i18n.setLocale(langSel.value));

// Quand la langue change, on ré-interroge le serveur pour obtenir les libellés
// de qualité dans la nouvelle langue (ils sont générés côté serveur).
i18n.onChange((loc) => {
  langSel.value = loc;
  if (current && urlInput.value.trim()) form.requestSubmit();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return;

  setStatus(i18n.t('analyzing'), 'loading');
  resultEl.hidden = true;
  dlNote.hidden = true;
  analyzeBtn.disabled = true;

  try {
    const res = await fetch('/api/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, lang: i18n.getLocale() }),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      const code = data.error?.code;
      setStatus(data.error?.message || i18n.t('analyzeFailed'), code === 'auth' || code === 'live' ? 'auth' : 'error');
      return;
    }

    current = { url, info: data.info, platform: data.platform };
    renderResult(data.platform, data.info);
    clearStatus();
  } catch (err) {
    setStatus(i18n.t('serverDown'), 'error');
  } finally {
    analyzeBtn.disabled = false;
  }
});

function renderResult(platform, info) {
  badgeEl.textContent = platform.label;
  badgeEl.className = 'badge ' + platform.id;

  titleEl.textContent = info.title || i18n.t('videoFallback');

  const bits = [];
  if (info.uploader) bits.push(info.uploader);
  if (info.durationSeconds) bits.push(formatDuration(info.durationSeconds));
  detailsEl.textContent = bits.join('  ·  ');

  if (info.thumbnail) {
    thumbEl.src = info.thumbnail;
    thumbEl.hidden = false;
  } else {
    thumbEl.hidden = true;
  }

  qualitiesEl.innerHTML = '';
  for (const q of info.qualities) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = q.label;
    if (q.kind === 'audio') b.classList.add('audio');
    b.addEventListener('click', () => startDownload(q, b));
    qualitiesEl.appendChild(b);
  }

  resultEl.hidden = false;
}

async function startDownload(quality, btn) {
  const buttons = qualitiesEl.querySelectorAll('button');
  buttons.forEach((b) => (b.disabled = true));
  dlNote.hidden = false;
  dlNote.className = 'dl-note working';
  dlNote.textContent = quality.kind === 'audio' ? i18n.t('workingAudio') : i18n.t('workingVideo');

  const params = new URLSearchParams({
    url: current.url,
    quality: quality.id,
    title: current.info.title || 'video',
    lang: i18n.getLocale(),
  });

  try {
    const res = await fetch('/api/download?' + params.toString());
    const ct = res.headers.get('Content-Type') || '';

    if (!res.ok || ct.includes('application/json')) {
      let msg = i18n.t('downloadFailed');
      try {
        const data = await res.json();
        msg = data.error?.message || msg;
      } catch {}
      dlNote.className = 'dl-note error';
      dlNote.textContent = msg;
      return;
    }

    const blob = await res.blob();
    const filename = filenameFromDisposition(res.headers.get('Content-Disposition')) ||
      `${sanitize(current.info.title)}.${quality.kind === 'audio' ? 'mp3' : 'mp4'}`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 30_000);

    dlNote.className = 'dl-note';
    dlNote.textContent = i18n.t('downloadDone', { name: filename, size: formatBytes(blob.size) });
  } catch (err) {
    dlNote.className = 'dl-note error';
    dlNote.textContent = i18n.t('downloadNetworkError');
  } finally {
    buttons.forEach((b) => (b.disabled = false));
  }
}

function setStatus(msg, kind) {
  statusEl.hidden = false;
  statusEl.textContent = msg;
  statusEl.className = 'status' + (kind ? ' ' + kind : '');
}
function clearStatus() {
  statusEl.hidden = true;
  statusEl.textContent = '';
  statusEl.className = 'status';
}

function formatDuration(s) {
  s = Math.round(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

function formatBytes(n) {
  if (n < 1024) return n + ' ' + i18n.t('unitB');
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' ' + i18n.t('unitKB');
  if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + ' ' + i18n.t('unitMB');
  return (n / (1024 * 1024 * 1024)).toFixed(2) + ' ' + i18n.t('unitGB');
}

function sanitize(name) {
  return (name || 'video').replace(/[^\w\s.-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120) || 'video';
}

function filenameFromDisposition(header) {
  if (!header) return null;
  const star = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1]);
    } catch {}
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1] : null;
}
