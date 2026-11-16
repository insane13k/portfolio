# Aryan Arora — portfolio

A static, dependency-free portfolio: `index.html`, `styles.css`, `script.js` and `particles.js`
(a raw-WebGL particle sculpture that morphs between shapes as the chapters scroll by).

- **Run locally:** serve the folder, e.g. `python -m http.server 5190`, and open http://localhost:5190.
- **Deploy:** every push to `main` goes live on Netlify (https://aryanarora13.netlify.app). The "build" only copies the site files into `dist/`.
- **Résumé:** add `resume.pdf` to the repository root; the "Download résumé" button links to it.
- **Motion:** visitors whose device asks for reduced motion get a still version with a prompt to switch on
  full motion. `?motion=on` / `?motion=off` sets the choice directly.
- **3D placement:** each `<section>` in `index.html` carries `data-shape`, `data-px`, `data-py`, `data-ps`
  and `data-pa` (shape, x/y offset, scale, opacity) read by `particles.js`.

The previous React version of this site is in the git history before this rewrite.
