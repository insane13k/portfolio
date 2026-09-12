/**
 * ─────────────────────────────────────────────────────────────
 *  THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE WHAT THE SITE SAYS.
 *  Every section reads from here. Leave a field as "" to hide it.
 * ─────────────────────────────────────────────────────────────
 */

export type Project = {
  id: string
  title: string
  tagline: string          // one line, shown in the list
  description: string      // 2–3 lines, shown in the card
  year: string
  tags: string[]
  live?: string            // link to the live site / store listing
  code?: string            // link to the code
  images?: string[]        // files in public/projects/ — phone screenshots are shown as a pair of phones
  featured?: boolean
}

export type Milestone = {
  period: string
  title: string
  org: string
  description: string
}

export const content = {
  firstName: 'Aryan',
  lastName: 'Arora',
  role: 'Software engineer',
  status: 'Open to work',            // "" hides the green dot
  location: 'India',
  timeZone: 'Asia/Kolkata',

  /** The phrases that type themselves after "I build" */
  roles: ['web apps.', 'Android apps.', 'shops that take real orders.'],

  intro:
    'Software engineer at Capgemini. Outside work I built and run Protein Plate 2.0 — a live food-delivery platform with a customer site, admin panel and Android apps.',

  /** Put your resume at public/resume.pdf and set this to "/resume.pdf". "" hides the button. */
  resumeUrl: '',

  email: 'aryanarora7733@gmail.com',

  socials: [
    { label: 'GitHub', href: 'https://github.com/insane13k' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/aryan1306' },
    { label: 'WhatsApp', href: 'https://wa.me/917733812152' },
  ],

  /** GitHub username for the live activity tile. */
  githubUsername: 'insane13k',

  projects: [
    {
      id: 'protein-plate',
      title: 'Protein Plate 2.0',
      tagline: 'Food-delivery platform · web, admin, Android, UPI',
      description:
        'Built solo for a real business: customer site with nutrition breakdown per order, admin panel, two Android apps and a UPI payment flow. Live and taking orders every day.',
      year: '2026',
      tags: ['React', 'Firebase', 'Expo', 'UPI payments'],
      live: 'https://proteinplate.co.in',
      images: ['/projects/pp2.jpeg', '/projects/pp1.jpeg'],
      featured: true,
    },
  ] as Project[],

  about: {
    bio:
      'Software engineer at Capgemini. Outside work I designed, built and run Protein Plate 2.0 — a live food-delivery platform with a customer site, admin panel and two Android apps. I like shipping things people actually use.',
    stack: ['React', 'TypeScript', 'Firebase', 'Expo', 'Node', 'Tailwind'],
    currently: {
      building: 'Protein Plate 2.0',
      learning: '',                   // e.g. "Next.js" — "" hides the line
      basedIn: 'India',
    },
  },

  experience: [
    {
      period: 'Aug 2025 – Present',
      title: 'Software Engineer',
      org: 'Capgemini',
      description:
        "Test engineer on IKEA's Workforce Management (WFM) tool. Design test cases and support integration, payroll and UAT testing across release cycles.",
    },
    {
      period: '2025 – Present',
      title: 'Founder-developer',
      org: 'Protein Plate 2.0 · own product',
      description:
        'Designed and built the customer site, admin panel, two Android apps and the payment flow. Live at proteinplate.co.in.',
    },
  ] as Milestone[],

  education: [
    {
      period: '2023 – 2025',
      title: 'MCA — Master of Computer Applications',
      org: 'JECRC University, Jaipur',
      description: '',
    },
    {
      period: '2020 – 2023',
      title: 'BCA — Bachelor of Computer Applications',
      org: 'Lachoo Memorial College, Jodhpur',
      description: '',
    },
  ] as Milestone[],

  skills: {
    Frontend: ['React', 'TypeScript', 'Tailwind', 'Vite'],
    Mobile: ['React Native', 'Expo', 'Android builds'],
    Backend: ['Firebase', 'Firestore rules', 'Cloud Functions', 'Node'],
    Quality: ['Test case design', 'Integration testing', 'UAT', 'Payroll testing'],
    Tools: ['Git & GitHub', 'Netlify', 'Firebase console'],
  } as Record<string, string[]>,

  contact: {
    heading: "Let's build something.",
    blurb:
      'Have a product to build, or a team that needs someone who ships end to end? Send a note — I reply within a day.',
  },

  footer: 'Built with care · Hosted free · Made in India',
}
