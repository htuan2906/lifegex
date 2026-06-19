# LifeGex v2 — Deployment Guide

## Quick Deploy (GitHub Pages)

1. **Tạo repo mới** trên GitHub (public hoặc private)
2. **Push code:**
```bash
cd C:\Users\hoang\Documents\01_PROJECTS_DEV\LifeGex
git init
git add .
git commit -m "LifeGex v2 - 50 UI/UX tasks"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
git push -u origin main
```

3. **Enable GitHub Pages:**
- Settings → Pages → Source: **"GitHub Actions"**
- Done! Site sẽ live tại `https://<username>.github.io/<repo-name>/`

4. **Add secrets (nếu dùng API):**
- Settings → Secrets and variables → Actions → New repository secret
- Thêm: `VITE_TRANSLATION_API_URL`, `VITE_TRANSLATION_API_KEY`, `VITE_WS_URL`, `VITE_IMAGE_CDN_URL`, `VITE_CONTACT_API`

---

## Deploy Vercel (Alternative)

1. Vào **vercel.com** → Import Git Repository
2. Chọn repo → Framework: **Vite** → Deploy
3. Add Environment Variables trong Project Settings

---

## Local Dev

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # → dist/
npm run preview      # preview build
```

---

## Project Structure (63 files)

```
├── index.html              # Entry
├── vite.config.js          # Build config
├── postcss.config.js       # PostCSS
├── .github/workflows/deploy.yml
│
├── public/sw.js            # Service Worker
├── scripts/subset-fonts.mjs
├── scripts/optimize-images.mjs
│
├── src/
│   ├── main.js, app.js
│   ├── styles/ (7 files)
│   ├── animations/ (9 files)
│   ├── components/ (17 files)
│   ├── effects/ (5 files)
│   ├── state/ (3 files)
│   ├── utils/ (10 files)
│   └── i18n/ (en, zh, es)
│
└── tests/visual/           # Playwright
```

---

## 50 Tasks Implemented

| Category | Tasks |
|----------|-------|
| Performance | Vite, critical CSS, font subset, WebP/AVIF, SW, CSS containment |
| Visual | Fluid type, container queries, color-mix, mesh gradient, scroll-driven |
| Animation | Text split, FLIC, 3D tilt+gyro, parallax, morph logo, stagger |
| State | XState machine, IndexedDB, history stack, URL sync |
| A11y | WCAG 2.2 AA, keyboard, RTL, screen reader, touch gestures |
| Components | 17 Web Components (nav, hero, timeline, funds, carousel, etc) |
| Effects | Cursor trail, particles, fluid sim, noise, ambient light |
| DX | Command palette, drag-reorder, exit intent, sticky nav, testing |

---

## Required Secrets (nếu dùng)

| Secret | Description |
|--------|-------------|
| `VITE_TRANSLATION_API_KEY` | Google/DeepL API key for fallback translation |
| `VITE_TRANSLATION_API_URL` | Translation API endpoint |
| `VITE_WS_URL` | WebSocket for live metrics |
| `VITE_IMAGE_CDN_URL` | Image CDN (Cloudinary/imgix) |
| `VITE_CONTACT_API` | Form endpoint |

---

**Build passes**: `npm run build` → 50 modules, 8.59s, zero warnings.
