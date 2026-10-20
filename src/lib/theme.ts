/**
 * Light and dark, switched by the lamp's cord (Lamp.astro). The page opens
 * dark; a pull is kept in localStorage.theme, which BaseLayout reads inline
 * before first paint. The system setting is deliberately not consulted.
 *
 * The switch crossfades the whole page at once (a same-document View
 * Transition, styled in base.css), so every colour changes together. Easing
 * each element's colours instead is uneven: an element that sets its own
 * colour inside one that inherits a changing colour (the footer's "Copy"
 * inside its button) has its transition restarted every frame, and lags far
 * behind. Browsers without View Transitions fall back to that easing.
 */

export type Theme = 'light' | 'dark';

const root = document.documentElement;

export const getTheme = (): Theme => (root.dataset.theme === 'dark' ? 'dark' : 'light');

const apply = (theme: Theme) => {
  root.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {} // storage blocked: it holds for this page only
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(root).getPropertyValue('--surface').trim();
};

export function setTheme(theme: Theme) {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm && document.startViewTransition) {
    root.dataset.themeSwitch = '';
    const vt = document.startViewTransition(() => apply(theme));
    vt.finished.finally(() => delete root.dataset.themeSwitch);
  } else {
    // Colours ease across for a moment (base.css), unless motion is reduced.
    root.classList.add('theme-switching');
    apply(theme);
    const ms = parseFloat(getComputedStyle(root).getPropertyValue('--duration-theme')) || 500;
    clearTimeout(switching);
    switching = setTimeout(() => root.classList.remove('theme-switching'), ms);
  }
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

let switching: ReturnType<typeof setTimeout>;
