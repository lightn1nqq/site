import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Github,
  Menu,
  SlidersHorizontal,
} from 'lucide-react';
import type { PortfolioData, ProjectItem } from './data/portfolio';
import {
  clearPortfolioData,
  hasCustomPortfolioData,
  isLocalEditorAllowed,
  loadPortfolioData,
  savePortfolioData,
} from './lib/storage';
import { sound, type SoundProfile } from './lib/sound';
import { runViewTransition } from './lib/viewTransition';
import { useGlassSpecular } from './lib/useGlassSpecular';
import { useScrollFocusFallback } from './lib/useScrollFocusFallback';
import { SocialIcon } from './components/SocialIcon';
import { ProjectPreview } from './components/ProjectPreview';
import { ProjectModal } from './components/ProjectModal';
import { EditorDrawer } from './components/EditorDrawer';
import { MobileNavDialog } from './components/MobileNavDialog';
import { RevealText } from './components/RevealText';
import { SlidingTabs, type SlidingTabItem } from './components/SlidingTabs';
import {
  AnimatedCopyIcon,
  AnimatedSoundIcon,
  AnimatedThemeIcon,
} from './components/AnimatedCopyIcon';
import {
  AtmospherePopover,
  type GlassDensity,
  type ScrollBlurMode,
  type ThemePreference,
} from './components/AtmospherePopover';
import { ScrollRail } from './components/ScrollRail';
import { RoamingCats } from './components/RoamingCats';

const ALL_CATEGORY = 'Все';
const STORAGE_SCHEME_KEY = 'color-scheme';
const STORAGE_BLUR_KEY = 'portfolio_scroll_blur_mode';
const STORAGE_GLASS_KEY = 'portfolio_glass_density';
const STORAGE_CATS_KEY = 'portfolio_cats_enabled';

const APPROACH_PRINCIPLES = [
  {
    index: '01',
    title: 'Тишина интерфейса',
    text: 'Хром, отступы и поверхности отступают на второй план, чтобы взгляд сразу считывал смысл, текст и сам продукт.',
  },
  {
    index: '02',
    title: 'Оптическая глубина',
    text: 'Слои жидкого стекла и тончайшие световые кромки формируют иерархию одинаково чисто в тёмной и светлой теме.',
  },
  {
    index: '03',
    title: 'Инерция и отклик',
    text: 'Движение следует за жестом и скоростью скролла: переходы на GPU, выверенное замедление и едва заметный звук.',
  },
];

function readStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = window.localStorage.getItem(STORAGE_SCHEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // ignore
  }
  return 'system';
}

function getSystemPrefersLight(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.matchMedia?.('(prefers-color-scheme: light)').matches);
}

function applyThemeToDocument(pref: ThemePreference): void {
  if (typeof document === 'undefined') return;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (meta) {
    meta.content = pref === 'system' ? 'light dark' : pref;
  }
  if (pref === 'system') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = pref;
  }
}

export function App() {
  const canUseEditor = useMemo(() => isLocalEditorAllowed(), []);
  const [data, setData] = useState<PortfolioData>(() => loadPortfolioData());
  const [isCustomized, setIsCustomized] = useState<boolean>(
    () => canUseEditor && hasCustomPortfolioData(),
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [navDirection, setNavDirection] = useState<'next' | 'prev' | 'none'>('none');
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.isEnabled());
  const [soundProfile, setSoundProfile] = useState<SoundProfile>(() => sound.getProfile());

  const [themePreference, setThemePreference] = useState<ThemePreference>(() => readStoredTheme());
  const [systemIsLight, setSystemIsLight] = useState<boolean>(() => getSystemPrefersLight());

  const [catsEnabled, setCatsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = window.localStorage.getItem(STORAGE_CATS_KEY);
      if (saved !== null) return saved === 'true';
    } catch {
      // ignore
    }
    return true;
  });

  const [scrollBlur, setScrollBlur] = useState<ScrollBlurMode>(() => {
    if (typeof window === 'undefined') return 'deep';
    try {
      const saved = window.localStorage.getItem(STORAGE_BLUR_KEY);
      if (saved === 'deep' || saved === 'soft' || saved === 'off') return saved;
    } catch {
      // ignore
    }
    return 'deep';
  });

  const [glassDensity, setGlassDensity] = useState<GlassDensity>(() => {
    if (typeof window === 'undefined') return 'liquid';
    try {
      const saved = window.localStorage.getItem(STORAGE_GLASS_KEY);
      if (saved === 'liquid' || saved === 'dense') return saved;
    } catch {
      // ignore
    }
    return 'liquid';
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const toastTimerRef = useRef<number | null>(null);

  const isLightResolved =
    themePreference === 'light' || (themePreference === 'system' && systemIsLight);

  const showToast = useCallback((message: string) => {
    setToastText(message);
    setToastVisible(true);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  }, []);

  // Sync <meta name="color-scheme"> and cross-tab storage/system changes
  useEffect(() => {
    applyThemeToDocument(themePreference);
  }, [themePreference]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onSystemChange = (e: MediaQueryListEvent) => {
      setSystemIsLight(e.matches);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_SCHEME_KEY) {
        setThemePreference(readStoredTheme());
      }
    };
    mq.addEventListener('change', onSystemChange);
    window.addEventListener('storage', onStorage);
    return () => {
      mq.removeEventListener('change', onSystemChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleSetThemePreference = useCallback(
    (next: ThemePreference) => {
      setThemePreference(next);
      try {
        if (next === 'system') {
          window.localStorage.removeItem(STORAGE_SCHEME_KEY);
        } else {
          window.localStorage.setItem(STORAGE_SCHEME_KEY, next);
        }
      } catch {
        // ignore storage errors while still applying theme
      }
      showToast(
        next === 'light'
          ? 'Светлая тема Liquid Glass'
          : next === 'dark'
            ? 'Тёмная тема Liquid Glass'
            : 'Тема как в системе',
      );
    },
    [showToast],
  );

  // Two-state quick toggle in header: switches to opposite of currently rendered scheme,
  // reverting to system default (removing localStorage override) when matching OS preference.
  const handleQuickToggleTheme = useCallback(() => {
    sound.playTab();
    const target: 'light' | 'dark' = isLightResolved ? 'dark' : 'light';
    const systemScheme: 'light' | 'dark' = getSystemPrefersLight() ? 'light' : 'dark';
    const nextPref: ThemePreference = target === systemScheme ? 'system' : target;
    setThemePreference(nextPref);
    try {
      if (nextPref === 'system') {
        window.localStorage.removeItem(STORAGE_SCHEME_KEY);
      } else {
        window.localStorage.setItem(STORAGE_SCHEME_KEY, nextPref);
      }
    } catch {
      // ignore
    }
    showToast(target === 'light' ? 'Светлая тема Liquid Glass' : 'Тёмная тема Liquid Glass');
  }, [isLightResolved, showToast]);

  const handleSetCatsEnabled = useCallback(
    (next: boolean) => {
      setCatsEnabled(next);
      try {
        window.localStorage.setItem(STORAGE_CATS_KEY, String(next));
      } catch {
        // ignore
      }
      showToast(next ? 'Котики вышли на прогулку' : 'Котики скрыты');
    },
    [showToast],
  );

  const handleToggleCats = useCallback(() => {
    sound.playTab();
    handleSetCatsEnabled(!catsEnabled);
  }, [catsEnabled, handleSetCatsEnabled]);

  useEffect(() => {
    document.documentElement.dataset.scrollBlur = scrollBlur;
    try {
      window.localStorage.setItem(STORAGE_BLUR_KEY, scrollBlur);
    } catch {
      // ignore
    }
  }, [scrollBlur]);

  useEffect(() => {
    document.documentElement.dataset.glassDensity = glassDensity;
    try {
      window.localStorage.setItem(STORAGE_GLASS_KEY, glassDensity);
    } catch {
      // ignore
    }
  }, [glassDensity]);

  useEffect(() => {
    document.title = `${data.profile.name} — Проекты и контакты`;
  }, [data.profile.name]);

  useGlassSpecular();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#project-')) {
      const id = hash.replace('#project-', '');
      if (data.projects.some((p) => p.id === id)) {
        setNavDirection('none');
        setActiveProjectId(id);
      }
    }
  }, [data.projects]);

  const categoryTabs: SlidingTabItem<string>[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of data.projects) {
      counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
    }
    return [
      { id: ALL_CATEGORY, label: ALL_CATEGORY, count: data.projects.length },
      ...Array.from(counts.entries()).map(([name, count]) => ({
        id: name,
        label: name,
        count,
      })),
    ];
  }, [data.projects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === ALL_CATEGORY) return data.projects;
    return data.projects.filter((p) => p.category === selectedCategory);
  }, [data.projects, selectedCategory]);

  useScrollFocusFallback(scrollBlur, [filteredProjects.length, selectedCategory]);

  useEffect(() => {
    if (
      selectedCategory !== ALL_CATEGORY &&
      !data.projects.some((p) => p.category === selectedCategory)
    ) {
      setSelectedCategory(ALL_CATEGORY);
    }
  }, [data.projects, selectedCategory]);

  const activeProjectIndex = useMemo(() => {
    if (!activeProjectId) return -1;
    return filteredProjects.findIndex((p) => p.id === activeProjectId);
  }, [activeProjectId, filteredProjects]);

  const activeProject: ProjectItem | null =
    activeProjectIndex >= 0 ? filteredProjects[activeProjectIndex] : null;

  const handleCategoryChange = useCallback((nextCategory: string) => {
    runViewTransition(() => {
      setSelectedCategory(nextCategory);
    });
  }, []);

  const handleDataChange = useCallback((next: PortfolioData) => {
    setData(next);
    savePortfolioData(next);
    setIsCustomized(true);
  }, []);

  const handleResetData = useCallback(() => {
    runViewTransition(() => {
      const defaults = clearPortfolioData();
      setData(defaults);
      setIsCustomized(false);
    });
  }, []);

  const handleToggleSound = useCallback(() => {
    const next = sound.toggle();
    setSoundEnabled(next);
    showToast(next ? 'Звук интерфейса включён' : 'Звук интерфейса выключен');
  }, [showToast]);

  const handleChangeSoundProfile = useCallback(
    (profile: SoundProfile) => {
      sound.setProfile(profile);
      setSoundProfile(profile);
      showToast(profile === 'glass' ? 'Профиль звука: Стекло' : 'Профиль звука: Механика');
    },
    [showToast],
  );

  const handleCopy = useCallback(
    async (value: string, id: string, label: string) => {
      try {
        await navigator.clipboard.writeText(value);
        sound.playCopy();
        setCopiedId(id);
        showToast(`${label} скопирован`);
        window.setTimeout(() => {
          setCopiedId((curr) => (curr === id ? null : curr));
        }, 1800);
      } catch {
        showToast('Не удалось скопировать в буфер');
      }
    },
    [showToast],
  );

  const handleOpenProject = useCallback((id: string) => {
    setNavDirection('none');
    setActiveProjectId(id);
  }, []);

  const handlePrevProject = useCallback(() => {
    if (filteredProjects.length <= 1 || activeProjectIndex < 0) return;
    setNavDirection('prev');
    const prevIdx =
      (activeProjectIndex - 1 + filteredProjects.length) % filteredProjects.length;
    setActiveProjectId(filteredProjects[prevIdx].id);
  }, [filteredProjects, activeProjectIndex]);

  const handleNextProject = useCallback(() => {
    if (filteredProjects.length <= 1 || activeProjectIndex < 0) return;
    setNavDirection('next');
    const nextIdx = (activeProjectIndex + 1) % filteredProjects.length;
    setActiveProjectId(filteredProjects[nextIdx].id);
  }, [filteredProjects, activeProjectIndex]);

  const { profile, socials } = data;
  const currentYear = new Date().getFullYear();

  return (
    <div className="page-shell">
      {/* Hairline optical scroll progress thread */}
      <div className="scroll-progress-thread" aria-hidden="true">
        <div className="scroll-progress-fill" />
      </div>

      {/* Floating Liquid Glass vertical section focus rail (wide desktop) */}
      <ScrollRail />

      <header className="site-header header-enter">
        <div className="container header-inner">
          <a
            href="#top"
            className="wordmark"
            onClick={() => sound.playClick()}
            onMouseEnter={() => sound.playHover()}
          >
            <span className="wordmark-mark" aria-hidden="true">
              {profile.monogram}
            </span>
            <span>{profile.name}</span>
          </a>

          <nav className="header-nav" aria-label="Основная навигация">
            <a
              href="#approach"
              className="nav-link"
              onClick={() => sound.playClick()}
              onMouseEnter={() => sound.playHover()}
            >
              <span>Подход</span>
            </a>
            <a
              href="#projects"
              className="nav-link"
              onClick={() => sound.playClick()}
              onMouseEnter={() => sound.playHover()}
            >
              <span>Проекты</span>
            </a>
            <a
              href="#contacts"
              className="nav-link"
              onClick={() => sound.playClick()}
              onMouseEnter={() => sound.playHover()}
            >
              <span>Контакты</span>
            </a>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="icon-control glass-control theme-quick-btn"
              onClick={handleQuickToggleTheme}
              onMouseEnter={() => sound.playHover()}
              aria-label={isLightResolved ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}
              title={isLightResolved ? 'Включить тёмную тему' : 'Включить светлую тему'}
            >
              <AnimatedThemeIcon isLight={isLightResolved} size={15} />
              <span key={isLightResolved ? 'light' : 'dark'} className="micro-swap-text theme-quick-label">
                {isLightResolved ? 'Светлая' : 'Тёмная'}
              </span>
            </button>

            <AtmospherePopover
              themePreference={themePreference}
              catsEnabled={catsEnabled}
              scrollBlur={scrollBlur}
              glassDensity={glassDensity}
              soundProfile={soundProfile}
              onChangeTheme={handleSetThemePreference}
              onChangeCatsEnabled={handleSetCatsEnabled}
              onChangeScrollBlur={setScrollBlur}
              onChangeGlassDensity={setGlassDensity}
              onChangeSoundProfile={handleChangeSoundProfile}
            />

            <button
              type="button"
              className={`icon-control glass-control ${soundEnabled ? 'is-active' : ''}`}
              onClick={handleToggleSound}
              onMouseEnter={() => sound.playHover()}
              aria-pressed={soundEnabled}
              aria-label="Звук интерфейса"
              title={soundEnabled ? 'Звук включён' : 'Звук выключен'}
            >
              <AnimatedSoundIcon enabled={soundEnabled} size={16} />
              <span key={soundEnabled ? 'on' : 'off'} className="micro-swap-text sound-btn-label">
                {soundEnabled ? 'Звук' : 'Тихо'}
              </span>
              <span className="sound-dot" aria-hidden="true" />
            </button>

            {canUseEditor && (
              <button
                type="button"
                className="icon-control glass-control editor-desktop-btn"
                onClick={() => {
                  sound.playClick();
                  setEditorOpen(true);
                }}
                onMouseEnter={() => sound.playHover()}
                aria-label="Открыть локальный редактор проектов и ссылок"
              >
                <SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden="true" />
                <span>Редактор</span>
              </button>
            )}

            <button
              type="button"
              className="icon-control glass-control mobile-menu-btn"
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(true);
              }}
              aria-label="Открыть меню навигации"
            >
              <Menu size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section id="hero" className="hero">
          <div className="container hero-grid">
            <div className="hero-main">
              <div data-scroll-focus="stagger-1">
                <div className="status-line enter enter-d1">
                  <span
                    className={`status-dot ${profile.isAvailable ? '' : 'is-muted'}`}
                    aria-hidden="true"
                  />
                  <span>{profile.availability}</span>
                  <span className="status-sep" aria-hidden="true">
                    ·
                  </span>
                  <span>{profile.location}</span>
                </div>
              </div>

              <div data-scroll-focus="stagger-2">
                <h1 className="hero-title hero-words-immediate">
                  <RevealText
                    baseDelayMs={70}
                    stepMs={38}
                    segments={[
                      { text: profile.headlineStart },
                      { text: profile.headlineItalic, italic: true },
                      { text: profile.headlineEnd },
                    ]}
                  />
                </h1>
              </div>

              <div data-scroll-focus="stagger-3">
                <p className="hero-subhead enter enter-d3">{profile.subhead}</p>
              </div>

              <div data-scroll-focus="stagger-4">
                <div className="hero-actions enter enter-d4">
                  <a
                    href="#projects"
                    className="btn btn--primary"
                    onClick={() => sound.playClick()}
                    onMouseEnter={() => sound.playHover()}
                  >
                    <span>Смотреть проекты</span>
                    <ArrowDown
                      size={16}
                      strokeWidth={1.5}
                      className="btn-arrow-down"
                      aria-hidden="true"
                    />
                  </a>

                  <button
                    type="button"
                    className="btn btn--secondary glass-control"
                    onClick={() => handleCopy(profile.email, 'hero-email', 'Адрес почты')}
                    onMouseEnter={() => sound.playHover()}
                  >
                    <AnimatedCopyIcon copied={copiedId === 'hero-email'} size={16} />
                    <span
                      key={copiedId === 'hero-email' ? 'copied' : 'idle'}
                      className="micro-swap-text"
                    >
                      {copiedId === 'hero-email' ? 'Почта скопирована' : profile.email}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div data-scroll-focus="stagger-3">
              <aside
                id="contacts"
                className="socials-card glass-surface enter enter-d3"
                aria-label="Социальные сети и прямые контакты"
              >
                <div className="socials-card-header">
                  <h2 className="socials-card-title">Связь и сети</h2>
                  <span className="socials-card-meta">Клик по иконке копирует контакт</span>
                </div>

                <ul className="social-list">
                  {socials.map((item, idx) => {
                    const hasUrl = Boolean(item.url.trim());
                    const isMail = item.url.startsWith('mailto:');
                    const isCopied = copiedId === item.id;
                    return (
                      <li
                        key={item.id}
                        className="social-row social-row-stagger"
                        style={{ '--row-delay': `${180 + idx * 42}ms` } as React.CSSProperties}
                        onMouseEnter={() => sound.playHover()}
                      >
                        {hasUrl ? (
                          <a
                            href={item.url}
                            target={isMail ? undefined : '_blank'}
                            rel={isMail ? undefined : 'noreferrer'}
                            className="social-row-link"
                            onClick={() => sound.playClick()}
                          >
                            <span className="social-icon-box">
                              <SocialIcon name={item.icon} />
                            </span>
                            <span className="social-text-group">
                              <span className="social-label">{item.label}</span>
                              <span className="social-handle">{item.handle}</span>
                            </span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="social-row-link social-row-btn"
                            onClick={() => handleCopy(item.copyValue, item.id, item.label)}
                          >
                            <span className="social-icon-box">
                              <SocialIcon name={item.icon} />
                            </span>
                            <span className="social-text-group">
                              <span className="social-label">{item.label}</span>
                              <span className="social-handle">{item.handle}</span>
                            </span>
                          </button>
                        )}
                        <button
                          type="button"
                          className={`copy-mini-btn ${isCopied ? 'is-copied' : ''}`}
                          onClick={() => handleCopy(item.copyValue, item.id, item.label)}
                          aria-label={`Скопировать ${item.label}: ${item.copyValue}`}
                          title={`Скопировать ${item.copyValue}`}
                        >
                          <AnimatedCopyIcon copied={isCopied} size={15} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            </div>
          </div>
        </section>

        {/* Quiet typographic scroll-focus interlude */}
        <section id="approach" className="approach-section" aria-labelledby="approach-heading">
          <div className="container">
            <div className="approach-lead" data-scroll-focus="stagger-1">
              <span className="approach-kicker tabular">02 · Подход</span>
              <h2 id="approach-heading" className="approach-statement">
                Интерфейс работает лучше всего тогда, когда остаётся{' '}
                <em>почти невидимым</em> — уступая сцену контенту и ритму чтения
              </h2>
            </div>

            <div className="approach-grid">
              {APPROACH_PRINCIPLES.map((item, idx) => (
                <div
                  key={item.index}
                  className="approach-card glass-surface"
                  data-scroll-focus={`stagger-${idx + 2}`}
                  onMouseEnter={() => sound.playHover()}
                >
                  <span className="project-index tabular">{item.index}</span>
                  <h3 className="approach-card-title">{item.title}</h3>
                  <p className="approach-card-text">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="projects-section">
          <div className="container">
            <div className="section-header">
              <div className="section-title-group" data-scroll-focus="stagger-1">
                <h2 className="section-heading">
                  {data.projects.length === 1 ? (
                    <>
                      Флагманский <em>проект</em>
                    </>
                  ) : (
                    <>
                      Избранные <em>работы</em>
                    </>
                  )}
                </h2>
                <p className="section-sub tabular">
                  <span
                    key={`${selectedCategory}-${filteredProjects.length}`}
                    className="micro-swap-text"
                  >
                    {filteredProjects.length}{' '}
                    {filteredProjects.length === 1
                      ? 'проект · две редакции интерфейса'
                      : filteredProjects.length < 5
                        ? 'проекта'
                        : 'проектов'}
                  </span>{' '}
                  · нажмите на карточку для подробностей
                </p>
              </div>

              {categoryTabs.length > 2 && (
                <div data-scroll-focus="stagger-2">
                  <SlidingTabs
                    items={categoryTabs}
                    activeId={selectedCategory}
                    onChange={handleCategoryChange}
                    ariaLabel="Фильтр проектов по категории"
                  />
                </div>
              )}
            </div>

            <div
              className="projects-grid"
              role="tabpanel"
              aria-label={`Категория: ${selectedCategory}`}
            >
              {filteredProjects.map((project, idx) => {
                const isSingle = filteredProjects.length === 1;
                const hasLead = filteredProjects.length >= 3;
                const isFirstLead = hasLead && idx === 0;
                const isClosingWide =
                  hasLead &&
                  idx === filteredProjects.length - 1 &&
                  (filteredProjects.length - 1) % 2 === 1;
                const isLead = isSingle || isFirstLead || isClosingWide;
                const indexLabel = String(idx + 1).padStart(2, '0');
                const safeVtId = project.id.replace(/[^a-zA-Z0-9_-]/g, '');

                return (
                  <article
                    key={project.id}
                    id={`project-${project.id}`}
                    data-scroll-focus={idx % 2 === 0 ? 'stagger-1' : 'stagger-2'}
                    className={`project-card glass-surface ${isLead ? 'project-card--lead' : ''}`}
                    style={
                      {
                        viewTransitionName: `project-card-${safeVtId}`,
                      } as React.CSSProperties
                    }
                    onMouseEnter={() => sound.playHover()}
                  >
                    <button
                      type="button"
                      className="project-media-trigger"
                      onClick={() => {
                        sound.playClick();
                        handleOpenProject(project.id);
                      }}
                      aria-label={`Открыть проект ${project.title}`}
                    >
                      {project.coverImage ? (
                        <>
                          <img
                            src={project.coverImage}
                            alt={project.coverAlt}
                            className="project-cover-img"
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            fetchPriority={idx === 0 ? 'high' : 'auto'}
                          />
                          <div className="project-media-vignette" aria-hidden="true" />
                        </>
                      ) : (
                        <ProjectPreview project={project} compact />
                      )}
                    </button>

                    <div className="project-body">
                      <div className="project-meta-top">
                        <span className="project-index tabular">{indexLabel}</span>
                        <span className="project-meta-right">
                          <span>{project.role}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular">{project.year}</span>
                        </span>
                      </div>

                      <div>
                        <button
                          type="button"
                          className="project-title-btn"
                          onClick={() => {
                            sound.playClick();
                            handleOpenProject(project.id);
                          }}
                        >
                          <h3 className="project-title">{project.title}</h3>
                        </button>
                      </div>

                      <p className="project-summary">{project.summary}</p>

                      {project.editions && project.editions.length > 0 && (
                        <div className="card-editions-row">
                          {project.editions.map((ed) => (
                            <div key={ed.binary} className="card-edition-chip">
                              <span className="card-edition-name">{ed.name}</span>
                              <span className="card-edition-bin tabular">{ed.binary}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <ul className="stack-list" aria-label="Технологии">
                        {project.stack.slice(0, isLead ? 7 : 4).map((tech) => (
                          <li key={tech} className="stack-tag">
                            {tech}
                          </li>
                        ))}
                      </ul>

                      <div className="project-footer">
                        <button
                          type="button"
                          className="project-open-link"
                          onClick={() => {
                            sound.playClick();
                            handleOpenProject(project.id);
                          }}
                        >
                          <span>Подробнее</span>
                          <ArrowUpRight
                            size={15}
                            strokeWidth={1.5}
                            className="card-arrow-ne"
                            aria-hidden="true"
                          />
                        </button>

                        <div className="project-external-links">
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="project-ext-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playClick();
                              }}
                              aria-label={`Демо ${project.title}`}
                            >
                              <span>Демо</span>
                              <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                            </a>
                          )}
                          {project.repoUrl && (
                            <a
                              href={project.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="project-ext-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playClick();
                              }}
                              aria-label={`Репозиторий ${project.title}`}
                            >
                              <Github size={14} strokeWidth={1.5} aria-hidden="true" />
                              <span>Код</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer id="footer-contact" className="site-footer">
        <div className="container">
          <div className="footer-statement" data-scroll-focus="footer">
            <p className="footer-quote">
              {profile.closingQuote}
              {profile.closingQuoteItalic && <em>{profile.closingQuoteItalic}</em>}
            </p>

            <div className="footer-contact-box">
              <span className="meta-block-label">Прямой контакт</span>
              <div className="footer-email-row">
                <a
                  href={`mailto:${profile.email}`}
                  className="btn btn--primary btn--sm"
                  onClick={() => sound.playClick()}
                  onMouseEnter={() => sound.playHover()}
                >
                  <span>Написать на почту</span>
                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.5}
                    className="card-arrow-ne"
                    aria-hidden="true"
                  />
                </a>
                <button
                  type="button"
                  className="btn btn--secondary glass-control btn--sm"
                  onClick={() => handleCopy(profile.email, 'footer-email', 'Адрес почты')}
                  onMouseEnter={() => sound.playHover()}
                >
                  <AnimatedCopyIcon copied={copiedId === 'footer-email'} size={15} />
                  <span
                    key={copiedId === 'footer-email' ? 'copied' : 'idle'}
                    className="micro-swap-text"
                  >
                    {copiedId === 'footer-email' ? 'Скопировано' : 'Копировать'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="footer-bottom" data-scroll-focus="footer">
            <span className="tabular">
              © {currentYear} {profile.name} · {profile.role}
            </span>
            <div className="footer-links">
              {socials.map((s) =>
                s.url.trim() ? (
                  <a
                    key={s.id}
                    href={s.url}
                    target={s.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel={s.url.startsWith('mailto:') ? undefined : 'noreferrer'}
                    className="footer-link"
                    onClick={() => sound.playClick()}
                  >
                    <span>{s.label}</span>
                  </a>
                ) : (
                  <button
                    key={s.id}
                    type="button"
                    className="footer-link footer-link-btn"
                    onClick={() => handleCopy(s.copyValue, `footer-${s.id}`, s.label)}
                  >
                    <span>{s.label}</span>
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </footer>

      {catsEnabled && <RoamingCats />}

      <ProjectModal
        project={activeProject}
        projectIndex={activeProjectIndex}
        totalProjects={filteredProjects.length}
        direction={navDirection}
        onClose={() => setActiveProjectId(null)}
        onPrev={handlePrevProject}
        onNext={handleNextProject}
        onNotify={showToast}
      />

      {canUseEditor && (
        <EditorDrawer
          open={editorOpen}
          data={data}
          isCustomized={isCustomized}
          onChange={handleDataChange}
          onReset={handleResetData}
          onClose={() => setEditorOpen(false)}
          onNotify={showToast}
        />
      )}

      <MobileNavDialog
        open={mobileMenuOpen}
        canUseEditor={canUseEditor}
        isLightTheme={isLightResolved}
        soundEnabled={soundEnabled}
        catsEnabled={catsEnabled}
        socials={socials}
        onClose={() => setMobileMenuOpen(false)}
        onToggleTheme={handleQuickToggleTheme}
        onToggleSound={handleToggleSound}
        onToggleCats={handleToggleCats}
        onOpenEditor={() => setEditorOpen(true)}
        onCopySocial={(s) => handleCopy(s.copyValue, `mobile-${s.id}`, s.label)}
      />

      <div
        role="status"
        aria-live="polite"
        className={`toast-bar glass-surface ${toastVisible ? 'is-visible' : ''}`}
      >
        <Check size={15} strokeWidth={1.5} className="toast-icon" aria-hidden="true" />
        <span key={toastText} className="micro-swap-text">
          {toastText}
        </span>
      </div>
    </div>
  );
}

export default App;
