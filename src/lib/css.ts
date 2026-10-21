/**
 * A duration token (tokens.css) in milliseconds. Read the unit, never just
 * parseFloat: the production build's CSS minifier rewrites `600ms` as `.6s`,
 * which parseFloat reads as 0.6, and every wait timed by it collapses to
 * nothing (dev serves the tokens as written, so it only breaks live).
 */
export function cssMs(el: Element, name: string): number {
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(value) || 0;
  return value.endsWith('ms') ? n : value.endsWith('s') ? n * 1000 : n;
}
