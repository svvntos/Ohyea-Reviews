import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Tv, RefreshCw } from 'lucide-react';
import { MediaPoster } from './MediaPoster';

interface MediaShaderSliderProps {
  currentlyPlaying: {
    title: string;
    platform: string;
    hours?: string;
    rating?: string;
    note?: string;
    imageUrl?: string | null;
  };
  currentlyWatching: {
    title: string;
    platform: string;
    hours?: string;
    rating?: string;
    note?: string;
    imageUrl?: string | null;
  };
  playingTheme: any;
  watchingTheme: any;
}

export const MediaShaderSlider: React.FC<MediaShaderSliderProps> = ({
  currentlyPlaying,
  currentlyWatching,
  playingTheme,
  watchingTheme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderX, setSliderX] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    setSliderX(percentage);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click
    if (e.button !== 0) return;
    setIsDragging(true);
    handleMove(e.clientX);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const transitionClass = isDragging ? "transition-none" : "transition-all duration-500 ease-out";

  return (
    <div className="flex flex-col gap-3 select-none">
      
      {/* Top Slider Helper Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 font-mono text-[10px] font-black text-stone-500 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Tactile Dual Shader System: Drag Bar to Switch
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setSliderX(100)}
            className={`px-2 py-0.5 border-2 text-[9px] font-mono font-black uppercase rounded-lg transition-colors cursor-pointer ${
              sliderX > 85 
                ? 'bg-red-500 text-white border-stone-950 shadow-[1px_1px_0px_0px_#000]' 
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-300'
            }`}
          >
            🎮 Playing
          </button>
          <button
            onClick={() => setSliderX(50)}
            className={`px-2 py-0.5 border-2 text-[9px] font-mono font-black uppercase rounded-lg transition-colors cursor-pointer ${
              sliderX >= 15 && sliderX <= 85 
                ? 'bg-amber-500 text-white border-stone-950 shadow-[1px_1px_0px_0px_#000]' 
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-300'
            }`}
          >
            🌓 Half & Half
          </button>
          <button
            onClick={() => setSliderX(0)}
            className={`px-2 py-0.5 border-2 text-[9px] font-mono font-black uppercase rounded-lg transition-colors cursor-pointer ${
              sliderX < 15 
                ? 'bg-blue-500 text-white border-stone-950 shadow-[1px_1px_0px_0px_#000]' 
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-300'
            }`}
          >
            📺 Watching
          </button>
        </div>
      </div>

      {/* Main Interactive Shader Container */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="relative w-full min-h-[360px] md:min-h-[250px] rounded-2xl border-3 border-stone-950 shadow-[6px_6px_0px_0px_#000] bg-stone-900 overflow-hidden cursor-ew-resize select-none"
      >
        
        {/* Layer 1 (Base / Background): Currently Watching */}
        <div className="absolute inset-0 w-full h-full">
          <section 
            style={watchingTheme.bgStyle}
            className="w-full h-full p-5 md:p-7 flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden"
          >
            {/* Dynamic atmospheric overlay */}
            {watchingTheme.ambientOverlay}

            {/* Content Details (Left) */}
            <div className="relative z-10 flex-1 flex flex-col gap-3.5 w-full text-left">
              <div className="flex items-center gap-2.5">
                <div 
                  style={{ borderColor: `${watchingTheme.accentColorRaw}33`, color: watchingTheme.accentColorRaw, backgroundColor: `${watchingTheme.accentColorRaw}10` }}
                  className="p-1.5 border rounded-lg shrink-0"
                >
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-widest font-black block" style={{ color: watchingTheme.accentColorRaw }}>
                      CURRENTLY WATCHING
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                  <h2 style={{ color: watchingTheme.accentColorRaw }} className={`font-black text-2xl md:text-3xl uppercase mt-0.5 tracking-tight ${watchingTheme.headingFont || 'font-sans'}`}>
                    {currentlyWatching.title}
                  </h2>
                </div>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 mt-0.5">
                <div className="flex items-center gap-2 font-mono text-[10px] border-b pb-0.5" style={{ borderColor: `${watchingTheme.accentColorRaw}22` }}>
                  <span className="font-bold opacity-75" style={{ color: watchingTheme.accentColorRaw }}>STREAMING:</span>
                  <span className="font-bold tracking-wide uppercase" style={{ color: watchingTheme.accentColorRaw }}>{currentlyWatching.platform}</span>
                </div>
                {currentlyWatching.hours && (
                  <div className="flex items-center gap-2 font-mono text-[10px] border-b pb-0.5" style={{ borderColor: `${watchingTheme.accentColorRaw}22` }}>
                    <span className="font-bold opacity-75" style={{ color: watchingTheme.accentColorRaw }}>PROGRESS:</span>
                    <span className="font-bold tracking-wide uppercase" style={{ color: watchingTheme.accentColorRaw }}>{currentlyWatching.hours}</span>
                  </div>
                )}
                {currentlyWatching.rating && (
                  <div className="flex items-center gap-2 font-mono text-[10px] border-b pb-0.5" style={{ borderColor: `${watchingTheme.accentColorRaw}22` }}>
                    <span className="font-bold opacity-75" style={{ color: watchingTheme.accentColorRaw }}>SCORE:</span>
                    <span className="font-bold tracking-wide uppercase" style={{ color: watchingTheme.accentColorRaw }}>{currentlyWatching.rating}</span>
                  </div>
                )}
              </div>

              {currentlyWatching.note && (
                <p 
                  className={`text-xs leading-relaxed max-w-xl select-text border-l-2 pl-3 mt-1 italic ${watchingTheme.bodyFont || 'font-sans'}`}
                  style={{ borderLeftColor: watchingTheme.accentColorRaw, color: watchingTheme.accentColorRaw }}
                >
                  "{currentlyWatching.note}"
                </p>
              )}
            </div>

            {/* Poster cover (Right) */}
            <div 
              className="relative z-10 shrink-0 w-24 sm:w-28 aspect-[2/3] overflow-hidden border-2 rounded-xl select-none bg-stone-100 self-center md:self-auto hover:rotate-1 hover:scale-102 transition-all duration-300"
              style={{
                borderColor: watchingTheme.accentColorRaw,
                boxShadow: `4px 4px 0px 0px ${watchingTheme.accentColorRaw}`
              }}
            >
              <MediaPoster 
                title={currentlyWatching.title}
                imageUrl={currentlyWatching.imageUrl}
                category="show"
                platform={currentlyWatching.platform}
                accentColor={watchingTheme.accentColorRaw}
              />
            </div>
          </section>
        </div>

        {/* Layer 2 (Clipped Overlay): Currently Playing */}
        <div 
          style={{
            clipPath: `inset(0 ${100 - sliderX}% 0 0)`
          }}
          className={`absolute inset-0 w-full h-full z-20 overflow-hidden select-none pointer-events-none ${transitionClass}`}
        >
          <section 
            style={playingTheme.bgStyle}
            className="w-full h-full p-5 md:p-7 flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden pointer-events-auto"
          >
            {/* Dynamic atmospheric overlay */}
            {playingTheme.ambientOverlay}

            {/* Content Details (Left) */}
            <div className="relative z-10 flex-1 flex flex-col gap-3.5 w-full text-left">
              <div className="flex items-center gap-2.5">
                <div 
                  style={{ borderColor: `${playingTheme.accentColorRaw}33`, color: playingTheme.accentColorRaw, backgroundColor: `${playingTheme.accentColorRaw}10` }}
                  className="p-1.5 border rounded-lg shrink-0"
                >
                  <Gamepad2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-widest font-black block" style={{ color: playingTheme.accentColorRaw }}>
                      CURRENTLY PLAYING
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  </div>
                  <h2 style={{ color: playingTheme.accentColorRaw }} className={`font-black text-2xl md:text-3xl uppercase mt-0.5 tracking-tight ${playingTheme.headingFont || 'font-sans'}`}>
                    {currentlyPlaying.title}
                  </h2>
                </div>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 mt-0.5">
                <div className="flex items-center gap-2 font-mono text-[10px] border-b pb-0.5" style={{ borderColor: `${playingTheme.accentColorRaw}22` }}>
                  <span className="font-bold opacity-75" style={{ color: playingTheme.accentColorRaw }}>PLATFORM:</span>
                  <span className="font-bold tracking-wide uppercase" style={{ color: playingTheme.accentColorRaw }}>{currentlyPlaying.platform}</span>
                </div>
                {currentlyPlaying.hours && (
                  <div className="flex items-center gap-2 font-mono text-[10px] border-b pb-0.5" style={{ borderColor: `${playingTheme.accentColorRaw}22` }}>
                    <span className="font-bold opacity-75" style={{ color: playingTheme.accentColorRaw }}>TIME INVESTED:</span>
                    <span className="font-bold tracking-wide uppercase" style={{ color: playingTheme.accentColorRaw }}>{currentlyPlaying.hours}</span>
                  </div>
                )}
                {currentlyPlaying.rating && (
                  <div className="flex items-center gap-2 font-mono text-[10px] border-b pb-0.5" style={{ borderColor: `${playingTheme.accentColorRaw}22` }}>
                    <span className="font-bold opacity-75" style={{ color: playingTheme.accentColorRaw }}>SCORE:</span>
                    <span className="font-bold tracking-wide uppercase" style={{ color: playingTheme.accentColorRaw }}>{currentlyPlaying.rating}</span>
                  </div>
                )}
              </div>

              {currentlyPlaying.note && (
                <p 
                  className={`text-xs leading-relaxed max-w-xl select-text border-l-2 pl-3 mt-1 italic ${playingTheme.bodyFont || 'font-sans'}`}
                  style={{ borderLeftColor: playingTheme.accentColorRaw, color: playingTheme.accentColorRaw }}
                >
                  "{currentlyPlaying.note}"
                </p>
              )}
            </div>

            {/* Poster cover (Right) */}
            <div 
              className="relative z-10 shrink-0 w-24 sm:w-28 aspect-[2/3] overflow-hidden border-2 rounded-xl select-none bg-stone-100 self-center md:self-auto hover:rotate-1 hover:scale-102 transition-all duration-300"
              style={{
                borderColor: playingTheme.accentColorRaw,
                boxShadow: `4px 4px 0px 0px ${playingTheme.accentColorRaw}`
              }}
            >
              <MediaPoster 
                title={currentlyPlaying.title}
                imageUrl={currentlyPlaying.imageUrl}
                category="game"
                platform={currentlyPlaying.platform}
                accentColor={playingTheme.accentColorRaw}
              />
            </div>
          </section>
        </div>

        {/* Tactile Drag Handle divider */}
        <div 
          style={{ left: `${sliderX}%` }}
          className={`absolute top-0 bottom-0 w-[4px] bg-amber-500 shadow-[0_0_12px_#ef4444] z-30 -ml-[2px] pointer-events-none ${transitionClass}`}
        >
          {/* Draggable Circle Controller */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-amber-500 border-3 border-stone-950 shadow-[2px_2px_0px_#000] flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
            title="Drag back and forth!"
          >
            {/* Retro vertical ridge handlers */}
            <div className="flex gap-0.5">
              <div className="w-[2px] h-3.5 bg-stone-950 rounded-full opacity-60" />
              <div className="w-[2px] h-3.5 bg-stone-950 rounded-full opacity-60" />
              <div className="w-[2px] h-3.5 bg-stone-950 rounded-full opacity-60" />
            </div>
          </div>
        </div>

      </div>

      {/* Swipe visual indicator pill */}
      <div className="text-center">
        <p className="font-mono text-[9px] text-stone-400 uppercase tracking-widest font-bold">
          {sliderX > 80 ? "🎮 Fully revealing what you are playing" : sliderX < 20 ? "📺 Fully revealing what you are watching" : "🌓 Shading both side-by-side!"}
        </p>
      </div>

    </div>
  );
};
