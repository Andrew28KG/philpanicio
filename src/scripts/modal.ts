// Opens <dialog data-modal> elements from any [data-open-modal="<dialog id>"] trigger.
export function initModals() {
  let opener: HTMLElement | null = null;

  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element).closest<HTMLElement>('[data-open-modal]');
    if (!trigger) return;
    const dialog = document.getElementById(trigger.dataset.openModal!);
    if (!(dialog instanceof HTMLDialogElement)) return;
    opener = trigger;
    dialog.showModal();
    window.dispatchEvent(new CustomEvent('pp:modal', { detail: true }));
  });

  document.querySelectorAll<HTMLDialogElement>('dialog[data-modal]').forEach((dialog) => {
    // A click on the backdrop lands on the <dialog> itself.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', () => {
      window.dispatchEvent(new CustomEvent('pp:modal', { detail: false }));
      opener?.focus({ preventScroll: true });
      opener = null;
    });
  });
}
