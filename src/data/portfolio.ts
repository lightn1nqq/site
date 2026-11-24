export type SocialIconName =
  | 'github'
  | 'telegram'
  | 'twitter'
  | 'discord'
  | 'linkedin'
  | 'mail'
  | 'globe'
  | 'dribbble'
  | 'youtube';

export interface SocialLink {
  id: string;
  label: string;
  handle: string;
  url: string;
  copyValue: string;
  icon: SocialIconName;
}

export type ProjectPreviewKind =
  | 'aether'
  | 'monolith'
  | 'kadro'
  | 'vektor'
  | 'sreda'
  | 'custom';

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectEdition {
  name: string;
  binary: string;
  character: string;
  details: string;
}

export interface ProjectHotkey {
  keys: string;
  action: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline?: string;
  category: string;
  year: string;
  role: string;
  summary: string;
  description: string[];
  stack: string[];
  coverImage: string;
  coverAlt: string;
  previewKind?: ProjectPreviewKind;
  galleryImages?: string[];
  metrics: ProjectMetric[];
  editions?: ProjectEdition[];
  hotkeys?: ProjectHotkey[];
  liveUrl?: string;
  repoUrl?: string;
  featured?: boolean;
}

export interface ProfileConfig {
  name: string;
  monogram: string;
  role: string;
  location: string;
  availability: string;
  isAvailable: boolean;
  headlineStart: string;
  headlineItalic: string;
  headlineEnd: string;
  subhead: string;
  email: string;
  closingQuote: string;
  closingQuoteItalic: string;
}

export interface PortfolioData {
  profile: ProfileConfig;
  socials: SocialLink[];
  projects: ProjectItem[];
}

/**
 * Единый файл конфигурации портфолио lightn1ng.
 * Меняйте профиль, соцсети и проекты прямо здесь или через панель «Редактор».
 */
export const PORTFOLIO_DATA: PortfolioData = {
  profile: {
    name: 'lightn1ng',
    monogram: 'L1',
    role: 'Инженер интерфейсов и десктоп-приложений',
    location: 'UTC+3',
    availability: 'Открыт к выборочным проектам',
    isAvailable: true,
    headlineStart: 'Создаю десктоп-инструменты и ',
    headlineItalic: 'точные',
    headlineEnd: ' интерфейсы',
    subhead:
      'Проектирую быстрые нативные приложения для Windows и веб-интерфейсы в эстетике Liquid Glass. Внимание к алгоритмам, типографике, плавности отклика и деталям без визуального шума.',
    email: 'lightnng32@gmail.com',
    closingQuote: 'Хороший инструмент не требует внимания к себе — он оставляет пространство для ',
    closingQuoteItalic: 'вашей работы',
  },
  socials: [
    {
      id: 'github',
      label: 'GitHub',
      handle: 'github.com/lightnng32-ui',
      url: 'https://github.com/lightnng32-ui',
      copyValue: 'https://github.com/lightnng32-ui',
      icon: 'github',
    },
    {
      id: 'telegram',
      label: 'Telegram',
      handle: '@lightn1nqq',
      url: 'https://t.me/lightn1nqq',
      copyValue: '@lightn1nqq',
      icon: 'telegram',
    },
    {
      id: 'twitter',
      label: 'X (Twitter)',
      handle: '@lightning38645',
      url: 'https://x.com/lightning38645',
      copyValue: 'https://x.com/lightning38645',
      icon: 'twitter',
    },
    {
      id: 'discord',
      label: 'Discord',
      handle: 'travelerwillpw',
      url: '',
      copyValue: 'travelerwillpw',
      icon: 'discord',
    },
    {
      id: 'email',
      label: 'Почта',
      handle: 'lightnng32@gmail.com',
      url: 'mailto:lightnng32@gmail.com',
      copyValue: 'lightnng32@gmail.com',
      icon: 'mail',
    },
  ],
  projects: [
    {
      id: 'aether',
      title: 'Aether',
      tagline: 'Rise above the rest · Slate Gray & Obsidian Editions',
      category: 'Windows · .NET 8 / WPF',
      year: '2026',
      role: 'Автор, архитектура и дизайн',
      summary:
        'Студия точного автоматического рисования для Gartic Phone на .NET 8 / WPF в эстетике Liquid Glass — две самостоятельные редакции интерфейса (Slate Gray и Aether Obsidian) на едином движке Oklab-квантизации и Win32-планировщика штрихов.',
      description: [
        'Aether построен вокруг единого вычислительного ядра (GarticBot.Core и GarticBot.Input) и выпускается сразу в двух самостоятельных версиях интерфейса для Windows 10/11. Основная версия Slate Gray (Aether.exe) оформлена в матовом титаново-сером жидком стекле с DWM Acrylic, переключением плотности «Живое / Матовое» и магнитной шторкой сравнения. Альтернативная редакция Aether Obsidian (Aether_Obsidian.exe) переводит тот же функционал в строгий обсидианово-графитовый Liquid Glass с тёплым платиновым акцентом, заголовками Instrument Serif / Cormorant Garamond и плавным проявлением текста из расфокуса.',
        'В ядре обработки изображений реализован режим максимальной точности 1:1 с шагом сетки от 1 px без упрощения линий и слияния оттенков, а также два режима палитры: классическая сетка Gartic 18 с разовой калибровкой в 2 клика и RGB-пипетка от 2 до 128 цветов с перцептивной квантизацией в пространстве Oklab (Median Cut + K-Means) и переходом Tab между каналами R/G/B.',
        'Движок планирования штрихов (DrawingPlanner и ImageThicknessAnalyzer) автоматически подбирает толщину карандаша 1–5 и шаг сетки под лимит пакетов альбома Gartic Phone, поддерживает непрерывные полилинии, заливки, режим «От руки» с вынесением контуров в финал и низкоуровневый ввод Win32 SendInput. За безопасность сессии отвечают глобальные хоткеи и мгновенная остановка при резком уводе мыши (Failsafe).',
        'Поверх вычислительной части добавлены тактильные детали: процедурный генератор UI-звуков 44.1 kHz PCM прямо в памяти (без внешних файлов) с тумблером Mute / Unmute, загрузка изображений через Ctrl+V, Drag & Drop, файл или URL, 4 режима просмотра (интерактивная шторка сравнения, свотчи палитры с копированием HEX, рядом и оригинал), а также импорт и экспорт профилей калибровки в JSON.',
      ],
      stack: [
        '.NET 8',
        'C# 12',
        'WPF',
        'Win32 SendInput',
        'DWM Acrylic',
        'Oklab Quantizer',
        '44.1 kHz PCM Audio',
      ],
      coverImage: '',
      coverAlt:
        'Интерактивное превью студии Aether в двух редакциях — Slate Gray и Aether Obsidian',
      previewKind: 'aether',
      metrics: [
        { label: 'Редакции интерфейса', value: '2 версии' },
        { label: 'RGB-квантизация Oklab', value: '2–128 цв.' },
        { label: 'Точность режима 1:1', value: 'от 1 px' },
      ],
      editions: [
        {
          name: 'Aether — Slate Gray',
          binary: 'Aether.exe',
          character: 'Титаново-серое жидкое стекло · DWM Acrylic',
          details:
            'SF Pro Display + JetBrains Mono, переключатель плотности «Живое / Матовое» и магнитная шторка сравнения в центре.',
        },
        {
          name: 'Aether — Obsidian',
          binary: 'Aether_Obsidian.exe',
          character: 'Обсидиановый графит · тёплый платиновый акцент',
          details:
            'Instrument Serif + Cormorant Garamond для заголовков, SF Pro Display для интерфейса и оптическое проявление текста из расфокуса.',
        },
      ],
      hotkeys: [
        { keys: 'F6', action: 'Старт / Пауза рисования' },
        { keys: 'F5', action: 'Пропустить текущий цвет' },
        { keys: 'Esc', action: 'Экстренная остановка (+ Failsafe мыши)' },
        { keys: 'Ctrl + V', action: 'Вставить картинку из буфера' },
        { keys: 'F1', action: 'Памятка клавиш и режима 1:1' },
      ],
      repoUrl: 'https://github.com/lightnng32-ui',
      featured: true,
    },
  ],
};
