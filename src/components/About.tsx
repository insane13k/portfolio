import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { content } from '../content'
import { useClock } from '../lib/hooks'

/** GitHub contribution levels (0–4) for the last `days` days. Real when a username is set, otherwise a sample pattern. */
function useContributions(days: number) {
  const [levels, setLevels] = useState<number[] | null>(null)
  const [real, setReal] = useState(false)
  useEffect(() => {
    let alive = true
    const sample = () => Array.from({ length: days }, () => { const r = Math.random(); return r < 0.42 ? 0 : r < 0.65 ? 1 : r < 0.82 ? 2 : r < 0.94 ? 3 : 4 })
    if (!content.githubUsername) { setLevels(sample()); return }
    fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(content.githubUsername)}?y=last`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status))))
      .then((d: { contributions: { level: number }[] }) => {
        if (!alive) return
        const lv = d.contributions.slice(-days).map(c => c.level)
        setLevels(lv.length ? lv : sample()); setReal(lv.length > 0)
      })
      .catch(() => { if (alive) setLevels(sample()) })
    return () => { alive = false }
  }, [days])
  return { levels, real }
}

/** Live tiles: bio, real clock, GitHub activity, stack, and what you're up to. The border glow follows the cursor. */
export function About() {
  const grid = useRef<HTMLDivElement>(null)
  const clock = useClock(content.timeZone)
  const { levels, real } = useContributions(140)
  const initials = (content.firstName[0] ?? '') + (content.lastName[0] ?? '')
  const move = (e: PointerEvent) => {
    grid.current?.querySelectorAll<HTMLElement>('.gt').forEach(t => {
      const r = t.getBoundingClientRect()
      t.style.setProperty('--x', `${e.clientX - r.left}px`); t.style.setProperty('--y', `${e.clientY - r.top}px`)
    })
  }
  const { building, learning, basedIn } = content.about.currently

  return (
    <section className="sec" id="about">
      <div className="sh"><span className="eyebrow">About</span><h2>Who's behind the work.</h2></div>
      <div className="ab" ref={grid} onPointerMove={move}>
        <div className="gt big">
          <div className="av">{initials}</div>
          <h3>{content.firstName} {content.lastName}</h3>
          <p>{content.about.bio}</p>
          <div className="tags">{content.about.stack.map(s => <span key={s}>{s}</span>)}</div>
        </div>
        <div className="gt">
          <span className="lbl">Now</span>
          <div className="clock">{clock}</div>
          <div className="small">{content.location} · local time</div>
          {content.status && <div className="small" style={{ marginTop: 'auto', color: 'var(--ok)' }}>● {content.status}</div>}
        </div>
        <div className="gt">
          <span className="lbl">GitHub activity{!real && <em> · sample</em>}</span>
          <div className="heat" aria-hidden="true">{(levels ?? []).map((l, i) => <i key={i} className={l ? `l${l}` : undefined} />)}</div>
          <div className="small">Last 20 weeks</div>
        </div>
        <div className="gt">
          <span className="lbl">Stack</span>
          <div className="stk">{content.about.stack.slice(0, 6).map(s => <span key={s}>{s}</span>)}</div>
        </div>
        <div className="gt">
          <span className="lbl">Currently</span>
          <div className="cur-list">
            {building && <><b>Building</b> {building}<br /></>}
            {learning && <><b>Learning</b> {learning}<br /></>}
            {basedIn && <><b>Based in</b> {basedIn}</>}
          </div>
        </div>
      </div>
    </section>
  )
}
