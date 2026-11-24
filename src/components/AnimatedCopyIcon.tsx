import { Check, Copy, Volume2, VolumeX } from 'lucide-react';

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
