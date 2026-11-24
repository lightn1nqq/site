import { useEffect, useId, useRef } from 'react';
import { Sliders, X } from 'lucide-react';
import { sound, type SoundProfile } from '../lib/sound';
import { SlidingTabs, type SlidingTabItem } from './SlidingTabs';

export type ScrollBlurMode = 'deep' | 'soft' | 'off';
export type GlassDensity = 'liquid' | 'dense';

interface AtmospherePopoverProps {
  scrollBlur: ScrollBlurMode;
  glassDensity: GlassDensity;
  soundProfile: SoundProfile;
  onChangeScrollBlur: (mode: ScrollBlurMode) => void;
  onChangeGlassDensity: (density: GlassDensity) => void;
  onChangeSoundProfile: (profile: SoundProfile) => void;
}

const BLUR_TABS: SlidingTabItem<ScrollBlurMode>[] = [
  { id: 'deep', label: 'Глубокий' },
  { id: 'soft', label: 'Мягкий' },
  { id: 'off', label: 'Выкл' },
];

const GLASS_TABS: SlidingTabItem<GlassDensity>[] = [
  { id: 'liquid', label: 'Жидкое' },
  { id: 'dense', label: 'Плотное' },
];

const SOUND_TABS: SlidingTabItem<SoundProfile>[] = [
  { id: 'glass', label: 'Стекло' },
  { id: 'mechanical', label: 'Механика' },
];

/**
 * Native Popover API ("popover=auto") settings panel in Dark Liquid Glass,
 * positioned via CSS Anchor Positioning (`position-area` + `position-try-fallbacks`).
 * Follows button-revealing-a-control-panel semantics (no role="menu" or aria-haspopup).
 */
export function AtmospherePopover({
  scrollBlur,
  glassDensity,
  soundProfile,
  onChangeScrollBlur,
  onChangeGlassDensity,
  onChangeSoundProfile,
}: AtmospherePopoverProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const popoverId = `atmosphere-panel-${rawId}`;
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;

    const handleToggle = (e: Event) => {
      const toggleEvent = e as ToggleEvent;
      if (toggleEvent.newState === 'open') {
        sound.playModalOpen();
      } else if (toggleEvent.newState === 'closed') {
        sound.playModalClose();
      }
    };

    el.addEventListener('toggle', handleToggle);
    return () => el.removeEventListener('toggle', handleToggle);
  }, []);

  return (
    <div className="atmosphere-anchor-wrap">
      <button
        type="button"
        className="icon-control glass-control atmosphere-trigger"
        popoverTarget={popoverId}
        onMouseEnter={() => sound.playHover()}
        aria-label="Настройки оптики, скролла и звука"
        title="Оптика и звук"
      >
        <Sliders size={15} strokeWidth={1.5} aria-hidden="true" />
        <span className="atmosphere-trigger-label">Оптика</span>
      </button>

      <div
        ref={popoverRef}
        id={popoverId}
        popover="auto"
        className="glass-popover glass-surface"
        aria-labelledby={`${popoverId}-title`}
      >
        <div className="glass-popover-head">
          <div>
            <h2 id={`${popoverId}-title`} className="socials-card-title">
              Оптика и отклик
            </h2>
            <p className="glass-popover-sub">Живые настройки стекла, скролла и звука</p>
          </div>
          <button
            type="button"
            className="copy-mini-btn"
            popoverTarget={popoverId}
            popoverTargetAction="hide"
            aria-label="Закрыть панель оптики"
          >
            <X size={15} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <div className="glass-popover-body">
          <div className="atmosphere-row">
            <span className="atmosphere-label">Скролл-фокус текста</span>
            <SlidingTabs
              variant="compact"
              items={BLUR_TABS}
              activeId={scrollBlur}
              onChange={onChangeScrollBlur}
              ariaLabel="Интенсивность скролл-фокуса текста"
            />
          </div>

          <div className="atmosphere-row">
            <span className="atmosphere-label">Плотность стекла</span>
            <SlidingTabs
              variant="compact"
              items={GLASS_TABS}
              activeId={glassDensity}
              onChange={onChangeGlassDensity}
              ariaLabel="Плотность тёмного стекла"
            />
          </div>

          <div className="atmosphere-row">
            <span className="atmosphere-label">Профиль звука</span>
            <SlidingTabs
              variant="compact"
              items={SOUND_TABS}
              activeId={soundProfile}
              onChange={onChangeSoundProfile}
              ariaLabel="Звуковой профиль интерфейса"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
