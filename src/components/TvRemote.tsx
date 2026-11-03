import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Home,
  Menu,
  Volume2,
  VolumeX,
  Tv,
  Power,
  Sliders,
  Keyboard
} from 'lucide-react';

interface TvRemoteProps {
  onDpad: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect: () => void;
  onBack: () => void;
  onHome: () => void;
  onMenu: () => void;
  onInput: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onPowerToggle: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const TvRemote: React.FC<TvRemoteProps> = ({
  onDpad,
  onSelect,
  onBack,
  onHome,
  onMenu,
  onInput,
  isMuted,
  onToggleMute,
  onPowerToggle,
  isOpen,
  onToggleOpen
}) => {
  return (
    <div
      className={`fixed right-6 bottom-6 z-50 transition-all duration-300 ease-out flex flex-col items-end ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-95'
      }`}
    >
      {/* Floating Toggle Button */}
      <button
        onClick={onToggleOpen}
        className="mb-3 px-4 py-2.5 rounded-full glass-panel flex items-center gap-2.5 text-xs font-semibold tracking-wider uppercase text-zinc-300 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
        title="Toggle Android TV D-Pad Remote"
      >
        <Tv className="w-4 h-4 text-sky-400" />
        <span>{isOpen ? 'Minimize TV Remote' : 'TCL Remote Control'}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Remote Chassis */}
      {isOpen && (
        <div className="w-64 rounded-3xl p-5 glass-panel border border-white/15 shadow-2xl backdrop-blur-2xl flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-200">
          {/* Top Remote Header */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">TCL • SAMBHAV</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onInput}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Switch TV Input (HDMI)"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onPowerToggle}
                className="p-1.5 rounded-full hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                title="TV Standby / Power"
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* D-Pad Click Wheel */}
          <div className="relative w-44 h-44 rounded-full bg-gradient-to-b from-white/12 to-white/4 border border-white/20 shadow-inner flex items-center justify-center my-2">
            {/* Up Button */}
            <button
              onClick={() => onDpad('up')}
              className="absolute top-2 w-12 h-10 flex items-center justify-center text-zinc-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
              title="D-Pad Up"
            >
              <ChevronUp className="w-6 h-6" />
            </button>

            {/* Down Button */}
            <button
              onClick={() => onDpad('down')}
              className="absolute bottom-2 w-12 h-10 flex items-center justify-center text-zinc-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
              title="D-Pad Down"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            {/* Left Button */}
            <button
              onClick={() => onDpad('left')}
              className="absolute left-2 w-10 h-12 flex items-center justify-center text-zinc-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
              title="D-Pad Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Button */}
            <button
              onClick={() => onDpad('right')}
              className="absolute right-2 w-10 h-12 flex items-center justify-center text-zinc-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
              title="D-Pad Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Center OK / Select Button */}
            <button
              onClick={onSelect}
              className="w-18 h-18 rounded-full bg-gradient-to-b from-white/20 to-white/10 hover:from-white/30 hover:to-white/15 border border-white/30 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-lg hover:scale-105 active:scale-90 transition-all cursor-pointer"
              title="Select / OK"
            >
              OK
            </button>
          </div>

          {/* Action Row: Back, Home, Menu */}
          <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={onBack}
              className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-all active:scale-95"
              title="Back (Esc / Backspace)"
            >
              <RotateCcw className="w-4 h-4 mb-1" />
              <span className="text-[10px] uppercase font-medium">Back</span>
            </button>

            <button
              onClick={onHome}
              className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-all active:scale-95"
              title="Home"
            >
              <Home className="w-4 h-4 mb-1 text-sky-400" />
              <span className="text-[10px] uppercase font-medium">Home</span>
            </button>

            <button
              onClick={onMenu}
              className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-all active:scale-95"
              title="Settings / Menu"
            >
              <Menu className="w-4 h-4 mb-1" />
              <span className="text-[10px] uppercase font-medium">Menu</span>
            </button>
          </div>

          {/* Volume Row */}
          <div className="w-full flex items-center justify-between mt-3 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
              title="Mute / Unmute"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
            </button>
            <span className="text-[10px] font-medium text-zinc-400">TV Volume</span>
            <span className="text-[11px] font-mono text-zinc-300">{isMuted ? 'MUTE' : '35%'}</span>
          </div>

          {/* Keyboard Navigation Tip */}
          <div className="w-full mt-3 pt-2 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400">
            <Keyboard className="w-3 h-3 text-sky-400" />
            <span>Use Arrow Keys + Enter on keyboard</span>
          </div>
        </div>
      )}
    </div>
  );
};
