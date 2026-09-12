import { content } from '../content'

export function Footer() {
  return (
    <footer>
      <span>© {new Date().getFullYear()} {content.firstName} {content.lastName}</span>
      <span>{content.footer}</span>
    </footer>
  )
}
