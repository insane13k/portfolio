import type { ReactNode } from 'react'

/**
 * Fades and lifts its children as they cross the viewport — tied to scroll
 * position, not fired once by a trigger, so it tracks the scroll both ways.
 *
 * StringTune writes --reveal (0 → 1) over the window below and `.rv` in
 * index.css reads it. If the engine never drives an element, --reveal stays
 * unset and the fallback shows it in full — reveals never hide content.
 * `delay` shifts the window so a row of cards arrives one after another.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div
      className={`rv ${className}`.trim()}
      data-string="progress"
      data-string-key="--reveal"
      data-string-offset-bottom={`${-6 - delay * 60}%`}
      data-string-exit-el="top"
      data-string-exit-vp="top"
      data-string-offset-top="-48%"
    >
      {children}
    </div>
  )
}
