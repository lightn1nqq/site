import { useEffect } from 'react';

/**
 * Tracks pointer coordinates relative to hovered `.glass-surface` elements
 * to project a subtle monochrome specular reflection along dark Liquid Glass edges.
 * Disabled on coarse/touch pointers and when reduced motion is preferred.
 */
export function useGlassSpecular(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(hover: none)').matches) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let rafId = 0;
    let activeEl: HTMLElement | null = null;
    let lastX = 0;
    let lastY = 0;

    const flush = () => {
      rafId = 0;
      if (!activeEl) return;
      const rect = activeEl.getBoundingClientRect();
      const x = ((lastX - rect.left) / Math.max(rect.width, 1)) * 100;
      const y = ((lastY - rect.top) / Math.max(rect.height, 1)) * 100;
      activeEl.style.setProperty('--mx', `${x.toFixed(1)}%`);
      activeEl.style.setProperty('--my', `${y.toFixed(1)}%`);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('.glass-surface');
      if (!target) {
        activeEl = null;
        return;
      }
      activeEl = target;
      lastX = e.clientX;
      lastY = e.clientY;
      if (!rafId) {
        rafId = window.requestAnimationFrame(flush);
      }
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);
}
