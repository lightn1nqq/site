import { Check, Copy, Moon, Sun, Volume2, VolumeX } from 'lucide-react';

interface AnimatedCopyIconProps {
  copied: boolean;
  size?: number;
}

export function AnimatedCopyIcon({ copied, size = 15 }: AnimatedCopyIconProps) {
  return (
    <span className={`morph-icon ${copied ? 'is-swapped' : ''}`} aria-hidden="true">
      <span className="morph-icon-layer morph-icon-a">
        <Copy size={size} strokeWidth={1.5} />
      </span>
      <span className="morph-icon-layer morph-icon-b toast-icon">
        <Check size={size} strokeWidth={1.5} />
      </span>
    </span>
  );
}

interface AnimatedSoundIconProps {
  enabled: boolean;
  size?: number;
}

export function AnimatedSoundIcon({ enabled, size = 16 }: AnimatedSoundIconProps) {
  return (
    <span className={`morph-icon ${enabled ? '' : 'is-swapped'}`} aria-hidden="true">
      <span className="morph-icon-layer morph-icon-a">
        <Volume2 size={size} strokeWidth={1.5} />
      </span>
      <span className="morph-icon-layer morph-icon-b">
        <VolumeX size={size} strokeWidth={1.5} />
      </span>
    </span>
  );
}

interface AnimatedThemeIconProps {
  isLight: boolean;
  size?: number;
}

export function AnimatedThemeIcon({ isLight, size = 15 }: AnimatedThemeIconProps) {
  return (
    <span className={`morph-icon ${isLight ? 'is-swapped' : ''}`} aria-hidden="true">
      <span className="morph-icon-layer morph-icon-a">
        <Moon size={size} strokeWidth={1.5} />
      </span>
      <span className="morph-icon-layer morph-icon-b">
        <Sun size={size} strokeWidth={1.5} />
      </span>
    </span>
  );
}
