<div align="center">

<img src="book-portfolio/public/textures/thumbnail.png" alt="pranavsagar.us" width="640" />

# pranavsagar.us

**A cinematic, 3D interactive portfolio disguised as a comic book.**

Flip through pages in a WebGL scene, hear the Skyfall score, read hologram intel panels, or switch to a clean reader mode. Built with React, Three.js, and Framer Motion.

### [Visit the live site at pranavsagar.us](https://pranavsagar.us)

[![Live Site](https://img.shields.io/badge/live-pranavsagar.us-000?style=flat-square&logo=vercel)](https://pranavsagar.us)
[![License: MIT](https://img.shields.io/badge/license-MIT-333?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r184-000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org)

</div>

---

## What is this?

Most portfolios are static pages. This one is a **3D book** you physically flip through in your browser.

Every page turn triggers a sound effect. A Skyfall-themed ambient score plays in the background. As you navigate, a hologram intel panel updates with context about whatever section you're viewing. On mobile, the intel slides up as a bottom sheet.

The whole thing runs client-side — no server, no database, no CMS. Just a Vite build deployed to Vercel.

---

## The experience

| | |
|---|---|
| **3D Book** | A realistic book rendered in WebGL with page-flip physics, ambient lighting, and camera transitions via React Three Fiber + drei |
| **Page flip audio** | Every turn plays a subtle page-flip sound effect |
| **Skyfall score** | Background music toggle with animated equalizer bars |
| **Hologram panels** | Bond-style intel overlays that update per page — desktop sidebar or mobile bottom sheet |
| **Reader mode** | One click switches from the 3D book to a clean, scrollable portfolio view |
| **11 double-sided pages** | Cover, Intro, About, Gallery, Skills, Education, Certifications, Experience, Projects (4 collections, 14 projects), Contact, Social, Finale |
| **Mobile responsive** | Full touch navigation with swipe support and adapted layouts |

---

## Pages inside the book

```
Cover ─── Hero ─── About ─── Gallery ─── Skills
  │
Education ─── Certifications ─── Experience
  │
Projects I ─── II ─── III ─── IV
  │
Contact ─── Social ─── Finale ─── Back Cover
```

**14 projects** organized into four collections:
- **AI Operators** — Omnyx, OmnyxMail, Omnyx iOS
- **AI Platforms** — Vedic AI Astrologer, Billionaire Mentors, CrawlBot, KimuntuPro AI
- **Media & Interfaces** — Spotify Clone, Custom Web Browser, YouTube Shorts Maker, UI Morph
- **Systems & Utilities** — CRM, Gradium, JackedPranav

---

## Stack

| Layer | Tech |
|---|---|
| **Build** | Vite 8 |
| **UI** | React 19 |
| **3D** | Three.js r184 + React Three Fiber 9 + drei 10 |
| **Animation** | Framer Motion 12 |
| **Math** | maath |
| **Styling** | Plain CSS (no framework) |
| **Linting** | ESLint 9 flat config |
| **Hosting** | Vercel |

---

## Quick start

```bash
git clone https://github.com/psagar29/pranavsagar.us.git
cd pranavsagar.us/book-portfolio
npm install
npm run dev
```

Open the local URL from the terminal. You'll see the 3D book with full interactivity.

---

## Project structure

```
pranavsagar.us/
├── vercel.json                  # Vercel config (points to book-portfolio/)
├── book-portfolio/
│   ├── src/
│   │   ├── App.jsx              # Entry — lazy loads BookScene + Overlay
│   │   ├── main.jsx             # React root
│   │   ├── styles.css           # All styles (no CSS framework)
│   │   ├── components/
│   │   │   ├── Book.jsx         # Three.js book geometry + page flip logic
│   │   │   ├── BookPage.jsx     # Individual page renderer
│   │   │   ├── BookScene.jsx    # R3F canvas + camera + lighting + particles
│   │   │   ├── BookReader.jsx   # Clean scrollable reader mode
│   │   │   ├── HologramProjector.jsx  # Bond-style intel overlay panels
│   │   │   └── Overlay.jsx      # Top bar, navigation, music controls
│   │   └── lib/
│   │       ├── bookData.js      # Page definitions + navigation config
│   │       ├── portfolioData.js # All portfolio content (structured data)
│   │       ├── hologramContent.js     # Per-page hologram panel content
│   │       ├── deviceProfile.js       # Mobile/desktop detection
│   │       └── assets.js              # Asset path helpers
│   └── public/
│       ├── audios/              # Page flip SFX + Skyfall score
│       ├── portfolio/           # Photos and personal images
│       └── textures/            # Book cover, back cover, thumbnails
```

---

## Scripts

```bash
cd book-portfolio
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

---

## Deploy

Configured for Vercel from the repo root via `vercel.json`:

```json
{
  "installCommand": "npm ci --prefix book-portfolio",
  "buildCommand": "npm run build --prefix book-portfolio",
  "outputDirectory": "book-portfolio/dist"
}
```

Push to `main` and Vercel builds automatically.

---

## Fork it, make it yours

The code is MIT licensed. If you want to build your own version:

1. Fork or clone the repo
2. Replace content in `book-portfolio/src/lib/portfolioData.js` with your own
3. Swap photos in `book-portfolio/public/portfolio/`
4. Update `bookData.js` if you want different page labels
5. Deploy to Vercel (or any static host)

The structure is data-driven — `portfolioData.js` is the single source of truth for everything rendered in both the 3D book and the reader mode. Change the data, keep the experience.

If you build something with it, I'd genuinely like to see it. Open an issue titled **"Built with pranavsagar.us"** or send me a link at [psagar2@asu.edu](mailto:psagar2@asu.edu).

---

## License

Code is released under the [MIT License](LICENSE). Personal content, images, audio, and brand materials remain owned by Pranav Sagar.

---

<div align="center">

Built by [Pranav Sagar](https://github.com/psagar29)

[Website](https://pranavsagar.us) · [LinkedIn](https://www.linkedin.com/in/pranav-sagar-whythisurlissolong/) · [GitHub](https://github.com/psagar29) · [Instagram](https://www.instagram.com/perhapspranav)

</div>
