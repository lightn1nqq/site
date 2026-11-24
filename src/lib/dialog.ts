/**
 * Modern top-layer <dialog> helpers:
 * - Accurate discrete display transition probe (handles Firefox bug 1882408)
 * - Smooth exit animation fallback for browsers without CSS `overlay` / discrete `display`
 * - Pointer-bounds light-dismiss fallback for browsers without native `closedby="any"`
 */

let supportsDisplayTransition: boolean | undefined;

export function canTransitionDisplay(): boolean {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (
    typeof window === 'undefined' ||
    !window.CSS?.supports?.('transition-behavior', 'allow-discrete') ||
    !document.body
  ) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransition;
}

export function supportsTopLayerExit(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.CSS?.supports?.('overlay', 'auto')) && canTransitionDisplay();
}

export async function closeDialogSmoothly(dialog: HTMLDialogElement): Promise<void> {
  if (!dialog.open) return;

  if (!supportsTopLayerExit()) {
    if (dialog.hasAttribute('data-closing')) return;
    dialog.setAttribute('data-closing', '');
    const animations = dialog.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise<void>((resolve) => window.setTimeout(resolve, 450)),
      ]);
    }
    if (!dialog.hasAttribute('data-closing')) return;
    dialog.removeAttribute('data-closing');
  }

  if (dialog.open) {
    dialog.close();
  }
}

/**
 * Attaches light-dismiss pointer fallback when browser lacks native `closedby`
 * and routes cancel events through smooth close when needed.
 */
export function attachDialogBehaviors(
  dialog: HTMLDialogElement,
  onRequestClose: () => void,
): () => void {
  const handleCancel = (event: Event) => {
    if (!supportsTopLayerExit()) {
      event.preventDefault();
      onRequestClose();
    }
  };

  dialog.addEventListener('cancel', handleCancel);

  let cleanupLightDismiss = () => {};
  if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
    let pressedOutside = false;

    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };

    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) {
        pressedOutside = false;
        onRequestClose();
      } else {
        pressedOutside = false;
      }
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);

    cleanupLightDismiss = () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }

  return () => {
    dialog.removeEventListener('cancel', handleCancel);
    cleanupLightDismiss();
  };
}
