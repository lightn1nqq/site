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
      handle: 'github.com/lightn1nqq',
      url: 'https://github.com/lightn1nqq',
      copyValue: 'https://github.com/lightn1nqq',
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
        'Десктоп-студия алгоритмического анализа изображений, перцептивной квантизации цвета в пространстве Oklab и точного растрово-векторного переноса штрихов (1:1) на графические холсты Windows в эстетике Liquid Glass.',
      description: [
        'Aether объединяет детерминированный движок обработки изображений и векторного планирования с двумя самостоятельными версиями интерфейса для Windows 10/11. Основная редакция Slate Gray (Aether.exe) построена на матовом титаново-сером жидком стекле с DWM Acrylic, переключением плотности «Живое / Матовое» и магнитной шторкой сравнения. Версия Aether Obsidian (Aether_Obsidian.exe) переводит тот же инструмент в строгий обсидианово-графитовый Liquid Glass с тёплым платиновым акцентом, типографикой Instrument Serif и оптическим проявлением текста из расфокуса.',
        'Вычислительное ядро разбирает исходное изображение в перцептивном пространстве Oklab (Median Cut + K-Means), извлекая от 2 до 128 чистых RGB-оттенков либо сопоставляя их с компактной 18-цветной студийной палитрой. В режиме максимальной точности 1:1 движок строит карту штрихов с шагом от 1 px без потери мелких деталей и сглаживания контуров.',
        'Планировщик траекторий и анализатор толщины автоматически подбирают диаметр кисти (1–5) и плотность сетки под заданный бюджет штрихов, объединяют пиксели в непрерывные полилинии и заливки, выносят контуры на финальный проход («От руки») и воспроизводят геометрию на выбранном холсте через низкоуровневый Win32 SendInput с мгновенной защитой Failsafe при движении мыши.',
        'Для повседневной работы в студии реализован процедурный генератор UI-звуков 44.1 kHz PCM прямо в памяти (без внешних аудиофайлов) с тумблером Mute / Unmute, мгновенная загрузка референсов через Ctrl+V, Drag & Drop или URL, 4 режима инспекции (интерактивная шторка сравнения, кликабельные свотчи палитры с копированием HEX, просмотр рядом и оригинал) и переносимые JSON-профили калибровки холста.',
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
        'Интерактивное превью десктоп-студии Aether в редакциях Slate Gray и Aether Obsidian',
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
            'SF Pro Display + JetBrains Mono, переключатель плотности «Живое / Матовое» и магнитная шторка сравнения по центру.',
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
        { keys: 'F6', action: 'Старт / Пауза переноса штрихов' },
        { keys: 'F5', action: 'Пропустить текущий цветовой слой' },
        { keys: 'Esc', action: 'Экстренная остановка (+ Failsafe мыши)' },
        { keys: 'Ctrl + V', action: 'Вставить референс из буфера обмена' },
        { keys: 'F1', action: 'Памятка клавиш и режима точности 1:1' },
      ],
      repoUrl: 'https://github.com/lightn1nqq/Aether-Bot',
      featured: true,
    },
  ],
};
