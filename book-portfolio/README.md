# Book Portfolio

The production Vite + React + Three.js portfolio for [pranavsagar.us](https://pranavsagar.us).

This app lives inside the `pranavsagar.us` repo as the deployed subproject:

- `book-portfolio/`

The root `vercel.json` builds this folder and deploys `book-portfolio/dist`.

## Features

- Interactive 3D book portfolio
- Readable portfolio overlay for quick scanning
- Contact form and social links
- GitHub source link in the top-right utility area
- Local portfolio media and textures

## Run

```bash
npm install
npm run dev
```

## Check

```bash
npm run build
npm run lint
```

## Notes

- Public assets are local to this app under `public/` and are required by the current production experience.
- The Vite base is relative so the app can be hosted cleanly from Vercel.
- Personal content, photos, and audio belong to Pranav Sagar. Reuse the code, but replace the identity layer before publishing your own version.
