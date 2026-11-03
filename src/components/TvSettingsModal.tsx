import React, { useState } from 'react';
import {
  Sliders,
  Tv,
  Volume2,
  Wifi,
  Info,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';

interface TvSettingsModalProps {
  onClose: () => void;
}

export const TvSettingsModal: React.FC<TvSettingsModalProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'picture' | 'audio' | 'inputs' | 'about'>('picture');
  const [selectedPictureMode, setSelectedPictureMode] = useState<string>('Dolby Vision Cinema (Recommended)');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('HDMI eARC Soundbar (Dolby Atmos)');

  const pictureModes = [
    { name: 'Dolby Vision Cinema (Recommended)', desc: 'Engineered for authentic cinematic color grading and 24fps motion cadence.' },
    { name: 'Dolby Vision Bright', desc: 'Enhanced peak luminance for daytime living room ambient conditions.' },
    { name: 'Filmmaker Mode', desc: 'Disables all post-processing, artificial sharpening, and frame interpolation.' },
    { name: 'Low-Latency Game Mode', desc: 'Under 10ms input lag with 120Hz MEMC hardware acceleration.' },
    { name: 'Standard Energy Star', desc: 'Optimized power efficiency with dynamic backlight dimming.' }
  ];

  const audioOutputs = [
    { name: 'HDMI eARC Soundbar (Dolby Atmos)', desc: 'True uncompressed multi-channel pass-through with spatial audio.' },
    { name: 'TCL High-Fidelity Internal Speakers', desc: 'Standard dual 15W down-firing stereo array.' },
    { name: 'Optical Digital Audio (TOSLINK)', desc: 'Legacy SPDIF 5.1 surround sound.' },
    { name: 'Bluetooth Wireless Audio', desc: 'Low-latency pairing for wireless headphones.' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-8 animate-in fade-in duration-200">
      <div className="w-[840px] max-h-[85vh] glass-panel rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">TCL Sambhav TV OS Preferences</h3>
              <p className="text-xs text-zinc-400">Android 9 Pie (API 28) • Hardware Settings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Settings Navigation Tabs */}
          <div className="w-60 border-r border-white/10 p-4 space-y-1 bg-black/20">
            <button
              onClick={() => setActiveCategory('picture')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeCategory === 'picture'
                  ? 'bg-white/15 text-white border border-white/25 shadow-md'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <Tv className="w-4 h-4 text-sky-400" />
              <span>Picture &amp; HDR</span>
            </button>

            <button
              onClick={() => setActiveCategory('audio')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeCategory === 'audio'
                  ? 'bg-white/15 text-white border border-white/25 shadow-md'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Dolby Audio &amp; eARC</span>
            </button>

            <button
              onClick={() => setActiveCategory('about')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeCategory === 'about'
                  ? 'bg-white/15 text-white border border-white/25 shadow-md'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <Info className="w-4 h-4 text-amber-400" />
              <span>Hardware &amp; About</span>
            </button>
          </div>

          {/* Settings Content Pane */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeCategory === 'picture' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Dolby Vision &amp; Color Profiles
                </h4>
                {pictureModes.map((mode) => {
                  const isSelected = selectedPictureMode === mode.name;
                  return (
                    <button
                      key={mode.name}
                      onClick={() => setSelectedPictureMode(mode.name)}
                      className={`w-full text-left p-4 rounded-2xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-white/15 border-white/40 shadow-lg'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white">{mode.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{mode.desc}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {activeCategory === 'audio' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Audio Output Configuration
                </h4>
                {audioOutputs.map((output) => {
                  const isSelected = selectedAudioOutput === output.name;
                  return (
                    <button
                      key={output.name}
                      onClick={() => setSelectedAudioOutput(output.name)}
                      className={`w-full text-left p-4 rounded-2xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-white/15 border-white/40 shadow-lg'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white">{output.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{output.desc}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {activeCategory === 'about' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-zinc-400">Target TV Device:</span>
                    <span className="font-semibold text-white">TCL 4K UHD Smart Television</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-zinc-400">Android OS:</span>
                    <span className="font-semibold text-white">Android 9 (Pie)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-zinc-400">API Level:</span>
                    <span className="font-semibold text-white">28 (Leanback Launcher)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-zinc-400">Launcher Package:</span>
                    <span className="font-mono text-sky-400">tv.sambhav.os.launcher</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-zinc-400">Hardware Kernel:</span>
                    <span className="font-mono text-zinc-300">Linux 4.14.76-arm64</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-zinc-400">Graphics Acceleration:</span>
                    <span className="font-semibold text-emerald-400">OpenGL ES 3.2 Hardware Accelerated</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-400/20 text-xs text-zinc-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Designed strictly without Android Compose or WebView overhead to ensure smooth 60fps operation on TCL 1GB/2GB SoC television hardware.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 border-t border-white/10 bg-white/5 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs tracking-wider transition-all cursor-pointer"
          >
            Apply &amp; Return
          </button>
        </div>
      </div>
    </div>
  );
};
