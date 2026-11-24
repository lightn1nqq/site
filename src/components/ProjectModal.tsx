import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Github,
  X,
} from 'lucide-react';
import type { ProjectItem } from '../data/portfolio';
import { attachDialogBehaviors, closeDialogSmoothly } from '../lib/dialog';
import { sound } from '../lib/sound';
import { ProjectPreview } from './ProjectPreview';
import { SlidingTabs, type SlidingTabItem } from './SlidingTabs';
import { AnimatedCopyIcon } from './AnimatedCopyIcon';

interface ProjectModalProps {
  project: ProjectItem | null;
  projectIndex: number;
  totalProjects: number;
  direction: 'next' | 'prev' | 'none';
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onNotify: (message: string) => void;
}

type StageMode = 'cover' | 'preview';

const STAGE_TABS: SlidingTabItem<StageMode>[] = [
  { id: 'cover', label: 'Обложка' },
  { id: 'preview', label: 'Превью интерфейса' },
];

export function ProjectModal({
  project,
  projectIndex,
  totalProjects,
  direction,
  onClose,
  onPrev,
  onNext,
  onNotify,
}: ProjectModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stageMode, setStageMode] = useState<StageMode>('cover');
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset stage mode & scroll top whenever switching projects
  useEffect(() => {
    if (project) {
      setStageMode(project.coverImage ? 'cover' : 'preview');
      setCopiedLink(false);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [project?.id, project?.coverImage]);

  // Sync native <dialog> top-layer modal open/close state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (project) {
      if (!dialog.open) {
        dialog.showModal();
        sound.playModalOpen();
      }
    } else if (dialog.open) {
      closeDialogSmoothly(dialog);
    }
  }, [project]);

  // Attach native close, light-dismiss fallback, and keyboard arrow navigation
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialog.open || !project) return;
      // Ignore if focus is inside the inner stage tablist so ArrowLeft/Right switches stage tabs naturally
      const activeEl = document.activeElement;
      if (activeEl?.getAttribute('role') === 'tab') return;

      if (e.key === 'ArrowLeft' && totalProjects > 1) {
        e.preventDefault();
        sound.playTab();
        onPrev();
      } else if (e.key === 'ArrowRight' && totalProjects > 1) {
        e.preventDefault();
        sound.playTab();
        onNext();
      }
    };

    dialog.addEventListener('close', handleNativeClose);
    dialog.addEventListener('keydown', handleKeyDown);

    return () => {
      detach();
      dialog.removeEventListener('close', handleNativeClose);
      dialog.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onPrev, onNext, project, totalProjects]);

  const handleCloseClick = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    sound.playModalClose();
    closeDialogSmoothly(dialog);
  };

  const handleCopyProjectLink = async () => {
    if (!project) return;
    const url = `${window.location.origin}${window.location.pathname}#project-${project.id}`;
    try {
      await navigator.clipboard.writeText(url);
      sound.playCopy();
      setCopiedLink(true);
      onNotify('Ссылка на проект скопирована');
      window.setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      onNotify('Не удалось скопировать ссылку');
    }
  };

  const formattedIndex = String(projectIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalProjects).padStart(2, '0');

  const slideClass = useMemo(() => {
    if (direction === 'next') return 'modal-body-anim modal-body-anim--next';
    if (direction === 'prev') return 'modal-body-anim modal-body-anim--prev';
    return 'modal-body-anim';
  }, [direction]);

  return (
    <dialog
      ref={dialogRef}
      className="ui-dialog"
      aria-labelledby="project-modal-title"
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      {project && (
        <>
          <div className="dialog-header">
            <div key={project.id} className="dialog-header-meta micro-swap-text">
              <span className="project-index tabular">
                {formattedIndex} / {formattedTotal}
              </span>
              <span className="status-sep">·</span>
              <span className="section-sub">
                {project.category} · <span className="tabular">{project.year}</span>
              </span>
            </div>
            <button
              type="button"
              className="dialog-close-btn"
              onClick={handleCloseClick}
              onMouseEnter={() => sound.playHover()}
              aria-label="Закрыть окно проекта"
              autoFocus
            >
              <X size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <div ref={scrollRef} className="dialog-scroll">
            <div key={project.id} className={slideClass}>
              <div className="modal-stage-header">
                <div>
                  <h2 id="project-modal-title" className="modal-project-title">
                    {project.title}
                  </h2>
                  {project.tagline && (
                    <p className="modal-project-tagline">{project.tagline}</p>
                  )}
                </div>

                {project.coverImage && (
                  <SlidingTabs
                    variant="compact"
                    items={STAGE_TABS}
                    activeId={stageMode}
                    onChange={setStageMode}
                    ariaLabel="Режим просмотра"
                  />
                )}
              </div>

              <div
                role="tabpanel"
                aria-label={stageMode === 'cover' ? 'Обложка проекта' : 'Превью интерфейса'}
                className={`modal-visual-frame ${
                  stageMode === 'preview' || !project.coverImage ? 'is-preview' : ''
                }`}
              >
                <div key={`${project.id}-${stageMode}`} className="stage-view-transition">
                  {stageMode === 'cover' && project.coverImage ? (
                    <img src={project.coverImage} alt={project.coverAlt} />
                  ) : (
                    <ProjectPreview project={project} interactive onNotify={onNotify} />
                  )}
                </div>
              </div>

              {project.metrics.length > 0 && (
                <div className="modal-metrics-grid">
                  {project.metrics.map((m, idx) => (
                    <div
                      key={m.label}
                      className="metric-card metric-stagger"
                      style={{ '--metric-delay': `${40 + idx * 45}ms` } as React.CSSProperties}
                    >
                      <span className="metric-label">{m.label}</span>
                      <span className="metric-value tabular">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {project.editions && project.editions.length > 0 && (
                <div className="modal-editions-block">
                  <span className="meta-block-label">Две редакции на общем ядре</span>
                  <div className="modal-editions-grid">
                    {project.editions.map((ed) => (
                      <div key={ed.binary} className="edition-card">
                        <div className="edition-card-head">
                          <span className="edition-card-title">{ed.name}</span>
                          <span className="edition-card-bin tabular">{ed.binary}</span>
                        </div>
                        <span className="edition-card-char">{ed.character}</span>
                        <p className="edition-card-desc">{ed.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-content-grid">
                <div className="modal-story">
                  {project.description.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                <aside className="modal-aside">
                  <div className="meta-block">
                    <span className="meta-block-label">Роль</span>
                    <span className="meta-block-val">{project.role}</span>
                  </div>

                  <div className="meta-block">
                    <span className="meta-block-label">Стек</span>
                    <ul className="stack-list">
                      {project.stack.map((tech) => (
                        <li key={tech} className="stack-tag">
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {project.hotkeys && project.hotkeys.length > 0 && (
                    <div className="meta-block">
                      <span className="meta-block-label">Горячие клавиши</span>
                      <ul className="hotkeys-list">
                        {project.hotkeys.map((hk) => (
                          <li key={hk.keys} className="hotkey-row">
                            <kbd className="kbd">{hk.keys}</kbd>
                            <span className="hotkey-action">{hk.action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="meta-block">
                    <span className="meta-block-label">Ссылки</span>
                    <div className="modal-links-row">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn--primary btn--sm"
                          onClick={() => sound.playClick()}
                          onMouseEnter={() => sound.playHover()}
                        >
                          <span>Открыть демо</span>
                          <ArrowUpRight
                            size={15}
                            strokeWidth={1.5}
                            className="card-arrow-ne"
                            aria-hidden="true"
                          />
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn--secondary btn--sm"
                          onClick={() => sound.playClick()}
                          onMouseEnter={() => sound.playHover()}
                        >
                          <Github size={15} strokeWidth={1.5} aria-hidden="true" />
                          <span>Репозиторий</span>
                        </a>
                      )}
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={handleCopyProjectLink}
                        onMouseEnter={() => sound.playHover()}
                      >
                        <AnimatedCopyIcon copied={copiedLink} size={15} />
                        <span key={copiedLink ? 'c' : 'i'} className="micro-swap-text">
                          {copiedLink ? 'Скопировано' : 'Ссылка'}
                        </span>
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>

          <div className="dialog-footer">
            <div className="modal-kbd-hint">
              <kbd className="kbd">Esc</kbd>
              <span>закрыть</span>
              {totalProjects > 1 && (
                <>
                  <span className="status-sep">·</span>
                  <kbd className="kbd">←</kbd>
                  <kbd className="kbd">→</kbd>
                  <span>проекты</span>
                </>
              )}
            </div>

            {totalProjects > 1 && (
              <div className="modal-nav-group">
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => {
                    sound.playTab();
                    onPrev();
                  }}
                  onMouseEnter={() => sound.playHover()}
                >
                  <ArrowLeft size={15} strokeWidth={1.5} aria-hidden="true" />
                  <span>Предыдущий</span>
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => {
                    sound.playTab();
                    onNext();
                  }}
                  onMouseEnter={() => sound.playHover()}
                >
                  <span>Следующий</span>
                  <ArrowRight size={15} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}
