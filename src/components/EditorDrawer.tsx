import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Download,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import type {
  PortfolioData,
  ProjectItem,
  SocialIconName,
  SocialLink,
} from '../data/portfolio';
import { attachDialogBehaviors, closeDialogSmoothly } from '../lib/dialog';
import { sound } from '../lib/sound';
import { generatePortfolioConfigTs } from '../lib/storage';
import { runViewTransition } from '../lib/viewTransition';
import { SlidingTabs, type SlidingTabItem } from './SlidingTabs';
import { AnimatedCopyIcon } from './AnimatedCopyIcon';

interface EditorDrawerProps {
  open: boolean;
  data: PortfolioData;
  isCustomized: boolean;
  onChange: (next: PortfolioData) => void;
  onReset: () => void;
  onClose: () => void;
  onNotify: (message: string) => void;
}

type EditorTab = 'projects' | 'profile' | 'socials' | 'export';

const SOCIAL_ICON_OPTIONS: { value: SocialIconName; label: string }[] = [
  { value: 'github', label: 'GitHub' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'discord', label: 'Discord' },
  { value: 'mail', label: 'Почта' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'globe', label: 'Сайт / ссылка' },
];

export function EditorDrawer({
  open,
  data,
  isCustomized,
  onChange,
  onReset,
  onClose,
  onNotify,
}: EditorDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('projects');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const exportTs = useMemo(() => generatePortfolioConfigTs(data), [data]);

  const editorTabs: SlidingTabItem<EditorTab>[] = useMemo(
    () => [
      { id: 'projects', label: 'Проекты', count: data.projects.length },
      { id: 'profile', label: 'Профиль' },
      { id: 'socials', label: 'Соцсети', count: data.socials.length },
      { id: 'export', label: 'Экспорт' },
    ],
    [data.projects.length, data.socials.length],
  );

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

  const handleClose = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    sound.playModalClose();
    closeDialogSmoothly(dialog);
  };

  // Profile updater
  const updateProfile = <K extends keyof PortfolioData['profile']>(
    key: K,
    value: PortfolioData['profile'][K],
  ) => {
    onChange({
      ...data,
      profile: {
        ...data.profile,
        [key]: value,
      },
    });
  };

  // Project helpers
  const addProject = () => {
    sound.playClick();
    const id = `project-${Date.now().toString(36)}`;
    const newProject: ProjectItem = {
      id,
      title: 'Новый проект',
      category: 'Продукты',
      year: String(new Date().getFullYear()),
      role: 'Автор и инженер',
      summary: 'Краткое описание сути проекта в одно-два предложения.',
      description: [
        'Расскажите о задаче, контексте и ключевых инженерных или дизайн-решениях.',
      ],
      stack: ['TypeScript', 'React'],
      coverImage: '',
      coverAlt: 'Обложка проекта',
      previewKind: 'custom',
      metrics: [{ label: 'Статус', value: 'В релизе' }],
      liveUrl: '',
      repoUrl: '',
    };
    runViewTransition(() => {
      onChange({
        ...data,
        projects: [newProject, ...data.projects],
      });
      setEditingProjectId(id);
    });
    onNotify('Проект добавлен');
  };

  const updateProject = (id: string, patch: Partial<ProjectItem>) => {
    onChange({
      ...data,
      projects: data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  const deleteProject = (id: string) => {
    sound.playClick();
    runViewTransition(() => {
      onChange({
        ...data,
        projects: data.projects.filter((p) => p.id !== id),
      });
      if (editingProjectId === id) setEditingProjectId(null);
    });
    onNotify('Проект удалён');
  };

  const moveProject = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= data.projects.length) return;
    sound.playTab();
    runViewTransition(() => {
      const next = [...data.projects];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      onChange({ ...data, projects: next });
    });
  };

  const handleCoverUpload = (id: string, file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateProject(id, { coverImage: reader.result });
        sound.playCopy();
        onNotify('Обложка загружена локально');
      }
    };
    reader.readAsDataURL(file);
  };

  // Social helpers
  const addSocial = () => {
    sound.playClick();
    const newSocial: SocialLink = {
      id: `social-${Date.now().toString(36)}`,
      label: 'Новая ссылка',
      handle: '@username',
      url: 'https://example.com',
      copyValue: '@username',
      icon: 'globe',
    };
    onChange({
      ...data,
      socials: [...data.socials, newSocial],
    });
  };

  const updateSocial = (id: string, patch: Partial<SocialLink>) => {
    onChange({
      ...data,
      socials: data.socials.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const deleteSocial = (id: string) => {
    sound.playClick();
    onChange({
      ...data,
      socials: data.socials.filter((s) => s.id !== id),
    });
  };

  // Export actions
  const handleCopyTs = async () => {
    try {
      await navigator.clipboard.writeText(exportTs);
      sound.playCopy();
      setCopiedConfig(true);
      onNotify('Конфиг portfolio.ts скопирован');
      window.setTimeout(() => setCopiedConfig(false), 1800);
    } catch {
      onNotify('Не удалось скопировать конфиг');
    }
  };

  const handleDownloadTs = () => {
    sound.playClick();
    const blob = new Blob([exportTs], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.ts';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Файл portfolio.ts сохранён');
  };

  const editingProject = data.projects.find((p) => p.id === editingProjectId) ?? null;

  return (
    <dialog
      ref={dialogRef}
      className="ui-dialog ui-drawer"
      aria-labelledby="editor-drawer-title"
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      <div className="dialog-header">
        <div className="dialog-header-meta">
          <h2 id="editor-drawer-title" className="socials-card-title">
            Редактор портфолио
          </h2>
          {isCustomized && <span className="socials-card-meta">· локальные правки</span>}
        </div>
        <button
          type="button"
          className="dialog-close-btn"
          onClick={handleClose}
          onMouseEnter={() => sound.playHover()}
          aria-label="Закрыть редактор"
          autoFocus
        >
          <X size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <div className="editor-tabs-bar">
        <SlidingTabs
          variant="editor"
          items={editorTabs}
          activeId={activeTab}
          onChange={(nextTab) => {
            setActiveTab(nextTab);
            setEditingProjectId(null);
          }}
          ariaLabel="Разделы редактора"
        />
      </div>

      <div className="dialog-scroll">
        <div
          key={`${activeTab}-${editingProjectId ?? 'list'}`}
          role="tabpanel"
          className="tab-panel-anim"
        >
          {activeTab === 'projects' && !editingProject && (
            <div className="editor-section">
              <div className="editor-item-head">
                <span className="section-sub">
                  Изменения сразу применяются на сайте и сохраняются в браузере
                </span>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={addProject}
                  onMouseEnter={() => sound.playHover()}
                >
                  <Plus size={15} strokeWidth={1.5} aria-hidden="true" />
                  <span>Добавить проект</span>
                </button>
              </div>

              {data.projects.map((p, idx) => (
                <div key={p.id} className="editor-item-card">
                  <div className="editor-item-head">
                    <div>
                      <div className="editor-item-title">
                        <span className="project-index tabular">
                          {String(idx + 1).padStart(2, '0')}
                        </span>{' '}
                        {p.title}
                      </div>
                      <div className="editor-item-sub">
                        {p.category} · <span className="tabular">{p.year}</span> · {p.role}
                      </div>
                    </div>
                    <div className="editor-item-actions">
                      <button
                        type="button"
                        className="copy-mini-btn"
                        aria-label="Переместить выше"
                        disabled={idx === 0}
                        onClick={() => moveProject(idx, -1)}
                      >
                        <ArrowUp size={15} strokeWidth={1.5} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="copy-mini-btn"
                        aria-label="Переместить ниже"
                        disabled={idx === data.projects.length - 1}
                        onClick={() => moveProject(idx, 1)}
                      >
                        <ArrowDown size={15} strokeWidth={1.5} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => {
                          sound.playClick();
                          setEditingProjectId(p.id);
                        }}
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        className="copy-mini-btn"
                        aria-label={`Удалить ${p.title}`}
                        onClick={() => deleteProject(p.id)}
                      >
                        <Trash2 size={15} strokeWidth={1.5} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'projects' && editingProject && (
            <div className="editor-section">
              <div className="editor-item-head">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    sound.playTab();
                    setEditingProjectId(null);
                  }}
                >
                  ← К списку проектов
                </button>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => deleteProject(editingProject.id)}
                >
                  <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
                  <span>Удалить</span>
                </button>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="p-title">
                  Название проекта
                </label>
                <input
                  id="p-title"
                  className="field-input"
                  value={editingProject.title}
                  onChange={(e) => updateProject(editingProject.id, { title: e.target.value })}
                />
              </div>

              <div className="field-row-2">
                <div className="field-group">
                  <label className="field-label" htmlFor="p-cat">
                    Категория
                  </label>
                  <input
                    id="p-cat"
                    className="field-input"
                    value={editingProject.category}
                    onChange={(e) =>
                      updateProject(editingProject.id, { category: e.target.value })
                    }
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="p-year">
                    Год
                  </label>
                  <input
                    id="p-year"
                    className="field-input tabular"
                    value={editingProject.year}
                    onChange={(e) => updateProject(editingProject.id, { year: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="p-role">
                  Роль
                </label>
                <input
                  id="p-role"
                  className="field-input"
                  value={editingProject.role}
                  onChange={(e) => updateProject(editingProject.id, { role: e.target.value })}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="p-summary">
                  Краткое описание (в карточке)
                </label>
                <textarea
                  id="p-summary"
                  className="field-textarea"
                  value={editingProject.summary}
                  onChange={(e) => updateProject(editingProject.id, { summary: e.target.value })}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="p-desc">
                  Подробное описание (абзацы через пустую строку)
                </label>
                <textarea
                  id="p-desc"
                  className="field-textarea"
                  style={{ minHeight: 128 }}
                  value={editingProject.description.join('\n\n')}
                  onChange={(e) =>
                    updateProject(editingProject.id, {
                      description: e.target.value
                        .split(/\n\s*\n/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="p-stack">
                  Стек (через запятую)
                </label>
                <input
                  id="p-stack"
                  className="field-input"
                  value={editingProject.stack.join(', ')}
                  onChange={(e) =>
                    updateProject(editingProject.id, {
                      stack: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="field-row-2">
                <div className="field-group">
                  <label className="field-label" htmlFor="p-live">
                    Ссылка на демо
                  </label>
                  <input
                    id="p-live"
                    className="field-input"
                    placeholder="https://..."
                    value={editingProject.liveUrl ?? ''}
                    onChange={(e) => updateProject(editingProject.id, { liveUrl: e.target.value })}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="p-repo">
                    Репозиторий
                  </label>
                  <input
                    id="p-repo"
                    className="field-input"
                    placeholder="https://github.com/..."
                    value={editingProject.repoUrl ?? ''}
                    onChange={(e) => updateProject(editingProject.id, { repoUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="p-cover">
                  URL обложки (или загрузите файл ниже)
                </label>
                <input
                  id="p-cover"
                  className="field-input"
                  placeholder="/images/cover-monolith.jpg"
                  value={editingProject.coverImage}
                  onChange={(e) =>
                    updateProject(editingProject.id, { coverImage: e.target.value })
                  }
                />
                <input
                  type="file"
                  accept="image/*"
                  className="field-input"
                  onChange={(e) => handleCoverUpload(editingProject.id, e.target.files?.[0])}
                />
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="editor-section">
              <div className="field-row-2">
                <div className="field-group">
                  <label className="field-label" htmlFor="prof-name">
                    Имя
                  </label>
                  <input
                    id="prof-name"
                    className="field-input"
                    value={data.profile.name}
                    onChange={(e) => updateProfile('name', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="prof-mono">
                    Монограмма
                  </label>
                  <input
                    id="prof-mono"
                    className="field-input"
                    maxLength={3}
                    value={data.profile.monogram}
                    onChange={(e) => updateProfile('monogram', e.target.value)}
                  />
                </div>
              </div>

              <div className="field-row-2">
                <div className="field-group">
                  <label className="field-label" htmlFor="prof-email">
                    Основная почта
                  </label>
                  <input
                    id="prof-email"
                    className="field-input"
                    value={data.profile.email}
                    onChange={(e) => updateProfile('email', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="prof-loc">
                    Локация / часовой пояс
                  </label>
                  <input
                    id="prof-loc"
                    className="field-input"
                    value={data.profile.location}
                    onChange={(e) => updateProfile('location', e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="prof-status">
                  Статус доступности
                </label>
                <input
                  id="prof-status"
                  className="field-input"
                  value={data.profile.availability}
                  onChange={(e) => updateProfile('availability', e.target.value)}
                />
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={data.profile.isAvailable}
                    onChange={(e) => updateProfile('isAvailable', e.target.checked)}
                  />
                  Подсветить статус активной точкой
                </label>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="prof-h1">
                  Заголовок (начало)
                </label>
                <input
                  id="prof-h1"
                  className="field-input"
                  value={data.profile.headlineStart}
                  onChange={(e) => updateProfile('headlineStart', e.target.value)}
                />
              </div>

              <div className="field-row-2">
                <div className="field-group">
                  <label className="field-label" htmlFor="prof-h2">
                    Акцентное слово (italic)
                  </label>
                  <input
                    id="prof-h2"
                    className="field-input"
                    value={data.profile.headlineItalic}
                    onChange={(e) => updateProfile('headlineItalic', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="prof-h3">
                    Заголовок (продолжение)
                  </label>
                  <input
                    id="prof-h3"
                    className="field-input"
                    value={data.profile.headlineEnd}
                    onChange={(e) => updateProfile('headlineEnd', e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="prof-sub">
                  Подзаголовок
                </label>
                <textarea
                  id="prof-sub"
                  className="field-textarea"
                  value={data.profile.subhead}
                  onChange={(e) => updateProfile('subhead', e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'socials' && (
            <div className="editor-section">
              <div className="editor-item-head">
                <span className="section-sub">Ссылки и значения для копирования в один клик</span>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={addSocial}
                  onMouseEnter={() => sound.playHover()}
                >
                  <Plus size={15} strokeWidth={1.5} aria-hidden="true" />
                  <span>Добавить</span>
                </button>
              </div>

              {data.socials.map((s) => (
                <div key={s.id} className="editor-item-card">
                  <div className="field-row-2">
                    <div className="field-group">
                      <label className="field-label">Название</label>
                      <input
                        className="field-input"
                        value={s.label}
                        onChange={(e) => updateSocial(s.id, { label: e.target.value })}
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Иконка</label>
                      <select
                        className="field-select"
                        value={s.icon}
                        onChange={(e) =>
                          updateSocial(s.id, { icon: e.target.value as SocialIconName })
                        }
                      >
                        {SOCIAL_ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="field-row-2">
                    <div className="field-group">
                      <label className="field-label">Подпись / ник</label>
                      <input
                        className="field-input"
                        value={s.handle}
                        onChange={(e) => updateSocial(s.id, { handle: e.target.value })}
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Что копировать</label>
                      <input
                        className="field-input"
                        value={s.copyValue}
                        onChange={(e) => updateSocial(s.id, { copyValue: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="editor-item-head">
                    <input
                      className="field-input"
                      aria-label="URL ссылки"
                      placeholder="https://..."
                      value={s.url}
                      onChange={(e) => updateSocial(s.id, { url: e.target.value })}
                    />
                    <button
                      type="button"
                      className="copy-mini-btn"
                      aria-label={`Удалить ${s.label}`}
                      onClick={() => deleteSocial(s.id)}
                    >
                      <Trash2 size={15} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="editor-section">
              <p className="project-summary">
                Все правки сохраняются локально в браузере. Чтобы закрепить их в исходниках сайта,
                скопируйте или скачайте этот файл и замените им <code>src/data/portfolio.ts</code>.
              </p>
              <div className="modal-links-row">
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={handleCopyTs}
                  onMouseEnter={() => sound.playHover()}
                >
                  <AnimatedCopyIcon copied={copiedConfig} size={15} />
                  <span key={copiedConfig ? 'c' : 'i'} className="micro-swap-text">
                    {copiedConfig ? 'Скопировано' : 'Копировать portfolio.ts'}
                  </span>
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={handleDownloadTs}
                  onMouseEnter={() => sound.playHover()}
                >
                  <Download size={15} strokeWidth={1.5} aria-hidden="true" />
                  <span>Скачать portfolio.ts</span>
                </button>
              </div>
              <pre className="export-code">{exportTs}</pre>
            </div>
          )}
        </div>
      </div>

      <div className="dialog-footer">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => {
            sound.playClick();
            onReset();
            setEditingProjectId(null);
            onNotify('Восстановлены данные из portfolio.ts');
          }}
        >
          <RotateCcw size={14} strokeWidth={1.5} aria-hidden="true" />
          <span>Сбросить к исходным</span>
        </button>
        <button type="button" className="btn btn--secondary btn--sm" onClick={handleClose}>
          Готово
        </button>
      </div>
    </dialog>
  );
}
