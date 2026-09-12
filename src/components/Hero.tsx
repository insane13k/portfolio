import { useEffect, useState } from 'react'
import { content } from '../content'
import { useClock, useReducedMotion } from '../lib/hooks'
import { Magnetic } from './Magnetic'
import { Tilt } from './Tilt'

/** Types the phrases in content.roles one after another. */
function useTypewriter(phrases: string[], enabled: boolean) {
  const [text, setText] = useState(phrases[0] ?? '')
  useEffect(() => {
    if (!enabled || phrases.length === 0) { setText(phrases[0] ?? ''); return }
    let pi = 0, ci = phrases[0].length, del = false, t = 0
    const tick = () => {
      const p = phrases[pi]
      if (!del) { ci++; setText(p.slice(0, ci)); if (ci >= p.length) { del = true; t = window.setTimeout(tick, 1700); return } }
      else { ci--; setText(p.slice(0, ci)); if (ci <= 0) { del = false; pi = (pi + 1) % phrases.length } }
      t = window.setTimeout(tick, del ? 38 : 72)
    }
    del = true; t = window.setTimeout(tick, 1700)
    return () => clearTimeout(t)
  }, [phrases, enabled])
  return text
}

export function Hero() {
  const reduce = useReducedMotion()
  const typed = useTypewriter(content.roles, !reduce)
  const clock = useClock(content.timeZone)
  const featured = content.projects.find(p => p.featured) ?? content.projects[0]

  return (
    <>
      <section className="hero" id="top">
        <div className="h-copy">
          {content.status && <p className="eyebrow live"><i />{content.status} · {new Date().getFullYear()}</p>}
          <h1 className="h1"><span className="ln">{content.firstName}</span><span className="ln">{content.lastName}</span></h1>
          <p className="role">I build <span className="tw">{typed}</span>{!reduce && <span className="caret" />}</p>
          <p className="sub">{content.intro}</p>
          <div className="cta">
            <Magnetic className="btn p" href="#work">See projects</Magnetic>
            <Magnetic className="btn g" href="#contact">Get in touch</Magnetic>
          </div>
        </div>
        <div className="h-right">
          <div className="slot" id="hero-slot" aria-hidden="true" />
          {featured && (
            <Tilt className="feat" href="#work">
              <span className="tag">Featured project</span>
              <h3>{featured.title}</h3>
              <p>{featured.description}</p>
              <div className={`shot${featured.images?.length ? ' has-img phones' : ''}`}>{featured.images?.slice(0, 2).map(src => <img key={src} src={src} alt="" loading="lazy" />)}</div>
              <div className="tags">{featured.tags.map(t => <span key={t}>{t}</span>)}{featured.live && <span>Live ↗</span>}</div>
            </Tilt>
          )}
        </div>
      </section>
      <div className="meta">
        <span>{content.location} · {clock}</span>
        <span>{Object.keys(content.skills).slice(0, 3).join(' · ')}</span>
        {featured && <span>Latest: {featured.title}</span>}
      </div>
    </>
  )
}
