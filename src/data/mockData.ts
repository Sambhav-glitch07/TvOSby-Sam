import { MediaItem, AppItem, TvHardwareInput } from '../types/tv';

export const FEATURED_MEDIA: MediaItem[] = [
  {
    id: 'feat_interstellar',
    title: 'CHRONICLES OF DEEP SPACE',
    subtitle: 'Sci-Fi • 2h 45m • 2024',
    synopsis:
      'A team of celestial voyagers journeys through an enigmatic gateway on the fringe of known reality to seek an enduring sanctuary for humankind across unexplored star systems.',
    categoryBadge: 'SAMBHAV CINEMA EXCLUSIVE',
    technicalBadges: '4K HDR10+ • DOLBY VISION • DOLBY ATMOS',
    rating: 'IMDb 9.2',
    duration: '165 min',
    year: 2024,
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2560&q=85',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    dominantColor: '#0a172c',
    targetPackage: 'com.sambhav.cinema'
  },
  {
    id: 'feat_solaris',
    title: 'THE SHADOW CITADEL',
    subtitle: 'Action / Espionage • 2h 18m • 2024',
    synopsis:
      'Behind impenetrable basalt battlements and quantum encryption, an elite reconnaissance syndicate uncovers a clandestine cipher threatening global communications.',
    categoryBadge: 'CRITICS CHOICE BLOCKBUSTER',
    technicalBadges: '4K ULTRA HD • IMAX ENHANCED • 7.1 DTS-X',
    rating: 'IMDb 8.9',
    duration: '138 min',
    year: 2024,
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=85',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    dominantColor: '#281119',
    targetPackage: 'com.netflix.ninja'
  },
  {
    id: 'feat_aurora',
    title: 'AURORA BOREALIS',
    subtitle: 'Nature Documentary • 1h 52m • 2024',
    synopsis:
      'Witness the breathtaking arctic dance of polar geomagnetic storms captured over four harsh northern winters using experimental ultra-low-light 8K cinema sensors.',
    categoryBadge: 'SAMBHAV EARTH EXPEDITION',
    technicalBadges: 'DOLBY VISION IQ • DOLBY ATMOS 3D AUDIO',
    rating: 'IMDb 9.4',
    duration: '112 min',
    year: 2024,
    backdropUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2560&q=85',
    posterUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
    dominantColor: '#07241e',
    targetPackage: 'com.disney.disneyplus'
  },
  {
    id: 'feat_valkyrie',
    title: 'ECHOES OF THE VALKYRIE',
    subtitle: 'Historical Drama • 2h 30m • 2024',
    synopsis:
      'In the frozen fjords of 9th-century Scandinavia, twin rulers navigate dynastic betrayal and treacherous oceanic expeditions into uncharted western realms.',
    categoryBadge: 'PREMIUM MASTERPIECE',
    technicalBadges: '4K HDR • MASTERED IN 24FPS CINEMA',
    rating: 'IMDb 8.7',
    duration: '150 min',
    year: 2024,
    backdropUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    dominantColor: '#271c0c',
    targetPackage: 'com.amazon.amazonvideo.livingroom'
  }
];

export const ORIGINAL_SHOWS: MediaItem[] = [
  {
    id: 'show_quantum',
    title: 'QUANTUM HORIZON',
    subtitle: 'Season 2 • 8 Episodes • 2024',
    synopsis:
      'In 2088, the first sub-atomic entanglement network triggers unexpected parallel timeline collapses across three major megacities.',
    categoryBadge: 'SAMBHAV ORIGINAL SERIES',
    technicalBadges: '4K DOLBY VISION • 5.1 SURROUND',
    rating: 'IMDb 9.0',
    duration: '8 Episodes',
    year: 2024,
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=2560&q=85',
    posterUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    dominantColor: '#141829'
  },
  {
    id: 'show_neon',
    title: 'NEON MONARCHY',
    subtitle: 'Season 1 • 10 Episodes • 2024',
    synopsis:
      'Under the rain-slicked skies of Neo-Tokyo, a veteran investigator uncovers the mysterious vanishing of the city’s lead artificial intelligence architect.',
    categoryBadge: 'NEW EPISODES WEEKLY',
    technicalBadges: '4K ULTRA HD • DOLBY ATMOS',
    rating: 'IMDb 8.8',
    duration: '10 Episodes',
    year: 2024,
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2560&q=85',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    dominantColor: '#240d28'
  },
  {
    id: 'show_serengeti',
    title: 'SERENGETI EXPEDITIONS',
    subtitle: 'Nature Series • 6 Episodes • 2024',
    synopsis:
      'An intimate look at the great migration captured with high-speed remote drones, thermal optics, and custom camera rigs.',
    categoryBadge: 'ORIGINAL DOCUMENTARY',
    technicalBadges: '4K HDR10 • DOLBY SURROUND',
    rating: 'IMDb 9.3',
    duration: '6 Episodes',
    year: 2024,
    backdropUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2560&q=85',
    posterUrl: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=800&q=80',
    dominantColor: '#1d190f'
  },
  {
    id: 'show_cipher',
    title: 'THE BERLIN CIPHER',
    subtitle: 'Cold War Espionage • 6 Episodes',
    synopsis:
      'A cryptographer stationed in divided 1961 Berlin intercepts communications pointing to an unauthorized nuclear test in the Baltic.',
    categoryBadge: 'LIMITED MINI-SERIES',
    technicalBadges: '4K FILM GRAIN • DOLBY 5.1',
    rating: 'IMDb 8.6',
    duration: '6 Episodes',
    year: 2024,
    backdropUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2560&q=85',
    posterUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    dominantColor: '#121e25'
  }
];

export const INSTALLED_APPS: AppItem[] = [
  {
    packageName: 'com.netflix.ninja',
    activityName: 'com.netflix.ninja.MainActivity',
    label: 'Netflix',
    iconType: 'N',
    iconBg: '#E50914',
    category: 'streaming',
    isLeanbackCompatible: true,
    version: '8.4.1'
  },
  {
    packageName: 'com.google.android.youtube.tv',
    activityName: 'com.google.android.apps.youtube.tv.activity.ShellActivity',
    label: 'YouTube TV',
    iconType: 'YT',
    iconBg: '#FF0000',
    category: 'streaming',
    isLeanbackCompatible: true,
    version: '4.12.002'
  },
  {
    packageName: 'com.amazon.amazonvideo.livingroom',
    activityName: 'com.amazon.ignition.IgnitionActivity',
    label: 'Prime Video',
    iconType: 'PV',
    iconBg: '#00A8E1',
    category: 'streaming',
    isLeanbackCompatible: true,
    version: '6.18.2'
  },
  {
    packageName: 'com.disney.disneyplus',
    activityName: 'com.disney.disneyplus.MainActivity',
    label: 'Disney+',
    iconType: 'D+',
    iconBg: '#113CCF',
    category: 'streaming',
    isLeanbackCompatible: true,
    version: '3.1.0'
  },
  {
    packageName: 'com.apple.atve.androidtv.appletv',
    activityName: 'com.apple.atve.androidtv.MainActivity',
    label: 'Apple TV',
    iconType: 'tv',
    iconBg: '#000000',
    category: 'streaming',
    isLeanbackCompatible: true,
    version: '2.3.0'
  },
  {
    packageName: 'com.plexapp.android',
    activityName: 'com.plexapp.plex.activities.SplashActivity',
    label: 'Plex Media',
    iconType: 'PX',
    iconBg: '#E5A00D',
    category: 'entertainment',
    isLeanbackCompatible: true,
    version: '10.5.1'
  },
  {
    packageName: 'com.spotify.tv.android',
    activityName: 'com.spotify.tv.android.SpotifyTVActivity',
    label: 'Spotify',
    iconType: 'SP',
    iconBg: '#1DB954',
    category: 'entertainment',
    isLeanbackCompatible: true,
    version: '1.92.0'
  },
  {
    packageName: 'tv.twitch.android.app',
    activityName: 'tv.twitch.android.app.core.LandingActivity',
    label: 'Twitch',
    iconType: 'TW',
    iconBg: '#9146FF',
    category: 'entertainment',
    isLeanbackCompatible: true,
    version: '14.2.0'
  },
  {
    packageName: 'in.startv.hotstar',
    activityName: 'in.startv.hotstar.SplashActivity',
    label: 'JioHotstar',
    iconType: 'JH',
    iconBg: '#0042D9',
    category: 'streaming',
    isLeanbackCompatible: true,
    version: '24.11.0'
  },
  {
    packageName: 'com.tcl.channel',
    activityName: 'com.tcl.channel.MainActivity',
    label: 'TCL Channel',
    iconType: 'TCL',
    iconBg: '#D8232A',
    category: 'system',
    isLeanbackCompatible: true,
    version: '5.2.0'
  },
  {
    packageName: 'com.sambhav.store',
    activityName: 'tv.sambhav.store.StoreMainActivity',
    label: 'Sambhav Store',
    iconType: 'S',
    iconBg: '#2563EB',
    category: 'system',
    isLeanbackCompatible: true,
    version: '1.0.0'
  },
  {
    packageName: 'com.android.tv.settings',
    activityName: 'com.android.tv.settings.MainSettings',
    label: 'TV Settings',
    iconType: '⚙',
    iconBg: '#374151',
    category: 'system',
    isLeanbackCompatible: true,
    version: '9.0-pie'
  }
];

export const TV_INPUTS: TvHardwareInput[] = [
  {
    id: 'tcl_hdmi_1',
    title: 'HDMI 1 (eARC)',
    subtitle: 'Atmos Soundbar Connected',
    isConnected: true,
    type: 'hdmi'
  },
  {
    id: 'tcl_hdmi_2',
    title: 'HDMI 2 (4K 120Hz)',
    subtitle: 'Game Console / Low Latency',
    isConnected: true,
    type: 'hdmi'
  },
  {
    id: 'tcl_hdmi_3',
    title: 'HDMI 3 (PC / Media)',
    subtitle: 'Ready for connection',
    isConnected: false,
    type: 'hdmi'
  },
  {
    id: 'tcl_av',
    title: 'AV Composite',
    subtitle: 'Standard Video In',
    isConnected: false,
    type: 'av'
  }
];
