// ============================================================
// SAVEIT.PRO - Main Script
// ============================================================

// ── Theme ────────────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ── Mobile Nav ────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');

hamburger?.addEventListener('click', () => mobileNav?.classList.add('open'));
mobileClose?.addEventListener('click', () => mobileNav?.classList.remove('open'));
mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

// ── Tools Data ────────────────────────────────────────────
const tools = [
  { id: 'instagram-reels', title: 'Instagram Reels', desc: 'Download reels without watermark', icon: '📸', iconClass: 'icon-instagram', url: 'tools/instagram-reels.html' },
  { id: 'tiktok', title: 'TikTok Video', desc: 'Save TikTok videos without watermark', icon: '🎵', iconClass: 'icon-tiktok', url: 'tools/tiktok.html' },
  { id: 'youtube', title: 'YouTube Video', desc: 'Download YouTube videos in HD', icon: '▶️', iconClass: 'icon-youtube', url: 'tools/youtube.html' },
  { id: 'youtube-mp3', title: 'YouTube MP3', desc: 'Convert YouTube to MP3 audio', icon: '🎧', iconClass: 'icon-youtube-mp3', url: 'tools/youtube-mp3.html' },
  { id: 'facebook', title: 'Facebook Video', desc: 'Download Facebook videos easily', icon: '👥', iconClass: 'icon-facebook', url: 'tools/facebook.html' },
  { id: 'twitter', title: 'Twitter / X Video', desc: 'Save videos from Twitter/X posts', icon: '🐦', iconClass: 'icon-twitter', url: 'tools/twitter.html' },
  { id: 'pinterest', title: 'Pinterest Video', desc: 'Download Pinterest video pins', icon: '📌', iconClass: 'icon-pinterest', url: 'tools/pinterest.html' },
  { id: 'instagram-photo', title: 'Instagram Photo', desc: 'Save Instagram photos & carousels', icon: '🖼️', iconClass: 'icon-photo', url: 'tools/instagram-photo.html' },
  { id: 'instagram-story', title: 'Instagram Story', desc: 'Download Instagram stories anonymously', icon: '💫', iconClass: 'icon-story', url: 'tools/instagram-story.html' },
];

// ── Render Tools ──────────────────────────────────────────
function renderTools(data) {
  const grid = document.getElementById('toolsGrid');
  if (!grid) return;
  grid.innerHTML = data.map(t => `
    <a href="${t.url}" class="tool-card" data-id="${t.id}">
      <div class="tool-icon ${t.iconClass}">${t.icon}</div>
      <h3>${t.title}</h3>
      <p>${t.desc}</p>
      <span class="arrow">Download now →</span>
    </a>
  `).join('');
}

renderTools(tools);

// ── Search ────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

function doSearch() {
  const q = searchInput?.value.toLowerCase().trim();
  if (!q) { renderTools(tools); return; }
  const filtered = tools.filter(t =>
    t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
  );
  renderTools(filtered.length ? filtered : tools);
  if (!filtered.length) showToast('No tools found. Showing all tools.', 'error');
}

searchInput?.addEventListener('input', doSearch);
searchBtn?.addEventListener('click', doSearch);
searchInput?.addEventListener('keydown', e => e.key === 'Enter' && doSearch());

// ── Load Blogs from Firebase ──────────────────────────────
async function loadBlogs() {
  const blogGrid = document.getElementById('blogGrid');
  if (!blogGrid) return;

  // Show skeleton
  blogGrid.innerHTML = Array(3).fill(`
    <div class="blog-card">
      <div class="skeleton" style="height:200px"></div>
      <div class="blog-card-body">
        <div class="skeleton" style="height:12px;width:80px;margin-bottom:12px"></div>
        <div class="skeleton" style="height:20px;margin-bottom:8px"></div>
        <div class="skeleton" style="height:60px"></div>
      </div>
    </div>
  `).join('');

  try {
    const { db } = await import('./firebase/firebase-config.js');
    const { collection, getDocs, orderBy, query, limit } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const q = query(collection(db, 'blogs'), orderBy('date', 'desc'), limit(3));
    const snap = await getDocs(q);
    const blogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (blogs.length === 0) {
      blogGrid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1">No blog posts yet. Check back soon!</p>';
      return;
    }

    blogGrid.innerHTML = blogs.map(b => `
      <a href="pages/blog-post.html?id=${b.id}" class="blog-card">
        ${b.image
          ? `<img src="${b.image}" alt="${b.title}" loading="lazy">`
          : `<div class="blog-card-img-placeholder">📝</div>`}
        <div class="blog-card-body">
          <div class="date">${b.date ? new Date(b.date.seconds * 1000).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : ''}</div>
          <h3>${b.title}</h3>
          <p>${b.meta_description || ''}</p>
        </div>
      </a>
    `).join('');
  } catch (e) {
    blogGrid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1">Blog posts coming soon.</p>';
  }
}

loadBlogs();

// ── Toast Notifications ───────────────────────────────────
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
window.showToast = showToast;

// ── Animate on scroll ─────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.tool-card, .blog-card, .feature, .popular-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ── Share Buttons ─────────────────────────────────────────
window.shareUrl = function(platform) {
  const url = encodeURIComponent(location.href);
  const text = encodeURIComponent('Free video downloader – no watermarks, no signup!');
  const urls = {
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    whatsapp: `https://wa.me/?text=${text}%20${url}`,
  };
  window.open(urls[platform], '_blank', 'width=600,height=400');
};

// ── Copy Link ─────────────────────────────────────────────
window.copyLink = function() {
  navigator.clipboard.writeText(location.href).then(() => showToast('Link copied!', 'success'));
};
