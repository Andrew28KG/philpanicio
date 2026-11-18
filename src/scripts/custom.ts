// Custom Cakes: style filter chips + a shared lightbox with prev/next and a
// WhatsApp "order a design like this" link. Close/backdrop handling comes from modal.ts.
import { currentLang } from './prefs';

export function initCustom() {
  const section = document.querySelector<HTMLElement>('[data-custom]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (!section || !dialog) return;

  const chips = [...section.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const tiles = [...section.querySelectorAll<HTMLElement>('.tile')];
  const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-custom-open]')];
  const img = dialog.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const wa = dialog.querySelector<HTMLAnchorElement>('[data-lb-wa]')!;
  const capId = dialog.querySelector<HTMLElement>('[data-lb-cap="id"]')!;
  const capEn = dialog.querySelector<HTMLElement>('[data-lb-cap="en"]')!;
  const share = dialog.querySelector<HTMLButtonElement>('[data-lb-share]')!;
  const shareLabel = share.querySelector<HTMLElement>('[data-share-label]')!;
  const shareDone = share.querySelector<HTMLElement>('[data-share-done]')!;

  // Share the design page: native share sheet on phones, otherwise copy the link.
  share.addEventListener('click', async () => {
    const url = share.dataset.link!;
    try {
      if (navigator.share) return await navigator.share({ title: `${share.dataset.title} · Philpanicio`, url });
      await navigator.clipboard.writeText(url);
      shareLabel.hidden = true;
      shareDone.hidden = false;
    } catch {
      /* cancelled or not allowed: nothing to do */
    }
  });

  // ---- filters ----
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      const style = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      tiles.forEach((tile) => {
        const show = style === 'all' || tile.dataset.style === style;
        tile.hidden = !show;
        // Filtered-in tiles may not have been revealed by the scroll animation yet.
        if (show) {
          tile.style.opacity = '';
          tile.style.transform = '';
        }
      });
      window.dispatchEvent(new Event('resize')); // let ScrollTrigger re-measure
    }),
  );

  // ---- lightbox ----
  let index = 0;
  let opener: HTMLElement | null = null;
  const visible = () => buttons.filter((btn) => !btn.closest<HTMLElement>('.tile')!.hidden);

  function show(btn: HTMLButtonElement) {
    index = Number(btn.dataset.customOpen);
    const d = btn.dataset;
    img.src = d.full!;
    img.alt = (currentLang() === 'en' ? d.capEn : d.capId) ?? '';
    capId.textContent = d.capId ?? '';
    capEn.textContent = d.capEn ?? '';
    wa.dataset.i18n = 'href';
    wa.setAttribute('data-i18n-href-id', d.waId!);
    wa.setAttribute('data-i18n-href-en', d.waEn!);
    wa.href = currentLang() === 'en' ? d.waEn! : d.waId!;
    // what the order form needs (scripts/order.ts)
    wa.dataset.orderNameId = d.capId ?? '';
    wa.dataset.orderNameEn = d.capEn ?? '';
    wa.dataset.orderLink = d.link ?? '';
    wa.dataset.orderImg = d.thumb ?? '';
    share.dataset.link = d.link ?? '';
    share.dataset.title = d.capId ?? '';
    shareLabel.hidden = false;
    shareDone.hidden = true;
  }

  function step(dir: number) {
    const list = visible();
    const pos = list.findIndex((btn) => Number(btn.dataset.customOpen) === index);
    show(list[(pos + dir + list.length) % list.length]);
  }

  buttons.forEach((btn) =>
    btn.addEventListener('click', () => {
      opener = btn;
      show(btn);
      dialog.showModal();
      window.dispatchEvent(new CustomEvent('pp:modal', { detail: true }));
    }),
  );

  dialog.querySelectorAll<HTMLButtonElement>('[data-lb-step]').forEach((btn) =>
    btn.addEventListener('click', () => step(Number(btn.dataset.lbStep))),
  );

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });

  // Swipe left/right on the photo.
  let startX = 0;
  img.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
  img.addEventListener(
    'touchend',
    (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    },
    { passive: true },
  );

  window.addEventListener('pp:lang', () => {
    if (dialog.open) img.alt = (currentLang() === 'en' ? capEn.textContent : capId.textContent) ?? '';
  });

  dialog.addEventListener('close', () => {
    opener?.focus({ preventScroll: true });
    opener = null;
  });
}
