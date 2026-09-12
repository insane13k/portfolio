import { useEffect, useRef } from 'react'

/** Thin line at the top that fills as you read. */
export function Progress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const on = () => {
      const max = document.body.scrollHeight - innerHeight
      if (ref.current) ref.current.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%'
    }
    on()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
  return <div id="prog" ref={ref} aria-hidden="true" />
}
