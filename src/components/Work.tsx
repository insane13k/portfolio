import { useRef, useState, type PointerEvent } from 'react'
import { content, type Project } from '../content'
import { Reveal } from './Reveal'
import { Tilt } from './Tilt'

/** Screenshot area: phone screenshots are shown as a pair of phones rising from the bottom edge. */
function Shot({ p, i, className = '' }: { p: Project; i: number; className?: string }) {
  const imgs = p.images ?? []
  const fallback = i % 3 === 1 ? ' s2' : i % 3 === 2 ? ' s3' : ''
  if (imgs.length === 0) return <div className={`shot${fallback} ${className}`} />
  return (
    <div className={`shot has-img phones ${className}`}>
      {imgs.slice(0, 2).map(src => <img key={src} src={src} alt={p.title} loading="lazy" />)}
    </div>
  )
}

/** Big index: a list of project names; a preview card follows the cursor over the row you're on. */
export function Work() {
  const list = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const move = (e: PointerEvent) => {
    if (!list.current) return
    const r = list.current.getBoundingClientRect()
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
  }
  const projects = content.projects
  const hp = hover != null ? projects[hover] : null
  const one = projects.length === 1

  return (
    <section className="sec" id="work">
      <div className="sh"><span className="eyebrow">Selected work</span><h2>Things I've shipped.</h2></div>
      <div className="idx" ref={list} onPointerMove={move} onPointerLeave={() => setHover(null)}>
        {projects.map((p, i) => (
          <a key={p.id} className="ir" href={p.live || p.code || `#${p.id}`} target={p.live || p.code ? '_blank' : undefined} rel="noopener" onPointerEnter={() => setHover(i)}>
            <span className="n">{String(i + 1).padStart(2, '0')}</span>
            <span className="t">{p.title}</span>
            <span className="c">{p.tagline}</span>
            <span className="y">{p.year}</span>
          </a>
        ))}
        <div className={`iprev${hp ? ' on' : ''}`} style={{ left: pos.x, top: pos.y }} aria-hidden="true">
          {hp && <><Shot p={hp} i={hover ?? 0} /><p>{hp.description}</p></>}
        </div>
      </div>
      {/* Detail cards: the full story of each project, with links. */}
      <div className={`pd${one ? ' one' : ''}`}>
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <Tilt href={p.live || p.code || '#work'} className="pcard">
              <Shot p={p} i={i} className="pshot" />
              <div className="pbody">
                <span className="tag">{p.featured ? 'Featured' : p.tags[0] ?? 'Project'}{p.live ? ' · Live' : ''}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
                {(p.live || p.code) && <div className="lk">{p.live && <span>{p.live.replace(/^https?:\/\//, '')} ↗</span>}{p.code && <span>Code ↗</span>}</div>}
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
