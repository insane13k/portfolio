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
    const form = e.currentTarget
    const data = new FormData(form)
    const fields = { name: String(data.get('name') ?? ''), email: String(data.get('email') ?? ''), message: String(data.get('message') ?? '') }
    setBusy(true); setMsg(null)
    try {
      // 1) Web3Forms: emails the message to you, with the visitor's address as Reply-To.
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: content.web3formsKey,
          subject: `Portfolio message from ${fields.name}`,
          from_name: 'Portfolio contact form',
          botcheck: data.get('bot-field') ? 'yes' : '',
          ...fields,
        }),
      })
      const j = (await r.json().catch(() => ({}))) as { success?: boolean }
      if (!r.ok || !j.success) throw new Error('web3forms')
      // 2) Netlify Forms as a silent backup copy (only works on the live site).
      const body = new URLSearchParams({ 'form-name': 'contact', ...fields }).toString()
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }).catch(() => {})
      setMsg({ text: 'Sent — thank you. I reply within a day.' })
      form.reset()
    } catch {
      setMsg({ text: `Could not send. Please email me at ${content.email}.`, err: true })
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
