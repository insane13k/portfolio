import type { ReactNode } from 'react'

type Props = {
  as?: 'a' | 'button'
  className?: string
  href?: string
  type?: 'button' | 'submit'
  children: ReactNode
  onClick?: () => void
  /** How far it leans toward the cursor (0–1). */
  strength?: number
  /** How close the cursor must be, in pixels, before it reacts. */
  radius?: number
}

/**
 * A button that leans toward the cursor. StringTune tracks the pointer and
 * writes --magnetic-x / --magnetic-y; the `.mag` rule in index.css turns those
 * into a transform. Touch devices never move it, which is the right behaviour.
 */
export function Magnetic({
  as = 'a',
  className = '',
  href,
  type,
  children,
  onClick,
  strength = 0.32,
  radius = 120,
}: Props) {
  const tune = {
    'data-string': 'magnetic',
    'data-string-strength': String(strength),
    'data-string-radius': String(radius),
  }
  const cls = `${className} mag`.trim()

  if (as === 'button') {
    return (
      <button type={type ?? 'button'} className={cls} onClick={onClick} {...tune}>
        {children}
      </button>
    )
  }
  return (
    <a href={href} className={cls} onClick={onClick} {...tune}>
      {children}
    </a>
  )
}
