// Single client entry. Light features load immediately; the animation stack
// (GSAP, ScrollTrigger, Lenis, particles) only loads when motion is allowed.
import { initPrefs } from './prefs';
import { initModals } from './modal';
import { initTilt } from './tilt';
import { initGallery } from './gallery';

initPrefs();
initModals();
initGallery();

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  initTilt();
  import('./motion').then((m) => m.initMotion());
} else {
  document.documentElement.classList.remove('motion-pending');
}
