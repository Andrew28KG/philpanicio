import type { ImageMetadata } from 'astro';

// Every image under src/assets is available here, so the JSON files can refer
// to images by path (e.g. "products/cakes/chocolate.jpg") and still get Astro's
// optimisation (resizing, WebP/AVIF) and base-path-safe URLs.
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

export function resolveImage(path: string): ImageMetadata {
  const key = `/src/assets/${path.replace(/^\/+/, '').replace(/^src\/assets\//, '')}`;
  const found = images[key];
  if (!found) {
    throw new Error(
      `Image not found: "${path}". Put the file in src/assets/ and use its path relative to that folder ` +
        `(e.g. "products/cakes/my-cake.jpg"). Paths are case-sensitive.`,
    );
  }
  return found.default;
}
