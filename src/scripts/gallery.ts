// Dots for the swipeable Display Case (mobile / reduced motion). Desktop pinning lives in motion.ts.
export function initGallery() {
  const viewport = document.querySelector<HTMLElement>('[data-gallery-viewport]');
  const dots = [...document.querySelectorAll<HTMLButtonElement>('[data-dot]')];
  const slides = [...document.querySelectorAll<HTMLElement>('[data-slide]')];
  if (!viewport || !slides.length) return;

  const setActive = (index: number) =>
    dots.forEach((dot, i) => (i === index ? dot.setAttribute('aria-current', 'true') : dot.removeAttribute('aria-current')));

  let ticking = false;
  viewport.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const center = viewport.scrollLeft + viewport.clientWidth / 2;
        let best = 0;
        slides.forEach((slide, i) => {
          const mid = slide.offsetLeft + slide.offsetWidth / 2;
          const bestMid = slides[best].offsetLeft + slides[best].offsetWidth / 2;
          if (Math.abs(mid - center) < Math.abs(bestMid - center)) best = i;
        });
        setActive(best);
      });
    },
    { passive: true },
  );

  dots.forEach((dot, i) =>
    dot.addEventListener('click', () => {
      const slide = slides[i];
      viewport.scrollTo({
        left: slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    }),
  );
}
