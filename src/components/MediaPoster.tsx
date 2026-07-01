import React, { useState, useEffect } from 'react';
import { Gamepad2, Tv, Film, Disc, Monitor } from 'lucide-react';

interface MediaPosterProps {
  title: string;
  imageUrl?: string | null;
  category: 'game' | 'movie' | 'show';
  platform: string;
  accentColor: string;
}

export const MediaPoster: React.FC<MediaPosterProps> = ({
  title,
  imageUrl,
  category,
  platform,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Reset error state if imageUrl changes
  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl, title]);

  const platformLower = (platform || '').toLowerCase();

  // Pick suitable streaming/platform colors and text
  let fallbackColorClass = "from-stone-900 to-stone-950";
  let fallbackBorderColor = "border-stone-800";
  let fallbackTextColor = "text-stone-400";
  let badgeLabel = "MEDIA STREAM";
  let platformIcon = <Tv className="w-8 h-8" />;

  if (category === 'game') {
    if (platformLower.includes('ps') || platformLower.includes('playstation')) {
      fallbackColorClass = "from-[#0037AE] to-[#001D60]";
      fallbackBorderColor = "border-[#0037AE]";
      fallbackTextColor = "text-[#88B0FF]";
      badgeLabel = "PLAYSTATION";
      platformIcon = <Gamepad2 className="w-8 h-8" />;
    } else if (platformLower.includes('switch') || platformLower.includes('nintendo')) {
      fallbackColorClass = "from-[#E60012] to-[#80000A]";
      fallbackBorderColor = "border-[#E60012]";
      fallbackTextColor = "text-[#FFA3A8]";
      badgeLabel = "NINTENDO SWITCH";
      platformIcon = <Gamepad2 className="w-8 h-8" />;
    } else if (platformLower.includes('xbox')) {
      fallbackColorClass = "from-[#107C10] to-[#052C05]";
      fallbackBorderColor = "border-[#107C10]";
      fallbackTextColor = "text-[#A3FFA3]";
      badgeLabel = "XBOX DIRECT";
      platformIcon = <Gamepad2 className="w-8 h-8" />;
    } else if (platformLower.includes('pc') || platformLower.includes('steam') || platformLower.includes('deck')) {
      fallbackColorClass = "from-[#171A21] to-[#0B0D11]";
      fallbackBorderColor = "border-[#2A475E]";
      fallbackTextColor = "text-[#66C0F4]";
      badgeLabel = "STEAM PLAY";
      platformIcon = <Monitor className="w-8 h-8" />;
    } else {
      fallbackColorClass = "from-[#EF4444] to-amber-600";
      fallbackBorderColor = "border-[#EF4444]";
      fallbackTextColor = "text-amber-100";
      badgeLabel = "INSERT COIN";
      platformIcon = <Gamepad2 className="w-8 h-8" />;
    }
  } else {
    // Movies / Shows fallback
    if (platformLower.includes('netflix')) {
      fallbackColorClass = "from-[#E50914] to-black";
      fallbackBorderColor = "border-[#E50914]";
      fallbackTextColor = "text-red-400";
      badgeLabel = "NETFLIX MOVIE";
      platformIcon = <Film className="w-8 h-8" />;
    } else if (platformLower.includes('apple') || platformLower.includes('tv+')) {
      fallbackColorClass = "from-stone-700 to-stone-900";
      fallbackBorderColor = "border-stone-500";
      fallbackTextColor = "text-white";
      badgeLabel = "APPLE TV+";
      platformIcon = <Tv className="w-8 h-8" />;
    } else if (platformLower.includes('prime') || platformLower.includes('amazon')) {
      fallbackColorClass = "from-[#00A8E1] to-[#151A21]";
      fallbackBorderColor = "border-[#00A8E1]";
      fallbackTextColor = "text-[#80E4FF]";
      badgeLabel = "PRIME VIDEO";
      platformIcon = <Film className="w-8 h-8" />;
    } else if (platformLower.includes('disney')) {
      fallbackColorClass = "from-[#001032] to-[#113CCF]";
      fallbackBorderColor = "border-[#113CCF]";
      fallbackTextColor = "text-[#00E5FF]";
      badgeLabel = "DISNEY+ PLUS";
      platformIcon = <Tv className="w-8 h-8" />;
    } else if (platformLower.includes('hbo') || platformLower.includes('max')) {
      fallbackColorClass = "from-[#19003C] to-[#510099]";
      fallbackBorderColor = "border-[#510099]";
      fallbackTextColor = "text-[#D080FF]";
      badgeLabel = "HBO MAX";
      platformIcon = <Disc className="w-8 h-8" />;
    } else if (platformLower.includes('hulu')) {
      fallbackColorClass = "from-[#1CE783] to-stone-950";
      fallbackBorderColor = "border-[#1CE783]";
      fallbackTextColor = "text-[#98FFCB]";
      badgeLabel = "HULU ORIGINAL";
      platformIcon = <Tv className="w-8 h-8" />;
    } else if (platformLower.includes('crunchy') || platformLower.includes('anime')) {
      fallbackColorClass = "from-[#F47521] to-[#8A3600]";
      fallbackBorderColor = "border-[#F47521]";
      fallbackTextColor = "text-[#FFD3B4]";
      badgeLabel = "CRUNCHYROLL";
      platformIcon = <Disc className="w-8 h-8" />;
    } else {
      fallbackColorClass = "from-[#3B82F6] to-indigo-950";
      fallbackBorderColor = "border-indigo-500";
      fallbackTextColor = "text-blue-300";
      badgeLabel = "CINEMA SPECIAL";
      platformIcon = <Film className="w-8 h-8" />;
    }
  }

  const renderFallback = () => (
    <div 
      className={`w-full h-full bg-gradient-to-br ${fallbackColorClass} flex flex-col justify-between p-3 border-2 ${fallbackBorderColor} rounded-xl text-left relative overflow-hidden select-none`}
    >
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none z-10" />
      
      {/* Retro background graphics */}
      <div className="absolute -right-6 -bottom-6 opacity-10 z-0 rotate-12">
        {platformIcon}
      </div>

      <div className="flex justify-between items-center z-10 border-b border-white/10 pb-1.5">
        <span className="font-mono text-[8px] font-black tracking-widest text-white/80 uppercase">
          {badgeLabel}
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
      </div>

      <div className="my-auto py-2 flex flex-col items-center justify-center gap-2 text-center z-10">
        <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white shadow-inner animate-pulse">
          {platformIcon}
        </div>
        <span className={`font-mono text-[9px] font-bold ${fallbackTextColor} px-2 py-0.5 bg-black/40 rounded border border-white/5 uppercase tracking-wider truncate max-w-[120px]`}>
          {platform || 'Unknown'}
        </span>
      </div>

      <div className="z-10 mt-auto border-t border-white/10 pt-1.5">
        <h5 className="font-display font-black text-[10px] text-white uppercase tracking-tight line-clamp-2 leading-tight">
          {title}
        </h5>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[7px] font-mono text-white/50 uppercase font-bold">FALLBACK</span>
          <span className="text-[7px] font-mono text-white/50 uppercase font-bold">2026 // KOOL</span>
        </div>
      </div>
    </div>
  );

  if (imageUrl && !imageFailed) {
    return (
      <img 
        src={imageUrl} 
        alt={`${title} cover`}
        referrerPolicy="no-referrer"
        onError={() => {
          console.warn(`MediaPoster: Image failed to load for "${title}". Loading fallback card...`);
          setImageFailed(true);
        }}
        className="w-full h-full object-cover filter saturate-[1.25] contrast-[1.05]"
      />
    );
  }

  return renderFallback();
};
