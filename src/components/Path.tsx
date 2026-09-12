import { useEffect, useRef } from 'react'
import { content, type Milestone } from '../content'

/** Experience and education on one timeline. The coloured line draws itself as you scroll; items light up as you reach them. */
export function Path() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fill = el.querySelector<HTMLElement>('.tl-line i')
    const on = () => {
      const r = el.getBoundingClientRect(), H = innerHeight
      fill?.style.setProperty('--p', Math.max(0, Math.min(1, (H * 0.8 - r.top) / r.height)).toFixed(3))
      el.querySelectorAll<HTMLElement>('.ti').forEach(t => t.classList.toggle('in', t.getBoundingClientRect().top < H * 0.85))
    }
    on()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
  const Item = ({ m }: { m: Milestone }) => (
    <div className="ti">
      <span className="y">{m.period}</span>
      <h3>{m.title}<small>{m.org}</small></h3>
      {m.description && <p>{m.description}</p>}
    </div>
  )
  return (
    <section className="sec" id="path">
      <div className="sh"><span className="eyebrow">Path</span><h2>Experience and education.</h2></div>
      <div className="tl" ref={ref}>
        <div className="tl-line"><i /></div>
        {content.experience.length > 0 && <div className="hh">Experience</div>}
        {content.experience.map((m, i) => <Item key={`e${i}`} m={m} />)}
        {content.education.length > 0 && <div className="hh">Education</div>}
        {content.education.map((m, i) => <Item key={`d${i}`} m={m} />)}
      </div>
    </section>
  )
}
