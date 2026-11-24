import { useState } from 'react';
import type { ProjectItem } from '../data/portfolio';
import { sound } from '../lib/sound';

interface ProjectPreviewProps {
  project: ProjectItem;
  compact?: boolean;
  interactive?: boolean;
  onNotify?: (message: string) => void;
}

const OKLAB_SWATCHES = [
  '#F0EDE6',
  '#C9A97A',
  '#8C99A6',
  '#5A6270',
  '#3A3D45',
  '#1C1E22',
  '#09090B',
];

const WAVE_BARS = [
  18, 28, 42, 34, 58, 72, 48, 36, 62, 84, 92, 68, 52, 40, 64, 78, 54, 44, 30, 50,
  74, 88, 66, 46, 38, 58, 70, 44, 32, 24, 42, 60, 50, 34, 26, 20,
];

/**
 * Предметные и интерфейсные превью в коде — без декоративного шума,
 * с реальными палитрами и данными каждого продукта.
 */
export function ProjectPreview({
  project,
  compact = false,
  interactive = !compact,
  onNotify,
}: ProjectPreviewProps) {
  const [aetherEdition, setAetherEdition] = useState<'obsidian' | 'slate'>('obsidian');
  const [splitPos, setSplitPos] = useState<number>(50);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeWaveIdx, setActiveWaveIdx] = useState(14);
  const [dialStep, setDialStep] = useState(3);
  const kind = project.previewKind ?? 'custom';

  if (kind === 'aether') {
    const isObsidian = aetherEdition === 'obsidian';

    const handleSwitchEdition = (next: 'obsidian' | 'slate', e: React.MouseEvent) => {
      e.stopPropagation();
      if (aetherEdition !== next) {
        sound.playTab();
        setAetherEdition(next);
      }
    };

    const handleCycleSplit = (e: React.MouseEvent) => {
      e.stopPropagation();
      sound.playClick();
      setSplitPos((prev) => (prev === 50 ? 74 : prev === 74 ? 26 : 50));
    };

    const handleCopySwatch = async (hex: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(hex);
        sound.playCopy();
        setCopiedHex(hex);
        onNotify?.(`Цвет ${hex} скопирован`);
        window.setTimeout(() => setCopiedHex((c) => (c === hex ? null : c)), 1400);
      } catch {
        // ignore clipboard error
      }
    };

    return (
      <div
        className={`coded-stage coded-stage--aether ${compact ? 'is-compact' : ''} ${
          isObsidian ? 'is-obsidian' : 'is-slate'
        }`}
      >
        <div className={`aether-window ${isObsidian ? 'is-obsidian' : 'is-slate'}`}>
          {/* Top titlebar mirroring real Aether / Aether Obsidian WPF chrome */}
          <div className="aether-titlebar">
            <div className="aether-brand">
              <span className="aether-brand-dot" />
              <span className="aether-brand-name">
                {isObsidian ? 'Aether Obsidian' : 'Aether'}
              </span>
              <span className="aether-brand-bin tabular">
                {isObsidian ? 'Aether_Obsidian.exe' : 'Aether.exe'}
              </span>
            </div>

            {interactive ? (
              <div className="aether-edition-switch" role="group" aria-label="Редакция Aether">
                <button
                  type="button"
                  className={`aether-ed-btn ${!isObsidian ? 'is-active' : ''}`}
                  onClick={(e) => handleSwitchEdition('slate', e)}
                >
                  Slate Gray
                </button>
                <button
                  type="button"
                  className={`aether-ed-btn ${isObsidian ? 'is-active' : ''}`}
                  onClick={(e) => handleSwitchEdition('obsidian', e)}
                >
                  Obsidian
                </button>
              </div>
            ) : (
              <span className="aether-edition-badge">Slate Gray · Obsidian</span>
            )}
          </div>

          <div className="aether-workspace">
            {/* Left Canvas Stage with Comparison Split Curtain */}
            <div className="aether-canvas-col">
              <div className="aether-stage-box">
                {/* Original soft tonal layer (left of divider) */}
                <div className="aether-layer aether-layer--orig" aria-hidden="true">
                  <svg viewBox="0 0 280 156" className="aether-art-svg">
                    <rect width="280" height="156" fill="transparent" />
                    <path
                      d="M 24 126 Q 92 40 162 84 T 258 46"
                      fill="none"
                      stroke="rgba(240, 237, 230, 0.28)"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="104"
                      cy="62"
                      r="26"
                      fill="rgba(201, 169, 122, 0.24)"
                    />
                    <path
                      d="M 46 132 L 138 66 L 194 102 L 244 74"
                      fill="none"
                      stroke="rgba(240, 237, 230, 0.52)"
                      strokeWidth="3"
                    />
                  </svg>
                </div>

                {/* Quantized 1:1 Vector Stroke layer (right of divider) */}
                <div
                  className="aether-layer aether-layer--plan"
                  style={{ clipPath: `inset(0 0 0 ${splitPos}%)` }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 280 156" className="aether-art-svg">
                    <defs>
                      <pattern
                        id="aether-grid"
                        width="12"
                        height="12"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 12 0 L 0 0 0 12"
                          fill="none"
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="0.75"
                        />
                      </pattern>
                    </defs>
                    <rect width="280" height="156" fill="url(#aether-grid)" />
                    <polyline
                      points="24,126 58,86 92,58 128,68 162,84 206,76 258,46"
                      fill="none"
                      stroke="#C9A97A"
                      strokeWidth="2"
                    />
                    <polygon
                      points="104,36 126,48 126,76 104,88 82,76 82,48"
                      fill="none"
                      stroke="#F0EDE6"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                    <polyline
                      points="46,132 138,66 194,102 244,74"
                      fill="none"
                      stroke="#F0EDE6"
                      strokeWidth="1.75"
                    />
                  </svg>
                </div>

                {/* Magnetic Comparison Curtain Divider */}
                <div
                  className="aether-curtain-line"
                  style={{ left: `${splitPos}%` }}
                  aria-hidden="true"
                >
                  <span className="aether-curtain-handle" />
                </div>

                <div className="aether-stage-tags tabular">
                  <span>Оригинал</span>
                  {interactive ? (
                    <button
                      type="button"
                      className="aether-split-btn"
                      onClick={handleCycleSplit}
                    >
                      Шторка {splitPos}%
                    </button>
                  ) : (
                    <span>Шторка 50%</span>
                  )}
                  <span>План 1:1</span>
                </div>
              </div>

              {/* Oklab Quantized Swatches */}
              <div className="aether-swatches-bar">
                <span className="aether-swatches-label">Oklab RGB</span>
                <div className="aether-swatches-list">
                  {OKLAB_SWATCHES.map((hex) =>
                    interactive ? (
                      <button
                        key={hex}
                        type="button"
                        className={`aether-swatch ${copiedHex === hex ? 'is-copied' : ''}`}
                        style={{ backgroundColor: hex }}
                        title={`Скопировать ${hex}`}
                        aria-label={`Скопировать цвет ${hex}`}
                        onClick={(e) => handleCopySwatch(hex, e)}
                      />
                    ) : (
                      <span
                        key={hex}
                        className="aether-swatch"
                        style={{ backgroundColor: hex }}
                        aria-hidden="true"
                      />
                    ),
                  )}
                </div>
                <span className="aether-swatches-meta tabular">
                  {copiedHex ?? '24 цв. · 1 px'}
                </span>
              </div>
            </div>

            {/* Right Inspector Column */}
            <div className="aether-inspector">
              <div className="aether-insp-row">
                <span className="aether-insp-k">Палитра</span>
                <span className="aether-insp-v">RGB пипетка</span>
              </div>
              <div className="aether-insp-row">
                <span className="aether-insp-k">Точность</span>
                <span className="aether-insp-v tabular">1:1 · шаг 1 px</span>
              </div>
              <div className="aether-insp-row">
                <span className="aether-insp-k">Кисть</span>
                <span className="aether-insp-v tabular">Авто 1–5</span>
              </div>
              <div className="aether-insp-row">
                <span className="aether-insp-k">Лимит альбома</span>
                <span className="aether-insp-v is-ok">В норме</span>
              </div>
              <div className="aether-insp-row">
                <span className="aether-insp-k">Звук UI</span>
                <span className="aether-insp-v tabular">44.1 kHz PCM</span>
              </div>

              <div className="aether-cta-bar">
                <span className="aether-cta-pill">Начать рисование · F6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'sreda') {
    const dialAngles = [-120, -72, -24, 24, 72, 114];
    const dbValues = ['−18.0 дБ', '−12.4 дБ', '−6.2 дБ', '−2.4 дБ', '0.0 дБ', '+1.5 дБ'];
    const angle = dialAngles[dialStep % dialAngles.length];

    const dialInner = (
      <>
        <span className="sreda-dial-ring" />
        <span className="sreda-dial-cap" style={{ transform: `rotate(${angle}deg)` }}>
          <span className="sreda-dial-notch" />
        </span>
      </>
    );

    return (
      <div className={`coded-stage coded-stage--sreda ${compact ? 'is-compact' : ''}`}>
        <div className="sreda-hardware">
          <div className="sreda-plinth">
            {interactive ? (
              <button
                type="button"
                className="sreda-dial"
                aria-label="Повернуть регулятор усиления"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playTab();
                  setDialStep((s) => (s + 1) % dialAngles.length);
                }}
                onMouseEnter={() => sound.playHover()}
              >
                {dialInner}
              </button>
            ) : (
              <span className="sreda-dial is-static" aria-hidden="true">
                {dialInner}
              </span>
            )}
            <div className="sreda-meta-row">
              <span className="sreda-track-name">Карелия · дождь на сосновой крыше</span>
              <span className="sreda-db tabular">{dbValues[dialStep % dbValues.length]}</span>
            </div>
          </div>

          <div className="sreda-wave-box" aria-hidden="true">
            <div className="sreda-wave-bars">
              {WAVE_BARS.map((height, idx) =>
                interactive ? (
                  <button
                    key={idx}
                    type="button"
                    tabIndex={-1}
                    className={`sreda-bar ${idx <= activeWaveIdx ? 'is-played' : ''} ${
                      idx === activeWaveIdx ? 'is-head' : ''
                    }`}
                    style={{ height: `${height}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playHover();
                      setActiveWaveIdx(idx);
                    }}
                  />
                ) : (
                  <span
                    key={idx}
                    className={`sreda-bar ${idx <= activeWaveIdx ? 'is-played' : ''} ${
                      idx === activeWaveIdx ? 'is-head' : ''
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
            <div className="sreda-wave-footer tabular">
              <span>01:18.4</span>
              <span>96 кГц · 24 бит</span>
              <span>03:42.0</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`coded-stage coded-stage--custom ${compact ? 'is-compact' : ''}`}>
      <div className="custom-artifact">
        <span className="custom-artifact-cat">{project.category}</span>
        <span className="custom-artifact-title">{project.title}</span>
        <span className="custom-artifact-year tabular">{project.year}</span>
      </div>
    </div>
  );
}
