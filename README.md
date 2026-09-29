# Aryan Arora — portfolio

Cyber 3D direction: Solar colours, wireframe object that docks into the nav, starfield, typewriter, big-index projects, live About tiles, drawn timeline.

## Change what the site says

Edit **one file**: `src/content.ts`. Every section reads from it. Leave a field as `""` to hide it.
Lines marked `// SAMPLE` are placeholders.

- Photos of projects → put them in `public/projects/` and set `image: "/projects/name.jpg"`.
- Resume → put `resume.pdf` in `public/` and set `resumeUrl: "/resume.pdf"`.
- Share preview image (WhatsApp / LinkedIn) → `public/og.png`, rendered from `design/og.html` with headless Chrome.
- GitHub activity tile → set `githubUsername`. Until then it shows a sample pattern.

## Run it on your computer

```bash
npm install
npm run dev
```

Open http://localhost:5180.

## Put it live (free)

Live at **https://aryanarora13.netlify.app** — every push to `main` goes live automatically (GitHub → Netlify).

The contact form sends each message to my inbox through Web3Forms (free; the access key in `src/content.ts` is public by design and only allows sending *to* my address). Netlify Forms keeps a backup copy of every submission in the Netlify dashboard.

```bash
npm run build   # produces dist/
```

## Motion

[StringTune](https://tune.fiddle.digital/docs/introduction/) is the only motion
engine on the site. Effects are declared in the markup as `data-string="…"`
attributes and arrive as CSS variables; `src/index.css` turns those into
motion under `html.tuned`.

| Effect | Where it's declared | Variable |
| --- | --- | --- |
| Smooth scrolling | `src/lib/stringTune.ts` (desktop only) | — |
| Magnetic buttons | `components/Magnetic.tsx` | `--magnetic-x/y` |
| Word-by-word heading reveal | `components/SplitText.tsx` | `--reveal`, `--word-index` |
| Block reveal | `components/Reveal.tsx` | `--reveal` |
| Parallax screenshots | `components/Work.tsx` | applied as a transform |

Two rules keep it safe: nothing starts when the visitor's device asks for
reduced motion, and `html.tuned` is only added after the engine's first
measured frame — so the page is complete and readable with JavaScript off,
and an element the engine never drives stays fully visible.

## Where things are

- `src/content.ts` — all words, links, projects (the only file you need to edit)
- `src/index.css` — colours and styles (`--a` / `--b` are the two accent colours)
- `src/components/Scene.tsx` — the 3D object and starfield
- `design/` — the original prototype pages, for reference only
