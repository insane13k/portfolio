import { useState, type FormEvent } from 'react'
import { content } from '../content'
import { Magnetic } from './Magnetic'

/** Contact form posts to Netlify Forms (free, no backend). Locally it can't send, and says so. */
export function Contact() {
  const [msg, setMsg] = useState<{ text: string; err?: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const socials = content.socials.filter(s => s.href)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const body = new URLSearchParams()
    body.set('form-name', 'contact')
    for (const [k, v] of data.entries()) body.set(k, String(v))
    setBusy(true); setMsg(null)
    try {
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
      if (!r.ok) throw new Error(String(r.status))
      setMsg({ text: 'Sent — thank you. I reply within a day.' })
      e.currentTarget.reset()
    } catch {
      setMsg(import.meta.env.DEV
        ? { text: 'Sending only works on the live Netlify site, not on localhost.', err: true }
        : { text: 'Could not send. Please email me instead.', err: true })
    } finally { setBusy(false) }
  }

  return (
    <section className="contact" id="contact">
      <div>
        <span className="eyebrow">Contact</span>
        <h2>{content.contact.heading}</h2>
        <p className="sub">{content.contact.blurb}</p>
        <form className="form" name="contact" onSubmit={submit}>
          <input type="hidden" name="form-name" value="contact" />
          <p hidden><label>Don't fill this out: <input name="bot-field" /></label></p>
          <input type="text" name="name" placeholder="Your name" aria-label="Your name" required />
          <input type="email" name="email" placeholder="Your email" aria-label="Your email" required />
          <textarea name="message" placeholder="What are you building?" aria-label="Message" required />
          <div className="frow">
            <Magnetic as="button" type="submit" className="btn p">{busy ? 'Sending…' : 'Send message'}</Magnetic>
            {msg && <span className={`msg${msg.err ? ' err' : ''}`}>{msg.text}</span>}
          </div>
        </form>
        {(socials.length > 0 || content.email) && (
          <div className="soc">
            {socials.map(s => <a key={s.label} href={s.href} target="_blank" rel="noopener">{s.label}</a>)}
            {content.email && <a href={`mailto:${content.email}`}>Email</a>}
          </div>
        )}
      </div>
      <div className="slot c" id="contact-slot" aria-hidden="true" />
    </section>
  )
}
