/**
 * Деликатный саунд-дизайн интерфейса на Web Audio API (без внешних аудиофайлов).
 * Два звуковых профиля:
 * - "glass" (по умолчанию): тихие стеклянные касания, мягкие высокодобротные обертоны и прозрачный резонанс.
 * - "mechanical": сухие тактильные щелчки аналогового затвора.
 */

const STORAGE_ENABLED_KEY = 'portfolio_ui_sound_enabled';
const STORAGE_PROFILE_KEY = 'portfolio_ui_sound_profile';

export type SoundProfile = 'glass' | 'mechanical';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private enabled = true;
  private profile: SoundProfile = 'glass';
  private lastHoverAt = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedEnabled = window.localStorage.getItem(STORAGE_ENABLED_KEY);
        if (storedEnabled !== null) {
          this.enabled = storedEnabled === 'true';
        }
        const storedProfile = window.localStorage.getItem(STORAGE_PROFILE_KEY);
        if (storedProfile === 'glass' || storedProfile === 'mechanical') {
          this.profile = storedProfile;
        }
      } catch {
        // Ignore storage restrictions
      }
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getProfile(): SoundProfile {
    return this.profile;
  }

  public setProfile(next: SoundProfile): void {
    this.profile = next;
    try {
      window.localStorage.setItem(STORAGE_PROFILE_KEY, next);
    } catch {
      // Ignore storage restrictions
    }
    if (this.enabled) {
      this.playTab();
    }
  }

  public toggle(): boolean {
    const next = !this.enabled;
    if (!next) {
      this.playToggle(false);
    }
    this.enabled = next;
    try {
      window.localStorage.setItem(STORAGE_ENABLED_KEY, String(next));
    } catch {
      // Ignore storage restrictions
    }
    if (next) {
      this.playToggle(true);
    }
    return this.enabled;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const length = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const env = Math.pow(1 - i / length, 3.4);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  private playTone(
    ctx: AudioContext,
    opts: {
      type?: OscillatorType;
      freqStart: number;
      freqEnd?: number;
      startOffset?: number;
      duration: number;
      peakGain: number;
      attack?: number;
      lowpassHz?: number;
    },
  ): void {
    const t = ctx.currentTime + (opts.startOffset ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(opts.freqStart, t);
    if (opts.freqEnd && opts.freqEnd !== opts.freqStart) {
      osc.frequency.exponentialRampToValueAtTime(opts.freqEnd, t + opts.duration);
    }

    const attack = opts.attack ?? 0.004;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(opts.peakGain, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.duration);

    if (opts.lowpassHz) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(opts.lowpassHz, t);
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + opts.duration + 0.01);
  }

  /** Едва заметный стеклянный / тактильный тик при наведении */
  public playHover(): void {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastHoverAt < 60) return;
    this.lastHoverAt = nowMs;

    const ctx = this.getContext();
    if (!ctx || ctx.state !== 'running') return;

    if (this.profile === 'glass') {
      this.playTone(ctx, {
        type: 'sine',
        freqStart: 2760,
        freqEnd: 2420,
        duration: 0.022,
        peakGain: 0.009,
        attack: 0.002,
      });
      this.playTone(ctx, {
        type: 'sine',
        freqStart: 4140,
        freqEnd: 3820,
        duration: 0.016,
        peakGain: 0.004,
        attack: 0.002,
      });
      return;
    }

    this.playTone(ctx, {
      type: 'triangle',
      freqStart: 1650,
      freqEnd: 980,
      duration: 0.02,
      peakGain: 0.014,
      lowpassHz: 2200,
    });
  }

  /** Мягкий стеклянный клик (кнопка, ссылка, карточка) */
  public playClick(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.profile === 'glass') {
      // Crystal partial pair + subtle damped body
      this.playTone(ctx, {
        type: 'sine',
        freqStart: 1320,
        freqEnd: 1180,
        duration: 0.045,
        peakGain: 0.022,
        attack: 0.002,
      });
      this.playTone(ctx, {
        type: 'sine',
        freqStart: 2640,
        freqEnd: 2460,
        duration: 0.03,
        peakGain: 0.009,
        attack: 0.002,
      });
      this.playTone(ctx, {
        type: 'sine',
        freqStart: 320,
        freqEnd: 185,
        duration: 0.036,
        peakGain: 0.024,
        attack: 0.003,
      });
      return;
    }

    const t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1900, t);
    bandpass.Q.setValueAtTime(1.8, t);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.03, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);
    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

    this.playTone(ctx, {
      type: 'sine',
      freqStart: 420,
      freqEnd: 190,
      duration: 0.035,
      peakGain: 0.034,
    });
  }

  /** Жидкое переключение вкладок и тумблеров */
  public playTab(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.profile === 'glass') {
      this.playTone(ctx, {
        type: 'sine',
        freqStart: 740,
        freqEnd: 980,
        duration: 0.056,
        peakGain: 0.022,
        attack: 0.004,
      });
      this.playTone(ctx, {
        type: 'sine',
        freqStart: 1480,
        freqEnd: 1960,
        duration: 0.044,
        peakGain: 0.008,
        attack: 0.004,
      });
      return;
    }

    this.playTone(ctx, {
      type: 'sine',
      freqStart: 520,
      freqEnd: 680,
      duration: 0.048,
      peakGain: 0.028,
      lowpassHz: 1600,
    });
  }

  /** Открытие меню, модального окна или боковой панели */
  public playModalOpen(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.profile === 'glass') {
      // Soft optical glass harmonic swell (fifth interval)
      this.playTone(ctx, {
        type: 'sine',
        freqStart: 392,
        freqEnd: 440,
        duration: 0.14,
        peakGain: 0.02,
        attack: 0.012,
        lowpassHz: 1800,
      });
      this.playTone(ctx, {
        type: 'sine',
        freqStart: 587,
        freqEnd: 659,
        startOffset: 0.018,
        duration: 0.13,
        peakGain: 0.014,
        attack: 0.01,
        lowpassHz: 2200,
      });
      return;
    }

    this.playTone(ctx, {
      type: 'sine',
      freqStart: 240,
      freqEnd: 340,
      duration: 0.115,
      peakGain: 0.03,
      attack: 0.015,
    });
  }

  /** Закрытие меню, модального окна или панели */
  public playModalClose(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.profile === 'glass') {
      this.playTone(ctx, {
        type: 'sine',
        freqStart: 523,
        freqEnd: 349,
        duration: 0.11,
        peakGain: 0.018,
        attack: 0.006,
        lowpassHz: 1600,
      });
      this.playTone(ctx, {
        type: 'sine',
        freqStart: 784,
        freqEnd: 523,
        duration: 0.08,
        peakGain: 0.008,
        attack: 0.005,
      });
      return;
    }

    this.playTone(ctx, {
      type: 'sine',
      freqStart: 310,
      freqEnd: 195,
      duration: 0.095,
      peakGain: 0.024,
      attack: 0.008,
    });
  }

  /** Чистый двойной отклик при копировании */
  public playCopy(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = this.profile === 'glass' ? [880, 1175] : [620, 825];
    notes.forEach((freq, idx) => {
      this.playTone(ctx, {
        type: 'sine',
        freqStart: freq,
        startOffset: idx * 0.055,
        duration: 0.11,
        peakGain: this.profile === 'glass' ? 0.02 : 0.026,
        attack: 0.005,
      });
    });
  }

  /** Тумблер звука (вкл / выкл) */
  private playToggle(on: boolean): void {
    const ctx = this.getContext();
    if (!ctx) return;

    this.playTone(ctx, {
      type: 'sine',
      freqStart: on ? 520 : 640,
      freqEnd: on ? 780 : 390,
      duration: 0.068,
      peakGain: 0.022,
      attack: 0.005,
    });
  }
}

export const sound = new SoundEngine();
