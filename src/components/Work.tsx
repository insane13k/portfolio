import { useRef, useState, type PointerEvent } from 'react'
import { content, type Project } from '../content'
import { Reveal } from './Reveal'
import { Tilt } from './Tilt'

const shotClass = (i: number, p: Project) => `shot${p.image ? ' has-img' : i % 3 === 1 ? ' s2' : i % 3 === 2 ? ' s3' : ''}`

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
          {hp && <><div className={shotClass(hover ?? 0, hp)}>{hp.image && <img src={hp.image} alt="" />}</div><p>{hp.description}</p></>}
        </div>
      </div>
      {/* Detail cards: the full story of each project, with links. */}
      <div className="pd">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <Tilt href={p.live || p.code || '#work'}>
              <span className="tag">{p.featured ? 'Featured' : p.tags[0] ?? 'Project'}{p.live ? ' · Live' : ''}</span>
              <div className={shotClass(i, p)} style={{ aspectRatio: '16/10', marginTop: 10 }}>{p.image && <img src={p.image} alt={p.title} loading="lazy" />}</div>
              <h3 style={{ marginTop: 12 }}>{p.title}</h3>
              <p>{p.description}</p>
              <div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
              {(p.live || p.code) && <div className="lk">{p.live && <span>Live ↗</span>}{p.code && <span>Code ↗</span>}</div>}
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
