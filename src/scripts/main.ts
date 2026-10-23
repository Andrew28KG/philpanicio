// Single client entry. Light features load immediately; the animation stack
// (GSAP, ScrollTrigger, Lenis, particles) only loads when motion is allowed.
import { initPrefs } from './prefs';

initPrefs();

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  import('./motion').then((m) => m.initMotion());
} else {
  document.documentElement.classList.remove('motion-pending');
}
