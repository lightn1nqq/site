import { useEffect, useState } from 'react';
import { sound } from '../lib/sound';

interface RailSection {
  id: string;
  index: string;
  label: string;
}

const SECTIONS: RailSection[] = [
  { id: 'hero', index: '01', label: 'Введение' },
  { id: 'approach', index: '02', label: 'Подход' },
  { id: 'projects', index: '03', label: 'Работы' },
  { id: 'footer-contact', index: '04', label: 'Контакт' },
];

/**
 * Quiet floating Dark Liquid Glass section-focus rail along the right viewport margin.
 * Tracks exact reading depth at top, mid-page, and bottom and glides smoothly to any section.
 */
export function ScrollRail() {
  const [activeId, setActiveId] = useState<string>('hero');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId = 0;

    const computeActive = () => {
      rafId = 0;
      const scrollY = window.scrollY;
      const vh = window.innerHeight || 1;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollY <= 64) {
        setActiveId('hero');
        return;
      }

      if (scrollY + vh >= docHeight - 48) {
        setActiveId('footer-contact');
        return;
      }

      const pivot = vh * 0.42;
      let current = 'hero';

      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= pivot) {
          current = sec.id;
        }
      }

      setActiveId(current);
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(computeActive);
      }
    };

    computeActive();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleJump = (id: string) => {
    sound.playTab();
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="scroll-rail glass-surface" aria-label="Навигация по секциям">
      {SECTIONS.map((sec) => {
        const isActive = activeId === sec.id;
        return (
          <button
            key={sec.id}
            type="button"
            className={`scroll-rail-btn ${isActive ? 'is-active' : ''}`}
            onClick={() => handleJump(sec.id)}
            onMouseEnter={() => sound.playHover()}
            aria-current={isActive ? 'location' : undefined}
            aria-label={`${sec.index} — ${sec.label}`}
          >
            <span className="scroll-rail-index tabular">{sec.index}</span>
            <span className="scroll-rail-dot" aria-hidden="true" />
            <span className="scroll-rail-label">{sec.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
