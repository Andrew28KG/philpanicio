export const LANGS = ['id', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'id';

/** Text that is either the same in every language, or given per language. */
export type Localized = string | Record<Lang, string>;

export function t(value: Localized, lang: Lang): string {
  return typeof value === 'string' ? value : (value[lang] ?? value[DEFAULT_LANG]);
}

/**
 * Attributes (alt, href, aria-label…) that change with the language.
 * Renders the Indonesian value and stores both so the toggle can swap them:
 *   <img {...i18nAttrs({ alt: product.name })} />
 */
export function i18nAttrs(attrs: Record<string, Localized>): Record<string, string> {
  const out: Record<string, string> = {};
  const names: string[] = [];
  for (const [name, value] of Object.entries(attrs)) {
    out[name] = t(value, DEFAULT_LANG);
    if (typeof value === 'string') continue;
    names.push(name);
    for (const lang of LANGS) out[`data-i18n-${name}-${lang}`] = value[lang];
  }
  if (names.length) out['data-i18n'] = names.join(' ');
  return out;
}

/** Replaces {placeholders} in a template, e.g. fill('Hi {name}', { name: 'Phil' }). */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match);
}

const priceFormat = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return priceFormat.format(amount).replace(/\s/g, ' ');
}
