// Subtle 3D tilt for [data-tilt] cards: follows the mouse, and leans toward a finger on touch.
const MAX = 7; // degrees

export function initTilt() {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    const tiltTo = (event: PointerEvent, strength = 1) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', `${(x - 0.5) * 2 * MAX * strength}deg`);
      card.style.setProperty('--rx', `${(0.5 - y) * 2 * MAX * strength}deg`);
      card.style.setProperty('--gx', `${x * 100}%`);
      card.style.setProperty('--gy', `${y * 100}%`);
    };
    const reset = () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    };

    card.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') tiltTo(e);
    });
    card.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') tiltTo(e, 0.6);
    });
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointerup', (e) => e.pointerType === 'touch' && reset());
    card.addEventListener('pointercancel', reset);
  });
}
