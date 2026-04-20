# Book Portfolio

Standalone Vite + React + Three.js portfolio experiment for Pranav Sagar.

This app lives inside the `pranavsagar.us` repo as an isolated subproject:

- `book-portfolio/`

The live website root stays separate. Nothing in the production site is wired to this app yet.

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

- Public assets are local to this app under `public/`.
- The Vite base is relative so the app can be served from a subfolder later.
- This project is intended to evolve independently from the current live site.
