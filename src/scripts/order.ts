// Order form (components/OrderForm.astro). Any [data-order] element opens it:
//   data-order-kind   "custom" | "product"
//   data-order-id     product id (picks the product's option chips)
//   data-order-name-id / data-order-name-en
//   data-order-link   absolute URL of the design page (custom) — sent as the photo reference
//   data-order-img    thumbnail URL
//   data-order-price, data-order-unit-id / -en, data-order-max  (products)
// The element's own href (a plain wa.me link) stays as the no-JS fallback.
import { currentLang, type Lang } from './prefs';

type Msg = Record<'customIntro' | 'productIntro' | 'design' | 'reference' | 'total' | 'thanks', Record<Lang, string>>;

const price = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const rupiah = (n: number) => price.format(n).replace(/\s/g, ' ');
const stripOptional = (s: string) => s.replace(/\s*\((opsional|optional)\)\s*$/i, '');

export function initOrder() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-order-form]');
  if (!dialog) return;
  const form = dialog.querySelector('form')!;
  const msg = JSON.parse(dialog.dataset.i18nMsg!) as Msg;
  const qty = form.elements.namedItem('qty') as HTMLInputElement;
  const date = form.elements.namedItem('date') as HTMLInputElement;
  const thumb = dialog.querySelector<HTMLImageElement>('[data-of-thumb]')!;
  const priceEl = dialog.querySelector<HTMLElement>('[data-of-price]')!;
  const maxEl = dialog.querySelector<HTMLElement>('[data-of-max]')!;
  let current: DOMStringMap = {};
  let opener: HTMLElement | null = null;

  const pad = (n: number) => String(n).padStart(2, '0');
  const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  function updatePrice() {
    const p = Number(current.orderPrice);
    if (!p) return (priceEl.textContent = '');
    const unit = currentLang() === 'en' ? current.orderUnitEn : current.orderUnitId;
    const n = Math.max(1, Number(qty.value) || 1);
    priceEl.textContent = n > 1 || !unit ? rupiah(p * n) : `${rupiah(p)} ${unit}`;
  }

  function open(trigger: HTMLElement) {
    current = { ...trigger.dataset };
    const kind = current.orderKind === 'product' ? 'product' : 'custom';
    form.reset();

    dialog.querySelectorAll<HTMLElement>('[data-for]').forEach((el) => (el.hidden = el.dataset.for !== kind));
    const scope = kind === 'custom' ? 'custom' : current.orderId;
    dialog.querySelectorAll<HTMLElement>('[data-options]').forEach((el) => (el.hidden = el.dataset.options !== scope));

    dialog.querySelector('[data-of-name="id"]')!.textContent = current.orderNameId ?? '';
    dialog.querySelector('[data-of-name="en"]')!.textContent = current.orderNameEn ?? current.orderNameId ?? '';
    thumb.src = current.orderImg ?? '';
    thumb.hidden = !current.orderImg;

    const max = Number(current.orderMax) || 0;
    qty.max = max ? String(max) : '';
    qty.value = '1';
    maxEl.hidden = !max;
    maxEl.querySelectorAll<HTMLElement>('[data-max-text]').forEach((s) => (s.textContent = s.dataset.maxText!.replace('{max}', String(max))));
    updatePrice();

    // Earliest date: two days from today (orders need 2–3 days).
    const min = new Date();
    min.setDate(min.getDate() + 2);
    date.min = isoDate(min);

    opener = trigger;
    dialog.showModal();
    window.dispatchEvent(new CustomEvent('pp:modal', { detail: true }));
  }

  function close() {
    dialog.close();
  }

  function buildMessage(lang: Lang): string {
    const L = (el: HTMLElement) => stripOptional(el.dataset[lang === 'en' ? 'labelEn' : 'labelId'] ?? '');
    const kind = current.orderKind === 'product' ? 'product' : 'custom';
    const name = (lang === 'en' ? current.orderNameEn : current.orderNameId) ?? current.orderNameId ?? '';
    const lines: string[] = [];

    if (kind === 'custom') {
      lines.push(msg.customIntro[lang], '', `${msg.design[lang]}: *${name}*`);
      if (current.orderLink) lines.push(`${msg.reference[lang]}: ${current.orderLink}`);
    } else {
      const n = Math.max(1, Number(qty.value) || 1);
      const p = Number(current.orderPrice) || 0;
      lines.push(msg.productIntro[lang], `• ${n}× *${name}*${p ? ` — ${rupiah(p * n)}` : ''}`);
    }
    lines.push('');

    // chosen chips (skips "not sure yet", which has an empty value)
    const scope = kind === 'custom' ? 'custom' : current.orderId;
    dialog.querySelectorAll<HTMLInputElement>(`[data-options="${scope}"] input:checked`).forEach((input) => {
      if (input.value !== '') lines.push(`${L(input)}: ${input.dataset[lang]}`);
    });

    if (date.value) {
      const [y, m, d] = date.value.split('-').map(Number);
      const text = new Date(y, m - 1, d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      lines.push(`${L(date)}: ${text}`);
    }
    for (const field of ['size', 'cakeText', 'name', 'notes']) {
      const el = form.elements.namedItem(field) as HTMLInputElement | null;
      if (!el || el.closest<HTMLElement>('[hidden]')) continue;
      const value = el.value.trim();
      if (value) lines.push(`${L(el)}: ${value}`);
    }
    lines.push('', msg.thanks[lang]);
    return lines.join('\n').replace(/\n{3,}/g, '\n\n');
  }

  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element).closest<HTMLElement>('[data-order]');
    if (!trigger) return;
    event.preventDefault();
    open(trigger);
  });

  dialog.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const max = Number(qty.max) || Infinity;
      qty.value = String(Math.min(max, Math.max(1, (Number(qty.value) || 1) + Number(btn.dataset.step))));
      updatePrice();
    }),
  );
  qty.addEventListener('input', () => {
    const max = Number(qty.max) || Infinity;
    if (Number(qty.value) > max) qty.value = String(max);
    updatePrice();
  });
  window.addEventListener('pp:lang', updatePrice);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = buildMessage(currentLang());
    window.open(`https://wa.me/${dialog.dataset.wa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    close();
  });

  dialog.querySelector('[data-of-close]')!.addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener('close', () => {
    // Another dialog (e.g. the photo lightbox) may still be open underneath.
    const stillOpen = document.querySelector('dialog[open]');
    window.dispatchEvent(new CustomEvent('pp:modal', { detail: Boolean(stillOpen) }));
    opener?.focus({ preventScroll: true });
    opener = null;
  });
}
