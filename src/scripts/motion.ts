import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initDust } from './particles';

gsap.registerPlugin(ScrollTrigger);

export let lenis: Lenis | null = null;

function initSmoothScroll() {
  lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 } });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Pause smooth scrolling while a dialog is open.
  const onModal = (e: Event) => ((e as CustomEvent<boolean>).detail ? lenis?.stop() : lenis?.start());
  window.addEventListener('pp:modal', onModal);

  return () => {
    window.removeEventListener('pp:modal', onModal);
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  // Letters rise like dough: squashed and low, then springing up into place.
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.fromTo(
    hero.querySelectorAll('.hero-title .ch'),
    { yPercent: 70, scaleY: 0.55, scaleX: 1.15, opacity: 0, transformOrigin: '50% 100%' },
    { yPercent: 0, scaleY: 1, scaleX: 1, opacity: 1, duration: 1.1, ease: 'back.out(2.2)', stagger: 0.035 },
  ).from(hero.querySelectorAll('.hero-fade'), { y: 24, opacity: 0, duration: 0.9, stagger: 0.12 }, 0.25);

  gsap.from(hero.querySelector('.hero-visual'), { y: 40, opacity: 0, scale: 0.96, duration: 1.3, delay: 0.2 });

  // Gentle parallax on the cake photo.
  const img = hero.querySelector('[data-parallax]');
  if (img) {
    gsap.fromTo(
      img,
      { yPercent: -4 },
      { yPercent: 6, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } },
    );
  }
  gsap.to(hero.querySelectorAll('.doodle'), {
    y: -30,
    rotate: '+=10',
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });

  const canvas = hero.querySelector<HTMLCanvasElement>('[data-dust]');
  return canvas ? initDust(canvas) : undefined;
}

// Generic scroll reveals: [data-reveal] fades up on its own, [data-reveal-item] in staggered batches.
function initReveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 36, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  const items = gsap.utils.toArray<HTMLElement>('[data-reveal-item]');
  gsap.set(items, { y: 48, opacity: 0 });
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    onEnter: (batch) =>
      gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.09, overwrite: true }),
  });
  return () => gsap.set(items, { clearProps: 'all' });
}

// Display Case: pin the section and slide the photos sideways as you scroll (desktop only).
function initGalleryPin() {
  const section = document.querySelector<HTMLElement>('[data-gallery]');
  const pin = section?.querySelector<HTMLElement>('[data-gallery-pin]');
  const track = section?.querySelector<HTMLElement>('[data-gallery-track]');
  if (!section || !pin || !track) return;

  section.classList.add('is-pinned');
  const distance = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin,
      pin: true,
      start: 'top top',
      end: () => `+=${distance()}`,
      scrub: 0.8,
      refreshPriority: 1,
      invalidateOnRefresh: true,
    },
  });
  // Slides gently straighten as they pass through the middle of the screen.
  track.querySelectorAll('figure').forEach((fig) => {
    gsap.fromTo(
      fig,
      { y: 30, scale: 0.94 },
      {
        y: 0,
        scale: 1,
        ease: 'power1.out',
        scrollTrigger: { trigger: fig, containerAnimation: tween, start: 'left 95%', end: 'left 55%', scrub: true },
      },
    );
  });

  return () => {
    section.classList.remove('is-pinned');
    gsap.set(track, { clearProps: 'transform' });
  };
}

export function initMotion() {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const cleanups = [initSmoothScroll(), initHero(), initReveals()];
    return () => cleanups.forEach((fn) => fn?.());
  });
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => initGalleryPin());
  // Images and fonts change heights after load; re-measure the pinned section.
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  document.documentElement.classList.remove('motion-pending');
}
