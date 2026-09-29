import type { ElementType } from 'react'

/**
 * A heading whose words rise into place as you scroll toward it.
 *
 * StringTune splits the text into `.-s-word` spans (giving each --word-index
 * and --word-total) and writes --reveal across the window below. The stagger
 * maths lives in index.css, so there is no per-word JavaScript and no timers:
 * scroll up and the words settle back exactly as they came.
 */
export function SplitText({
  as: Tag = 'h2',
  children,
  className = '',
}: {
  as?: ElementType
  children: string
  className?: string
}) {
  return (
    <Tag
      className={`reveal-text ${className}`.trim()}
      data-string="split|progress"
      data-string-key="--reveal"
      data-string-split="word"
      data-string-offset-bottom="-8%"
      data-string-exit-el="top"
      data-string-exit-vp="top"
      data-string-offset-top="-55%"
    >
      {children}
    </Tag>
  )
}
