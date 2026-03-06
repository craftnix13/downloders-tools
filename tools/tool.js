// ============================================================
// SAVEIT.PRO – Tool Page Logic (FIXED VERSION)
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


// ── API KEY ──────────────────────────────────────────────
const RAPID_API_KEY = "ccb5cec02emshc 725046d9580c92p17a803jsn281809f4ec04";


// ── Helpers ──────────────────────────────────────────────
function showError(msg) {

  if (errorBox) {
    errorBox.classList.add('show');
    if (errorMsg) errorMsg.textContent = msg;
  }

  loader?.classList.remove('show');
  resultBox?.classList.remove('show');

}

function hideError() {
  errorBox?.classList.remove('show');
}

function isValidUrl(url) {

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }

}

function isPlatformUrl(url) {

  if (!TOOL_CONFIG.domains) return true;

  return TOOL_CONFIG.domains.some(d => url.includes(d));

}


// ── YouTube ID Extractor ──────────────────────────────────
function extractYouTubeId(url) {

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  return match ? match[1] : "";

}


// ── API Call ─────────────────────────────────────────────
async function fetchDownloadLinks(url) {


  // ===============================
  // Instagram
  // ===============================
  if (TOOL_CONFIG.platformName === "Instagram") {

    const res = await fetch(

      `https://instagram-downloader9.p.rapidapi.com/ig?url=${encodeURIComponent(url)}`,

      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": RAPID_API_KEY,
          "X-RapidAPI-Host": "instagram-downloader9.p.rapidapi.com"
        }
      }
    );

    if (!res.ok) throw new Error(`API Error ${res.status}`);

    const data = await res.json();

    return {

      success: true,

      title: data.title || "Instagram Content",

      thumbnail: data.thumbnail || data.thumb || "",

      duration: "",

      formats: [
        {
          label: "⬇️ Download HD (No Watermark)",
          url: data.video_url || data.url || data.download_url || "#",
          quality: "HD"
        }
      ]

    };

  }


  // ===============================
  // TikTok
  // ===============================
  if (TOOL_CONFIG.platformName === "TikTok") {

    const res = await fetch(

      `https://tiktok-video-no-watermark2.p.rapidapi.com/?url=${encodeURIComponent(url)}&hd=1`,

      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": RAPID_API_KEY,
          "X-RapidAPI-Host": "tiktok-video-no-watermark2.p.rapidapi.com"
        }
      }
    );

    if (!res.ok) throw new Error(`API Error ${res.status}`);

    const data = await res.json();

    return {

      success: true,

      title: data.data?.title || "TikTok Video",

      thumbnail: data.data?.cover || "",

      duration: "",

      formats: [

        {
          label: "⬇️ Download HD (No Watermark)",
          url: data.data?.hdplay || data.data?.play || "#",
          quality: "HD"
        },

        {
          label: "⬇️ Download SD (No Watermark)",
          url: data.data?.play || "#",
          quality: "SD"
        }

      ]

    };

  }


  // ===============================
  // YouTube
  // ===============================
  if (TOOL_CONFIG.platformName === "YouTube" || TOOL_CONFIG.platformName === "YouTube MP3") {

    const ytId = extractYouTubeId(url);

    if (!ytId) throw new Error("Valid YouTube URL nahi hai");

    const res = await fetch(

      `https://youtube-mp36.p.rapidapi.com/dl?id=${ytId}`,

      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": RAPID_API_KEY,
          "X-RapidAPI-Host": "youtube-mp36.p.rapidapi.com"
        }
      }
    );

    if (!res.ok) throw new Error(`API Error ${res.status}`);

    const data = await res.json();

    const isMP3 = TOOL_CONFIG.platformName === "YouTube MP3";

    return {

      success: true,

      title: data.title || "YouTube Video",

      thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,

      duration: "",

      formats: [

        {
          label: isMP3 ? "⬇️ Download MP3" : "⬇️ Download MP4",
          url: data.link || "#",
          quality: isMP3 ? "MP3" : "HD"
        }

      ]

    };

  }


  throw new Error("Platform supported nahi hai");

}


// ── Main Handler ─────────────────────────────────────────
async function handleDownload() {

  const url = urlInput?.value.trim();

  if (!url) {
    showError("Pehle link paste karo");
    return;
  }

  if (!isValidUrl(url)) {
    showError("Invalid URL");
    return;
  }

  if (!isPlatformUrl(url)) {
    showError(`Ye tool sirf ${TOOL_CONFIG.platformName} links ke liye hai`);
    return;
  }

  hideError();

  loader?.classList.add("show");
  downloadBtn.disabled = true;

  try {

    const data = await fetchDownloadLinks(url);

    const thumb = document.getElementById("resultThumb");
    const titleEl = document.getElementById("resultTitle");

    if (thumb && data.thumbnail) {
      thumb.src = data.thumbnail;
      thumb.style.display = "block";
    }

    if (titleEl) titleEl.textContent = data.title;

    downloadOptions.innerHTML = data.formats.map(f => `

      <a href="${f.url}"
         class="download-btn primary"
         target="_blank"
         download>

         ${f.label}

      </a>

    `).join("");

    loader?.classList.remove("show");
    resultBox?.classList.add("show");

  }

  catch (err) {

    showError(err.message || "Error aa gaya");

  }

  finally {

    downloadBtn.disabled = false;

  }

}


// ── Events ───────────────────────────────────────────────
downloadBtn?.addEventListener("click", handleDownload);

urlInput?.addEventListener("keydown", e => {

  if (e.key === "Enter") handleDownload();

});