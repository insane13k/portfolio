# Aryan Arora — portfolio

Cyber 3D direction: Solar colours, wireframe object that docks into the nav, starfield, typewriter, big-index projects, live About tiles, drawn timeline.

## Change what the site says

Edit **one file**: `src/content.ts`. Every section reads from it. Leave a field as `""` to hide it.
Lines marked `// SAMPLE` are placeholders.

- Photos of projects → put them in `public/projects/` and set `image: "/projects/name.jpg"`.
- Resume → put `resume.pdf` in `public/` and set `resumeUrl: "/resume.pdf"`.
- Share preview image (WhatsApp / LinkedIn) → put a 1200×630 `og.png` in `public/`.
- GitHub activity tile → set `githubUsername`. Until then it shows a sample pattern.

## Run it on your computer

```bash
npm install
npm run dev
```

Open http://localhost:5180.

## Put it live (free)

The site is built for Netlify. Once the project is on GitHub and connected to Netlify, every change goes live automatically.
The contact form uses Netlify Forms — nothing to configure; submissions arrive in the Netlify dashboard (and by email if you turn that on there).

```bash
npm run build   # produces dist/
```

## Where things are

- `src/content.ts` — all words, links, projects (the only file you need to edit)
- `src/index.css` — colours and styles (`--a` / `--b` are the two accent colours)
- `src/components/Scene.tsx` — the 3D object and starfield
- `design/` — the original prototype pages, for reference only
