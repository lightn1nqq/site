import { useCallback, useEffect, useRef, useState } from 'react';
import { sound } from '../lib/sound';

interface CatConfig {
  id: 'nox' | 'lumen';
  name: string;
  variant: 'dark' | 'light';
  speed: number;
  startRatio: number;
  startDir: 1 | -1;
}

const CATS: CatConfig[] = [
  {
    id: 'nox',
    name: 'Нокс',
    variant: 'dark',
    speed: 46,
    startRatio: 0.16,
    startDir: 1,
  },
  {
    id: 'lumen',
    name: 'Люмен',
    variant: 'light',
    speed: 38,
    startRatio: 0.78,
    startDir: -1,
  },
];

interface CatRuntime {
  x: number;
  dir: 1 | -1;
  mode: 'walk' | 'idle' | 'petted';
  timer: number;
  petUntil: number;
  lastStrokeAt: number;
}

interface CatUiState {
  mode: 'walk' | 'idle' | 'petted';
  dir: 1 | -1;
  petCount: number;
  heartBurstId: number;
}

/**
 * Тихие интерактивные котики, пробегающие вдоль нижнего края экрана.
 * Наведение/поглаживание или клик: котик останавливается, жмурится, мурчит (Web Audio)
 * и выпускает пару аккуратных векторных сердечек.
 * Полностью отключаются тумблером «Котики» в Настройках.
 */
export function RoamingCats() {
  const elRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const runtimeRef = useRef<Record<string, CatRuntime>>({});
  const [uiState, setUiState] = useState<Record<string, CatUiState>>(() => {
    const initial: Record<string, CatUiState> = {};
    for (const c of CATS) {
      initial[c.id] = {
        mode: 'walk',
        dir: c.startDir,
        petCount: 0,
        heartBurstId: 0,
      };
    }
    return initial;
  });

  const petCat = useCallback((catId: string, isStroke = false) => {
    const rt = runtimeRef.current[catId];
    const now = performance.now();
    if (!rt) return;

    // Throttle continuous pointer stroking so hovering feels gentle and organic
    if (isStroke && now - rt.lastStrokeAt < 650) {
      rt.petUntil = Math.max(rt.petUntil, now + 1500);
      return;
    }

    rt.lastStrokeAt = now;
    rt.mode = 'petted';
    rt.petUntil = now + 2100;
    sound.playPurr();

    setUiState((prev) => {
      const curr = prev[catId];
      if (!curr) return prev;
      return {
        ...prev,
        [catId]: {
          ...curr,
          mode: 'petted',
          petCount: curr.petCount + 1,
          heartBurstId: curr.heartBurstId + 1,
        },
      };
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const vw = window.innerWidth || 1280;
    const catWidth = 64;
    const pad = 28;

    for (const c of CATS) {
      const startX = Math.max(pad, Math.min(vw - catWidth - pad, vw * c.startRatio));
      runtimeRef.current[c.id] = {
        x: startX,
        dir: c.startDir,
        mode: prefersReduced ? 'idle' : 'walk',
        timer: 3200 + Math.random() * 4200,
        petUntil: 0,
        lastStrokeAt: 0,
      };
      const node = elRefs.current[c.id];
      if (node) {
        node.style.transform = `translate3d(${startX.toFixed(1)}px, 0, 0)`;
      }
    }

    if (prefersReduced) {
      setUiState((prev) => {
        const next = { ...prev };
        for (const c of CATS) {
          next[c.id] = { ...next[c.id], mode: 'idle' };
        }
        return next;
      });
    }

    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;
      const width = window.innerWidth || 1280;
      const maxX = Math.max(pad, width - catWidth - pad);

      for (const c of CATS) {
        const rt = runtimeRef.current[c.id];
        if (!rt) continue;

        let modeChanged = false;
        let dirChanged = false;

        if (rt.mode === 'petted') {
          if (now >= rt.petUntil) {
            rt.mode = prefersReduced ? 'idle' : 'walk';
            rt.timer = 4000 + Math.random() * 4500;
            modeChanged = true;
          }
        } else if (!prefersReduced) {
          rt.timer -= dt * 1000;
          if (rt.mode === 'walk') {
            rt.x += rt.dir * c.speed * dt;
            if (rt.x <= pad) {
              rt.x = pad;
              rt.dir = 1;
              dirChanged = true;
            } else if (rt.x >= maxX) {
              rt.x = maxX;
              rt.dir = -1;
              dirChanged = true;
            }

            if (rt.timer <= 0) {
              rt.mode = 'idle';
              rt.timer = 2400 + Math.random() * 2600;
              modeChanged = true;
            }
          } else {
            if (rt.timer <= 0) {
              rt.mode = 'walk';
              // Occasionally flip direction after resting
              if (Math.random() < 0.35) {
                rt.dir = rt.dir === 1 ? -1 : 1;
                dirChanged = true;
              }
              rt.timer = 4500 + Math.random() * 5500;
              modeChanged = true;
            }
          }
        }

        const node = elRefs.current[c.id];
        if (node) {
          node.style.transform = `translate3d(${rt.x.toFixed(1)}px, 0, 0)`;
        }

        if (modeChanged || dirChanged) {
          const nextMode = rt.mode;
          const nextDir = rt.dir;
          setUiState((prev) => ({
            ...prev,
            [c.id]: {
              ...prev[c.id],
              mode: nextMode,
              dir: nextDir,
            },
          }));
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="cats-stage" aria-label="Интерактивные котики на странице">
      {CATS.map((cat) => {
        const st = uiState[cat.id];
        const isPetted = st.mode === 'petted';
        const isWalking = st.mode === 'walk';

        return (
          <button
            key={cat.id}
            ref={(el) => {
              elRefs.current[cat.id] = el;
            }}
            type="button"
            className={`roaming-cat roaming-cat--${cat.variant} is-${st.mode}`}
            onClick={() => petCat(cat.id, false)}
            onPointerMove={(e) => {
              if (e.pointerType === 'mouse' && (e.movementX !== 0 || e.movementY !== 0)) {
                petCat(cat.id, true);
              }
            }}
            aria-label={`Погладить котика ${cat.name}${
              st.petCount > 0 ? ` (поглажено: ${st.petCount})` : ''
            }`}
            title={`Погладить ${cat.name}`}
          >
            {isPetted && (
              <span key={st.heartBurstId} className="cat-purr-bubble" aria-hidden="true">
                <span className="cat-purr-pill tabular">
                  Мурр{st.petCount > 1 ? ` · ${st.petCount}` : ''}
                </span>
                <svg
                  className="cat-heart cat-heart--1"
                  viewBox="0 0 16 16"
                  width="12"
                  height="12"
                >
                  <path
                    d="M8 13.4s-4.8-3.1-5.8-5.9C1.5 5.4 2.9 3.5 5 3.5c1.2 0 2.3.7 3 1.7.7-1 1.8-1.7 3-1.7 2.1 0 3.5 1.9 2.8 4-.9 2.8-5.8 5.9-5.8 5.9Z"
                    fill="currentColor"
                  />
                </svg>
                <svg
                  className="cat-heart cat-heart--2"
                  viewBox="0 0 16 16"
                  width="9"
                  height="9"
                >
                  <path
                    d="M8 13.4s-4.8-3.1-5.8-5.9C1.5 5.4 2.9 3.5 5 3.5c1.2 0 2.3.7 3 1.7.7-1 1.8-1.7 3-1.7 2.1 0 3.5 1.9 2.8 4-.9 2.8-5.8 5.9-5.8 5.9Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            )}

            <span
              className={`cat-sprite-flip ${st.dir === -1 ? 'is-left' : 'is-right'}`}
              aria-hidden="true"
            >
              <svg
                className="cat-svg"
                viewBox="0 0 64 46"
                width="62"
                height="44"
                fill="none"
              >
                {/* Ground contact shadow */}
                <ellipse cx="32" cy="43" rx="19" ry="2.4" className="cat-shadow" />

                {/* Expressive curved tail */}
                <path
                  d="M15 28 C8 27, 6 19, 10 13 C12 10, 15 10, 15 13"
                  className="cat-tail"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                />

                {/* Back & front legs (animated stride when walking) */}
                <g className="cat-legs">
                  <path
                    d="M21 31 L19 41"
                    className={`cat-leg cat-leg--a ${isWalking ? 'is-walking' : ''}`}
                    strokeWidth="3.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M26 32 L26 41"
                    className={`cat-leg cat-leg--b ${isWalking ? 'is-walking' : ''}`}
                    strokeWidth="3.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M39 32 L38 41"
                    className={`cat-leg cat-leg--b ${isWalking ? 'is-walking' : ''}`}
                    strokeWidth="3.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M44 31 L46 41"
                    className={`cat-leg cat-leg--a ${isWalking ? 'is-walking' : ''}`}
                    strokeWidth="3.6"
                    strokeLinecap="round"
                  />
                </g>

                {/* Torso */}
                <rect x="15" y="20" width="31" height="15" rx="7.5" className="cat-body" />

                {/* Brushed brass / bronze collar tag */}
                <path
                  d="M39 21.5 Q42.5 23.5 44.5 27.5"
                  className="cat-collar"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="43.8" cy="27.2" r="1.8" className="cat-tag" />

                {/* Head & pointed ears */}
                <g className="cat-head">
                  <path d="M40 16 L41 8 L47 13 Z" className="cat-body" />
                  <path d="M49 14 L54 8 L55 16 Z" className="cat-body" />
                  <circle cx="47.5" cy="19.5" r="8.5" className="cat-body" />

                  {/* Eyes: happy closed arcs when petted, calm dots otherwise */}
                  {isPetted ? (
                    <>
                      <path
                        d="M44.4 19.4 Q45.8 17.8 47.2 19.4"
                        className="cat-eye-happy"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M49.4 19.4 Q50.8 17.8 52.2 19.4"
                        className="cat-eye-happy"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </>
                  ) : (
                    <>
                      <circle cx="45.8" cy="18.8" r="1.25" className="cat-eye" />
                      <circle cx="51" cy="18.8" r="1.25" className="cat-eye" />
                    </>
                  )}

                  {/* Subtle nose */}
                  <circle cx="48.5" cy="21.4" r="0.9" className="cat-nose" />
                </g>
              </svg>
            </span>
          </button>
        );
      })}
    </div>
  );
}
