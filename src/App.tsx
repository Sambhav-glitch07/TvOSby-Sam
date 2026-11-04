import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Code2
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
import { ProjectInspector } from './components/ProjectInspector';
import { TvSettingsModal } from './components/TvSettingsModal';
import { AppLaunchOverlay } from './components/AppLaunchOverlay';

// Signature ambient lighting palettes per application for authentic TV reactive backdrop
const APP_AMBIENT_PALETTES: Record<string, { bg: string; glow: string; secondary: string; tag: string }> = {
  'com.netflix.ninja': {
    bg: '#1c0307',
    glow: 'rgba(229, 9, 20, 0.45)',
    secondary: '#3d0810',
    tag: 'ULTRA HD • DOLBY VISION'
  },
  'com.google.android.youtube.tv': {
    bg: '#1a0505',
    glow: 'rgba(255, 0, 0, 0.45)',
    secondary: '#420a0a',
    tag: '4K 60FPS • HDR'
  },
  'com.amazon.amazonvideo.livingroom': {
    bg: '#04162c',
    glow: 'rgba(0, 168, 225, 0.42)',
    secondary: '#0a325c',
    tag: 'HDR10+ • DOLBY ATMOS'
  },
  'com.disney.disneyplus': {
    bg: '#050b29',
    glow: 'rgba(17, 60, 207, 0.45)',
    secondary: '#0c1a54',
    tag: 'IMAX ENHANCED • 4K DOLBY'
  },
  'com.apple.atve.androidtv.appletv': {
    bg: '#11141c',
    glow: 'rgba(210, 220, 240, 0.35)',
    secondary: '#222838',
    tag: 'ORIGINAL CINEMA • 4K ATMOS'
  },
  'com.plexapp.android': {
    bg: '#211303',
    glow: 'rgba(229, 160, 13, 0.45)',
    secondary: '#422806',
    tag: 'DIRECT PLAY • LOSSLESS AUDIO'
  },
  'com.spotify.tv.android': {
    bg: '#031c10',
    glow: 'rgba(29, 185, 84, 0.45)',
    secondary: '#083820',
    tag: 'HIFI AUDIO • CONNECT'
  },
  'tv.twitch.android.app': {
    bg: '#150626',
    glow: 'rgba(145, 70, 255, 0.42)',
    secondary: '#2e0f52',
    tag: 'LIVE 1080P60 • CHAT'
  },
  'in.startv.hotstar': {
    bg: '#03102e',
    glow: 'rgba(0, 66, 217, 0.45)',
    secondary: '#082569',
    tag: 'LIVE SPORTS • 4K DOLBY'
  },
  'com.tcl.channel': {
    bg: '#1a0406',
    glow: 'rgba(216, 35, 42, 0.42)',
    secondary: '#3d080c',
    tag: 'TCL SMART HUB • FREE CHANNELS'
  },
  'com.sambhav.store': {
    bg: '#06173d',
    glow: 'rgba(37, 99, 235, 0.45)',
    secondary: '#0f327a',
    tag: 'VERIFIED TV APPS'
  },
  'com.android.tv.settings': {
    bg: '#0e141c',
    glow: 'rgba(100, 116, 139, 0.38)',
    secondary: '#1c2838',
    tag: 'TCL ANDROID 9 PIE • API 28'
  }
};

export default function App() {
  // Navigation & State
  const [activeTab, setActiveTab] = useState<LauncherTab>('home');
  const [focusTarget, setFocusTarget] = useState<FocusTarget>({
    type: 'heroAction',
    action: 'play'
  });
  const [currentHeroMedia, setCurrentHeroMedia] = useState<MediaItem>(FEATURED_MEDIA[0]);
  const [focusedApp, setFocusedApp] = useState<AppItem | null>(null);

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
    INSTALLED_APPS[4], // Apple TV
    INSTALLED_APPS[6]  // Spotify
  ]);

  // Modal / Overlays
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProjectInspectorOpen, setIsProjectInspectorOpen] = useState<boolean>(false);
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

  // Derive dynamic atmospheric background palette based on focused app or media
  const dynamicAtmosphere = useMemo(() => {
    if (focusedApp) {
      const palette = APP_AMBIENT_PALETTES[focusedApp.packageName] || {
        bg: '#0a1628',
        glow: 'rgba(56, 189, 248, 0.4)',
        secondary: '#162e4a',
        tag: 'ANDROID TV APP'
      };
      return {
        bg: palette.bg,
        glow: palette.glow,
        secondary: palette.secondary,
        badgeText: palette.tag,
        isApp: true
      };
    }

    return {
      bg: currentHeroMedia.dominantColor || '#05070a',
      glow: `${currentHeroMedia.dominantColor}99`,
      secondary: '#0b1626',
      badgeText: currentHeroMedia.technicalBadges,
      isApp: false
    };
  }, [focusedApp, currentHeroMedia]);

  // Handle Tab Switch
  const handleSelectTab = (tab: LauncherTab) => {
    setActiveTab(tab);
    setFocusedApp(null);
    if (tab === 'settings') {
      setIsSettingsOpen(true);
    } else if (tab === 'apps') {
      setFocusedApp(INSTALLED_APPS[0]);
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
    showToast(`Launching ${app.label}`);
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

  // Focus update helper
  const handleAppFocused = (app: AppItem, target: FocusTarget) => {
    setFocusedApp(app);
    setFocusTarget(target);
  };

  const handleMediaFocused = (media: MediaItem, target: FocusTarget) => {
    setFocusedApp(null);
    setCurrentHeroMedia(media);
    setFocusTarget(target);
  };

  // D-Pad navigation logic
  const handleDpadMove = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (launchedApp || launchedMedia || isSettingsOpen || isProjectInspectorOpen) {
        return;
      }

      setFocusTarget((curr) => {
        switch (curr.type) {
          case 'tab': {
            const tabs: LauncherTab[] = ['home', 'movies', 'shows', 'apps', 'settings'];
            const curIdx = tabs.indexOf(curr.tab);
            if (direction === 'left' && curIdx > 0) {
              const prevTab = tabs[curIdx - 1];
              handleSelectTab(prevTab);
              return { type: 'tab', tab: prevTab };
            }
            if (direction === 'right' && curIdx < tabs.length - 1) {
              const nextTab = tabs[curIdx + 1];
              handleSelectTab(nextTab);
              return { type: 'tab', tab: nextTab };
            }
            if (direction === 'down') {
              if (activeTab === 'home' || activeTab === 'movies' || activeTab === 'shows') {
                return { type: 'heroAction', action: 'play' };
              }
              if (activeTab === 'apps') {
                const targetApp = INSTALLED_APPS[0];
                setFocusedApp(targetApp);
                return { type: 'installedApp', index: 0 };
              }
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
              if (activeTab === 'home' && recentApps.length > 0) {
                const app = recentApps[0];
                setFocusedApp(app);
                return { type: 'recentApp', index: 0 };
              }
              if (activeTab === 'movies') {
                return { type: 'featuredMedia', index: 0 };
              }
              if (activeTab === 'shows') {
                return { type: 'originalShow', index: 0 };
              }
              if (activeTab === 'apps') {
                const app = INSTALLED_APPS[0];
                setFocusedApp(app);
                return { type: 'installedApp', index: 0 };
              }
              return { type: 'featuredMedia', index: 0 };
            }
            return curr;
          }

          case 'recentApp': {
            if (direction === 'up') {
              setFocusedApp(null);
              return { type: 'heroAction', action: 'play' };
            }
            if (direction === 'left' && curr.index > 0) {
              const nextIdx = curr.index - 1;
              const app = recentApps[nextIdx];
              setFocusedApp(app);
              return { type: 'recentApp', index: nextIdx };
            }
            if (direction === 'right' && curr.index < recentApps.length - 1) {
              const nextIdx = curr.index + 1;
              const app = recentApps[nextIdx];
              setFocusedApp(app);
              return { type: 'recentApp', index: nextIdx };
            }
            if (direction === 'down') {
              setFocusedApp(null);
              return { type: 'featuredMedia', index: 0 };
            }
            return curr;
          }

          case 'featuredMedia': {
            if (direction === 'up') {
              if (activeTab === 'home' && recentApps.length > 0) {
                const app = recentApps[0];
                setFocusedApp(app);
                return { type: 'recentApp', index: 0 };
              }
              return { type: 'heroAction', action: 'play' };
            }
            if (direction === 'left' && curr.index > 0) {
              const nextIdx = curr.index - 1;
              setCurrentHeroMedia(FEATURED_MEDIA[nextIdx]);
              setFocusedApp(null);
              return { type: 'featuredMedia', index: nextIdx };
            }
            if (direction === 'right' && curr.index < FEATURED_MEDIA.length - 1) {
              const nextIdx = curr.index + 1;
              setCurrentHeroMedia(FEATURED_MEDIA[nextIdx]);
              setFocusedApp(null);
              return { type: 'featuredMedia', index: nextIdx };
            }
            if (direction === 'down') {
              if (activeTab === 'home') {
                const app = INSTALLED_APPS[0];
                setFocusedApp(app);
                return { type: 'installedApp', index: 0 };
              }
              return curr;
            }
            return curr;
          }

          case 'installedApp': {
            if (direction === 'up') {
              if (activeTab === 'apps') {
                setFocusedApp(null);
                return { type: 'tab', tab: 'apps' };
              }
              setFocusedApp(null);
              return { type: 'featuredMedia', index: 0 };
            }
            if (direction === 'left' && curr.index > 0) {
              const nextIdx = curr.index - 1;
              const app = INSTALLED_APPS[nextIdx];
              setFocusedApp(app);
              return { type: 'installedApp', index: nextIdx };
            }
            if (direction === 'right' && curr.index < INSTALLED_APPS.length - 1) {
              const nextIdx = curr.index + 1;
              const app = INSTALLED_APPS[nextIdx];
              setFocusedApp(app);
              return { type: 'installedApp', index: nextIdx };
            }
            if (direction === 'down') {
              setFocusedApp(null);
              return { type: 'originalShow', index: 0 };
            }
            return curr;
          }

          case 'originalShow': {
            if (direction === 'up') {
              const app = INSTALLED_APPS[0];
              setFocusedApp(app);
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
            return curr;
          }

          default:
            return curr;
        }
      });
    },
    [activeTab, recentApps, launchedApp, launchedMedia, isSettingsOpen, isProjectInspectorOpen]
  );

  // Handle Enter / OK selection
  const handleSelect = useCallback(() => {
    if (launchedApp || launchedMedia) return;
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
      return;
    }

    switch (focusTarget.type) {
      case 'tab':
        handleSelectTab(focusTarget.tab);
        break;
      case 'heroAction':
        if (focusedApp) {
          handleLaunchApp(focusedApp);
        } else {
          if (focusTarget.action === 'play') {
            handleLaunchMedia(currentHeroMedia);
          } else if (focusTarget.action === 'trailer') {
            showToast(`Playing Preview Trailer: ${currentHeroMedia.title}`);
          } else if (focusTarget.action === 'watchlist') {
            handleToggleWatchlist(currentHeroMedia);
          }
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
    }
  }, [
    focusTarget,
    focusedApp,
    currentHeroMedia,
    recentApps,
    launchedApp,
    launchedMedia,
    isSettingsOpen
  ]);

  // Handle TV Back button
  const handleBack = useCallback(() => {
    if (launchedApp || launchedMedia) {
      setLaunchedApp(null);
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

    setFocusedApp(null);
    if (focusTarget.type !== 'tab') {
      setFocusTarget({ type: 'tab', tab: activeTab });
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeTab !== 'home') {
      handleSelectTab('home');
    }
  }, [launchedApp, launchedMedia, isSettingsOpen, isProjectInspectorOpen, focusTarget, activeTab]);

  // Global Remote & Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Auto-scroll screen vertically to keep focused section visible
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    if (focusTarget.type === 'tab' || focusTarget.type === 'heroAction') {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (focusTarget.type === 'recentApp') {
      scrollContainerRef.current.scrollTo({ top: 80, behavior: 'smooth' });
    } else if (focusTarget.type === 'featuredMedia') {
      scrollContainerRef.current.scrollTo({ top: 220, behavior: 'smooth' });
    } else if (focusTarget.type === 'installedApp') {
      scrollContainerRef.current.scrollTo({ top: 440, behavior: 'smooth' });
    } else if (focusTarget.type === 'originalShow') {
      scrollContainerRef.current.scrollTo({ top: 680, behavior: 'smooth' });
    }
  }, [focusTarget]);

  const isInWatchlist = watchlist.includes(currentHeroMedia.id);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#030407] text-zinc-100 flex flex-col font-sans select-none"
      style={{ '--ambient-glow': dynamicAtmosphere.glow } as React.CSSProperties}
    >
      {/* =========================================================================
          LIQUID CRYSTAL MOVING EFFECTS & REACTIVE APP BACKGROUND ENGINE
          ========================================================================= */}
      
      {/* Ambient Moving Liquid Crystal Node A */}
      <div
        className="absolute -top-32 -right-32 w-[900px] h-[900px] rounded-full pointer-events-none opacity-45 blur-[140px] animate-liquid-a transition-colors duration-1000 ease-out"
        style={{ backgroundColor: dynamicAtmosphere.glow }}
      />

      {/* Ambient Moving Liquid Crystal Node B */}
      <div
        className="absolute -bottom-32 -left-32 w-[800px] h-[800px] rounded-full pointer-events-none opacity-35 blur-[130px] animate-liquid-b transition-colors duration-1000 ease-out"
        style={{ backgroundColor: dynamicAtmosphere.secondary }}
      />

      {/* Liquid Crystal Caustics & Prismatic Refraction Waves */}
      <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen animate-crystal-caustics">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="liquidCaustic" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="70%" stopColor="#818cf8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#liquidCaustic)" />
        </svg>
      </div>

      {/* Media Backdrop (Fades subtly when focused on an app) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out pointer-events-none"
        style={{
          backgroundImage: `url(${currentHeroMedia.backdropUrl})`,
          filter: focusedApp ? 'brightness(0.18) saturate(0.8)' : 'brightness(0.48) contrast(1.1)',
          opacity: focusedApp ? 0.35 : 0.85
        }}
      />

      {/* Deep Scrim Vignettes for Cinematic Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030407] via-[#030407]/75 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030407] via-[#030407]/65 to-transparent w-2/3 pointer-events-none" />

      {/* =========================================================================
          TOP GLASS STATUS & NAVIGATION STRIP
          ========================================================================= */}
      <header className="relative z-40 w-full px-12 py-3 flex items-center justify-between border-b border-white/10 glass-panel">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl glass-crystal flex items-center justify-center border border-white/30 shadow-lg">
            <Tv className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-widest text-white">SAMBHAV</span>
              <span className="text-[10px] font-semibold tracking-wider text-sky-300">TV OS</span>
            </div>
            <p className="text-[10px] text-zinc-400 tracking-wide">
              TCL Android 9 (API 28) • Liquid Crystal Glass
            </p>
          </div>
        </div>

        {/* Liquid Crystal Glass Navigation Tabs */}
        <nav className="flex items-center gap-2 p-1 rounded-full glass-panel border border-white/15">
          {(
            [
              { key: 'home', label: 'Home', icon: Tv },
              { key: 'movies', label: 'Cinema', icon: Film },
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
                className={`px-5 py-2 rounded-full flex items-center gap-2 text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
                  isFocused
                    ? 'glass-pill-focused ring-2 ring-white scale-105 shadow-xl'
                    : isActive
                    ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isFocused ? 'text-zinc-950' : ''}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Controls */}
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setIsProjectInspectorOpen(true)}
            className="px-3 py-1.5 rounded-xl glass-crystal text-[11px] font-medium text-sky-300 hover:text-white flex items-center gap-1.5 border border-sky-400/25 hover:border-sky-400/50 transition-all cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Project Files &amp; CI</span>
          </button>

          <div className="flex items-center gap-1.5 text-zinc-400 pl-2 border-l border-white/10">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium">Wi-Fi 5G</span>
          </div>

          <div className="text-right pl-3 border-l border-white/10">
            <span className="text-sm font-bold text-white tracking-wide block leading-none">
              {currentTime || '10:45 PM'}
            </span>
            <span className="text-[10px] text-zinc-400 tracking-wide mt-0.5 block">
              {currentDate || 'Tue, Nov 3'}
            </span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          SPACIOUS, UNCLUTTERED TV VIEWPORT (Full Liquid Crystal Experience)
          ========================================================================= */}
      <main
        ref={scrollContainerRef}
        className="relative z-20 flex-1 overflow-y-auto no-scrollbar px-14 pt-6 pb-28 space-y-12"
      >
        {/* HERO / FOCUSED ITEM STAGE */}
        <section className="max-w-4xl pt-2 transition-all duration-500 ease-out">
          {focusedApp ? (
            /* APP SPOTLIGHT STAGE (Active when user navigates apps) */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
                <span className="text-sky-400 font-bold uppercase tracking-wider">
                  {focusedApp.category} APPLICATION
                </span>
                <span aria-hidden="true">·</span>
                <span>Version {focusedApp.version || '1.0.0'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-semibold">TCL 4K Certified</span>
              </div>

              <div className="flex items-center gap-5">
                <div
                  className="w-16 h-16 rounded-2xl glass-crystal flex items-center justify-center text-2xl font-black text-white shadow-2xl border border-white/30"
                  style={{ backgroundColor: focusedApp.iconBg }}
                >
                  {focusedApp.iconType}
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-white uppercase drop-shadow-lg">
                    {focusedApp.label}
                  </h1>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {focusedApp.packageName}
                  </p>
                </div>
              </div>

              <p className="text-base text-zinc-300 max-w-2xl leading-relaxed">
                Seamlessly launch {focusedApp.label} on your TCL Android TV. Immersive streaming with reactive liquid crystal background illumination and hardware D-pad integration.
              </p>

              {/* Action Buttons for App */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => handleLaunchApp(focusedApp)}
                  className={`px-7 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-2xl ${
                    focusTarget.type === 'heroAction' && focusTarget.action === 'play'
                      ? 'glass-pill-focused ring-2 ring-white scale-105'
                      : 'bg-white text-zinc-950 hover:bg-zinc-100 hover:scale-102'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Open {focusedApp.label}</span>
                </button>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-6 py-3.5 rounded-2xl glass-crystal text-xs font-semibold tracking-wider uppercase text-zinc-200 hover:text-white transition-all cursor-pointer"
                >
                  App Preferences
                </button>
              </div>
            </div>
          ) : (
            /* CINEMATIC MEDIA STAGE (Default / Focused on movie) */
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Unboxed Metadata Discipline */}
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <span className="text-sky-400 font-bold uppercase tracking-wider">
                  {currentHeroMedia.categoryBadge}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-zinc-400">{currentHeroMedia.technicalBadges}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300 font-bold">{currentHeroMedia.rating}</span>
                <span aria-hidden="true">·</span>
                <span className="text-zinc-400">{currentHeroMedia.duration}</span>
                <span aria-hidden="true">·</span>
                <span className="text-zinc-400">{currentHeroMedia.year}</span>
              </div>

              {/* Hero Title */}
              <h1 className="text-5xl font-black tracking-tight text-white leading-tight uppercase drop-shadow-xl">
                {currentHeroMedia.title}
              </h1>

              {/* Synopsis */}
              <p className="text-base text-zinc-300 max-w-2xl leading-relaxed drop-shadow">
                {currentHeroMedia.synopsis}
              </p>

              {/* Liquid Crystal Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => handleLaunchMedia(currentHeroMedia)}
                  className={`px-7 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-2xl ${
                    focusTarget.type === 'heroAction' && focusTarget.action === 'play'
                      ? 'glass-pill-focused ring-2 ring-white scale-105'
                      : 'bg-white text-zinc-950 hover:bg-zinc-100 hover:scale-102'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Stream</span>
                </button>

                <button
                  onClick={() => showToast(`Playing Cinematic Preview: ${currentHeroMedia.title}`)}
                  className={`px-6 py-3.5 rounded-2xl glass-crystal flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    focusTarget.type === 'heroAction' && focusTarget.action === 'trailer'
                      ? 'glass-pill-focused ring-2 ring-white scale-105'
                      : 'text-zinc-200 hover:text-white'
                  }`}
                >
                  <span>Preview Trailer</span>
                </button>

                <button
                  onClick={() => handleToggleWatchlist(currentHeroMedia)}
                  className={`px-6 py-3.5 rounded-2xl glass-crystal flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    focusTarget.type === 'heroAction' && focusTarget.action === 'watchlist'
                      ? 'glass-pill-focused ring-2 ring-white scale-105'
                      : 'text-zinc-200 hover:text-white'
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
        </section>

        {/* =========================================================================
            SECTION 1: LIQUID CRYSTAL APP DOCK (Spacious & Aesthetic Pedestals)
            ========================================================================= */}
        {(activeTab === 'home' || activeTab === 'apps') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Applications &amp; Streaming
                </h2>
                <span className="text-xs text-zinc-400">
                  Select any app to adapt background
                </span>
              </div>
            </div>

            <div className="flex gap-5 overflow-x-auto no-scrollbar py-3">
              {recentApps.map((app, idx) => {
                const isFocused =
                  focusTarget.type === 'recentApp' && focusTarget.index === idx;

                return (
                  <button
                    key={app.packageName + idx}
                    onClick={() => handleLaunchApp(app)}
                    onMouseEnter={() => handleAppFocused(app, { type: 'recentApp', index: idx })}
                    className={`relative w-44 h-32 rounded-3xl glass-crystal p-4 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shrink-0 text-center ${
                      isFocused ? 'glass-crystal-focused crystal-shimmer' : 'hover:scale-102 hover:border-white/30'
                    }`}
                  >
                    {/* App Icon Container */}
                    <div
                      className="w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-xl border border-white/20 transition-transform duration-300"
                      style={{ backgroundColor: app.iconBg }}
                    >
                      {app.iconType}
                    </div>
                    <span className="mt-2.5 text-xs font-semibold text-zinc-100 truncate w-full">
                      {app.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                      {app.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION 2: FEATURED CINEMA (16:9 Spacious Widescreen Glass Cards)
            ========================================================================= */}
        {(activeTab === 'home' || activeTab === 'movies') && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Featured 4K Cinema
            </h2>

            <div className="flex gap-6 overflow-x-auto no-scrollbar py-3">
              {FEATURED_MEDIA.map((item, idx) => {
                const isFocused =
                  focusTarget.type === 'featuredMedia' && focusTarget.index === idx;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleLaunchMedia(item)}
                    onMouseEnter={() => handleMediaFocused(item, { type: 'featuredMedia', index: idx })}
                    className={`relative w-80 h-48 rounded-3xl overflow-hidden glass-crystal text-left transition-all duration-300 cursor-pointer shrink-0 ${
                      isFocused ? 'glass-crystal-focused crystal-shimmer' : 'hover:scale-102 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">
                        {item.categoryBadge}
                      </span>
                      <h3 className="text-base font-bold text-white truncate drop-shadow">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-300 truncate drop-shadow mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION 3: COMPLETE APP CATALOG (Clean Grid when on Apps tab)
            ========================================================================= */}
        {activeTab === 'apps' && (
          <section className="space-y-4 pt-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              All Installed Applications ({INSTALLED_APPS.length})
            </h2>

            <div className="grid grid-cols-4 gap-5">
              {INSTALLED_APPS.map((app, idx) => {
                const isFocused =
                  focusTarget.type === 'installedApp' && focusTarget.index === idx;

                return (
                  <button
                    key={app.packageName}
                    onClick={() => handleLaunchApp(app)}
                    onMouseEnter={() => handleAppFocused(app, { type: 'installedApp', index: idx })}
                    className={`relative h-32 rounded-3xl glass-crystal p-4 flex items-center gap-4 transition-all duration-300 cursor-pointer text-left ${
                      isFocused ? 'glass-crystal-focused crystal-shimmer' : 'hover:bg-white/10'
                    }`}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-xl border border-white/20 shrink-0"
                      style={{ backgroundColor: app.iconBg }}
                    >
                      {app.iconType}
                    </div>
                    <div className="truncate">
                      <h3 className="text-sm font-bold text-white truncate">{app.label}</h3>
                      <p className="text-xs text-zinc-400 capitalize">{app.category}</p>
                      <span className="inline-block mt-1 text-[10px] text-sky-400 font-mono">
                        v{app.version || '1.0.0'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION 4: SAMBHAV ORIGINALS & EPISODIC SHOWS
            ========================================================================= */}
        {(activeTab === 'home' || activeTab === 'shows') && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Sambhav Original Series
            </h2>

            <div className="flex gap-6 overflow-x-auto no-scrollbar py-3">
              {ORIGINAL_SHOWS.map((item, idx) => {
                const isFocused =
                  focusTarget.type === 'originalShow' && focusTarget.index === idx;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleLaunchMedia(item)}
                    onMouseEnter={() => handleMediaFocused(item, { type: 'originalShow', index: idx })}
                    className={`relative w-80 h-48 rounded-3xl overflow-hidden glass-crystal text-left transition-all duration-300 cursor-pointer shrink-0 ${
                      isFocused ? 'glass-crystal-focused crystal-shimmer' : 'hover:scale-102 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                        {item.categoryBadge}
                      </span>
                      <h3 className="text-base font-bold text-white truncate drop-shadow">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-300 truncate drop-shadow mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full glass-panel border border-white/25 shadow-2xl backdrop-blur-2xl text-xs font-semibold tracking-wide text-white animate-in fade-in slide-in-from-bottom-4 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
