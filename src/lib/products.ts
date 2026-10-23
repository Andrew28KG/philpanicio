import { z } from 'astro/zod';
import rawProducts from '../data/products.json';
import { resolveImage } from './images';
import type { Localized } from './i18n';

const localized = z.union([
  z.string().min(1),
  z.object({ id: z.string().min(1), en: z.string().min(1) }),
]);

const productSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'use lowercase letters, numbers and dashes only, e.g. "banana-bread"'),
  name: localized,
  description: localized,
  price: z.number().int().nonnegative(),
  category: z.string().min(1),
  image: z.string().min(1),
  featured: z.boolean().default(false),
  available: z.boolean().default(true),
});

export type Product = z.infer<typeof productSchema> & {
  name: Localized;
  description: Localized;
};

function load(): Product[] {
  const parsed = z.array(productSchema).safeParse(rawProducts);
  if (!parsed.success) {
    throw new Error(`src/data/products.json has a problem:\n${z.prettifyError(parsed.error)}`);
  }
  const seen = new Set<string>();
  for (const product of parsed.data) {
    if (seen.has(product.id)) {
      throw new Error(`src/data/products.json: the id "${product.id}" is used more than once.`);
    }
    seen.add(product.id);
    resolveImage(product.image); // fail the build early if the photo is missing
  }
  return parsed.data;
}

const products = load();

export function getProducts(): Product[] {
  return products;
}

export function getFeatured(): Product[] {
  return products.filter((p) => p.featured);
}

export function getByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getCategories(): string[] {
  return [...new Set(products.map((p) => p.category))];
}
