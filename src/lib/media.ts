import type { ImageMetadata } from 'astro';

/**
 * `sizes` for an image cropped into a tile with object-fit: cover. A photo
 * wider than its tile fills the tile's height and is drawn wider than the
 * tile, so srcset must be told that width or it picks a file too small and
 * the photo goes soft.
 *
 *   tileSizes(cover.src, { phone: [50, 4 / 5], desktop: [25, 4 / 5] })
 *
 * Each breakpoint is [tile width in vw, tile width / height].
 */
export function tileSizes(
  src: ImageMetadata | undefined,
  tile: { phone: [number, number]; desktop: [number, number] },
): string {
  const ratio = src ? src.width / src.height : 1;
  const drawn = ([vw, tileRatio]: [number, number]) => Math.ceil(vw * Math.max(1, ratio / tileRatio));
  return `(max-width: 48rem) ${drawn(tile.phone)}vw, ${drawn(tile.desktop)}vw`;
}
