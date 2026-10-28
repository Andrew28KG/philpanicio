import site from '../data/site.json';
import { fill, formatPrice, t, type Lang, type Localized } from './i18n';

/** https://wa.me link that opens a chat with the bakery and a pre-filled message. */
export function waLink(text: string, number: string = site.whatsapp): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function greetingMessage(lang: Lang): string {
  return t(site.messages.greeting, lang);
}

export function productMessage(product: { name: Localized; price: number; unit?: Localized }, lang: Lang): string {
  const price = formatPrice(product.price);
  return fill(t(site.messages.product, lang), {
    product: t(product.name, lang),
    price: product.unit ? `${price} ${t(product.unit, lang)}` : price,
  });
}

export interface OrderItem {
  name: Localized;
  price: number;
  qty: number;
}

/** Message for a multi-item order — ready for the future cart. */
export function orderMessage(items: OrderItem[], lang: Lang): string {
  const lines = items.map(
    (item) => `• ${item.qty}× ${t(item.name, lang)} — ${formatPrice(item.price * item.qty)}`,
  );
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return [
    t(site.messages.cartIntro, lang),
    ...lines,
    '',
    `${t(site.messages.cartTotal, lang)}: ${formatPrice(total)}`,
  ].join('\n');
}

/** "6287774435888" → "+62 877-7443-5888" for display. */
export function formatPhone(number: string = site.whatsapp): string {
  const local = number.replace(/^62/, '');
  return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
}
