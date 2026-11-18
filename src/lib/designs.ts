import site from '../data/site.json';
import { withBase } from './paths';

export interface Design {
  slug: string;
  image: string;
  style: string;
  caption: { id: string; en: string };
}

/** "custom/bird-garden-two-tier.jpg" → "bird-garden-two-tier" */
export const slugOf = (image: string) => image.replace(/^.*\//, '').replace(/\.[a-z]+$/i, '');

export function getDesigns(): Design[] {
  return site.custom.items.map((item) => ({
    slug: slugOf(item.image),
    image: item.image,
    style: item.style,
    caption: item.caption as { id: string; en: string },
  }));
}

/** Site-relative path of a design's own page, e.g. "/philpanicio/kue/bird-garden-two-tier/". */
export const designPath = (slug: string) => withBase(`kue/${slug}/`);

/** Absolute URL of a design page: what goes into the WhatsApp message (WhatsApp shows its photo preview). */
export const designUrl = (slug: string, site: URL | undefined) => new URL(designPath(slug), site).href;
