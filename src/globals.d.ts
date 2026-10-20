import type Lenis from 'lenis';

declare global {
  interface Window {
    /** The page's smooth scroll (SmoothScroll.astro), absent under reduced motion. */
    smoothScroll?: Lenis;
  }
}
