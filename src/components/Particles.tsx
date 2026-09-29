import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/hooks'

/**
 * The ambient particle field behind the page.
 *
 * Hand-written on a 2D canvas rather than a 3D library: this is a few hundred
 * dots, and three.js cost 540kB to do the same job. Each dot has a depth, so
 * the field parallaxes against the pointer, against touch, and against scroll,
 * and nudges away from the cursor when it passes through.
 *
 * Budgets are per-device: phones get fewer dots, one device pixel per CSS
 * pixel and 30fps. Nothing runs at all for reduced-motion visitors, who get a
 * single static frame, and nothing runs while the tab is hidden.
 */
type Dot = { x: number; y: number; z: number; r: number; vx: number; vy: number; warm: boolean }

export function Particles() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !ctx) return

    const mobile = innerWidth < 760 || matchMedia('(pointer: coarse)').matches
    // Density by area, not a fixed count, so a laptop and a phone read the
    // same rather than the phone looking crowded.
    const COUNT = Math.max(80, Math.min(820, Math.round((innerWidth * innerHeight) / (mobile ? 2900 : 2500))))
    const FRAME_MS = mobile ? 1000 / 30 : 0
    const PULL_RADIUS = mobile ? 120 : 190 // how close the pointer has to be to attract a dot
    const PULL_STRENGTH = mobile ? 44 : 66
    const SCROLL_FACTOR = mobile ? 0.22 : 0.12 // how far the field travels as you scroll
    const SCROLL_SURGE = mobile ? 3.4 : 2.2 // extra lag on a fast flick, then it settles

    const css = getComputedStyle(document.documentElement)
    const colA = css.getPropertyValue('--a').trim() || '#FFB547'
    const colB = css.getPropertyValue('--b').trim() || '#FF5C8A'

    let W = 0, H = 0, dpr = 1
    const dots: Dot[] = []

    const seed = () => {
      dots.length = 0
      for (let i = 0; i < COUNT; i++) {
        const z = 0.25 + Math.random() * 0.75 // depth: near dots move most
        dots.push({
          x: Math.random() * W,
          y: Math.random() * H,
          z,
          r: (mobile ? 0.9 : 0.8) + z * 1.2,
          vx: (Math.random() - 0.5) * 0.045,
          vy: (Math.random() - 0.5) * 0.045,
          warm: Math.random() < 0.22, // a few in the second accent
        })
      }
    }

    const resize = () => {
      W = innerWidth; H = innerHeight
      dpr = mobile ? 1 : Math.min(devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    // Pointer and scroll targets, eased so the field glides instead of snapping.
    let tpx = -9999, tpy = -9999, px = -9999, py = -9999
    let tShiftX = 0, tShiftY = 0, shiftX = 0, shiftY = 0
    let lastScroll: number | null = null, surge = 0
    // Positive shift: the whole field leans toward the pointer rather than
    // away from it, so the movement reads as following you.
    const onPointer = (e: PointerEvent) => {
      tpx = e.clientX; tpy = e.clientY
      tShiftX = (e.clientX / W - 0.5) * 30
      tShiftY = (e.clientY / H - 0.5) * 20
    }
    // Snap the pointer away rather than easing it, so the attraction does not
    // drag across the screen on its way out.
    const onLeave = () => { tpx = -9999; tpy = -9999; px = -9999; py = -9999; tShiftX = 0; tShiftY = 0 }
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      tpx = t.clientX; tpy = t.clientY
      tShiftX = (t.clientX / W - 0.5) * 22
      tShiftY = (t.clientY / H - 0.5) * 14
    }

    const draw = (dt: number) => {
      const ease = (per60: number) => 1 - Math.pow(1 - per60, dt / 16.67)
      const k = ease(0.07)
      shiftX += (tShiftX - shiftX) * k
      shiftY += (tShiftY - shiftY) * k
      if (px < -1000) { px = tpx; py = tpy } else { px += (tpx - px) * ease(0.12); py += (tpy - py) * ease(0.12) }

      // Scroll drives the field directly, and a flick adds a surge the dots
      // lag behind before settling — the main way the field reacts on a phone.
      const scroll = scrollY
      const delta = lastScroll === null ? 0 : scroll - lastScroll
      lastScroll = scroll
      surge += (delta - surge) * ease(0.14)
      if (Math.abs(surge) < 0.01) surge = 0

      ctx.clearRect(0, 0, W, H)

      // Two passes, one per colour, so the fill style is set twice a frame
      // instead of once per dot.
      for (let pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass === 0 ? colA : colB
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i]
          if (d.warm !== (pass === 1)) continue

          // Drift, wrapped so the field never empties out.
          d.x += d.vx * (dt / 16.67)
          d.y += d.vy * (dt / 16.67)
          if (d.x < -20) d.x = W + 20; else if (d.x > W + 20) d.x = -20
          if (d.y < -20) d.y = H + 20; else if (d.y > H + 20) d.y = -20

          // Depth parallax: pointer lean, scroll travel, and the flick surge.
          let sx = d.x + shiftX * d.z
          let sy = d.y + shiftY * d.z - ((scroll * SCROLL_FACTOR * d.z) % (H + 40)) - surge * SCROLL_SURGE * d.z
          while (sy < -30) sy += H + 40
          while (sy > H + 30) sy -= H + 40

          // Gather toward the pointer: gentle at the edge of the radius,
          // strongest up close, and never travelling past the pointer itself.
          const dx = px - sx, dy = py - sy
          const dist2 = dx * dx + dy * dy
          if (dist2 < PULL_RADIUS * PULL_RADIUS) {
            const dist = Math.sqrt(dist2) || 1
            const t = 1 - dist / PULL_RADIUS
            const pull = Math.min(t * t * PULL_STRENGTH * d.z, dist * 0.55)
            sx += (dx / dist) * pull
            sy += (dy / dist) * pull
          }

          ctx.globalAlpha = 0.22 + d.z * 0.42
          ctx.fillRect(sx, sy, d.r, d.r)
        }
      }
      ctx.globalAlpha = 1
    }

    resize()
    addEventListener('resize', resize)

    if (reduce) {
      draw(16.67) // one static frame, no loop and no interaction
      return () => removeEventListener('resize', resize)
    }

    addEventListener('pointermove', onPointer, { passive: true })
    addEventListener('pointerleave', onLeave, { passive: true })
    addEventListener('touchmove', onTouch, { passive: true })
    addEventListener('touchend', onLeave, { passive: true })

    let raf = 0, running = true, prev = 0, lastDraw = 0
    const loop = (ms: number) => {
      if (!running) return
      if (!FRAME_MS || ms - lastDraw >= FRAME_MS) {
        const dt = prev ? Math.min(64, ms - prev) : 16.67
        prev = ms; lastDraw = ms
        draw(dt)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const onVis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf) }
      else if (!running) { running = true; prev = 0; raf = requestAnimationFrame(loop) }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onPointer)
      removeEventListener('pointerleave', onLeave)
      removeEventListener('touchmove', onTouch)
      removeEventListener('touchend', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [reduce])

  return <canvas ref={ref} className="particles" aria-hidden="true" />
}
