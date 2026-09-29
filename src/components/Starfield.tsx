import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../lib/hooks'

/**
 * The ambient starfield behind the page — the same WebGL field that used to sit
 * behind the wireframe object, now on its own.
 *
 * WebGL draws every star in a single GPU call, which is why this stays smooth
 * on phones where a 2D canvas painting each dot separately did not.
 *
 * The field leans toward the pointer and travels with scroll, near stars more
 * than far ones. When the visitor's device asks for reduced motion (Windows
 * "Show animations" off, for instance) there is no autonomous drift, but the
 * field still answers the pointer and scroll directly — it moves only when
 * the visitor does.
 */
export function Starfield() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let W = innerWidth, H = innerHeight

    // Phones: one device pixel per CSS pixel and no antialiasing. The canvas
    // covers the whole screen, so pixel count is what costs.
    const mobile = W < 760 || matchMedia('(pointer: coarse)').matches
    const STARS = mobile ? 700 : 2400

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !mobile,
        alpha: true,
        powerPreference: mobile ? 'low-power' : 'default',
      })
    } catch {
      canvas.style.display = 'none' // no WebGL: the painted dots in CSS remain
      return
    }
    renderer.setPixelRatio(mobile ? 1 : Math.min(devicePixelRatio || 1, 2))
    renderer.setSize(W, H, false)

    const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 60)
    camera.position.z = 7
    const scene = new THREE.Scene()

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--a').trim() || '#FFB547'
    const pos = new Float32Array(STARS * 3)
    for (let i = 0; i < STARS; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = -9 + Math.random() * 10
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(accent),
      size: mobile ? 0.02 : 0.014, // a touch larger on phones so the sky still reads
      transparent: true,
      opacity: 0.8,
    })
    const stars = new THREE.Points(geometry, material)
    scene.add(stars)

    // Pointer target, eased toward so the field glides after the cursor.
    let mx = 0, my = 0, tmx = 0, tmy = 0
    const onMove = (e: PointerEvent) => {
      tmx = (e.clientX / W - 0.5) * 2
      tmy = (e.clientY / H - 0.5) * 2
    }
    addEventListener('pointermove', onMove, { passive: true })

    let prev = 0
    const frame = (ms: number) => {
      const dt = prev ? Math.min(64, ms - prev) : 16.67
      prev = ms
      const k = reduce ? 1 : 1 - Math.pow(1 - 0.06, dt / 16.67)
      mx += (tmx - mx) * k
      my += (tmy - my) * k

      stars.rotation.y = reduce ? 0 : ms * 0.00001 // slow drift, only when motion is welcome
      stars.position.x = mx * 0.25
      stars.position.y = -my * 0.15 - scrollY * 0.0006
      renderer.render(scene, camera)
    }

    let raf = 0, running = false
    const loop = (ms: number) => { if (!running) return; frame(ms); raf = requestAnimationFrame(loop) }
    const start = () => { if (running || reduce) return; running = true; raf = requestAnimationFrame(loop) }
    const stop = () => { running = false; cancelAnimationFrame(raf) }
    const once = () => frame(performance.now())
    const onVisibility = () => (document.hidden ? stop() : start())
    const onResize = () => {
      W = innerWidth; H = innerHeight
      renderer.setSize(W, H, false)
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      if (reduce) once()
    }

    addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    if (reduce) {
      // Direct response only: redraw when the visitor moves or scrolls.
      once()
      addEventListener('scroll', once, { passive: true })
      addEventListener('pointermove', once, { passive: true })
    } else {
      start()
    }

    return () => {
      stop()
      removeEventListener('pointermove', onMove)
      removeEventListener('resize', onResize)
      removeEventListener('scroll', once)
      removeEventListener('pointermove', once)
      document.removeEventListener('visibilitychange', onVisibility)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [reduce])

  return <canvas ref={ref} className="starfield" aria-hidden="true" />
}
