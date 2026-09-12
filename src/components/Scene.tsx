import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../lib/hooks'

/**
 * Two fixed canvases:
 *  - .gl-bg  (behind the page): a calm starfield
 *  - .gl-obj (above the page, ignores the mouse): the wireframe object
 *
 * The object moves between three "slots" in the page layout:
 *  #hero-slot (big, beside the name) → #dock (small, in the nav, acts as the logo) → #contact-slot (medium, at the end).
 * It turns toward the cursor and spins with your scroll.
 */
export function Scene() {
  const reduce = useReducedMotion()
  const bgRef = useRef<HTMLCanvasElement>(null)
  const objRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const bgC = bgRef.current, objC = objRef.current
    if (!bgC || !objC) return
    let W = innerWidth, H = innerHeight
    const FOV = 30, CZ = 7
    const css = getComputedStyle(document.documentElement)
    const colA = new THREE.Color(css.getPropertyValue('--a').trim() || '#FFB547')
    const colB = new THREE.Color(css.getPropertyValue('--b').trim() || '#FF5C8A')

    let rdO: THREE.WebGLRenderer, rdB: THREE.WebGLRenderer
    try {
      const mk = (c: HTMLCanvasElement) => {
        const r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true })
        r.setPixelRatio(Math.min(devicePixelRatio || 1, W < 760 ? 1.5 : 2))
        r.setSize(W, H, false)
        return r
      }
      rdO = mk(objC); rdB = mk(bgC)
    } catch {
      objC.style.display = 'none'; bgC.style.display = 'none'
      return
    }

    const cam = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 60)
    cam.position.z = CZ
    const scO = new THREE.Scene(), scB = new THREE.Scene()

    // ── the object: outer wireframe + inner wireframe + glowing core + a halo of points
    const lineA = new THREE.LineBasicMaterial({ color: colA, transparent: true, opacity: 0.6 })
    const lineB = new THREE.LineBasicMaterial({ color: colB, transparent: true, opacity: 0.7 })
    const coreM = new THREE.MeshBasicMaterial({ color: colA, transparent: true, opacity: 0.35 })
    const ptsM = new THREE.PointsMaterial({ color: colA, size: 0.03, transparent: true, opacity: 0.9 })
    const sphereCloud = (n: number, r: number) => {
      const pos = new Float32Array(n * 3)
      for (let i = 0; i < n; i++) {
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1)
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); pos[i * 3 + 2] = r * Math.cos(ph)
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return g
    }
    const group = new THREE.Group()
    const outer = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.15, 1)), lineA)
    const inner = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.72, 0)), lineB)
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 2), coreM)
    const halo = new THREE.Points(sphereCloud(420, 1.6), ptsM)
    group.add(outer, inner, core, halo)
    scO.add(group)

    // ── the starfield behind the page
    const N = 2400, pos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 22; pos[i * 3 + 1] = (Math.random() - 0.5) * 14; pos[i * 3 + 2] = -9 + Math.random() * 10 }
    const starsG = new THREE.BufferGeometry(); starsG.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const stars = new THREE.Points(starsG, new THREE.PointsMaterial({ color: colA, size: 0.014, transparent: true, opacity: 0.8 }))
    scB.add(stars)

    // ── motion state
    const cur = { x: 0, y: 0, s: 0.001 }, tgt = { x: 0, y: 0, s: 1 }
    let spin = -0.5, lastY = scrollY, mx = 0, my = 0, tmx = 0, tmy = 0, state: 'hero' | 'dock' | 'contact' = 'hero', intro = 0
    const onMove = (e: PointerEvent) => { tmx = (e.clientX / W - 0.5) * 2; tmy = (e.clientY / H - 0.5) * 2 }
    addEventListener('pointermove', onMove, { passive: true })

    const target = () => {
      const hero = document.getElementById('hero-slot'), dock = document.getElementById('dock'), contact = document.getElementById('contact-slot')
      if (!hero || !dock) return
      const hr = hero.getBoundingClientRect(), dr = dock.getBoundingClientRect(), cr = contact?.getBoundingClientRect()
      let r: DOMRect, f: number
      if (hr.bottom > hr.height * 0.4) { r = hr; f = 0.82; state = 'hero' }
      else if (cr && cr.top < H * 0.85) { r = cr; f = 0.9; state = 'contact' }
      else { r = dr; f = 0.72; state = 'dock' }
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2 - (state === 'hero' ? r.height * 0.06 : 0)
      const size = Math.min(r.width, r.height) * f
      const visH = 2 * CZ * Math.tan((FOV / 2) * Math.PI / 180), visW = visH * (W / H)
      tgt.x = (cx / W - 0.5) * visW; tgt.y = -(cy / H - 0.5) * visH; tgt.s = (size / H * visH) / 2.3
    }

    const frame = (ms: number) => {
      target()
      const k = reduce ? 1 : 0.085
      cur.x += (tgt.x - cur.x) * k; cur.y += (tgt.y - cur.y) * k; cur.s += (tgt.s - cur.s) * k
      intro += (1 - intro) * (reduce ? 1 : 0.06)
      const y = scrollY
      spin += (reduce ? 0 : state === 'dock' ? 0.006 : 0.0035) + (y - lastY) * 0.0022; lastY = y
      mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06
      group.position.set(cur.x, cur.y, 0)
      const s = cur.s * (0.02 + 0.98 * intro); group.scale.set(s, s, s)
      group.rotation.y = spin + mx * 0.45; group.rotation.x = 0.12 + my * 0.3
      inner.rotation.y = -ms * 0.0004
      const cs = 1 + Math.sin(ms * 0.0012) * 0.06; core.scale.set(cs, cs, cs)
      halo.rotation.y = -ms * 0.00008
      rdO.render(scO, cam)
      stars.rotation.y = ms * 0.00001; stars.position.x = mx * 0.25; stars.position.y = -my * 0.15 - y * 0.0006
      rdB.render(scB, cam)
    }

    let raf = 0, running = false
    const loop = (ms: number) => { if (!running) return; frame(ms); raf = requestAnimationFrame(loop) }
    const start = () => { if (running || reduce) return; running = true; raf = requestAnimationFrame(loop) }
    const stop = () => { running = false; cancelAnimationFrame(raf) }
    const once = () => frame(performance.now())
    const onVis = () => (document.hidden ? stop() : start())
    const onResize = () => { W = innerWidth; H = innerHeight; rdO.setSize(W, H, false); rdB.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); if (reduce) once() }
    document.addEventListener('visibilitychange', onVis)
    addEventListener('resize', onResize)
    if (reduce) { once(); addEventListener('scroll', once, { passive: true }); addEventListener('pointermove', once, { passive: true }) }
    else start()

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVis)
      removeEventListener('resize', onResize)
      removeEventListener('pointermove', onMove)
      removeEventListener('scroll', once)
      removeEventListener('pointermove', once)
      rdO.dispose(); rdB.dispose()
    }
  }, [reduce])

  return (
    <>
      <canvas ref={bgRef} className="gl-bg" aria-hidden="true" />
      <canvas ref={objRef} className="gl-obj" aria-hidden="true" />
    </>
  )
}
