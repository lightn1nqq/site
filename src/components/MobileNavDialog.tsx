import { useEffect, useRef } from 'react';
import { ArrowUpRight, Cat, SlidersHorizontal, X } from 'lucide-react';
import type { SocialLink } from '../data/portfolio';
import { attachDialogBehaviors, closeDialogSmoothly } from '../lib/dialog';
import { sound } from '../lib/sound';
import { SocialIcon } from './SocialIcon';
import { AnimatedSoundIcon, AnimatedThemeIcon } from './AnimatedCopyIcon';

interface MobileNavDialogProps {
  open: boolean;
  isLightTheme: boolean;
  soundEnabled: boolean;
  catsEnabled: boolean;
  socials: SocialLink[];
  onClose: () => void;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onToggleCats: () => void;
  onOpenEditor: () => void;
  onCopySocial: (social: SocialLink) => void;
}

export function MobileNavDialog({
  open,
  isLightTheme,
  soundEnabled,
  catsEnabled,
  socials,
  onClose,
  onToggleTheme,
  onToggleSound,
  onToggleCats,
  onOpenEditor,
  onCopySocial,
}: MobileNavDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
        sound.playModalOpen();
      }
    } else if (dialog.open) {
      closeDialogSmoothly(dialog);
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const requestClose = () => {
      sound.playModalClose();
      closeDialogSmoothly(dialog);
    };

    const detach = attachDialogBehaviors(dialog, requestClose);
    const handleNativeClose = () => {
      dialog.returnValue = '';
      onClose();
    };

    dialog.addEventListener('close', handleNativeClose);
    return () => {
      detach();
      dialog.removeEventListener('close', handleNativeClose);
    };
  }, [onClose]);

  const closeMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    sound.playModalClose();
    closeDialogSmoothly(dialog);
  };

  return (
    <dialog
      ref={dialogRef}
      className="ui-dialog ui-drawer ui-drawer--mobile"
      aria-labelledby="mobile-nav-title"
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      <div className="dialog-header">
        <h2 id="mobile-nav-title" className="socials-card-title">
          Навигация
        </h2>
        <button
          type="button"
          className="dialog-close-btn"
          onClick={closeMenu}
          aria-label="Закрыть меню"
          autoFocus
        >
          <X size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <div className="dialog-scroll">
        <nav
          key={open ? 'open' : 'closed'}
          className="mobile-nav-list tab-panel-anim"
          aria-label="Мобильная навигация"
        >
          <a
            href="#approach"
            className="mobile-nav-item"
            onClick={() => {
              sound.playClick();
              closeMenu();
            }}
          >
            <span>Подход</span>
            <ArrowUpRight size={16} strokeWidth={1.5} className="card-arrow-ne" aria-hidden="true" />
          </a>
          <a
            href="#projects"
            className="mobile-nav-item"
            onClick={() => {
              sound.playClick();
              closeMenu();
            }}
          >
            <span>Проекты</span>
            <ArrowUpRight size={16} strokeWidth={1.5} className="card-arrow-ne" aria-hidden="true" />
          </a>
          <a
            href="#contacts"
            className="mobile-nav-item"
            onClick={() => {
              sound.playClick();
              closeMenu();
            }}
          >
            <span>Контакты и сети</span>
            <ArrowUpRight size={16} strokeWidth={1.5} className="card-arrow-ne" aria-hidden="true" />
          </a>
          <button
            type="button"
            className="mobile-nav-item"
            onClick={() => {
              sound.playClick();
              closeMenu();
              onOpenEditor();
            }}
          >
            <span>Редактор контента</span>
            <SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button type="button" className="mobile-nav-item" onClick={onToggleTheme}>
            <span>Тема ({isLightTheme ? 'светлая' : 'тёмная'})</span>
            <AnimatedThemeIcon isLight={isLightTheme} size={16} />
          </button>
          <button type="button" className="mobile-nav-item" onClick={onToggleCats}>
            <span>Котики ({catsEnabled ? 'вкл' : 'выкл'})</span>
            <Cat size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button type="button" className="mobile-nav-item" onClick={onToggleSound}>
            <span>Звук интерфейса ({soundEnabled ? 'вкл' : 'выкл'})</span>
            <AnimatedSoundIcon enabled={soundEnabled} size={16} />
          </button>
        </nav>

        <div className="meta-block">
          <span className="meta-block-label">Соцсети</span>
          <ul className="social-list">
            {socials.map((s) => (
              <li key={s.id} className="social-row">
                {s.url.trim() ? (
                  <a
                    href={s.url}
                    target={s.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel={s.url.startsWith('mailto:') ? undefined : 'noreferrer'}
                    className="social-row-link"
                    onClick={() => sound.playClick()}
                  >
                    <span className="social-icon-box">
                      <SocialIcon name={s.icon} />
                    </span>
                    <span className="social-label">{s.label}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    className="social-row-link social-row-btn"
                    onClick={() => onCopySocial(s)}
                  >
                    <span className="social-icon-box">
                      <SocialIcon name={s.icon} />
                    </span>
                    <span className="social-label">{s.label}</span>
                    <span className="social-handle">{s.handle}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  );
}
