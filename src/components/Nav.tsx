import { content } from '../content'
import { useReducedMotion } from '../lib/hooks'

/** Floating glass pill. The empty round button on the left is where the 3D object docks — it doubles as "back to top". */
export function Nav() {
  const reduce = useReducedMotion()
  return (
    <header className="nav">
      <a
        className="nm"
        href="#top"
        onClick={e => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }) }}
      >
        {content.firstName}<b>.</b>
      </a>
      <nav className="links">
        <a href="#work">Work</a><a href="#about">About</a><a href="#path">Path</a><a href="#skills">Skills</a><a href="#contact">Contact</a>
      </nav>
      {content.resumeUrl && <a className="res" href={content.resumeUrl} download>Resume ↓</a>}
    </header>
  )
}
