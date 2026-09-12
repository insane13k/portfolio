/**
 * ─────────────────────────────────────────────────────────────
 *  THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE WHAT THE SITE SAYS.
 *  Every section reads from here. Leave a field as "" to hide it.
 *  Lines marked  // SAMPLE  are placeholders — replace them with your real details.
 * ─────────────────────────────────────────────────────────────
 */

export type Project = {
  id: string
  title: string
  tagline: string          // one line, shown in the list
  description: string      // 2–3 lines, shown in the preview card
  year: string
  tags: string[]
  live?: string            // link to the live site / store listing
  code?: string            // link to the code
  image?: string           // e.g. "/projects/proteinplate.jpg" (put the file in public/projects/)
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
  role: 'Full-stack developer',
  status: 'Open to work',            // "" hides the green dot
  location: 'India',
  timeZone: 'Asia/Kolkata',

  /** The phrases that type themselves after "I build" */
  roles: ['web apps.', 'Android apps.', 'shops that take real orders.'],

  intro:
    'Full-stack developer. Recently shipped Protein Plate 2.0 — a live food-delivery shop with a customer site, admin panel and Android apps.',

  /** Put your resume at public/resume.pdf and set this to "/resume.pdf". "" hides the button. */
  resumeUrl: '',

  /** Your email for the Contact section. "" hides the email link. */
  email: '',                          // SAMPLE — add your email

  socials: [
    { label: 'GitHub', href: '' },     // SAMPLE — add links; empty ones are hidden
    { label: 'LinkedIn', href: '' },
    { label: 'WhatsApp', href: '' },
  ],

  /** GitHub username for the live activity tile. "" shows a sample pattern instead. */
  githubUsername: '',

  projects: [
    {
      id: 'protein-plate',
      title: 'Protein Plate 2.0',
      tagline: 'Food-delivery platform · web, admin, Android, UPI',
      description:
        'Customer site, admin panel, two Android apps and a manual UPI payment flow. Live and taking real orders.',
      year: '2026',
      tags: ['React', 'Firebase', 'Expo'],
      live: '',                       // SAMPLE — add the shop URL
      code: '',
      image: '',
      featured: true,
    },
    {
      id: 'project-two',
      title: 'Your project',          // SAMPLE
      tagline: 'Sample row — replaced with yours',
      description: 'What it does, who it was for, what you built.',
      year: '2025',
      tags: ['Android'],
    },
    {
      id: 'project-three',
      title: 'Your project',          // SAMPLE
      tagline: 'Sample row',
      description: 'What it does, who it was for, what you built.',
      year: '2024',
      tags: ['Web'],
    },
  ] as Project[],

  about: {
    bio:
      'Full-stack developer building web and Android products, and the systems behind them. Latest: Protein Plate 2.0 — customer site, admin panel, two Android apps.', // SAMPLE
    stack: ['React', 'TypeScript', 'Firebase', 'Expo', 'Node'],
    currently: {
      building: 'Protein Plate 2.0',
      learning: 'your pick',          // SAMPLE
      basedIn: 'India',
    },
  },

  experience: [
    {
      period: '2026',
      title: 'Full-stack developer',
      org: 'Protein Plate 2.0 · own product',
      description:
        'Designed and built the customer site, admin panel, two Android apps and the payment flow. Live and taking orders.',
    },
    {
      period: '20——',                 // SAMPLE
      title: 'Your role',
      org: 'Company',
      description: 'Two lines on what you did and what changed because of it.',
    },
  ] as Milestone[],

  education: [
    {
      period: '20—— – 20——',          // SAMPLE
      title: 'Your degree',
      org: 'Your college',
      description: 'One highlight, if any.',
    },
  ] as Milestone[],

  skills: {
    Frontend: ['React', 'TypeScript', 'Tailwind', 'Vite'],
    Mobile: ['React Native', 'Expo', 'Android builds'],
    Backend: ['Firebase', 'Firestore rules', 'Cloud Functions', 'Node'],
    Tools: ['Git & GitHub', 'Netlify', 'Figma'],
  } as Record<string, string[]>,

  contact: {
    heading: "Let's build something.",
    blurb:
      'Have a product to build, or a team that needs someone who ships end to end? Send a note — I reply within a day.',
  },

  footer: 'Built with care · Hosted free · Made in India',
}
