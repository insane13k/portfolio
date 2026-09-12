import { content } from '../content'
import { Reveal } from './Reveal'

/** Plain columns — words only, grouped. */
export function Skills() {
  return (
    <section className="sec" id="skills">
      <div className="sh"><span className="eyebrow">Skills</span><h2>What I work with.</h2></div>
      <Reveal>
        <div className="sk-cols">
          {Object.entries(content.skills).map(([group, items]) => (
            <div key={group}><b>{group}</b><ul>{items.map(s => <li key={s}>{s}</li>)}</ul></div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
