import { useRef, type ReactNode, type PointerEvent } from 'react'
import { useReducedMotion } from '../lib/hooks'

type Props = { as?: 'a' | 'button'; className?: string; href?: string; type?: 'button' | 'submit'; children: ReactNode; onClick?: () => void }

/** A button that leans toward the cursor while it hovers, and snaps back when it leaves. */
export function Magnetic({ as = 'a', className = '', href, type, children, onClick }: Props) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const move = (e: PointerEvent) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
    ref.current.style.transform = `translate(${dx * 0.22}px,${dy * 0.22}px)`
  }
  const leave = () => { if (ref.current) ref.current.style.transform = '' }
  if (as === 'button') {
    return <button ref={ref as React.RefObject<HTMLButtonElement>} type={type ?? 'button'} className={className} onPointerMove={move} onPointerLeave={leave} onClick={onClick}>{children}</button>
  }
  return <a ref={ref as React.RefObject<HTMLAnchorElement>} href={href} className={className} onPointerMove={move} onPointerLeave={leave} onClick={onClick}>{children}</a>
}
