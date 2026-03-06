// ============================================================
// SAVEIT.PRO – Tool Page Logic
// ============================================================

// ── Theme ────────────────────────────────────────────────
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });
}

// ── Elements ──────────────────────────────────────────────
const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadBtn');
const loader = document.getElementById('loader');
const resultBox = document.getElementById('resultBox');
const errorBox = document.getElementById('errorBox');
const errorMsg = document.getElementById('errorMsg');
const videoPreview = document.getElementById('videoPreview');
const downloadOptions = document.getElementById('downloadOptions');
const TOOL_CONFIG = window.TOOL_CONFIG || {};

// ── API KEY – Apni nai key yahan daalo ───────────────────
const RAPID_API_KEY = 'ccb5cec02emshc725046d9580c92p17a803jsn281809f4ec04';

// ── Helpers ───────────────────────────────────────────────
function showError(msg) {
  if (errorBox) { errorBox.classList.add('show'); if (errorMsg) errorMsg.textContent = msg; }
  if (loader) loader.classList.remove('show');
  if (resultBox) resultBox.classList.remove('show');
}
function hideError() { errorBox?.classList.remove('show'); }
function isValidUrl(url) { try { new URL(url); return true; } catch { return false; } }
function isPlatformUrl(url) {
  if (!TOOL_CONFIG.domains) return true;
  return TOOL_CONFIG.domains.some(d => url.includes(d));
}
function extractYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}

// ── API Call ──────────────────────────────────────────────
async function fetchDownloadLinks(url) {

  // Instagram Reels & Photos & Stories
  if (TOOL_CONFIG.platformName === 'Instagram') {
    const res = await fetch(
      `https://instagram-downloader9.p.rapidapi.com/reels?url=${encodeURIComponent(url)}`,
      { headers: { 'x-rapidapi-key': RAPID_API_KEY, 'x-rapidapi-host': 'instagram-downloader9.p.rapidapi.com' } }
    );
    if (!res.ok) throw new Error(`API Error ${res.status}: Key sahi hai? RapidAPI pe check karo.`);
    const data = await res.json();
    return {
      success: true,
      title: data.title || 'Instagram Content',
      thumbnail: data.thumbnail || data.thumb || '',
      duration: data.duration || '',
      formats: [{ label: '⬇️ Download HD (No Watermark)', url: data.video_url || data.url || data.download_url || '#', quality: 'HD' }]
    };
  }

  // TikTok
  if (TOOL_CONFIG.platformName === 'TikTok') {
    const res = await fetch(
      `https://tiktok-video-no-watermark2.p.rapidapi.com/?url=${encodeURIComponent(url)}&hd=1`,
      { headers: { 'x-rapidapi-key': RAPID_API_KEY, 'x-rapidapi-host': 'tiktok-video-no-watermark2.p.rapidapi.com' } }
    );
    if (!res.ok) throw new Error(`API Error ${res.status}`);
    const data = await res.json();
    return {
      success: true,
      title: data.data?.title || 'TikTok Video',
      thumbnail: data.data?.cover || '',
      duration: '',
      formats: [
        { label: '⬇️ Download HD (No Watermark)', url: data.data?.hdplay || data.data?.play || '#', quality: 'HD' },
        { label: '⬇️ Download SD (No Watermark)', url: data.data?.play || '#', quality: 'SD' },
      ]
    };
  }

  // YouTube Video & MP3
  if (TOOL_CONFIG.platformName === 'YouTube' || TOOL_CONFIG.platformName === 'YouTube MP3') {
    const ytId = extractYouTubeId(url);
    if (!ytId) throw new Error('Valid YouTube URL nahi hai.');
    const res = await fetch(
      `https://youtube-mp36.p.rapidapi.com/dl?id=${ytId}`,
      { headers: { 'x-rapidapi-key': RAPID_API_KEY, 'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com' } }
    );
    if (!res.ok) throw new Error(`API Error ${res.status}`);
    const data = await res.json();
    const isMP3 = TOOL_CONFIG.platformName === 'YouTube MP3';
    return {
      success: true,
      title: data.title || 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      duration: '',
      formats: [{ label: isMP3 ? '⬇️ Download MP3 Audio' : '⬇️ Download MP4 Video', url: data.link || '#', quality: isMP3 ? 'MP3' : 'HD' }]
    };
  }

  // Facebook
  if (TOOL_CONFIG.platformName === 'Facebook') {
    const res = await fetch(
      `https://facebook-video-downloader6.p.rapidapi.com/app?url=${encodeURIComponent(url)}`,
      { headers: { 'x-rapidapi-key': RAPID_API_KEY, 'x-rapidapi-host': 'facebook-video-downloader6.p.rapidapi.com' } }
    );
    if (!res.ok) throw new Error(`API Error ${res.status}`);
    const data = await res.json();
    return {
      success: true,
      title: data.title || 'Facebook Video',
      thumbnail: data.thumbnail || '',
      duration: data.duration || '',
      formats: [
        { label: '⬇️ Download HD', url: data.hd || data.sd || '#', quality: 'HD' },
        { label: '⬇️ Download SD', url: data.sd || '#', quality: 'SD' },
      ]
    };
  }

  // Twitter / X
  if (TOOL_CONFIG.platformName === 'Twitter') {
    const res = await fetch(
      `https://twitter-video-downloader14.p.rapidapi.com/twitter?url=${encodeURIComponent(url)}`,
      { headers: { 'x-rapidapi-key': RAPID_API_KEY, 'x-rapidapi-host': 'twitter-video-downloader14.p.rapidapi.com' } }
    );
    if (!res.ok) throw new Error(`API Error ${res.status}`);
    const data = await res.json();
    const formats = (data.videos || []).map(v => ({ label: `⬇️ Download ${v.quality || 'Video'}`, url: v.url || '#', quality: v.quality }));
    return {
      success: true,
      title: data.title || 'Twitter Video',
      thumbnail: data.thumbnail || '',
      duration: '',
      formats: formats.length ? formats : [{ label: '⬇️ Download Video', url: data.url || '#' }]
    };
  }

  // Pinterest
  if (TOOL_CONFIG.platformName === 'Pinterest') {
    const res = await fetch(
      `https://pinterest-video-downloader4.p.rapidapi.com/?url=${encodeURIComponent(url)}`,
      { headers: { 'x-rapidapi-key': RAPID_API_KEY, 'x-rapidapi-host': 'pinterest-video-downloader4.p.rapidapi.com' } }
    );
    if (!res.ok) throw new Error(`API Error ${res.status}`);
    const data = await res.json();
    return {
      success: true,
      title: data.title || 'Pinterest Video',
      thumbnail: data.thumbnail || '',
      duration: '',
      formats: [{ label: '⬇️ Download Video', url: data.url || data.video_url || '#', quality: 'HD' }]
    };
  }

  throw new Error('Ye platform abhi supported nahi hai.');
}

// ── Main Handler ──────────────────────────────────────────
async function handleDownload() {
  const url = urlInput?.value.trim();
  if (!url) { showError('Pehle link paste karo.'); return; }
  if (!isValidUrl(url)) { showError('Invalid URL. Pura link paste karo (https:// ke saath).'); return; }
  if (!isPlatformUrl(url)) { showError(`Ye tool sirf ${TOOL_CONFIG.platformName || 'supported'} links ke liye kaam karta hai.`); return; }

  hideError();
  if (resultBox) resultBox.classList.remove('show');
  if (videoPreview) videoPreview.classList.remove('show');
  if (loader) loader.classList.add('show');
  if (downloadBtn) downloadBtn.disabled = true;

  try {
    const data = await fetchDownloadLinks(url);
    if (!data.success && !data.formats) throw new Error(data.message || 'Link process nahi hua.');

    const thumb = document.getElementById('resultThumb');
    const titleEl = document.getElementById('resultTitle');
    const metaEl = document.getElementById('resultMeta');

    if (thumb && data.thumbnail) { thumb.src = data.thumbnail; thumb.style.display = 'block'; }
    if (titleEl) titleEl.textContent = data.title || 'Video ready hai!';
    if (metaEl) metaEl.textContent = data.duration ? `Duration: ${data.duration}` : '';

    if (downloadOptions && data.formats) {
      downloadOptions.innerHTML = data.formats.map((f, i) => `
        <a href="${f.url}" class="download-btn ${i === 0 ? 'primary' : ''}"
           download target="_blank" rel="noopener">
          ${f.label || `⬇️ Download ${f.quality || 'Video'}`}
        </a>
      `).join('');
    }

    if (videoPreview && data.previewUrl) {
      const vid = videoPreview.querySelector('video');
      if (vid) { vid.src = data.previewUrl; videoPreview.classList.add('show'); }
    }

    if (loader) loader.classList.remove('show');
    if (resultBox) resultBox.classList.add('show');

  } catch (err) {
    showError(err.message || 'Kuch gadbad ho gayi. Dobara try karo.');
  } finally {
    if (downloadBtn) downloadBtn.disabled = false;
  }
}

downloadBtn?.addEventListener('click', handleDownload);
urlInput?.addEventListener('keydown', e => e.key === 'Enter' && handleDownload());

document.getElementById('pasteBtn')?.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (urlInput) urlInput.value = text;
  } catch { showToast('Clipboard access nahi mila', 'error'); }
});

// ── FAQ ───────────────────────────────────────────────────
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  let c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
window.showToast = showToast;