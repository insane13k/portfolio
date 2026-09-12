import { useEffect, useState } from 'react'
import { content } from '../content'
import { useReducedMotion } from '../lib/hooks'

/** One-second opening with the name. Skipped entirely for reduced-motion visitors. */
export function Loader() {
  const reduce = useReducedMotion()
  const [off, setOff] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setOff(true), 1100)
    return () => clearTimeout(t)
  }, [])
  if (reduce) return null
  return (
    <div className={`loader${off ? ' off' : ''}`} aria-hidden="true">
      <div className="ld-name">{content.firstName}<b>.</b></div>
      <div className="ld-bar"><i /></div>
    </div>
  )
}
