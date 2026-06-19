/* Task 29: Accessibility Utilities */
export const a11y = {
  announce(message, priority = 'polite') {
    let el = document.getElementById('a11y-announcer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'a11y-announcer';
      el.className = 'sr-only';
      el.setAttribute('aria-live', priority);
      el.setAttribute('aria-atomic', 'true');
      document.body.appendChild(el);
    }
    el.textContent = '';
    requestAnimationFrame(() => { el.textContent = message; });
  },

  trapFocus(container) {
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    const handler = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    container.addEventListener('keydown', handler);
    first.focus();
    return () => container.removeEventListener('keydown', handler);
  },

  setAriaExpanded(el, expanded) {
    el.setAttribute('aria-expanded', String(expanded));
  },

  setRole(el, role) {
    el.setAttribute('role', role);
  },

  createSkipLink() {
    if (document.querySelector('.skip-link')) return;
    const link = document.createElement('a');
    link.href = '#main';
    link.className = 'skip-link';
    link.textContent = 'Skip to content';
    document.body.insertBefore(link, document.body.firstChild);
  },
};
