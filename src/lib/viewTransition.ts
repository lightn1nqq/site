import { flushSync } from 'react-dom';

/**
 * Runs a React state update inside the native View Transitions API when available
 * and when the user has not requested reduced motion.
 */
export function runViewTransition(update: () => void): void {
  if (typeof document === 'undefined') {
    update();
    return;
  }

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const docWithVT = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };

  if (!prefersReduced && typeof docWithVT.startViewTransition === 'function') {
    docWithVT.startViewTransition(() => {
      flushSync(() => {
        update();
      });
    });
  } else {
    update();
  }
}
