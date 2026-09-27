/**
 * Site-wide constants. Kept in one module so the name, tagline and contact
 * details aren't duplicated across layouts and meta tags.
 */

export const SITE = {
  /** Used in <title> suffixes, OG site_name and the header. */
  name: 'Clara Cao',
  /** Fallback <title> and OG title for the landing page. */
  title: 'Clara Cao — Product Designer',
  /** Default meta description; individual pages should override this. */
  description:
    'Product designer at Bolt, raising the quality bar for the ride-hailing experience. Selected work and case studies.',
  /** Used for OG locale and the <html lang> attribute. */
  lang: 'en',
} as const;

/**
 * Public contact links, shown on /about. Static links only — a contact form
 * would need a server or third-party endpoint, which this site avoids.
 * TODO (Clara): add the real LinkedIn URL and drop a CV at public/cv.pdf.
 */
export const CONTACT = [
  { label: 'claracao99@gmail.com', href: 'mailto:claracao99@gmail.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/claracao99/', external: true },
  { label: 'CV', href: '/cv.pdf', external: true },
] as const;
