import { useEffect } from 'react';

/**
 * Observes elements marked with `[data-reveal]` and adds `.is-revealed`
 * once as they enter the viewport. Immediately reveals all elements if
 * `prefers-reduced-motion: reduce` is active.
 */
export function useScrollReveal(deps: ReadonlyArray<unknown> = []): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (nodes.length === 0) return;

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -32px 0px',
      },
    );

    nodes.forEach((el) => {
      if (!el.classList.contains('is-revealed')) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
