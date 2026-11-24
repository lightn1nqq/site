import { useEffect, useId, useRef } from 'react';
import { Settings2, X } from 'lucide-react';
import { sound, type SoundProfile } from '../lib/sound';
import { SlidingTabs, type SlidingTabItem } from './SlidingTabs';

export type ThemePreference = 'dark' | 'light' | 'system';
export type ScrollBlurMode = 'deep' | 'soft' | 'off';
export type GlassDensity = 'liquid' | 'dense';

interface AtmospherePopoverProps {
  themePreference: ThemePreference;
  catsEnabled: boolean;
  scrollBlur: ScrollBlurMode;
  glassDensity: GlassDensity;
  soundProfile: SoundProfile;
  onChangeTheme: (theme: ThemePreference) => void;
  onChangeCatsEnabled: (enabled: boolean) => void;
  onChangeScrollBlur: (mode: ScrollBlurMode) => void;
  onChangeGlassDensity: (density: GlassDensity) => void;
  onChangeSoundProfile: (profile: SoundProfile) => void;
}

const THEME_TABS: SlidingTabItem<ThemePreference>[] = [
  { id: 'dark', label: 'Тёмная' },
  { id: 'light', label: 'Светлая' },
  { id: 'system', label: 'Система' },
];

const CATS_TABS: SlidingTabItem<'on' | 'off'>[] = [
  { id: 'on', label: 'Вкл' },
  { id: 'off', label: 'Выкл' },
];

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
 * Native Popover API ("popover=auto") Settings panel in Liquid Glass,
 * positioned via CSS Anchor Positioning (`position-area` + `position-try-fallbacks`).
 */
export function AtmospherePopover({
  themePreference,
  catsEnabled,
  scrollBlur,
  glassDensity,
  soundProfile,
  onChangeTheme,
  onChangeCatsEnabled,
  onChangeScrollBlur,
  onChangeGlassDensity,
  onChangeSoundProfile,
}: AtmospherePopoverProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const popoverId = `settings-panel-${rawId}`;
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
        aria-label="Настройки сайта"
        title="Настройки"
      >
        <Settings2 size={15} strokeWidth={1.5} aria-hidden="true" />
        <span className="atmosphere-trigger-label">Настройки</span>
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
              Настройки
            </h2>
            <p className="glass-popover-sub">Тема, котики, скролл-фокус и звук</p>
          </div>
          <button
            type="button"
            className="copy-mini-btn"
            popoverTarget={popoverId}
            popoverTargetAction="hide"
            aria-label="Закрыть настройки"
          >
            <X size={15} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <div className="glass-popover-body">
          <div className="atmosphere-row">
            <span className="atmosphere-label">Тема оформления</span>
            <SlidingTabs
              variant="compact"
              items={THEME_TABS}
              activeId={themePreference}
              onChange={onChangeTheme}
              ariaLabel="Выбор темы оформления"
            />
          </div>

          <div className="atmosphere-row">
            <span className="atmosphere-label">Котики на экране</span>
            <SlidingTabs
              variant="compact"
              items={CATS_TABS}
              activeId={catsEnabled ? 'on' : 'off'}
              onChange={(val) => onChangeCatsEnabled(val === 'on')}
              ariaLabel="Показывать котиков на сайте"
            />
          </div>

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
              ariaLabel="Плотность стекла"
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
