import type { ImageMetadata } from 'astro';

/**
 * `sizes` for an image cropped into a tile with object-fit: cover. Tiles are
 * a fixed square on desktop and the window's width less its margins on
 * phones (both --tile-size in tokens.css). A photo wider than its tile fills
 * the tile's height and is drawn wider than the tile, so srcset must be told
 * that width or it picks a file too small and the photo goes soft.
 *
 * On case pages pictures span the whole grid (`wide`): two tiles and the
 * gap between on desktop, still one on phones.
 *
 *   tileSizes(cover.src)                          // a square index tile
 *   tileSizes(item.src, 16 / 9, { wide: true })   // a case picture at its own ratio
 */
const TILE_PX = 240; // desktop --tile-size
const GAP_PX = 10; // --index-gap
const RAIL_PX = 420; // --rail-tile at its largest

export function tileSizes(src: ImageMetadata | undefined, tileRatio = 1, { wide = false } = {}): string {
  const ratio = src ? src.width / src.height : 1;
  const scale = Math.max(1, ratio / tileRatio);
  const px = (size: number) => `${Math.ceil(size * scale)}px`;
  const desktop = wide ? 2 * TILE_PX + GAP_PX : TILE_PX;
  return `(max-width: 32rem) ${Math.ceil(100 * scale)}vw, ${px(desktop)}`;
}

/** An index tile: the grid's square up to 48rem, the rail's bigger one beyond. */
export function railSizes(src: ImageMetadata | undefined): string {
  const scale = Math.max(1, src ? src.width / src.height : 1);
  const px = (size: number) => `${Math.ceil(size * scale)}px`;
  return `(max-width: 32rem) ${Math.ceil(100 * scale)}vw, (max-width: 48rem) ${px(TILE_PX)}, ${px(RAIL_PX)}`;
}
