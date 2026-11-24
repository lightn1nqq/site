import { useEffect } from 'react';

/**
 * Progressive enhancement fallback for browsers without native CSS Scroll-Driven
 * Animations (`animation-timeline: view()` / `scroll()`):
 * - Smoothly interpolates opacity, vertical drift, and optical blur on `[data-scroll-focus]`
 *   elements as they enter and exit the viewport in BOTH scroll directions (down & up).
 * - Updates `--scroll-progress` on `[data-scroll-progress]` when `animation-timeline: scroll()`
 *   is unavailable.
 */
export function useScrollFocusFallback(
  scrollBlurMode: 'deep' | 'soft' | 'off',
  deps: ReadonlyArray<unknown> = [],
): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const supportsViewTimeline = window.CSS?.supports?.(
      '(animation-timeline: view()) and (animation-range: entry)',
    );
    const supportsScrollTimeline = window.CSS?.supports?.('animation-timeline', 'scroll()');

    // If native CSS scroll-driven animations handle everything (or reduced motion is on), skip JS scroll loop
    if (prefersReduced || (supportsViewTimeline && supportsScrollTimeline)) {
      return;
    }

    let rafId = 0;

    const maxBlurPx = scrollBlurMode === 'deep' ? 7 : scrollBlurMode === 'soft' ? 3.5 : 0;

    const update = () => {
      rafId = 0;
      const vh = window.innerHeight || 1;

      if (!supportsScrollTimeline) {
        const scrollable = Math.max(document.documentElement.scrollHeight - vh, 1);
        const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
        document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));
      }

      if (!supportsViewTimeline && scrollBlurMode !== 'off') {
        const elements = document.querySelectorAll<HTMLElement>('[data-scroll-focus]');
        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          // Entry progress: 0 when top hits bottom of viewport, 1 when 28% inside viewport
          const entryZone = vh * 0.28;
          const enterRatio = Math.min(Math.max((vh - rect.top) / entryZone, 0), 1);
          // Exit progress: 0 when bottom hits top of viewport, 1 when 26% below top
          const exitZone = vh * 0.26;
          const exitRatio = Math.min(Math.max(rect.bottom / exitZone, 0), 1);

          const focus = Math.min(enterRatio, exitRatio);
          // Smoothstep curve for cinematic deceleration
          const smooth = focus * focus * (3 - 2 * focus);
          const opacity = 0.08 + smooth * 0.92;
          const blur = (1 - smooth) * maxBlurPx;
          const shift =
            enterRatio < exitRatio ? (1 - smooth) * 18 : -(1 - smooth) * 14;

          el.style.setProperty('--sf-opacity', opacity.toFixed(3));
          el.style.setProperty('--sf-y', `${shift.toFixed(2)}px`);
          el.style.setProperty('--sf-blur', `${blur.toFixed(2)}px`);
        }
      }
    };

    const schedule = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollBlurMode, ...deps]);
}
