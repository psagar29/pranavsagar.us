# pranavsagar.us

Open-source source code for [pranavsagar.us](https://pranavsagar.us), the personal website and interactive portfolio of [Pranav Sagar](https://github.com/psagar29).

The live site is a Vite + React app in [`book-portfolio/`](book-portfolio). The current production experience keeps the cinematic book interface, the readable portfolio mode, and the local portfolio assets in this repo. Those media assets are intentional parts of the site, not forgotten build output.

## Why This Is Public

I am making the source public because personal websites should be more inspectable. If this helps you build your own site, fork it, remix the structure, and replace the personal content with your own.

If you reuse the site or borrow the structure, I would genuinely like to see it. Open an issue titled `Built with pranavsagar.us`, tag [@psagar29](https://github.com/psagar29), or send me a link at [psagar2@asu.edu](mailto:psagar2@asu.edu).

## Tech Stack

- Vite
- React
- Three.js via React Three Fiber
- Framer Motion
- Plain CSS
- Vercel

## Local Development

```bash
cd book-portfolio
npm install
npm run dev
```

## Checks

```bash
cd book-portfolio
npm run lint
npm run build
```

## Deploy

The repository is configured for Vercel from the root with [`vercel.json`](vercel.json):

```json
{
  "installCommand": "npm ci --prefix book-portfolio",
  "buildCommand": "npm run build --prefix book-portfolio",
  "outputDirectory": "book-portfolio/dist"
}
```

## Reuse Notes

You can reuse the code and layout under the MIT license. Please replace my name, writing, photos, contact details, and portfolio content before publishing your own version. The code is open-source; my identity is not a template variable, unfortunately.

## License

Code is released under the [MIT License](LICENSE). Personal content, images, audio, and brand/personality materials remain owned by Pranav Sagar unless otherwise noted.
