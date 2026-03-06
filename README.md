# SaveIt.Pro – Multi-Platform Video Downloader

A complete, production-ready video downloader website with a Firebase-powered admin panel.

---

## 🚀 Quick Setup Guide

### Step 1 – Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** and follow the steps
3. Enable **Google Analytics** (optional but recommended)

### Step 2 – Enable Firebase Services

In your Firebase project, enable:

| Service | How to Enable |
|---|---|
| **Authentication** | Build → Authentication → Get Started → Email/Password |
| **Firestore** | Build → Firestore Database → Create database → Start in production mode |
| **Storage** | Build → Storage → Get started |

### Step 3 – Add Admin User

1. Go to **Authentication → Users → Add user**
2. Create: `admin@yourdomain.com` + strong password
3. This is your admin panel login

### Step 4 – Configure Firebase

Edit `firebase/firebase-config.js` and replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Get these values from: **Firebase Console → Project Settings (⚙️) → Your Apps → SDK setup and configuration**

### Step 5 – Set Firestore Rules

In Firestore → Rules, set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for tools, blogs, settings
    match /tools/{doc} { allow read; allow write: if request.auth != null; }
    match /blogs/{doc} { allow read; allow write: if request.auth != null; }
    match /settings/{doc} { allow read; allow write: if request.auth != null; }
    // Contact form - write only
    match /contact/{doc} { allow create; }
  }
}
```

### Step 6 – Set Storage Rules

In Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 7 – Set Up Video Download API

The tool pages use RapidAPI for actual downloads. Sign up at [rapidapi.com](https://rapidapi.com) and subscribe to:

- **All Video Downloader** (or platform-specific APIs)
- Copy your API key
- Edit `tools/tool.js` and replace `YOUR_RAPIDAPI_KEY`

### Step 8 – Deploy

**Option A – Firebase Hosting (Recommended)**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Option B – GitHub Pages**
1. Push to GitHub repository
2. Settings → Pages → Deploy from branch → main
3. Your site will be at `https://yourusername.github.io/repo-name/`

---

## 📁 Folder Structure

```
project/
├── index.html              # Homepage
├── style.css               # Main stylesheet (dark/light theme)
├── script.js               # Homepage JS (tools grid, search, blog)
│
├── firebase/
│   └── firebase-config.js  # ⚠️ Configure this first!
│
├── tools/
│   ├── tool.js             # Shared downloader logic
│   ├── tool-style.css      # Tool page styles
│   ├── instagram-reels.html
│   ├── tiktok.html
│   ├── youtube.html
│   ├── youtube-mp3.html
│   ├── facebook.html
│   ├── twitter.html
│   ├── pinterest.html
│   ├── instagram-photo.html
│   └── instagram-story.html
│
├── admin/
│   ├── login.html          # Firebase Auth login
│   ├── dashboard.html      # Full admin UI
│   └── admin.js            # CRUD operations
│
└── pages/
    ├── blog.html           # Blog listing
    ├── blog-post.html      # Individual post
    ├── how-to-use.html     # Guide + FAQ
    ├── privacy-policy.html
    └── contact.html        # Contact form → Firestore
```

---

## ✨ Features

- ✅ 9 platform download tools
- ✅ Firebase Authentication (admin)
- ✅ Firestore for tools & blog CRUD
- ✅ Firebase Storage for images
- ✅ Dark/Light mode toggle
- ✅ Responsive mobile design
- ✅ SEO optimized pages
- ✅ Google AdSense ready slots
- ✅ Social share buttons
- ✅ FAQ accordions
- ✅ Toast notifications
- ✅ Loading animations + skeletons
- ✅ Contact form → Firestore

---

## 🔑 Admin Panel

Access at: `/admin/login.html`

Features:
- Add / Edit / Delete tools
- Add / Edit / Delete blog posts
- Upload images to Firebase Storage
- Manage SEO meta settings
- View contact form messages in Firestore

---

## 💡 Customization Tips

1. **Change the site name:** Search-replace "SaveIt.Pro" across all HTML files
2. **Add AdSense:** Uncomment the `<script>` tags and add your publisher ID
3. **Add Google Analytics:** Add your GA4 tag to the `<head>` of each page
4. **Custom domain:** Set up in Firebase Hosting settings or your domain registrar

---

## ⚖️ Legal Notice

This tool is intended for personal use only. Users must comply with copyright laws and the terms of service of each platform. Do not use this tool to infringe on intellectual property rights.
