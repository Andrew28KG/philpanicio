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

export function initMotion() {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const cleanups = [initSmoothScroll(), initHero()];
    return () => cleanups.forEach((fn) => fn?.());
  });
  document.documentElement.classList.remove('motion-pending');
}
