import React, { useEffect, useState } from 'react';
import { ArrowLeft, Play, ExternalLink, ShieldCheck } from 'lucide-react';
import { AppItem, MediaItem } from '../types/tv';

interface AppLaunchOverlayProps {
  app?: AppItem | null;
  media?: MediaItem | null;
  onExit: () => void;
}

export const AppLaunchOverlay: React.FC<AppLaunchOverlayProps> = ({
  app,
  media,
  onExit
}) => {
  const [phase, setPhase] = useState<'launching' | 'running'>('launching');

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('running');
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  const title = app?.label || media?.title || 'Application';
  const pkg = app?.packageName || media?.targetPackage || 'tv.sambhav.media.player';

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a] flex flex-col items-center justify-center p-8 select-none animate-in fade-in duration-300">
      {/* Top Bar inside simulated app */}
      <div className="absolute top-6 left-8 right-8 flex items-center justify-between z-10">
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-xl glass-panel text-white text-xs font-semibold flex items-center gap-2 hover:bg-white/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit App (Press TV Back)</span>
        </button>

        <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-zinc-300">
          Android Package: {pkg}
        </div>
      </div>

      {phase === 'launching' ? (
        <div className="flex flex-col items-center gap-5 animate-pulse">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 text-3xl font-black text-white"
            style={{ backgroundColor: app?.iconBg || '#2563eb' }}
          >
            {app?.iconType || '▶'}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-wide text-white">{title}</h2>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Resolving Leanback Launch Intent (FLAG_ACTIVITY_NEW_TASK)...
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl glass-panel rounded-3xl p-10 flex flex-col items-center text-center border border-white/15 shadow-2xl">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl border border-white/25 text-2xl font-bold text-white mb-6"
            style={{ backgroundColor: app?.iconBg || '#2563eb' }}
          >
            {app?.iconType || '▶'}
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-sm text-zinc-400 max-w-lg mb-8 leading-relaxed">
            {media?.synopsis ||
              `Simulating execution on TCL Android 9 TV. Full hardware audio-video decoders and Leanback remote controls are attached.`}
          </p>

          <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mb-8 text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Launch Status</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Intent Active
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Decoders</span>
              <span className="text-xs font-semibold text-white mt-1 block">4K HEVC / VP9</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Audio Path</span>
              <span className="text-xs font-semibold text-sky-400 mt-1 block">Dolby Atmos Passthrough</span>
            </div>
          </div>

          <button
            onClick={onExit}
            className="px-6 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer"
          >
            Return to Sambhav TV OS Home
          </button>
        </div>
      )}
    </div>
  );
};
