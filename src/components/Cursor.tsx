import { useEffect, useRef } from 'react'
import { useFinePointer, useReducedMotion } from '../lib/hooks'

/** Dot + ring cursor. Only on devices with a mouse; the ring widens over links and buttons. */
export function Cursor() {
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const dot = useRef<HTMLElement>(null)
  const ring = useRef<HTMLElement>(null)
  const active = fine && !reduce

  useEffect(() => {
    if (!active) return
    const html = document.documentElement
    html.classList.add('cur-on')
    let cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy, raf = 0
    const move = (e: PointerEvent) => {
      cx = e.clientX; cy = e.clientY
      if (dot.current) dot.current.style.transform = `translate(${cx}px,${cy}px)`
    }
    const loop = () => {
      rx += (cx - rx) * 0.2; ry += (cy - ry) * 0.2
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`
      raf = requestAnimationFrame(loop)
    }
    const over = (e: Event) => {
      const t = e.target as Element | null
      html.classList.toggle('cur-big', !!t?.closest('a,button,[data-hover]'))
    }
    addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over)
    raf = requestAnimationFrame(loop)
    return () => {
      html.classList.remove('cur-on', 'cur-big')
      removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      cancelAnimationFrame(raf)
    }
  }, [active])

  if (!active) return null
  return (
    <div className="cur" aria-hidden="true">
      <i className="dot" ref={dot} />
      <i className="ring" ref={ring} />
    </div>
  )
}
