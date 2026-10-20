/**
 * Text tiles grow in whole squares: when their content is longer than one
 * square, they become two squares tall plus the gap between, or three, and so
 * on, so their edges stay on the tile rows. Sets --snap-height (the CSS uses
 * it as the height) and --snap-rows on the element, and keeps them right as
 * the window resizes.
 *
 * `square` returns the side of one tile in px. With `fitMaxHeight`, the rows
 * stop at the most that fit the element's max-height (it scrolls inside).
 * Returns the update, for callers that change the element's width themselves
 * and need the new height at once.
 */
export function snapToSquares(
  el: HTMLElement,
  { square, fitMaxHeight = false }: { square: () => number; fitMaxHeight?: boolean },
): () => void {
  const update = () => {
    const side = square();
    if (!side) return;
    const style = getComputedStyle(el);
    const gap = parseFloat(style.getPropertyValue('--index-gap')) || 0;

    // The content's own height, whatever height the box has now.
    const kids = [...el.children] as HTMLElement[];
    const top = kids[0]?.getBoundingClientRect().top ?? 0;
    const bottom = Math.max(...kids.map((k) => k.getBoundingClientRect().bottom), top);
    const content = bottom - top + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

    let rows = Math.max(1, Math.ceil((content + gap) / (side + gap) - 0.001));
    if (fitMaxHeight) {
      const max = parseFloat(style.maxHeight);
      if (max) rows = Math.max(1, Math.min(rows, Math.floor((max + gap) / (side + gap))));
    }
    el.style.setProperty('--snap-rows', String(rows));
    el.style.setProperty('--snap-height', `${rows * side + (rows - 1) * gap}px`);
  };

  update();
  let width = 0;
  new ResizeObserver(([entry]) => {
    if (Math.abs(entry.contentRect.width - width) < 0.5) return;
    width = entry.contentRect.width;
    update();
  }).observe(el);
  window.addEventListener('resize', update);
  document.fonts?.ready.then(update);
  return update;
}
