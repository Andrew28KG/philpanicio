import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export let lenis: Lenis | null = null;

function initSmoothScroll() {
  lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Pause smooth scrolling while a dialog is open.
  window.addEventListener('pp:modal', (e) => {
    if ((e as CustomEvent<boolean>).detail) lenis?.stop();
    else lenis?.start();
  });
}

export function initMotion() {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    initSmoothScroll();
    return () => {
      lenis?.destroy();
      lenis = null;
    };
  });
  document.documentElement.classList.remove('motion-pending');
}
