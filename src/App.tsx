import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Tv,
  Film,
  TvMinimal,
  Grid,
  Settings,
  Play,
  Bookmark,
  Check,
  Wifi,
  Sliders,
  Code2,
  FolderDown,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import {
  LauncherTab,
  MediaItem,
  AppItem,
  TvHardwareInput,
  FocusTarget
} from './types/tv';
import {
  FEATURED_MEDIA,
  ORIGINAL_SHOWS,
  INSTALLED_APPS,
  TV_INPUTS
} from './data/mockData';
import { MAIN_ACTIVITY_KOTLIN_CODE } from './data/mainActivitySource';
import { TvRemote } from './components/TvRemote';
import { ProjectInspector } from './components/ProjectInspector';
import { TvSettingsModal } from './components/TvSettingsModal';
import { AppLaunchOverlay } from './components/AppLaunchOverlay';

export default function App() {
  // Navigation & State
  const [activeTab, setActiveTab] = useState<LauncherTab>('home');
  const [focusTarget, setFocusTarget] = useState<FocusTarget>({
    type: 'heroAction',
    action: 'play'
  });
  const [currentHeroMedia, setCurrentHeroMedia] = useState<MediaItem>(FEATURED_MEDIA[0]);
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sambhav_watchlist');
      return saved ? JSON.parse(saved) : ['feat_interstellar'];
    } catch {
      return ['feat_interstellar'];
    }
  });

  // Recent apps state
  const [recentApps, setRecentApps] = useState<AppItem[]>([
    INSTALLED_APPS[0], // Netflix
    INSTALLED_APPS[1], // YouTube TV
    INSTALLED_APPS[2], // Prime Video
    INSTALLED_APPS[3], // Disney+
    INSTALLED_APPS[5]  // Plex
  ]);

  // Modal / Overlays
  const [isRemoteOpen, setIsRemoteOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProjectInspectorOpen, setIsProjectInspectorOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [launchedApp, setLaunchedApp] = useState<AppItem | null>(null);
  const [launchedMedia, setLaunchedMedia] = useState<MediaItem | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References for TV auto-scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 2800);
  }, []);

  // Update real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sambhav_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [watchlist]);

  // Handle Tab Switch
  const handleSelectTab = (tab: LauncherTab) => {
    setActiveTab(tab);
    if (tab === 'settings') {
      setIsSettingsOpen(true);
    } else if (tab === 'apps') {
      setFocusTarget({ type: 'installedApp', index: 0 });
    } else if (tab === 'movies') {
      setCurrentHeroMedia(FEATURED_MEDIA[0]);
      setFocusTarget({ type: 'featuredMedia', index: 0 });
    } else if (tab === 'shows') {
      setCurrentHeroMedia(ORIGINAL_SHOWS[0]);
      setFocusTarget({ type: 'originalShow', index: 0 });
    } else {
      setFocusTarget({ type: 'heroAction', action: 'play' });
    }
  };

  // Launch App
  const handleLaunchApp = (app: AppItem) => {
    showToast(`Launching ${app.label} (com.android.intent)`);
    // update recents
    setRecentApps((prev) => {
      const filtered = prev.filter((a) => a.packageName !== app.packageName);
      return [app, ...filtered].slice(0, 8);
    });
    setLaunchedApp(app);
  };

  // Launch Media Playback
  const handleLaunchMedia = (media: MediaItem) => {
    showToast(`Starting 4K Stream: ${media.title}`);
    setLaunchedMedia(media);
  };

  // Toggle Watchlist
  const handleToggleWatchlist = (media: MediaItem) => {
    setWatchlist((prev) => {
      const exists = prev.includes(media.id);
      if (exists) {
        showToast(`Removed "${media.title}" from Watchlist`);
        return prev.filter((id) => id !== media.id);
      } else {
        showToast(`Added "${media.title}" to Watchlist`);
        return [...prev, media.id];
      }
    });
  };

  // =========================================================================
  // Directional Navigation Engine (D-pad & Keyboard)
  // =========================================================================

  const handleDpadMove = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      // If modal or app overlay is open, do not handle background dpad
      if (launchedApp || launchedMedia || isSettingsOpen || isProjectInspectorOpen) {
        return;
      }

      setFocusTarget((curr): FocusTarget => {
        switch (curr.type) {
          case 'tab': {
            const tabs: LauncherTab[] = ['home', 'movies', 'shows', 'apps', 'settings'];
            const curIdx = tabs.indexOf(curr.tab);

            if (direction === 'left' && curIdx > 0) {
              const nextTab = tabs[curIdx - 1];
              setActiveTab(nextTab);
              return { type: 'tab', tab: nextTab };
            }
            if (direction === 'right' && curIdx < tabs.length - 1) {
              const nextTab = tabs[curIdx + 1];
              setActiveTab(nextTab);
              return { type: 'tab', tab: nextTab };
            }
            if (direction === 'down') {
              if (activeTab === 'apps') {
                return { type: 'installedApp', index: 0 };
              }
              return { type: 'heroAction', action: 'play' };
            }
            return curr;
          }

          case 'heroAction': {
            if (direction === 'up') {
              return { type: 'tab', tab: activeTab };
            }
            if (direction === 'left') {
              if (curr.action === 'watchlist') return { type: 'heroAction', action: 'trailer' };
              if (curr.action === 'trailer') return { type: 'heroAction', action: 'play' };
              return curr;
            }
            if (direction === 'right') {
              if (curr.action === 'play') return { type: 'heroAction', action: 'trailer' };
              if (curr.action === 'trailer') return { type: 'heroAction', action: 'watchlist' };
              return curr;
            }
            if (direction === 'down') {
              // Move to Recent Apps or Featured Media
              if (recentApps.length > 0 && activeTab === 'home') {
                return { type: 'recentApp', index: 0 };
              }
              return { type: 'featuredMedia', index: 0 };
            }
            return curr;
          }

          case 'recentApp': {
            if (direction === 'up') {
              return { type: 'heroAction', action: 'play' };
            }
            if (direction === 'left' && curr.index > 0) {
              return { type: 'recentApp', index: curr.index - 1 };
            }
            if (direction === 'right' && curr.index < recentApps.length - 1) {
              return { type: 'recentApp', index: curr.index + 1 };
            }
            if (direction === 'down') {
              return { type: 'featuredMedia', index: 0 };
            }
            return curr;
          }

          case 'featuredMedia': {
            if (direction === 'up') {
              if (activeTab === 'home' && recentApps.length > 0) {
                return { type: 'recentApp', index: 0 };
              }
              return { type: 'heroAction', action: 'play' };
            }
            if (direction === 'left' && curr.index > 0) {
              const nextIdx = curr.index - 1;
              setCurrentHeroMedia(FEATURED_MEDIA[nextIdx]);
              return { type: 'featuredMedia', index: nextIdx };
            }
            if (direction === 'right' && curr.index < FEATURED_MEDIA.length - 1) {
              const nextIdx = curr.index + 1;
              setCurrentHeroMedia(FEATURED_MEDIA[nextIdx]);
              return { type: 'featuredMedia', index: nextIdx };
            }
            if (direction === 'down') {
              return { type: 'installedApp', index: 0 };
            }
            return curr;
          }

          case 'installedApp': {
            if (direction === 'up') {
              if (activeTab === 'apps') {
                return { type: 'tab', tab: 'apps' };
              }
              return { type: 'featuredMedia', index: 0 };
            }
            if (direction === 'left' && curr.index > 0) {
              return { type: 'installedApp', index: curr.index - 1 };
            }
            if (direction === 'right' && curr.index < INSTALLED_APPS.length - 1) {
              return { type: 'installedApp', index: curr.index + 1 };
            }
            if (direction === 'down') {
              if (activeTab === 'apps') {
                return { type: 'hardwareInput', index: 0 };
              }
              return { type: 'originalShow', index: 0 };
            }
            return curr;
          }

          case 'originalShow': {
            if (direction === 'up') {
              return { type: 'installedApp', index: 0 };
            }
            if (direction === 'left' && curr.index > 0) {
              const nextIdx = curr.index - 1;
              setCurrentHeroMedia(ORIGINAL_SHOWS[nextIdx]);
              return { type: 'originalShow', index: nextIdx };
            }
            if (direction === 'right' && curr.index < ORIGINAL_SHOWS.length - 1) {
              const nextIdx = curr.index + 1;
              setCurrentHeroMedia(ORIGINAL_SHOWS[nextIdx]);
              return { type: 'originalShow', index: nextIdx };
            }
            if (direction === 'down') {
              return { type: 'hardwareInput', index: 0 };
            }
            return curr;
          }

          case 'hardwareInput': {
            if (direction === 'up') {
              if (activeTab === 'apps') {
                return { type: 'installedApp', index: 0 };
              }
              return { type: 'originalShow', index: 0 };
            }
            if (direction === 'left' && curr.index > 0) {
              return { type: 'hardwareInput', index: curr.index - 1 };
            }
            if (direction === 'right' && curr.index < TV_INPUTS.length - 1) {
              return { type: 'hardwareInput', index: curr.index + 1 };
            }
            return curr;
          }

          default:
            return curr;
        }
      });
    },
    [activeTab, recentApps.length, launchedApp, launchedMedia, isSettingsOpen, isProjectInspectorOpen]
  );

  // Handle Enter / OK selection
  const handleSelect = useCallback(() => {
    if (launchedApp || launchedMedia) {
      return;
    }
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
      return;
    }

    switch (focusTarget.type) {
      case 'tab':
        handleSelectTab(focusTarget.tab);
        break;
      case 'heroAction':
        if (focusTarget.action === 'play') {
          handleLaunchMedia(currentHeroMedia);
        } else if (focusTarget.action === 'trailer') {
          showToast(`Playing Preview Trailer: ${currentHeroMedia.title}`);
        } else if (focusTarget.action === 'watchlist') {
          handleToggleWatchlist(currentHeroMedia);
        }
        break;
      case 'recentApp':
        handleLaunchApp(recentApps[focusTarget.index]);
        break;
      case 'featuredMedia':
        handleLaunchMedia(FEATURED_MEDIA[focusTarget.index]);
        break;
      case 'installedApp':
        handleLaunchApp(INSTALLED_APPS[focusTarget.index]);
        break;
      case 'originalShow':
        handleLaunchMedia(ORIGINAL_SHOWS[focusTarget.index]);
        break;
      case 'hardwareInput': {
        const input = TV_INPUTS[focusTarget.index];
        showToast(`Switching TV Input to ${input.title}`);
        break;
      }
    }
  }, [focusTarget, currentHeroMedia, recentApps, launchedApp, launchedMedia, isSettingsOpen, showToast]);

  // Handle Back Button
  const handleBack = useCallback(() => {
    if (launchedApp) {
      setLaunchedApp(null);
      return;
    }
    if (launchedMedia) {
      setLaunchedMedia(null);
      return;
    }
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
      return;
    }
    if (isProjectInspectorOpen) {
      setIsProjectInspectorOpen(false);
      return;
    }

    // Standard Android TV launcher behavior: return focus to top tab bar
    setFocusTarget({ type: 'tab', tab: activeTab });
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [launchedApp, launchedMedia, isSettingsOpen, isProjectInspectorOpen, activeTab]);

  // Listen to physical keyboard arrow keys & remote keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleDpadMove('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleDpadMove('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleDpadMove('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleDpadMove('right');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleSelect();
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          handleBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDpadMove, handleSelect, handleBack]);

  // Auto-scroll screen vertically to keep focused row comfortably visible
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    if (focusTarget.type === 'tab' || focusTarget.type === 'heroAction') {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (focusTarget.type === 'recentApp') {
      scrollContainerRef.current.scrollTo({ top: 120, behavior: 'smooth' });
    } else if (focusTarget.type === 'featuredMedia') {
      scrollContainerRef.current.scrollTo({ top: 280, behavior: 'smooth' });
    } else if (focusTarget.type === 'installedApp') {
      scrollContainerRef.current.scrollTo({ top: 520, behavior: 'smooth' });
    } else if (focusTarget.type === 'originalShow') {
      scrollContainerRef.current.scrollTo({ top: 760, behavior: 'smooth' });
    } else if (focusTarget.type === 'hardwareInput') {
      scrollContainerRef.current.scrollTo({ top: 1040, behavior: 'smooth' });
    }
  }, [focusTarget]);

  const isInWatchlist = watchlist.includes(currentHeroMedia.id);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070a] text-zinc-100 flex flex-col font-sans select-none">
      {/* Dynamic Ambient Glow Behind Backdrop */}
      <div
        className="absolute inset-0 transition-all duration-700 pointer-events-none opacity-40 blur-3xl scale-110"
        style={{
          background: `radial-gradient(circle at 60% 25%, ${currentHeroMedia.dominantColor} 0%, transparent 65%)`
        }}
      />

      {/* Layer 1: High-Resolution Cinematic Hero Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
        style={{
          backgroundImage: `url(${currentHeroMedia.backdropUrl})`,
          filter: 'brightness(0.55) contrast(1.08)'
        }}
      />

      {/* Layer 2: Apple tvOS Scrim Gradients for Pure Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05070a] via-[#05070a]/65 to-transparent w-3/4" />

      {/* Top Universal Control Strip */}
      <div className="relative z-40 w-full px-8 py-3 flex items-center justify-between border-b border-white/10 glass-panel bg-black/40 backdrop-blur-3xl">
        {/* Brand & Platform Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg border border-white/20">
            <Tv className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-widest text-white">SAMBHAV</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-400/30">
                TV OS
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 tracking-wider">
              TCL Android 9 (API 28) • Leanback Launcher
            </p>
          </div>
        </div>

        {/* Center Mode / Project Inspector Launcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProjectInspectorOpen(true)}
            className="px-4 py-2 rounded-xl glass-panel hover:bg-white/15 text-xs font-semibold text-sky-300 hover:text-white flex items-center gap-2 border border-sky-400/30 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-sky-400" />
            <span>Android Studio Project (1,166 lines Kotlin &amp; CI)</span>
          </button>
        </div>

        {/* Clock & System Indicators */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium">Wi-Fi 5G</span>
          </div>

          <div className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-zinc-300 tracking-wider">
            DOLBY VISION • ATMOS
          </div>

          <div className="text-right pl-2 border-l border-white/10">
            <span className="text-sm font-bold text-white tracking-wide block leading-none">
              {currentTime || '10:45 PM'}
            </span>
            <span className="text-[10px] text-zinc-400 tracking-wide mt-0.5 block">
              {currentDate || 'Tue, Nov 3'}
            </span>
          </div>
        </div>
      </div>

      {/* Main TV Navigation Bar (Apple tvOS Glass Tabs) */}
      <div className="relative z-30 px-14 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(
            [
              { key: 'home', label: 'Home', icon: Tv },
              { key: 'movies', label: 'Movies', icon: Film },
              { key: 'shows', label: 'Shows', icon: TvMinimal },
              { key: 'apps', label: 'Apps', icon: Grid },
              { key: 'settings', label: 'Settings', icon: Settings }
            ] as const
          ).map((t) => {
            const isFocused = focusTarget.type === 'tab' && focusTarget.tab === t.key;
            const isActive = activeTab === t.key;
            const Icon = t.icon;

            return (
              <button
                key={t.key}
                onClick={() => handleSelectTab(t.key)}
                className={`px-5 py-2.5 rounded-full flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  isFocused
                    ? 'glass-pill-focused ring-2 ring-white/90 scale-105 shadow-2xl'
                    : isActive
                    ? 'bg-white/20 text-white border border-white/30 shadow-md'
                    : 'glass-pill text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isFocused ? 'text-zinc-950' : ''}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick HDMI input preview chip */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-4 py-2 rounded-full glass-panel text-[11px] font-medium text-zinc-300 hover:text-white flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span>HDMI 1 (eARC) Active</span>
        </button>
      </div>

      {/* TV Viewport Scrollable Area */}
      <div
        ref={scrollContainerRef}
        className="relative z-20 flex-1 overflow-y-auto no-scrollbar px-14 pt-2 pb-24 space-y-12"
      >
        {/* HERO BANNER SECTION (Shows on Home, Movies, Shows) */}
        {activeTab !== 'apps' && (
          <div className="max-w-4xl pt-4 animate-in fade-in duration-300">
            {/* Tech Badges Row */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-sky-400 tracking-widest uppercase">
                {currentHeroMedia.categoryBadge}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-500" />
              <span className="text-xs text-zinc-400 tracking-wider">
                {currentHeroMedia.technicalBadges}
              </span>
              <span className="px-2 py-0.5 rounded-md glass-panel text-[11px] font-bold text-white tracking-wide">
                {currentHeroMedia.rating}
              </span>
              <span className="text-xs text-zinc-400">{currentHeroMedia.duration}</span>
              <span className="text-xs text-zinc-400">{currentHeroMedia.year}</span>
            </div>

            {/* Hero Title */}
            <h1 className="text-5xl font-black tracking-tight text-white leading-tight uppercase drop-shadow-lg">
              {currentHeroMedia.title}
            </h1>

            {/* Hero Synopsis */}
            <p className="mt-3 text-base text-zinc-300 max-w-2xl leading-relaxed drop-shadow">
              {currentHeroMedia.synopsis}
            </p>

            {/* Glass Action Buttons */}
            <div className="mt-6 flex items-center gap-4">
              {/* Play Now Button */}
              <button
                onClick={() => handleLaunchMedia(currentHeroMedia)}
                className={`px-6 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-xl ${
                  focusTarget.type === 'heroAction' && focusTarget.action === 'play'
                    ? 'glass-pill-focused ring-2 ring-white scale-105 shadow-2xl'
                    : 'bg-white text-zinc-950 hover:bg-zinc-100 hover:scale-102'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Now</span>
              </button>

              {/* Preview Trailer Button */}
              <button
                onClick={() => showToast(`Playing Preview Trailer: ${currentHeroMedia.title}`)}
                className={`px-6 py-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  focusTarget.type === 'heroAction' && focusTarget.action === 'trailer'
                    ? 'glass-pill-focused ring-2 ring-white scale-105 shadow-2xl'
                    : 'glass-panel text-zinc-200 hover:text-white hover:bg-white/15'
                }`}
              >
                <span>Preview Trailer</span>
              </button>

              {/* Watchlist Toggle */}
              <button
                onClick={() => handleToggleWatchlist(currentHeroMedia)}
                className={`px-6 py-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  focusTarget.type === 'heroAction' && focusTarget.action === 'watchlist'
                    ? 'glass-pill-focused ring-2 ring-white scale-105 shadow-2xl'
                    : 'glass-panel text-zinc-200 hover:text-white hover:bg-white/15'
                }`}
              >
                {isInWatchlist ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>+ Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SECTION 1: Recently Opened Applications (Apple tvOS Dock Style) */}
        {recentApps.length > 0 && activeTab === 'home' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
                <span>Recent Applications</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 font-normal">
                  Fast Resume
                </span>
              </h2>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {recentApps.map((app, idx) => {
                const isFocused =
                  focusTarget.type === 'recentApp' && focusTarget.index === idx;

                return (
                  <button
                    key={app.packageName + idx}
                    onClick={() => handleLaunchApp(app)}
                    className={`relative w-40 h-28 rounded-2xl glass-panel p-3 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                      isFocused ? 'glass-card-focused' : 'hover:bg-white/10'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md border border-white/20"
                      style={{ backgroundColor: app.iconBg }}
                    >
                      {app.iconType}
                    </div>
                    <span className="mt-2 text-xs font-semibold text-zinc-200 truncate w-full text-center">
                      {app.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: Featured Cinematic Releases (16:9 Large Cards) */}
        {(activeTab === 'home' || activeTab === 'movies') && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold tracking-wide text-white">
              Featured Cinematic Releases
            </h2>

            <div className="flex gap-5 overflow-x-auto no-scrollbar py-3">
              {FEATURED_MEDIA.map((item, idx) => {
                const isFocused =
                  focusTarget.type === 'featuredMedia' && focusTarget.index === idx;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleLaunchMedia(item)}
                    onMouseEnter={() => setCurrentHeroMedia(item)}
                    className={`relative w-72 h-44 rounded-2xl overflow-hidden glass-panel text-left transition-all duration-200 cursor-pointer shrink-0 ${
                      isFocused ? 'glass-card-focused' : 'hover:scale-102 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                        {item.categoryBadge}
                      </span>
                      <h3 className="text-sm font-bold text-white truncate drop-shadow">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-zinc-300 truncate drop-shadow">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: Television Applications (Complete Catalog) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-wide text-white">
              Television Applications
            </h2>
            <span className="text-xs text-zinc-400">
              {INSTALLED_APPS.length} Installed
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {INSTALLED_APPS.map((app, idx) => {
              const isFocused =
                focusTarget.type === 'installedApp' && focusTarget.index === idx;

              return (
                <button
                  key={app.packageName}
                  onClick={() => handleLaunchApp(app)}
                  className={`relative w-36 h-28 rounded-2xl glass-panel p-3 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                    isFocused ? 'glass-card-focused' : 'hover:bg-white/10'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md border border-white/20"
                    style={{ backgroundColor: app.iconBg }}
                  >
                    {app.iconType}
                  </div>
                  <span className="mt-2 text-xs font-semibold text-zinc-200 truncate w-full text-center">
                    {app.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: Sambhav Originals & Episodic Series */}
        {(activeTab === 'home' || activeTab === 'shows') && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold tracking-wide text-white">
              Sambhav Originals &amp; 4K Series
            </h2>

            <div className="flex gap-5 overflow-x-auto no-scrollbar py-3">
              {ORIGINAL_SHOWS.map((item, idx) => {
                const isFocused =
                  focusTarget.type === 'originalShow' && focusTarget.index === idx;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleLaunchMedia(item)}
                    onMouseEnter={() => setCurrentHeroMedia(item)}
                    className={`relative w-72 h-44 rounded-2xl overflow-hidden glass-panel text-left transition-all duration-200 cursor-pointer shrink-0 ${
                      isFocused ? 'glass-card-focused' : 'hover:scale-102 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        {item.categoryBadge}
                      </span>
                      <h3 className="text-sm font-bold text-white truncate drop-shadow">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-zinc-300 truncate drop-shadow">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 5: TCL Hardware Inputs & Connected Sources */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold tracking-wide text-white">
            TCL Hardware Inputs &amp; External Sources
          </h2>

          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {TV_INPUTS.map((input, idx) => {
              const isFocused =
                focusTarget.type === 'hardwareInput' && focusTarget.index === idx;

              return (
                <button
                  key={input.id}
                  onClick={() => showToast(`Switching TV Input to ${input.title}`)}
                  className={`w-64 h-24 rounded-2xl glass-panel p-4 flex items-center gap-3 transition-all duration-200 cursor-pointer shrink-0 text-left ${
                    isFocused ? 'glass-card-focused' : 'hover:bg-white/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                    <Sliders className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-xs font-bold text-white truncate">{input.title}</h3>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">{input.subtitle}</p>
                    <span
                      className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider ${
                        input.isConnected ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {input.isConnected ? 'Active Input' : 'Standby'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive TCL TV Remote Control Floating Widget */}
      <TvRemote
        onDpad={handleDpadMove}
        onSelect={handleSelect}
        onBack={handleBack}
        onHome={() => {
          setActiveTab('home');
          setFocusTarget({ type: 'heroAction', action: 'play' });
          scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onMenu={() => setIsSettingsOpen(true)}
        onInput={() => {
          setFocusTarget({ type: 'hardwareInput', index: 0 });
          showToast('Navigated to TCL Hardware Inputs');
        }}
        isMuted={isMuted}
        onToggleMute={() => {
          setIsMuted(!isMuted);
          showToast(!isMuted ? 'TV Audio Muted' : 'TV Audio Unmuted (35%)');
        }}
        onPowerToggle={() => {
          showToast('TV Standby Simulated');
        }}
        isOpen={isRemoteOpen}
        onToggleOpen={() => setIsRemoteOpen(!isRemoteOpen)}
      />

      {/* Simulated App Launch Overlay */}
      {(launchedApp || launchedMedia) && (
        <AppLaunchOverlay
          app={launchedApp}
          media={launchedMedia}
          onExit={() => {
            setLaunchedApp(null);
            setLaunchedMedia(null);
          }}
        />
      )}

      {/* TCL TV Settings Modal */}
      {isSettingsOpen && <TvSettingsModal onClose={() => setIsSettingsOpen(false)} />}

      {/* Android Studio Project & Code Inspector */}
      {isProjectInspectorOpen && (
        <ProjectInspector
          mainActivityCode={MAIN_ACTIVITY_KOTLIN_CODE}
          onClose={() => setIsProjectInspectorOpen(false)}
        />
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full glass-panel border border-white/25 shadow-2xl backdrop-blur-2xl text-xs font-semibold tracking-wide text-white animate-in fade-in slide-in-from-bottom-4 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
