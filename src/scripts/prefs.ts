// Language + theme toggles. The initial values are set by the inline script in Base.astro.
export type Lang = 'id' | 'en';

const root = document.documentElement;

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode — the choice just won't be remembered */
  }
}

export function currentLang(): Lang {
  return root.dataset.lang === 'en' ? 'en' : 'id';
}

/** Swap attributes rendered with i18nAttrs() (alt, href, aria-label…). */
function applyAttrs(lang: Lang) {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    for (const name of el.dataset.i18n!.split(' ')) {
      const value = el.getAttribute(`data-i18n-${name}-${lang}`);
      if (value !== null) el.setAttribute(name, value);
    }
  });
  const title = document.querySelector('title');
  const text = title?.getAttribute(`data-i18n-title-${lang}`);
  if (text) document.title = text;
}

export function setLang(lang: Lang, remember = true) {
  root.dataset.lang = lang;
  root.lang = lang;
  applyAttrs(lang);
  if (remember) store('pp-lang', lang);
  window.dispatchEvent(new CustomEvent('pp:lang', { detail: lang }));
}

function currentTheme(): 'light' | 'dark' {
  const set = root.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme: 'light' | 'dark') {
  root.dataset.theme = theme;
  store('pp-theme', theme);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.setAttribute('content', theme === 'dark' ? '#1c1512' : '#fffbf4');
  });
  window.dispatchEvent(new CustomEvent('pp:theme', { detail: theme }));
}

export function initPrefs() {
  if (currentLang() !== 'id') applyAttrs(currentLang());

  document.querySelectorAll('[data-toggle-lang]').forEach((btn) =>
    btn.addEventListener('click', () => setLang(currentLang() === 'id' ? 'en' : 'id')),
  );
  document.querySelectorAll('[data-toggle-theme]').forEach((btn) =>
    btn.addEventListener('click', () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark')),
  );

  // Solid header once the page is scrolled.
  const header = document.querySelector('[data-header]');
  if (header) {
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }
}
