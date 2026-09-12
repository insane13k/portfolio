import { useRef, type ReactNode, type PointerEvent } from 'react'
import { useReducedMotion } from '../lib/hooks'

/** A card that tilts in 3D toward the cursor with a soft glow where the pointer is. */
export function Tilt({ className = '', href, children }: { className?: string; href?: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduce = useReducedMotion()
  const move = (e: PointerEvent) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `perspective(800px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-2px)`
    ref.current.style.setProperty('--gx', `${(x + 0.5) * 100}%`)
    ref.current.style.setProperty('--gy', `${(y + 0.5) * 100}%`)
  }
  const leave = () => {
    if (!ref.current) return
    ref.current.style.transform = ''
    ref.current.style.setProperty('--gx', '50%')
    ref.current.style.setProperty('--gy', '50%')
  }
  return <a ref={ref} href={href} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={leave}>{children}</a>
}
