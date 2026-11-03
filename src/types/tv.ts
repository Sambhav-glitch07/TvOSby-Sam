export type LauncherTab = 'home' | 'movies' | 'shows' | 'apps' | 'settings';

export interface MediaItem {
  id: string;
  title: string;
  subtitle: string;
  synopsis: string;
  categoryBadge: string;
  technicalBadges: string;
  rating: string;
  duration: string;
  year: number;
  backdropUrl: string;
  posterUrl: string;
  dominantColor: string;
  streamUri?: string;
  targetPackage?: string;
  isOriginal?: boolean;
}

export interface AppItem {
  packageName: string;
  activityName: string;
  label: string;
  iconType: string;
  iconBg: string;
  category: 'streaming' | 'entertainment' | 'gaming' | 'system' | 'utilities';
  isLeanbackCompatible: boolean;
  version?: string;
}

export interface TvHardwareInput {
  id: string;
  title: string;
  subtitle: string;
  isConnected: boolean;
  type: 'hdmi' | 'av' | 'antenna';
}

export type FocusTarget =
  | { type: 'tab'; tab: LauncherTab }
  | { type: 'heroAction'; action: 'play' | 'trailer' | 'watchlist' }
  | { type: 'recentApp'; index: number }
  | { type: 'featuredMedia'; index: number }
  | { type: 'installedApp'; index: number }
  | { type: 'originalShow'; index: number }
  | { type: 'hardwareInput'; index: number };
