/**
 * Light and dark, switched by the lamp's cord (Lamp.astro). The page opens
 * light; a pull is kept in localStorage.theme, which BaseLayout reads inline
 * before first paint. The system setting is deliberately not consulted.
 */

export type Theme = 'light' | 'dark';

const root = document.documentElement;

export const getTheme = (): Theme => (root.dataset.theme === 'dark' ? 'dark' : 'light');

export function setTheme(theme: Theme) {
  // Colours ease across for a moment (base.css), unless motion is reduced.
  root.classList.add('theme-switching');
  root.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {} // storage blocked: it holds for this page only
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(root).getPropertyValue('--surface').trim();
  const ms = parseFloat(getComputedStyle(root).getPropertyValue('--duration-theme')) || 500;
  clearTimeout(switching);
  switching = setTimeout(() => root.classList.remove('theme-switching'), ms);
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

let switching: ReturnType<typeof setTimeout>;
