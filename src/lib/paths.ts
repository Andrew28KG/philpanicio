/**
 * Prefixes a path with the site's base (e.g. "/philpanicio/") so links keep
 * working on GitHub Pages. Use it for every internal link or file in /public.
 *   withBase('menu')        → "/philpanicio/menu"
 *   withBase('favicon.svg') → "/philpanicio/favicon.svg"
 */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return base + path.replace(/^\/+/, '');
}
