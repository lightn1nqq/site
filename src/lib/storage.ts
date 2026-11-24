import { PORTFOLIO_DATA, type PortfolioData } from '../data/portfolio';

const DATA_STORAGE_KEY = 'portfolio_custom_data_v5';

export function loadPortfolioData(): PortfolioData {
  if (typeof window === 'undefined') return PORTFOLIO_DATA;
  try {
    const raw = window.localStorage.getItem(DATA_STORAGE_KEY);
    if (!raw) return PORTFOLIO_DATA;
    const parsed = JSON.parse(raw) as Partial<PortfolioData>;
    if (!parsed || !parsed.profile || !Array.isArray(parsed.projects) || !Array.isArray(parsed.socials)) {
      return PORTFOLIO_DATA;
    }
    return {
      profile: { ...PORTFOLIO_DATA.profile, ...parsed.profile },
      socials: parsed.socials,
      projects: parsed.projects,
    };
  } catch {
    return PORTFOLIO_DATA;
  }
}

export function savePortfolioData(data: PortfolioData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota errors
  }
}

export function clearPortfolioData(): PortfolioData {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(DATA_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
  return PORTFOLIO_DATA;
}

export function hasCustomPortfolioData(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(DATA_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Generates a clean, drop-in TypeScript source file matching `src/data/portfolio.ts`
 * so the user can permanently commit their visual edits in seconds.
 */
export function generatePortfolioConfigTs(data: PortfolioData): string {
  const json = JSON.stringify(data, null, 2);
  return `export type SocialIconName =
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

export const PORTFOLIO_DATA: PortfolioData = ${json};
`;
}
