/**
 * Site-wide constants. Kept in one module so the name, tagline and contact
 * details aren't duplicated across layouts and meta tags.
 */

export const SITE = {
  /** Used in <title> suffixes, OG site_name and the header. */
  name: 'Clara Cao',
  /** Fallback <title> and OG title for the landing page. */
  title: 'Clara Cao',
  /** Default meta description; individual pages should override this. */
  description:
    'Product designer at Bolt, raising the quality bar for the ride-hailing experience. Selected work and case studies.',
  /** Used for OG locale and the <html lang> attribute. */
  lang: 'en',
  /** The intro on the About tile and page (About.astro, pages/about.astro). */
  intro:
    'Clara Cao is a product designer at Bolt, shaping the app millions of people use to get around their city. She finds the problem worth solving, builds the answer in real code with AI, and turns messy flows into calm, effortless experiences.',
} as const;

/**
 * Public contact links, shown in the footer (Footer.astro). Static links only — a contact form
 * would need a server or third-party endpoint, which this site avoids.
 * public/cv.pdf is a copy of cv/Clara-Cao-CV.pdf (WIP); re-copy after ./build.sh.
 */
export const CONTACT = [
  { label: 'claracao99@gmail.com', href: 'mailto:claracao99@gmail.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/clara-cao/', external: true },
  { label: 'CV', href: '/cv.pdf', external: true },
] as const;
