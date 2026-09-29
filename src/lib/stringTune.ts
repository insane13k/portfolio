import StringTune, {
  StringMagnetic,
  StringParallax,
  StringProgress,
  StringSplit,
} from '@fiddle-digital/string-tune'

/**
 * StringTune is the site's single motion engine: smooth scrolling, parallax,
 * magnetic buttons and scroll-linked text reveals all come from here.
 *
 * Effects are declared in the markup with `data-string="…"` attributes and
 * arrive as CSS variables (--reveal, --magnetic-x, --word-index, …); the
 * styling that reads them lives in index.css under `html.tuned`.
 *
 * Two guards keep the page trustworthy: nothing starts when the visitor asks
 * for reduced motion, and `html.tuned` is only added once the engine has had a
 * frame to measure. Without either, the page renders complete and static.
 */
let started = false

export function startStringTune(): void {
  if (started || typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  started = true

  const tune = StringTune.getInstance()

  tune.use(StringProgress) // drives --reveal, 0 → 1 across a scroll window
  tune.use(StringParallax) // depth on the project screenshots
  tune.use(StringMagnetic) // buttons lean toward the cursor
  tune.use(StringSplit) // headings split into words for staggered reveals

  // Smooth scroll on desktop; phones keep native momentum scrolling, which is
  // already smooth and much kinder to battery and touch precision.
  tune.scrollDesktopMode = 'smooth'
  tune.scrollMobileMode = 'default'
  tune.scroll.configure({
    speed: 0.1, // how tightly the view follows the target
    acceleration: 0.62, // how hard a wheel tick moves it
    smoothness: 0.55, // how long the glide tails off
    multiplier: 1.05,
  })

  tune.start(60)

  // Wait for a measured frame so nothing flashes in half-revealed, with a
  // timer as backstop because rAF is paused in background tabs.
  const armMotion = () => document.documentElement.classList.add('tuned')
  requestAnimationFrame(() => requestAnimationFrame(armMotion))
  setTimeout(armMotion, 300)
}
