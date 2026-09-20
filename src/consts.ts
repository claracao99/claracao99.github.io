/**
 * Site-wide constants. Kept in one module so the name, tagline and nav
 * structure aren't duplicated across layouts and meta tags.
 */

export const SITE = {
  /** Used in <title> suffixes, OG site_name and the footer. */
  name: 'Clara Cao',
  /**
   * Fallback <title> and OG title for the landing page.
   * TODO (Clara): this is placeholder positioning — it's what shows in search
   * results and link previews, so replace it with your own wording.
   */
  title: 'Clara Cao — Product Designer',
  /**
   * Default meta description; individual pages should override this.
   * TODO (Clara): also placeholder, and also public-facing.
   */
  description:
    'Product designer. Selected work and case studies.',
  /** Used for OG locale and the <html lang> attribute. */
  lang: 'en',
} as const;

export const NAV_LINKS = [
  { href: '/work/', label: 'Work' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
] as const;
