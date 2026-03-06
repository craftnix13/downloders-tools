// ============================================================
// SAVEIT.PRO – Admin Dashboard Script
// Cloudinary for images + Firebase for data
// ============================================================

import { auth, db } from '../firebase/firebase-config.js';
import {
  onAuthStateChanged, signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp, getDoc, setDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ── Cloudinary Config ─────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = 'dgtxzsjgk';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

// ── Upload Image to Cloudinary ────────────────────────────
async function uploadImage(file) {
  if (!file) return null;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  return data.secure_url;
}

// ── Auth Guard ────────────────────────────────────────────
onAuthStateChanged(auth, user => {
  if (!user) { window.location.href = 'login.html'; return; }
  const email = user.email || 'Admin';
  document.getElementById('userEmail').textContent = email;
  document.getElementById('userAvatar').textContent = email[0].toUpperCase();
  document.getElementById('loginTime').textContent = new Date().toLocaleTimeString();
  loadTools();
  loadBlogs();
  loadSEO();
});

// ── Theme ─────────────────────────────────────────────────
const t = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', t);
document.getElementById('themeToggle').textContent = t === 'dark' ? '☀️' : '🌙';
document.getElementById('themeToggle').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  document.getElementById('themeToggle').textContent = next === 'dark' ? '☀️' : '🌙';
});

// ── Sign Out ──────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});

// ── Panel Navigation ──────────────────────────────────────
const panelTitles = { overview: 'Dashboard', tools: 'Manage Tools', blogs: 'Manage Blog', seo: 'SEO Settings' };
document.querySelectorAll('.nav-item[data-panel]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = btn.dataset.panel;
    document.getElementById(`panel-${panel}`).classList.add('active');
    document.getElementById('panelTitle').textContent = panelTitles[panel] || panel;
  });
});

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  let c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Modal Helpers ─────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
});

// ── Image Preview ─────────────────────────────────────────
function setupImagePreview(inputId, previewId) {
  document.getElementById(inputId)?.addEventListener('change', e => {
    const file = e.target.files[0];
    const preview = document.getElementById(previewId);
    if (file && preview) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
    }
  });
}
setupImagePreview('toolIconFile', 'toolIconPreview');
setupImagePreview('blogImageFile', 'blogImagePreview');

// ══════════════════════════════════════════════════════════
// TOOLS CRUD
// ══════════════════════════════════════════════════════════

async function loadTools() {
  const tbody = document.getElementById('toolsTable');
  try {
    const snap = await getDocs(collection(db, 'tools'));
    const tools = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById('statTools').textContent = tools.length;

    if (tools.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty"><div class="icon">🔧</div><p>Koi tool nahi hai. "Add Tool" se add karo.</p></div></td></tr>`;
      return;
    }

    tbody.innerHTML = tools.map(tool => `
      <tr>
        <td><div class="td-flex">
          <div class="table-icon" style="background:var(--surface)">
            ${tool.iconUrl ? `<img src="${tool.iconUrl}" style="width:32px;height:32px;border-radius:8px;object-fit:cover">` : tool.icon || '🔧'}
          </div>
          <div><strong>${tool.title}</strong><br><small style="color:var(--text-muted)">${tool.description || ''}</small></div>
        </div></td>
        <td><small style="color:var(--text-muted)">${tool.tool_page_url || '—'}</small></td>
        <td><span class="badge badge-active">Active</span></td>
        <td><div class="action-btns">
          <button class="btn-edit" onclick="editTool('${tool.id}')">✏️ Edit</button>
          <button class="btn-del" onclick="deleteTool('${tool.id}')">🗑 Delete</button>
        </div></td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:var(--danger);padding:16px">Error: ${err.message}</td></tr>`;
  }
}

document.getElementById('addToolBtn').addEventListener('click', () => {
  document.getElementById('toolId').value = '';
  document.getElementById('toolTitle').value = '';
  document.getElementById('toolIcon').value = '';
  document.getElementById('toolDesc').value = '';
  document.getElementById('toolUrl').value = '';
  document.getElementById('toolIconFile').value = '';
  document.getElementById('toolIconPreview').style.display = 'none';
  document.getElementById('toolModalTitle').textContent = 'Add Tool';
  document.getElementById('saveToolBtn').textContent = 'Save Tool';
  openModal('toolModal');
});

window.editTool = async function(id) {
  try {
    const snap = await getDoc(doc(db, 'tools', id));
    if (!snap.exists()) { showToast('Tool nahi mila', 'error'); return; }
    const data = snap.data();
    document.getElementById('toolId').value = id;
    document.getElementById('toolTitle').value = data.title || '';
    document.getElementById('toolIcon').value = data.icon || '';
    document.getElementById('toolDesc').value = data.description || '';
    document.getElementById('toolUrl').value = data.tool_page_url || '';
    if (data.iconUrl) {
      document.getElementById('toolIconPreview').src = data.iconUrl;
      document.getElementById('toolIconPreview').style.display = 'block';
    }
    document.getElementById('toolModalTitle').textContent = 'Edit Tool';
    document.getElementById('saveToolBtn').textContent = 'Update Tool';
    openModal('toolModal');
  } catch (err) { showToast(err.message, 'error'); }
};

document.getElementById('saveToolBtn').addEventListener('click', async () => {
  const id = document.getElementById('toolId').value;
  const title = document.getElementById('toolTitle').value.trim();
  const icon = document.getElementById('toolIcon').value.trim();
  const description = document.getElementById('toolDesc').value.trim();
  const tool_page_url = document.getElementById('toolUrl').value.trim();
  const file = document.getElementById('toolIconFile').files[0];

  if (!title) { showToast('Tool ka naam zaroori hai.', 'error'); return; }

  const btn = document.getElementById('saveToolBtn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    let iconUrl = null;
    if (file) {
      showToast('Image upload ho rahi hai…', 'info');
      iconUrl = await uploadImage(file);
    }

    const data = { title, icon, description, tool_page_url, ...(iconUrl && { iconUrl }) };

    if (id) {
      await updateDoc(doc(db, 'tools', id), data);
      showToast('Tool update ho gaya!', 'success');
    } else {
      await addDoc(collection(db, 'tools'), { ...data, createdAt: serverTimestamp() });
      showToast('Tool add ho gaya!', 'success');
    }

    closeModal('toolModal');
    loadTools();
  } catch (err) { showToast(err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = id ? 'Update Tool' : 'Save Tool'; }
});

let deleteTarget = null;
window.deleteTool = function(id) {
  deleteTarget = { type: 'tool', id };
  openModal('confirmModal');
};

// ══════════════════════════════════════════════════════════
// BLOG CRUD
// ══════════════════════════════════════════════════════════

async function loadBlogs() {
  const tbody = document.getElementById('blogsTable');
  try {
    const q = query(collection(db, 'blogs'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    const blogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById('statBlogs').textContent = blogs.length;

    if (blogs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3"><div class="empty"><div class="icon">📝</div><p>Koi post nahi hai. "Add Post" se banao.</p></div></td></tr>`;
      return;
    }

    tbody.innerHTML = blogs.map(b => {
      const date = b.date ? new Date(b.date.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
      return `
        <tr>
          <td>
            <div class="td-flex">
              ${b.image ? `<img src="${b.image}" style="width:48px;height:36px;border-radius:6px;object-fit:cover;flex-shrink:0">` : '<div style="width:48px;height:36px;background:var(--bg3);border-radius:6px;display:flex;align-items:center;justify-content:center">📝</div>'}
              <div><strong>${b.title}</strong><br><small style="color:var(--text-muted)">${(b.meta_description || '').substring(0, 60)}…</small></div>
            </div>
          </td>
          <td><small style="color:var(--text-muted)">${date}</small></td>
          <td><div class="action-btns">
            <button class="btn-edit" onclick="editBlog('${b.id}')">✏️ Edit</button>
            <button class="btn-del" onclick="deleteBlogPost('${b.id}')">🗑 Delete</button>
          </div></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3" style="color:var(--danger);padding:16px">Error: ${err.message}</td></tr>`;
  }
}

document.getElementById('addBlogBtn').addEventListener('click', () => {
  document.getElementById('blogId').value = '';
  document.getElementById('blogTitle').value = '';
  document.getElementById('blogMetaDesc').value = '';
  document.getElementById('blogContent').value = '';
  document.getElementById('blogImageFile').value = '';
  document.getElementById('blogImagePreview').style.display = 'none';
  document.getElementById('blogModalTitle').textContent = 'Add Blog Post';
  document.getElementById('saveBlogBtn').textContent = 'Publish Post';
  openModal('blogModal');
});

window.editBlog = async function(id) {
  try {
    const snap = await getDoc(doc(db, 'blogs', id));
    if (!snap.exists()) { showToast('Post nahi mili', 'error'); return; }
    const data = snap.data();
    document.getElementById('blogId').value = id;
    document.getElementById('blogTitle').value = data.title || '';
    document.getElementById('blogMetaDesc').value = data.meta_description || '';
    document.getElementById('blogContent').value = data.content || '';
    if (data.image) {
      document.getElementById('blogImagePreview').src = data.image;
      document.getElementById('blogImagePreview').style.display = 'block';
    }
    document.getElementById('blogModalTitle').textContent = 'Edit Blog Post';
    document.getElementById('saveBlogBtn').textContent = 'Update Post';
    openModal('blogModal');
  } catch (err) { showToast(err.message, 'error'); }
};

document.getElementById('saveBlogBtn').addEventListener('click', async () => {
  const id = document.getElementById('blogId').value;
  const title = document.getElementById('blogTitle').value.trim();
  const meta_description = document.getElementById('blogMetaDesc').value.trim();
  const content = document.getElementById('blogContent').value.trim();
  const file = document.getElementById('blogImageFile').files[0];

  if (!title || !content) { showToast('Title aur content zaroori hai.', 'error'); return; }

  const btn = document.getElementById('saveBlogBtn');
  btn.disabled = true;
  btn.textContent = 'Publishing…';

  try {
    let image = null;
    if (file) {
      showToast('Image upload ho rahi hai…', 'info');
      image = await uploadImage(file);
    }

    const data = { title, meta_description, content, date: serverTimestamp(), ...(image && { image }) };

    if (id) {
      const existing = await getDoc(doc(db, 'blogs', id));
      const merged = { ...existing.data(), ...data };
      if (!image && existing.data()?.image) merged.image = existing.data().image;
      await updateDoc(doc(db, 'blogs', id), merged);
      showToast('Post update ho gayi!', 'success');
    } else {
      await addDoc(collection(db, 'blogs'), data);
      showToast('Post publish ho gayi!', 'success');
    }

    closeModal('blogModal');
    loadBlogs();
  } catch (err) { showToast(err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = id ? 'Update Post' : 'Publish Post'; }
});

window.deleteBlogPost = function(id) {
  deleteTarget = { type: 'blog', id };
  openModal('confirmModal');
};

// ── Confirm Delete ────────────────────────────────────────
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (!deleteTarget) return;
  const btn = document.getElementById('confirmDeleteBtn');
  btn.disabled = true; btn.textContent = 'Deleting…';
  try {
    const col = deleteTarget.type === 'tool' ? 'tools' : 'blogs';
    await deleteDoc(doc(db, col, deleteTarget.id));
    showToast('Delete ho gaya!', 'success');
    closeModal('confirmModal');
    if (deleteTarget.type === 'tool') loadTools(); else loadBlogs();
  } catch (err) { showToast(err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Delete'; deleteTarget = null; }
});

// ══════════════════════════════════════════════════════════
// SEO Settings
// ══════════════════════════════════════════════════════════

async function loadSEO() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'seo'));
    if (snap.exists()) {
      const d = snap.data();
      document.getElementById('seoTitle').value = d.title || '';
      document.getElementById('seoDesc').value = d.description || '';
      document.getElementById('seoKeywords').value = d.keywords || '';
      document.getElementById('seoGA').value = d.gaId || '';
      document.getElementById('seoAdsense').value = d.adsenseId || '';
    }
  } catch (e) {}
}

document.getElementById('saveSeoBtn').addEventListener('click', async () => {
  const btn = document.getElementById('saveSeoBtn');
  btn.disabled = true; btn.textContent = 'Saving…';
  try {
    await setDoc(doc(db, 'settings', 'seo'), {
      title: document.getElementById('seoTitle').value,
      description: document.getElementById('seoDesc').value,
      keywords: document.getElementById('seoKeywords').value,
      gaId: document.getElementById('seoGA').value,
      adsenseId: document.getElementById('seoAdsense').value,
      updatedAt: serverTimestamp(),
    });
    showToast('SEO settings save ho gayi!', 'success');
  } catch (err) { showToast(err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Save SEO Settings'; }
});