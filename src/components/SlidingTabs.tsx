import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { sound } from '../lib/sound';

export interface SlidingTabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

interface SlidingTabsProps<T extends string = string> {
  items: SlidingTabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  variant?: 'default' | 'compact' | 'editor';
}

export function SlidingTabs<T extends string = string>({
  items,
  activeId,
  onChange,
  ariaLabel,
  variant = 'default',
}: SlidingTabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<T, HTMLButtonElement>>(new Map());
  const [pill, setPill] = useState<{ x: number; w: number; ready: boolean }>({
    x: 0,
    w: 0,
    ready: false,
  });

  const measure = useCallback(() => {
    const activeBtn = btnRefs.current.get(activeId);
    if (!activeBtn) return;
    setPill({
      x: activeBtn.offsetLeft,
      w: activeBtn.offsetWidth,
      ready: true,
    });
  }, [activeId]);

  useLayoutEffect(() => {
    measure();
  }, [measure, items]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(list);
    btnRefs.current.forEach((btn) => ro.observe(btn));
    return () => ro.disconnect();
  }, [measure, items]);

  // Scroll selected tab into view inside horizontal scroller only (never scrolling the page)
  useEffect(() => {
    const activeBtn = btnRefs.current.get(activeId);
    const list = listRef.current;
    if (!activeBtn || !list) return;
    if (list.scrollWidth > list.clientWidth) {
      const btnLeft = activeBtn.offsetLeft;
      const btnRight = btnLeft + activeBtn.offsetWidth;
      const viewLeft = list.scrollLeft;
      const viewRight = viewLeft + list.clientWidth;
      if (btnLeft < viewLeft + 12) {
        list.scrollTo({ left: Math.max(0, btnLeft - 16), behavior: 'smooth' });
      } else if (btnRight > viewRight - 12) {
        list.scrollTo({ left: btnRight - list.clientWidth + 16, behavior: 'smooth' });
      }
    }
  }, [activeId]);

  const selectTab = (id: T, focusIt = false) => {
    if (id !== activeId) {
      sound.playTab();
      onChange(id);
    }
    if (focusIt) {
      btnRefs.current.get(id)?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = items.findIndex((item) => item.id === activeId);
    if (idx < 0) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = items[(idx + 1) % items.length];
      selectTab(next.id, true);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = items[(idx - 1 + items.length) % items.length];
      selectTab(prev.id, true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      selectTab(items[0].id, true);
    } else if (e.key === 'End') {
      e.preventDefault();
      selectTab(items[items.length - 1].id, true);
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={`sliding-tabs sliding-tabs--${variant}`}
    >
      <span
        aria-hidden="true"
        className={`sliding-tabs-pill ${pill.ready ? 'is-ready' : ''}`}
        style={
          {
            transform: `translate3d(${pill.x}px, 0, 0)`,
            width: `${pill.w}px`,
          } as React.CSSProperties
        }
      />

      {items.map((item) => {
        const selected = item.id === activeId;
        return (
          <button
            key={item.id}
            ref={(el) => {
              if (el) btnRefs.current.set(item.id, el);
              else btnRefs.current.delete(item.id);
            }}
            type="button"
            role="tab"
            tabIndex={selected ? 0 : -1}
            aria-selected={selected}
            className={`sliding-tab-btn ${selected ? 'is-active' : ''}`}
            onClick={() => selectTab(item.id)}
            onMouseEnter={() => sound.playHover()}
          >
            <span className="sliding-tab-label">{item.label}</span>
            {typeof item.count === 'number' && (
              <span className="sliding-tab-count tabular">{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
