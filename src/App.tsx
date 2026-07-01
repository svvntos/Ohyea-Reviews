import React, { useEffect, useState, useRef } from 'react';
import { 
  Loader2, 
  ArrowLeft, 
  Search, 
  X, 
  Gamepad2, 
  Tv, 
  Calendar, 
  Award, 
  BookOpen, 
  Plus, 
  Trash, 
  Save, 
  Edit3, 
  ExternalLink, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  Clock,
  Layers,
  FileText,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Play,
  MoreVertical,
  Shuffle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_BLOG_DATA, BlogData, GameStatus, BlogReview, BacklogGame, VideoReview, UpcomingItem } from './data/blogData';
import { KoolAidMascot } from './components/KoolAidMascot';

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

type UIState = 'IDLE' | 'GENERATING' | 'DONE';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

const RANDOM_TITLES: Record<'game' | 'movie' | 'show', string[]> = {
  game: [
    "Elden Ring",
    "Cyberpunk 2077",
    "Ghost of Tsushima",
    "Final Fantasy VII Remake",
    "Hades",
    "The Legend of Zelda: Breath of the Wild",
    "The Witcher 3: Wild Hunt",
    "Baldur's Gate 3",
    "Red Dead Redemption 2",
    "Persona 5 Royal",
    "Celeste",
    "Disco Elysium",
    "Hollow Knight",
    "Spiderman 2",
    "God of War Ragnarok"
  ],
  movie: [
    "Spirited Away",
    "Inception",
    "Interstellar",
    "Spider-Man: Into the Spider-Verse",
    "Everything Everywhere All at Once",
    "Dune",
    "The Dark Knight",
    "Blade Runner 2049",
    "Parasite",
    "Princess Mononoke",
    "Your Name",
    "The Matrix",
    "Mad Max: Fury Road",
    "Whiplash",
    "Pulp Fiction"
  ],
  show: [
    "Ted Lasso",
    "Severance",
    "Succession",
    "Breaking Bad",
    "Stranger Things",
    "The Last of Us",
    "Arcane",
    "The Bear",
    "Better Call Saul",
    "Attack on Titan",
    "Avatar: The Last Airbender",
    "Cyberpunk: Edgerunners",
    "BoJack Horseman",
    "Andor",
    "Fleabag"
  ]
};

const ScrambleText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let frame = 0;
    const step = Math.max(1, Math.floor(text.length / 15));
    const interval = setInterval(() => {
      setDisplayText(() => {
        let next = '';
        for (let i = 0; i < text.length; i++) {
          if (i < frame) {
            next += text[i];
          } else {
            next += text[i] === ' ' ? ' ' : CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
          }
        }
        return next;
      });
      frame += step;
      if (frame > text.length) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [text]);

  return <span className="font-pressstart tracking-tight">{displayText}</span>;
};

const PixelArtLoader = () => {
  const COLS = 7;
  const ROWS = 9;
  
  const [pixels, setPixels] = useState(() => Array.from({length: ROWS * COLS}, (_, i) => ({
    r: Math.floor(i / COLS),
    c: i % COLS,
    active: false,
    color: '#000',
    char: ''
  })));

  useEffect(() => {
    const update = () => {
      setPixels(prev => prev.map(p => {
        const dx = p.c - COLS / 2;
        const dy = p.r - ROWS / 2;
        const isActive = Math.random() > 0.1 && (dx*dx*1.8 + dy*dy < 14);
        if (isActive) {
          const isWhite = Math.random() < 0.25 && p.c <= COLS / 2;
          const shades = ['#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];
          return {
            ...p,
            active: true,
            color: isWhite ? '#ffffff' : shades[Math.floor(Math.random() * shades.length)],
            char: isWhite ? Math.floor(Math.random() * 10).toString() : ''
          };
        } else {
          return { ...p, active: false };
        }
      }));
    };
    
    update();
    const interval = setInterval(update, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex pointer-events-none shrink-0"
    >
      <div 
        className="grid gap-[1px]" 
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, width: '70px', height: '90px' }}
      >
        {pixels.map((p, i) => (
          <div 
            key={i} 
            className="flex items-center justify-center text-[10px] font-mono leading-none font-bold overflow-hidden"
            style={{
              backgroundColor: p.active ? p.color : 'transparent',
              color: p.color === '#ffffff' ? '#000000' : 'transparent',
            }}
          >
            {p.char}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Thematic engine to customize the visual environment, typography, colors and ambient effects based on the selected game
interface GameTheme {
  themeName: string;
  headingFont: string;
  bodyFont: string;
  bgStyle: React.CSSProperties;
  borderStyle: React.CSSProperties;
  accentTextColor: string;
  accentBgColor: string;
  accentBorderColor: string;
  accentColorRaw: string;
  badgeStyle: string;
  badgeStyleOverride?: React.CSSProperties;
  shadowStyle: React.CSSProperties;
  textColor: string;
  ambientOverlay?: React.ReactNode;
}

const getGameTheme = (gameTitle: string): GameTheme => {
  const titleLower = gameTitle.toLowerCase();

  // 1. SPIRITED AWAY (STUDIO GHIBLI / COZY WATERCOLOR)
  if (titleLower.includes("spirited") || titleLower.includes("ghibli") || titleLower.includes("away")) {
    return {
      themeName: "STUDIO GHIBLI // WATERCOLOR GREEN",
      headingFont: "font-display",
      bodyFont: "font-sans",
      bgStyle: {
        background: "linear-gradient(135deg, #FAF8F2 0%, #E9F4E6 100%)"
      },
      borderStyle: { borderColor: "#4C7C41" },
      accentTextColor: "text-[#4C7C41]",
      accentBgColor: "bg-[#4C7C41]",
      accentBorderColor: "border-[#4C7C41]",
      accentColorRaw: "#4C7C41",
      textColor: "text-[#1B3019]",
      badgeStyle: "bg-[#4C7C41]/10 border-[#4C7C41]/20 text-[#4C7C41]",
      shadowStyle: { boxShadow: "0 8px 24px rgba(76,124,65,0.08)" },
      ambientOverlay: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(76,124,65,0.06)_0%,transparent_70%)]" />
        </div>
      )
    };
  }

  // 2. TED LASSO (RICHMOND FC // BELIEVE OPTIMISM)
  if (titleLower.includes("lasso") || titleLower.includes("ted")) {
    return {
      themeName: "RICHMOND BELIEVE // SUNSET BLUE",
      headingFont: "font-sans",
      bodyFont: "font-sans",
      bgStyle: {
        background: "linear-gradient(135deg, #F5F9FC 0%, #E3EDFA 100%)"
      },
      borderStyle: { borderColor: "#1B4375" },
      accentTextColor: "text-[#1B4375]",
      accentBgColor: "bg-[#E6A125]",
      accentBorderColor: "border-[#1B4375]",
      accentColorRaw: "#1B4375",
      textColor: "text-[#122338]",
      badgeStyle: "bg-[#E6A125]/10 border-[#E6A125]/30 text-[#1B4375]",
      shadowStyle: { boxShadow: "0 8px 24px rgba(27,67,117,0.08)" },
      ambientOverlay: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,161,37,0.06)_0%,transparent_70%)]" />
        </div>
      )
    };
  }

  // 3. GHOST OF TSUSHIMA (SAMURAI CINEMA / COZY GOLD)
  if (titleLower.includes("tsushima") || titleLower.includes("ghost of")) {
    return {
      themeName: "AUTUMN TSUSHIMA // MAPLE GOLD",
      headingFont: "font-cinzel",
      bodyFont: "font-sans",
      bgStyle: {
        background: "linear-gradient(135deg, #FAF7F2 0%, #F5E6CC 100%)"
      },
      borderStyle: { borderColor: "#A8701D" },
      accentTextColor: "text-[#A8701D]",
      accentBgColor: "bg-[#A8701D]",
      accentBorderColor: "border-[#A8701D]",
      accentColorRaw: "#A8701D",
      textColor: "text-[#3D2808]",
      badgeStyle: "bg-[#A8701D]/10 border-[#A8701D]/20 text-[#A8701D]",
      shadowStyle: { boxShadow: "0 8px 24px rgba(168,112,29,0.08)" },
      ambientOverlay: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,112,29,0.05)_0%,transparent_70%)]" />
        </div>
      )
    };
  }

  // 4. FINAL FANTASY VII REMAKE (COZY SAGE & MINT)
  if (titleLower.includes("vii") || titleLower.includes("ff7") || titleLower.includes("final fantasy 7") || titleLower.includes("remake")) {
    return {
      themeName: "SHINRA SAGE // MINT HARMONY",
      headingFont: "font-orbitron",
      bodyFont: "font-mono",
      bgStyle: {
        background: "linear-gradient(135deg, #F6FAF7 0%, #E3EFE8 100%)"
      },
      borderStyle: { borderColor: "#246B54" },
      accentTextColor: "text-[#246B54]",
      accentBgColor: "bg-[#246B54]",
      accentBorderColor: "border-[#246B54]",
      accentColorRaw: "#246B54",
      textColor: "text-[#133529]",
      badgeStyle: "bg-[#246B54]/10 border-[#246B54]/20 text-[#246B54]",
      shadowStyle: { boxShadow: "0 8px 24px rgba(36,107,84,0.08)" },
      ambientOverlay: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(36,107,84,0.05)_0%,transparent_70%)]" />
        </div>
      )
    };
  }

  // 5. FINAL FANTASY XVI (VALISTHEA PEACH & TERRACOTTA)
  if (titleLower.includes("xvi") || titleLower.includes("ff16") || titleLower.includes("final fantasy 16")) {
    return {
      themeName: "ROSARIA SUNSET // PEACH TERRACOTTA",
      headingFont: "font-uncial",
      bodyFont: "font-sans",
      bgStyle: {
        background: "linear-gradient(135deg, #FCFAF7 0%, #F6E2D5 100%)"
      },
      borderStyle: { borderColor: "#C2532D" },
      accentTextColor: "text-[#C2532D]",
      accentBgColor: "bg-[#C2532D]",
      accentBorderColor: "border-[#C2532D]",
      accentColorRaw: "#C2532D",
      textColor: "text-[#421A0C]",
      badgeStyle: "bg-[#C2532D]/10 border-[#C2532D]/20 text-[#C2532D]",
      shadowStyle: { boxShadow: "0 8px 24px rgba(194,83,45,0.08)" },
      ambientOverlay: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(194,83,45,0.05)_0%,transparent_70%)]" />
        </div>
      )
    };
  }

  // 6. RATCHET & CLANK: RIFT APART (COSMIC LAVENDER)
  if (titleLower.includes("ratchet") || titleLower.includes("clank") || titleLower.includes("rift apart")) {
    return {
      themeName: "NEBULA LAVENDER // ORCHID HEATHER",
      headingFont: "font-righteous",
      bodyFont: "font-mono",
      bgStyle: {
        background: "linear-gradient(135deg, #FAF7FC 0%, #EDE1F5 100%)"
      },
      borderStyle: { borderColor: "#7C449C" },
      accentTextColor: "text-[#7C449C]",
      accentBgColor: "bg-[#7C449C]",
      accentBorderColor: "border-[#7C449C]",
      accentColorRaw: "#7C449C",
      textColor: "text-[#2D163C]",
      badgeStyle: "bg-[#7C449C]/10 border-[#7C449C]/20 text-[#7C449C]",
      shadowStyle: { boxShadow: "0 8px 24px rgba(124,68,156,0.08)" },
      ambientOverlay: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,68,156,0.05)_0%,transparent_70%)]" />
        </div>
      )
    };
  }

  // 7. GENERIC MATCHERS
  // Fantasy/RPG Theme
  if (titleLower.includes("fantasy") || titleLower.includes("zelda") || titleLower.includes("elder") || titleLower.includes("ring") || titleLower.includes("witcher")) {
    return {
      themeName: "MYSTICAL PARCHMENT // AMBER OAK",
      headingFont: "font-cinzel",
      bodyFont: "font-sans",
      bgStyle: {
        background: "linear-gradient(135deg, #FAF6EE 0%, #EDE2CC 100%)"
      },
      borderStyle: { borderColor: "#825D38" },
      accentTextColor: "text-[#825D38]",
      accentBgColor: "bg-[#825D38]",
      accentBorderColor: "border-[#825D38]",
      accentColorRaw: "#825D38",
      textColor: "text-[#2B1B0E]",
      badgeStyle: "bg-[#825D38]/10 border-[#825D38]/20 text-[#825D38]",
      shadowStyle: { boxShadow: "0 8px 24px rgba(130,93,56,0.08)" },
      ambientOverlay: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(130,93,56,0.05)_0%,transparent_70%)]" />
        </div>
      )
    };
  }

  // Cyberpunk/Futuristic
  if (titleLower.includes("cyber") || titleLower.includes("punk") || titleLower.includes("deus") || titleLower.includes("halo") || titleLower.includes("metroid") || titleLower.includes("star")) {
    return {
      themeName: "CYBER STEEL // STEEL BLUE",
      headingFont: "font-orbitron",
      bodyFont: "font-mono",
      bgStyle: {
        background: "linear-gradient(135deg, #F5F9FA 0%, #DCEEF2 100%)"
      },
      borderStyle: { borderColor: "#1A6B7A" },
      accentTextColor: "text-[#1A6B7A]",
      accentBgColor: "bg-[#1A6B7A]",
      accentBorderColor: "border-[#1A6B7A]",
      accentColorRaw: "#1A6B7A",
      textColor: "text-[#082930]",
      badgeStyle: "bg-[#1A6B7A]/10 border-[#1A6B7A]/20 text-[#1A6B7A]",
      shadowStyle: { boxShadow: "0 8px 24px rgba(26,107,122,0.08)" },
      ambientOverlay: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(26,107,122,0.05)_0%,transparent_70%)]" />
        </div>
      )
    };
  }

  // Retro/Pixel/Console
  if (titleLower.includes("mario") || titleLower.includes("pokemon") || titleLower.includes("kart") || titleLower.includes("smash") || titleLower.includes("retro") || titleLower.includes("arcade") || titleLower.includes("sonic")) {
    return {
      themeName: "RETRO PLAYGROUND // BERRY CREAM",
      headingFont: "font-righteous",
      bodyFont: "font-mono",
      bgStyle: {
        background: "linear-gradient(135deg, #FFF7F7 0%, #FCDDDD 100%)"
      },
      borderStyle: { borderColor: "#BF2A2A" },
      accentTextColor: "text-[#BF2A2A]",
      accentBgColor: "bg-[#BF2A2A]",
      accentBorderColor: "border-[#BF2A2A]",
      accentColorRaw: "#BF2A2A",
      textColor: "text-[#420A0A]",
      badgeStyle: "bg-[#BF2A2A]/10 border-[#BF2A2A]/20 text-[#BF2A2A]",
      shadowStyle: { boxShadow: "0 8px 24px rgba(191,42,42,0.08)" },
      ambientOverlay: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(191,42,42,0.05)_0%,transparent_70%)]" />
        </div>
      )
    };
  }

  // Horror/Scary
  if (titleLower.includes("souls") || titleLower.includes("resident") || titleLower.includes("evil") || titleLower.includes("horror") || titleLower.includes("dark") || titleLower.includes("silent") || titleLower.includes("doom")) {
    return {
      themeName: "COZY GOTHIC // MISTY ASH",
      headingFont: "font-creepster",
      bodyFont: "font-sans",
      bgStyle: {
        background: "linear-gradient(135deg, #FAF9F8 0%, #EBE5E0 100%)"
      },
      borderStyle: { borderColor: "#5C4F44" },
      accentTextColor: "text-[#5C4F44]",
      accentBgColor: "bg-[#5C4F44]",
      accentBorderColor: "border-[#5C4F44]",
      accentColorRaw: "#5C4F44",
      textColor: "text-[#241D17]",
      badgeStyle: "bg-[#5C4F44]/10 border-[#5C4F44]/20 text-[#5C4F44]",
      shadowStyle: { boxShadow: "0 8px 24px rgba(92,79,68,0.08)" },
      ambientOverlay: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(92,79,68,0.05)_0%,transparent_70%)]" />
        </div>
      )
    };
  }

  // 8. PROCEDURAL COZY THEMATIC ENGINE (Uses String Hash to build a light pastel feel-good palette!)
  let hash = 0;
  for (let i = 0; i < gameTitle.length; i++) {
    hash = gameTitle.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const hue = hash % 360;
  const saturation = 50 + (hash % 20); // 50% - 70%
  const lightness = 35 + (hash % 15);  // 35% - 50% (deep enough for legible high-contrast accent text on light cream)
  
  const accentColorHex = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const bgGradStart = `hsl(${hue}, 30%, 98%)`;
  const bgGradEnd = `hsl(${(hue + 25) % 360}, 20%, 93%)`;

  const FONTS = [
    "font-sans",
    "font-display",
    "font-syne",
    "font-cinzel",
    "font-righteous"
  ];
  const headingFont = FONTS[hash % FONTS.length];
  const bodyFont = "font-sans";

  return {
    themeName: `GARDEN ENGINE // FLORA-${hue}`,
    headingFont,
    bodyFont,
    bgStyle: {
      background: `linear-gradient(135deg, ${bgGradStart} 0%, ${bgGradEnd} 100%)`
    },
    borderStyle: { borderColor: accentColorHex },
    accentTextColor: `text-[${accentColorHex}]`,
    accentBgColor: `bg-[${accentColorHex}]`,
    accentBorderColor: `border-[${accentColorHex}]`,
    accentColorRaw: accentColorHex,
    textColor: "text-stone-800",
    badgeStyle: `bg-stone-50 border-[${accentColorHex}]/30 text-stone-800`,
    badgeStyleOverride: {
      backgroundColor: `hsla(${hue}, ${saturation}%, 96%, 0.8)`,
      borderColor: accentColorHex,
      color: accentColorHex
    },
    shadowStyle: { 
      boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
    },
    ambientOverlay: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 70% 30%, hsla(${hue}, ${saturation}%, ${lightness}%, 0.08) 0%, transparent 70%)`
          }}
        />
      </div>
    )
  };
};

export default function App() {
  // Core Blog Data
  const [blogData, setBlogData] = useState<BlogData>(() => {
    const saved = localStorage.getItem('kool_aid_blog_data_v2');
    let loadedData: BlogData = INITIAL_BLOG_DATA;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        loadedData = {
          ...INITIAL_BLOG_DATA,
          ...parsed,
          currentlyPlaying: parsed.currentlyPlaying || INITIAL_BLOG_DATA.currentlyPlaying,
          currentlyWatching: parsed.currentlyWatching || INITIAL_BLOG_DATA.currentlyWatching,
          reviews: parsed.reviews || INITIAL_BLOG_DATA.reviews,
          upcomingGames: parsed.upcomingGames && parsed.upcomingGames.length > 0 ? parsed.upcomingGames : INITIAL_BLOG_DATA.upcomingGames,
          upcomingShows: parsed.upcomingShows && parsed.upcomingShows.length > 0 ? parsed.upcomingShows : INITIAL_BLOG_DATA.upcomingShows,
          upcomingMovies: parsed.upcomingMovies && parsed.upcomingMovies.length > 0 ? parsed.upcomingMovies : INITIAL_BLOG_DATA.upcomingMovies,
        };
      } catch (e) {
        console.error("Failed to parse saved blog data", e);
      }
    }

    // Programmatically cleanse any reviews, games, or movies matching Cyberpunk or Spider-Man
    const cleanReviews = (loadedData.reviews || []).filter((rev) => {
      const gTitle = (rev.gameTitle || "").toLowerCase();
      const title = (rev.title || "").toLowerCase();
      return !gTitle.includes("cyberpunk") && !gTitle.includes("spider-man") &&
             !title.includes("cyberpunk") && !title.includes("spider-man");
    });

    const cleanUpcomingMovies = (loadedData.upcomingMovies || []).filter((item) => {
      const title = (item.title || "").toLowerCase();
      return !title.includes("cyberpunk") && !title.includes("spider-man");
    });

    const cleanUpcomingGames = (loadedData.upcomingGames || []).filter((item) => {
      const title = (item.title || "").toLowerCase();
      return !title.includes("cyberpunk") && !title.includes("spider-man");
    });

    return {
      ...loadedData,
      reviews: cleanReviews,
      upcomingMovies: cleanUpcomingMovies,
      upcomingGames: cleanUpcomingGames,
    };
  });

  // Mascot Color Presets & State for "Loud Cool Kid"
  const MASCOT_PRESETS = [
    { id: 'cherry', name: 'Cherry 🍒', liquid: '#ef4444', highlight: '#f87171', shadow: '#991b1b', handle: '#0284c7', shine: '#38bdf8' },
    { id: 'blueberry', name: 'Blueberry 🧊', liquid: '#3b82f6', highlight: '#60a5fa', shadow: '#1d4ed8', handle: '#eab308', shine: '#fef08a' },
    { id: 'lime', name: 'Lime 🍋', liquid: '#10b981', highlight: '#34d399', shadow: '#047857', handle: '#ec4899', shine: '#f472b6' },
    { id: 'grape', name: 'Grape 🍇', liquid: '#8b5cf6', highlight: '#a78bfa', shadow: '#5b21b6', handle: '#10b981', shine: '#34d399' },
    { id: 'orange', name: 'Orange 🍊', liquid: '#f97316', highlight: '#fb923c', shadow: '#c2410c', handle: '#06b6d4', shine: '#22d3ee' },
  ];

  const [selectedPresetId, setSelectedPresetId] = useState('cherry');
  const [customMascot, setCustomMascot] = useState({
    liquidColor: '#ef4444',
    highlightColor: '#f87171',
    shadowColor: '#991b1b',
    handleColor: '#0284c7',
    handleShineColor: '#38bdf8',
  });

  const handleSelectPreset = (id: string) => {
    const found = MASCOT_PRESETS.find(p => p.id === id);
    if (found) {
      setSelectedPresetId(id);
      setCustomMascot({
        liquidColor: found.liquid,
        highlightColor: found.highlight,
        shadowColor: found.shadow,
        handleColor: found.handle,
        handleShineColor: found.shine,
      });
    }
  };

  // Section / Navigation States
  const [activeSection, setActiveSection] = useState<'reviews' | 'upcoming-games' | 'upcoming-shows' | 'upcoming-movies'>('reviews');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<('game' | 'movie' | 'show')[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Search & Generator States
  const [userInput, setUserInput] = useState('');
  const [searchCategory, setSearchCategory] = useState<'game' | 'movie' | 'show'>('game');
  const [newReviewCategory, setNewReviewCategory] = useState<'game' | 'movie' | 'show'>('game');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSubmittingBacklog, setIsSubmittingBacklog] = useState(false);

  // Local Search state for Done Reviews
  const [reviewsSearchQuery, setReviewsSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');

  // Search & Add states for Upcoming sections
  const [upcomingQuery, setUpcomingQuery] = useState('');
  const [isSearchingUpcoming, setIsSearchingUpcoming] = useState(false);
  const [upcomingPreview, setUpcomingPreview] = useState<UpcomingItem | null>(null);
  const [upcomingNote, setUpcomingNote] = useState('');

  // List pagination display limits (only show 5 at a time)
  const [reviewsLimit, setReviewsLimit] = useState(5);
  const [backlogLimit, setBacklogLimit] = useState(5);

  // Highlight Engine state
  const [rects, setRects] = useState<Rect[]>([]);
  const [uiState, setUiState] = useState<UIState>('IDLE');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [selectionText, setSelectionText] = useState('');

  // Admin Hub Form States
  const [currentMediaMode, setCurrentMediaMode] = useState<'playing' | 'watching'>('playing');
  const [editPlaying, setEditPlaying] = useState<GameStatus>({ ...blogData.currentlyPlaying });
  const [editWatching, setEditWatching] = useState<GameStatus>({ ...blogData.currentlyWatching });
  const [newReview, setNewReview] = useState<{ title: string; gameTitle: string; rating: string; summary: string; paragraphs: string }>({
    title: '', gameTitle: '', rating: '4.8/5', summary: '', paragraphs: ''
  });
  const [newBacklog, setNewBacklog] = useState<{ title: string; platform: string; rating: string; status: 'Completed' | 'Playing' | 'Backlog' | 'Abandoned'; quickReview: string }>({
    title: '', platform: '', rating: '4.5/5', status: 'Completed', quickReview: ''
  });
  const [newVideo, setNewVideo] = useState<{ title: string; gameTitle: string; platform: string; duration: string; embedUrl: string; description: string }>({
    title: '', gameTitle: '', platform: 'YouTube', duration: '10:00', embedUrl: '', description: ''
  });

  const uiStateRef = useRef(uiState);
  uiStateRef.current = uiState;
  const selectionTextRef = useRef(selectionText);
  selectionTextRef.current = selectionText;

  // Persist State Helper
  const saveBlogData = (newData: BlogData) => {
    setBlogData(newData);
    localStorage.setItem('kool_aid_blog_data_v2', JSON.stringify(newData));
  };

  // Sync programmatically cleansed blogData to localStorage on mount
  useEffect(() => {
    localStorage.setItem('kool_aid_blog_data_v2', JSON.stringify(blogData));
  }, []);

  // Sync editPlaying form state
  useEffect(() => {
    setEditPlaying({ ...blogData.currentlyPlaying });
  }, [blogData.currentlyPlaying]);

  // Sync editWatching form state
  useEffect(() => {
    setEditWatching({ ...blogData.currentlyWatching });
  }, [blogData.currentlyWatching]);

  // Admin: Generate a custom game review on demand
  const handleGenerateReview = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    let queryToUse = userInput.trim();
    if (!queryToUse) return; // Do not randomize online searches
    
    let categoryToUse: 'game' | 'movie' | 'show' = searchCategory;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/blog/search-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToUse, category: categoryToUse })
      });
      const data = await response.json();
      
      if (data.title) {
        const newPost: BlogReview = {
          id: 'gen_' + Date.now(),
          title: data.reviewTitle || `My Thoughts on ${data.title}`,
          gameTitle: data.title,
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          rating: data.rating || '4.5/5',
          summary: data.reviewSummary || data.synopsis,
          paragraphs: data.reviewParagraphs || [data.synopsis],
          imageUrl: data.imageUrl || undefined,
          category: data.category || 'game'
        };

        const updatedReviews = [newPost, ...blogData.reviews];
        const updatedData: BlogData = {
          ...blogData,
          reviews: updatedReviews
        };

        saveBlogData(updatedData);

        setSelectedReviewId(newPost.id);
        setActiveSection('reviews');
        setUserInput('');
      }
    } catch (err) {
      console.error("Failed to generate custom game review", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Randomize among ALREADY DONE reviews
  const handleRandomDoneReview = () => {
    const reviews = blogData.reviews || [];
    if (reviews.length === 0) {
      alert("No done reviews yet! Add one first.");
      return;
    }
    const randomIndex = Math.floor(Math.random() * reviews.length);
    setSelectedReviewId(reviews[randomIndex].id);
  };

  // Search upcoming items via the Gemini endpoint
  const handleSearchUpcoming = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryToUse = upcomingQuery.trim();
    if (!queryToUse) return;

    setIsSearchingUpcoming(true);
    setUpcomingPreview(null);
    setUpcomingNote('');
    
    let categoryToUse: 'game' | 'movie' | 'show' = 'game';
    if (activeSection === 'upcoming-shows') categoryToUse = 'show';
    else if (activeSection === 'upcoming-movies') categoryToUse = 'movie';

    try {
      const response = await fetch('/api/blog/search-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToUse, category: categoryToUse })
      });
      const data = await response.json();
      
      if (data.title) {
        let parsedRT = '92%';
        if (data.rating) {
          const numMatch = data.rating.match(/([\d.]+)/);
          if (numMatch) {
            const val = parseFloat(numMatch[1]);
            if (val <= 5) parsedRT = Math.round((val / 5) * 100) + '%';
            else if (val <= 10) parsedRT = Math.round((val / 10) * 100) + '%';
            else if (val <= 100) parsedRT = Math.round(val) + '%';
          }
        }
        setUpcomingPreview({
          id: 'up_temp',
          title: data.title,
          category: data.category || categoryToUse,
          releaseYear: data.releaseYear || 'N/A',
          genres: data.genres || 'N/A',
          platforms: data.platforms || 'N/A',
          synopsis: data.synopsis || 'N/A',
          imageUrl: data.imageUrl || undefined,
          developer: data.developer || 'N/A',
          hypeScore: data.rating || '9.0/10',
          rottenTomatoes: parsedRT
        });
      } else {
        alert("Could not find any results for that title. Try another search!");
      }
    } catch (err) {
      console.error("Failed to search upcoming item:", err);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearchingUpcoming(false);
    }
  };

  // Add search preview item to upcoming arrays
  const handleAddUpcomingItem = () => {
    if (!upcomingPreview) return;

    const newItem: UpcomingItem = {
      id: 'up_' + Date.now(),
      title: upcomingPreview.title,
      category: upcomingPreview.category,
      releaseYear: upcomingPreview.releaseYear,
      genres: upcomingPreview.genres,
      platforms: upcomingPreview.platforms,
      synopsis: upcomingPreview.synopsis,
      imageUrl: upcomingPreview.imageUrl,
      developer: upcomingPreview.developer,
      hypeScore: upcomingPreview.hypeScore,
      rottenTomatoes: upcomingPreview.rottenTomatoes,
      notes: upcomingNote.trim() || undefined
    };

    let updated: BlogData;
    if (activeSection === 'upcoming-games') {
      updated = {
        ...blogData,
        upcomingGames: [newItem, ...(blogData.upcomingGames || [])]
      };
    } else if (activeSection === 'upcoming-shows') {
      updated = {
        ...blogData,
        upcomingShows: [newItem, ...(blogData.upcomingShows || [])]
      };
    } else {
      updated = {
        ...blogData,
        upcomingMovies: [newItem, ...(blogData.upcomingMovies || [])]
      };
    }

    saveBlogData(updated);
    setUpcomingPreview(null);
    setUpcomingQuery('');
    setUpcomingNote('');
  };

  // Delete upcoming item
  const handleDeleteUpcomingItem = (id: string, cat: 'upcoming-games' | 'upcoming-shows' | 'upcoming-movies') => {
    if (!confirm("Remove this upcoming item?")) return;
    let updated: BlogData;
    if (cat === 'upcoming-games') {
      updated = {
        ...blogData,
        upcomingGames: (blogData.upcomingGames || []).filter(item => item.id !== id)
      };
    } else if (cat === 'upcoming-shows') {
      updated = {
        ...blogData,
        upcomingShows: (blogData.upcomingShows || []).filter(item => item.id !== id)
      };
    } else {
      updated = {
        ...blogData,
        upcomingMovies: (blogData.upcomingMovies || []).filter(item => item.id !== id)
      };
    }
    saveBlogData(updated);
  };

  // Interactive Reading Mode disabled per user request
  const showTooltip = false;

  // Admin Event Handlers
  const handleUpdateCurrentlyPlaying = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlaying.title.trim()) return;

    setIsPinning(true);
    let finalTitle = editPlaying.title;
    let finalImageUrl = editPlaying.imageUrl || '';

    try {
      const response = await fetch('/api/blog/search-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: editPlaying.title, category: 'game' })
      });
      const data = await response.json();
      if (data.title) {
        finalTitle = data.title;
        finalImageUrl = data.imageUrl || finalImageUrl;
      }
    } catch (err) {
      console.error("Auto-fetch failed during currently playing update:", err);
    } finally {
      setIsPinning(false);
    }

    const updated: BlogData = {
      ...blogData,
      currentlyPlaying: {
        ...editPlaying,
        title: finalTitle,
        imageUrl: finalImageUrl
      }
    };
    saveBlogData(updated);
    alert(`Successfully updated and verified currently playing game as "${finalTitle}"!`);
  };

  const handleUpdateCurrentlyWatching = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWatching.title.trim()) return;

    setIsPinning(true);
    let finalTitle = editWatching.title;
    let finalImageUrl = editWatching.imageUrl || '';

    try {
      const response = await fetch('/api/blog/search-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: editWatching.title, category: 'show' })
      });
      const data = await response.json();
      if (data.title) {
        finalTitle = data.title;
        finalImageUrl = data.imageUrl || finalImageUrl;
      }
    } catch (err) {
      console.error("Auto-fetch failed during currently watching update:", err);
    } finally {
      setIsPinning(false);
    }

    const updated: BlogData = {
      ...blogData,
      currentlyWatching: {
        ...editWatching,
        title: finalTitle,
        imageUrl: finalImageUrl
      }
    };
    saveBlogData(updated);
    alert(`Successfully updated and verified currently watching media as "${finalTitle}"!`);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.title || !newReview.gameTitle) return;

    setIsSubmittingReview(true);
    let finalGameTitle = newReview.gameTitle;
    let finalImageUrl = undefined;
    let finalSummary = newReview.summary;
    let finalCategory: 'game' | 'movie' | 'show' = newReviewCategory;

    try {
      const response = await fetch('/api/blog/search-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newReview.gameTitle, category: newReviewCategory })
      });
      const data = await response.json();
      if (data.title) {
        finalGameTitle = data.title;
        finalImageUrl = data.imageUrl || undefined;
        finalCategory = data.category || newReviewCategory;
        if (!finalSummary) finalSummary = data.reviewSummary || data.synopsis || '';
      }
    } catch (err) {
      console.error("Auto-fetch failed during review submit:", err);
    } finally {
      setIsSubmittingReview(false);
    }

    const reviewItem: BlogReview = {
      id: 'rev_' + Date.now(),
      title: newReview.title,
      gameTitle: finalGameTitle,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      rating: newReview.rating,
      summary: finalSummary || "A deep retro review essay.",
      paragraphs: newReview.paragraphs.split('\n\n').filter(p => p.trim()),
      imageUrl: finalImageUrl,
      category: finalCategory
    };

    const updated: BlogData = {
      ...blogData,
      reviews: [reviewItem, ...blogData.reviews]
    };
    saveBlogData(updated);

    setNewReview({ title: '', gameTitle: '', rating: '4.8/5', summary: '', paragraphs: '' });
    setSelectedReviewId(reviewItem.id);
    setActiveSection('reviews');
    alert(`Successfully verified and added review essay for "${finalGameTitle}"!`);
  };

  const handleAddBacklog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBacklog.title || !newBacklog.platform) return;

    setIsSubmittingBacklog(true);
    let finalTitle = newBacklog.title;
    let finalPlatform = newBacklog.platform;
    let finalQuickReview = newBacklog.quickReview;
    let finalImageUrl = undefined;

    try {
      const response = await fetch('/api/blog/search-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newBacklog.title, category: 'game' })
      });
      const data = await response.json();
      if (data.title) {
        finalTitle = data.title;
        finalPlatform = data.platforms ? data.platforms.split(',')[0].trim() : finalPlatform;
        finalImageUrl = data.imageUrl || undefined;
        if (!finalQuickReview) finalQuickReview = data.reviewSummary || data.synopsis || '';
      }
    } catch (err) {
      console.error("Auto-fetch failed during backlog submit:", err);
    } finally {
      setIsSubmittingBacklog(false);
    }

    const backlogItem: BacklogGame & { imageUrl?: string } = {
      id: 'back_' + Date.now(),
      title: finalTitle,
      platform: finalPlatform,
      rating: newBacklog.rating,
      status: newBacklog.status,
      quickReview: finalQuickReview || "Gameplay fully logged.",
      imageUrl: finalImageUrl
    };

    const updated: BlogData = {
      ...blogData,
      backlog: [backlogItem, ...blogData.backlog]
    };
    saveBlogData(updated);

    setNewBacklog({ title: '', platform: '', rating: '4.5/5', status: 'Completed', quickReview: '' });
    alert(`Successfully verified and logged previous gameplay for "${finalTitle}"!`);
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title || !newVideo.gameTitle) return;

    const videoItem: VideoReview = {
      id: 'vid_' + Date.now(),
      title: newVideo.title,
      gameTitle: newVideo.gameTitle,
      platform: newVideo.platform,
      duration: newVideo.duration,
      embedUrl: newVideo.embedUrl,
      description: newVideo.description
    };

    const updated: BlogData = {
      ...blogData,
      videos: [videoItem, ...blogData.videos]
    };
    saveBlogData(updated);
    setNewVideo({ title: '', gameTitle: '', platform: 'YouTube', duration: '10:00', embedUrl: '', description: '' });
    alert("Added video review essay!");
  };

  const handleDeleteReview = (id: string) => {
    if (!confirm("Delete this review?")) return;
    const updated: BlogData = {
      ...blogData,
      reviews: blogData.reviews.filter(r => r.id !== id)
    };
    saveBlogData(updated);
    if (selectedReviewId === id) setSelectedReviewId(null);
  };

  const handleDeleteBacklog = (id: string) => {
    const updated: BlogData = {
      ...blogData,
      backlog: blogData.backlog.filter(b => b.id !== id)
    };
    saveBlogData(updated);
  };

  const handleDeleteVideo = (id: string) => {
    const updated: BlogData = {
      ...blogData,
      videos: blogData.videos.filter(v => v.id !== id)
    };
    saveBlogData(updated);
  };

  const handleResetData = () => {
    if (confirm("Reset blog data back to factory defaults?")) {
      saveBlogData(INITIAL_BLOG_DATA);
      setSelectedReviewId(null);
      alert("Reset complete.");
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "https://www.youtube.com/embed/dQw4w9WgXcQ";
    try {
      let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      let match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    } catch (e) {}
    return "https://www.youtube.com/embed/dQw4w9WgXcQ";
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-stone-100 font-sans antialiased py-6 px-3 sm:px-4 md:px-6">
      
      <div className="max-w-[900px] mx-auto bg-[#ce2029] border-4 border-stone-950 rounded-[2.5rem] p-5 sm:p-8 md:p-10 flex flex-col gap-8 shadow-[12px_12px_0px_0px_#09090b] relative overflow-hidden">
        {/* Shiny retro plastic-y gloss reflection across the cartridge/console box */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-white/10 z-20 pointer-events-none" />
        
        {/* 1. TOP HEADER BRAND - "LOUD COOL KID" */}
        <header className="flex flex-col gap-5 bg-[#FCF6E5] border-3 border-stone-950 p-5 rounded-3xl shadow-[6px_6px_0px_0px_#09090b] select-none text-stone-900 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4">
              <KoolAidMascot 
                className="w-12 h-12 md:w-16 md:h-16"
                liquidColor={customMascot.liquidColor}
                highlightColor={customMascot.highlightColor}
                shadowColor={customMascot.shadowColor}
                handleColor={customMascot.handleColor}
                handleShineColor={customMascot.handleShineColor}
              />
              <h1 
                className="text-2xl md:text-4xl font-pressstart font-bold tracking-wider uppercase transition-colors"
                style={{
                  color: '#FCF6E5', // Buttery warm cream-beige-white
                  textShadow: '3px 3px 0px #09090b, -3px -3px 0px #09090b, 3px -3px 0px #09090b, -3px 3px 0px #09090b, 0px 3px 0px #09090b, 0px -3px 0px #09090b, 3px 0px 0px #09090b, -3px 0px 0px #09090b, 6px 6px 0px #ef4444',
                }}
              >
                <ScrambleText text="KOOL-AIDE" />
              </h1>
            </div>
            
            <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest text-center md:text-right mt-1 font-bold">
              EST. 2026 // 2D PIXEL JOURNAL
            </div>
          </div>

          {/* Interactive Mascot Color Mixer (2D Minimal Retro Bar) */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs bg-white border-2 border-stone-950 p-3 rounded-xl shadow-[3px_3px_0px_0px_#09090b]">
            <span className="font-pressstart text-[8px] text-stone-500 mr-2 uppercase tracking-tight">Mix Loud Kid Colors:</span>
            <div className="flex flex-wrap gap-2">
              {MASCOT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`px-3 py-1.5 rounded-lg border-2 text-[9px] font-pressstart uppercase transition-all duration-150 cursor-pointer ${
                    selectedPresetId === preset.id 
                      ? 'border-stone-950 text-stone-950 bg-stone-100 shadow-[1px_1px_0px_0px_#000]' 
                      : 'border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 bg-white'
                  }`}
                >
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)]" style={{ backgroundColor: preset.liquid }} />
                  {preset.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </header>
        
        {/* 2. DUAL MEDIA HERO SECTION ("WHAT I'M PLAYING & WATCHING") */}
        {(() => {
          const activeItem = currentMediaMode === 'playing' ? blogData.currentlyPlaying : blogData.currentlyWatching;
          const activeTheme = getGameTheme(activeItem.title);
          const isPlaying = currentMediaMode === 'playing';

          return (
            <div className="flex flex-col gap-4">
              {/* Sliding Tactical Shader Switch */}
              <div className="flex justify-center md:justify-start">
                <div className="relative flex items-center bg-stone-900 border-3 border-stone-950 rounded-2xl p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-12 w-64 select-none">
                  {/* Left Half: Playing */}
                  <button 
                    onClick={() => setCurrentMediaMode('playing')}
                    className={`flex-1 text-center font-mono text-[10px] font-black z-10 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      isPlaying ? 'text-white' : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4" />
                    PLAYING
                  </button>

                  {/* Right Half: Watching */}
                  <button 
                    onClick={() => setCurrentMediaMode('watching')}
                    className={`flex-1 text-center font-mono text-[10px] font-black z-10 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      !isPlaying ? 'text-white' : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    <Tv className="w-4 h-4" />
                    WATCHING
                  </button>

                  {/* Tactile Slidable Shader Thumb with Grab Handlers */}
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 120 }}
                    dragElastic={0.05}
                    dragMomentum={false}
                    animate={{ x: isPlaying ? 2 : 122 }}
                    onDragEnd={(event, info) => {
                      if (isPlaying && info.offset.x > 30) {
                        setCurrentMediaMode('watching');
                      } else if (!isPlaying && info.offset.x < -30) {
                        setCurrentMediaMode('playing');
                      }
                    }}
                    className="absolute left-1 w-28 h-8 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 border-2 border-stone-950 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[2px_2px_0px_#000] z-20"
                    title="Slide to switch mode!"
                  >
                    {/* Retro ridges */}
                    <div className="flex gap-1">
                      <div className="w-1 h-3.5 bg-stone-950/40 rounded-full" />
                      <div className="w-1 h-3.5 bg-stone-950/40 rounded-full" />
                      <div className="w-1 h-3.5 bg-stone-950/40 rounded-full" />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* The Hero Display Board */}
              <section 
                style={{
                  ...activeTheme.bgStyle,
                  backgroundSize: '200% 200%',
                  borderColor: activeTheme.accentColorRaw,
                  boxShadow: `6px 6px 0px 0px ${activeTheme.accentColorRaw}`,
                }}
                className="group relative overflow-hidden border-2 rounded-2xl min-h-[240px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 select-none transition-all duration-700 bg-[position:0%_0%] hover:bg-[position:100%_100%]"
              >
                {/* Dynamic atmospheric overlay */}
                {activeTheme.ambientOverlay}

                {/* Cover background with vivid gradients */}
                {activeItem.imageUrl && (
                  <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
                    <img 
                      src={activeItem.imageUrl} 
                      alt="Poster Background" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-[0.68] filter saturate-[1.25] contrast-[1.05] transition-all duration-700 group-hover:scale-105 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:opacity-[0.78]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/55 to-white/10" />
                  </div>
                )}

                {/* Left: Text Details */}
                <div className="relative z-10 flex-1 flex flex-col gap-3.5 w-full">
                  <div className="flex items-center gap-3">
                    <div 
                      style={{ borderColor: `${activeTheme.accentColorRaw}33`, color: activeTheme.accentColorRaw, backgroundColor: `${activeTheme.accentColorRaw}10` }}
                      className="p-1.5 border rounded-lg shrink-0"
                    >
                      {isPlaying ? (
                        <Gamepad2 className="w-5 h-5" />
                      ) : (
                        <Tv className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono uppercase tracking-widest font-black block" style={{ color: activeTheme.accentColorRaw }}>
                          {isPlaying ? "CURRENTLY PLAYING" : "CURRENTLY WATCHING"}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeTheme.accentColorRaw }} />
                      </div>
                      <h2 style={{ color: activeTheme.accentColorRaw }} className={`font-black text-2xl md:text-3xl uppercase mt-0.5 tracking-tight ${activeTheme.headingFont}`}>
                        {activeItem.title}
                      </h2>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                    <div 
                      className="flex items-center gap-2 font-mono text-[11px] border-b pb-0.5"
                      style={{ borderColor: `${activeTheme.accentColorRaw}22` }}
                    >
                      <span className="font-bold opacity-75" style={{ color: activeTheme.accentColorRaw }}>
                        {isPlaying ? "PLATFORM:" : "STREAMING ON:"}
                      </span>
                      <span className="font-bold tracking-wide uppercase" style={{ color: activeTheme.accentColorRaw }}>{activeItem.platform}</span>
                    </div>
                    {activeItem.hours && (
                      <div 
                        className="flex items-center gap-2 font-mono text-[11px] border-b pb-0.5"
                        style={{ borderColor: `${activeTheme.accentColorRaw}22` }}
                      >
                        <span className="font-bold opacity-75" style={{ color: activeTheme.accentColorRaw }}>
                          {isPlaying ? "TIME INVESTED:" : "PROGRESS:"}
                        </span>
                        <span className="font-bold tracking-wide uppercase" style={{ color: activeTheme.accentColorRaw }}>{activeItem.hours}</span>
                      </div>
                    )}
                    {activeItem.rating && (
                      <div 
                        className="flex items-center gap-2 font-mono text-[11px] border-b pb-0.5"
                        style={{ borderColor: `${activeTheme.accentColorRaw}22` }}
                      >
                        <span className="font-bold opacity-75" style={{ color: activeTheme.accentColorRaw }}>SCORE:</span>
                        <span className="font-bold tracking-wide uppercase" style={{ color: activeTheme.accentColorRaw }}>{activeItem.rating}</span>
                      </div>
                    )}
                    
                    <span 
                      className="font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 border rounded-full font-bold"
                      style={{ borderColor: `${activeTheme.accentColorRaw}22`, color: activeTheme.accentColorRaw, backgroundColor: `${activeTheme.accentColorRaw}0d` }}
                    >
                      {activeTheme.themeName}
                    </span>
                  </div>

                  {activeItem.note && (
                    <p 
                      className={`text-xs leading-relaxed max-w-xl select-text border-l-2 pl-3 mt-1 italic ${activeTheme.bodyFont}`}
                      style={{ borderLeftColor: activeTheme.accentColorRaw, color: activeTheme.accentColorRaw }}
                    >
                      "{activeItem.note}"
                    </p>
                  )}
                </div>

                {/* Right: Sharp Vertical Cover Poster */}
                {activeItem.imageUrl && (
                  <div 
                    className="relative z-10 shrink-0 w-28 sm:w-32 md:w-36 aspect-[2/3] overflow-hidden border-2 rounded-xl select-none bg-stone-100 self-center md:self-auto hover:rotate-1 hover:scale-102 transition-all duration-300"
                    style={{
                      borderColor: activeTheme.accentColorRaw,
                      boxShadow: `4px 4px 0px 0px ${activeTheme.accentColorRaw}`
                    }}
                  >
                    <img 
                      src={activeItem.imageUrl} 
                      alt={`${activeItem.title} cover`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter saturate-[1.25] contrast-[1.05]"
                    />
                  </div>
                )}
              </section>
            </div>
          );
        })()}

        {/* ADMIN MANAGEMENT HUB (When active) */}
        <AnimatePresence>
          {showAdmin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-zinc-950 border-4 border-zinc-800 p-5 text-zinc-100 overflow-hidden font-sans shadow-[6px_6px_0px_0px_#EF4444]"
            >
              <div className="border-b-2 border-zinc-800 pb-3 mb-5">
                <h3 className="font-display font-bold text-lg text-[#EF4444] uppercase flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#EF4444]" />
                  Control Desk
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Manage reviews, logs, previously played games, or reset default data.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Add review form */}
                <div className="bg-zinc-900/40 p-4 border-2 border-zinc-800 flex flex-col gap-3">
                  <span className="font-mono text-xs font-bold text-white uppercase block border-b border-zinc-800 pb-1.5">1. Write a Deep Review Essay</span>
                  <form onSubmit={handleAddReview} className="flex flex-col gap-2">
                    <input 
                      placeholder="Article Title (e.g. Balatro: The Poker)" 
                      value={newReview.title} 
                      onChange={e => setNewReview({...newReview, title: e.target.value})}
                      className="w-full text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                      required
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input 
                        placeholder="Title (e.g. Ted Lasso)" 
                        value={newReview.gameTitle} 
                        onChange={e => setNewReview({...newReview, gameTitle: e.target.value})}
                        className="col-span-1 text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                        required
                      />
                      <select
                        value={newReviewCategory}
                        onChange={e => setNewReviewCategory(e.target.value as any)}
                        className="col-span-1 text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444] cursor-pointer"
                      >
                        <option value="game">Game 🎮</option>
                        <option value="movie">Movie 🎬</option>
                        <option value="show">TV Show 📺</option>
                      </select>
                      <input 
                        placeholder="Score (e.g. 4.8/5)" 
                        value={newReview.rating} 
                        onChange={e => setNewReview({...newReview, rating: e.target.value})}
                        className="col-span-1 text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                        required
                      />
                    </div>
                    <input 
                      placeholder="One Sentence Synopsis" 
                      value={newReview.summary} 
                      onChange={e => setNewReview({...newReview, summary: e.target.value})}
                      className="w-full text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                    />
                    <textarea 
                      placeholder="Deep review paragraphs..." 
                      rows={4}
                      value={newReview.paragraphs} 
                      onChange={e => setNewReview({...newReview, paragraphs: e.target.value})}
                      className="w-full text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444] resize-none"
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmittingReview || !newReview.gameTitle.trim()}
                      className="w-full py-1.5 bg-[#EF4444] hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold uppercase transition-colors cursor-pointer border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-1.5"
                    >
                      {isSubmittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {isSubmittingReview ? "Verifying & Fetching..." : "Publish Essay"}
                    </button>
                    <p className="text-[10px] text-zinc-500 font-mono text-center select-none">
                      Auto-corrects title & grabs cover artwork via OMDB/Game Brain on submit.
                    </p>
                  </form>
                </div>

                {/* Add previously played / backlog game form */}
                <div className="bg-zinc-900/40 p-4 border-2 border-zinc-800 flex flex-col gap-3">
                  <span className="font-mono text-xs font-bold text-white uppercase block border-b border-zinc-800 pb-1.5">2. Log Previously Played Game</span>
                  <form onSubmit={handleAddBacklog} className="flex flex-col gap-2">
                    <input 
                      placeholder="Game Title (e.g. Cyberpunk 2077)" 
                      value={newBacklog.title} 
                      onChange={e => setNewBacklog({...newBacklog, title: e.target.value})}
                      className="w-full text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        placeholder="Platform (e.g. PS5)" 
                        value={newBacklog.platform} 
                        onChange={e => setNewBacklog({...newBacklog, platform: e.target.value})}
                        className="text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                        required
                      />
                      <input 
                        placeholder="Rating (e.g. 4.5/5)" 
                        value={newBacklog.rating} 
                        onChange={e => setNewBacklog({...newBacklog, rating: e.target.value})}
                        className="text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                        required
                      />
                    </div>
                    <select 
                      value={newBacklog.status} 
                      onChange={e => setNewBacklog({...newBacklog, status: e.target.value as any})}
                      className="w-full text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Playing">Playing</option>
                      <option value="Backlog">Backlog</option>
                      <option value="Abandoned">Abandoned</option>
                    </select>
                    <input 
                      placeholder="Quick micro hot-take review..." 
                      value={newBacklog.quickReview} 
                      onChange={e => setNewBacklog({...newBacklog, quickReview: e.target.value})}
                      className="w-full text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmittingBacklog || !newBacklog.title.trim()}
                      className="w-full py-1.5 bg-[#EF4444] hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold uppercase transition-colors cursor-pointer border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-1.5"
                    >
                      {isSubmittingBacklog && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {isSubmittingBacklog ? "Verifying & Fetching..." : "Log Game Entry"}
                    </button>
                    <p className="text-[10px] text-zinc-500 font-mono text-center select-none">
                      Auto-corrects game name & grabs cover artwork via live API on submit.
                    </p>
                  </form>
                </div>

                {/* Update Playing & Watching Form */}
                <div className="bg-zinc-900/40 p-4 border-2 border-zinc-800 flex flex-col gap-3">
                  <span className="font-mono text-xs font-bold text-white uppercase block border-b border-zinc-800 pb-1.5">3. Update Active Media</span>
                  
                  {/* Small switcher inside admin for Playing vs Watching */}
                  <div className="flex gap-1 p-0.5 bg-black border border-zinc-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setCurrentMediaMode('playing')}
                      className={`flex-1 text-center py-1 font-mono text-[9px] font-bold rounded ${
                        currentMediaMode === 'playing' ? 'bg-[#EF4444] text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      🎮 PLAYING
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMediaMode('watching')}
                      className={`flex-1 text-center py-1 font-mono text-[9px] font-bold rounded ${
                        currentMediaMode === 'watching' ? 'bg-[#EF4444] text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      📺 WATCHING
                    </button>
                  </div>

                  {currentMediaMode === 'playing' ? (
                    <form onSubmit={handleUpdateCurrentlyPlaying} className="flex flex-col gap-2">
                      <input 
                        placeholder="Game Title (e.g. Final Fantasy VII Remake)" 
                        value={editPlaying.title} 
                        onChange={e => setEditPlaying({...editPlaying, title: e.target.value})}
                        className="w-full text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          placeholder="Platform (e.g. PS5)" 
                          value={editPlaying.platform} 
                          onChange={e => setEditPlaying({...editPlaying, platform: e.target.value})}
                          className="text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                          required
                        />
                        <input 
                          placeholder="Rating (e.g. 4.8/5)" 
                          value={editPlaying.rating || ''} 
                          onChange={e => setEditPlaying({...editPlaying, rating: e.target.value})}
                          className="text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          placeholder="Hours (e.g. 45 hrs)" 
                          value={editPlaying.hours || ''} 
                          onChange={e => setEditPlaying({...editPlaying, hours: e.target.value})}
                          className="text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                        />
                        <input 
                          placeholder="Image URL (Optional)" 
                          value={editPlaying.imageUrl || ''} 
                          onChange={e => setEditPlaying({...editPlaying, imageUrl: e.target.value})}
                          className="text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                        />
                      </div>
                      <input 
                        placeholder="A short hot-take note..." 
                        value={editPlaying.note || ''} 
                        onChange={e => setEditPlaying({...editPlaying, note: e.target.value})}
                        className="w-full text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                      />
                      <button 
                        type="submit" 
                        disabled={isPinning || !editPlaying.title.trim()}
                        className="w-full py-1.5 bg-[#EF4444] hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 border-2 border-black shadow-[2px_2px_0px_#000]"
                      >
                        {isPinning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isPinning ? "Verifying Title & Cover..." : "Update Playing"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleUpdateCurrentlyWatching} className="flex flex-col gap-2">
                      <input 
                        placeholder="Movie or Show Title (e.g. Severance)" 
                        value={editWatching.title} 
                        onChange={e => setEditWatching({...editWatching, title: e.target.value})}
                        className="w-full text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          placeholder="Platform (e.g. Apple TV+)" 
                          value={editWatching.platform} 
                          onChange={e => setEditWatching({...editWatching, platform: e.target.value})}
                          className="text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                          required
                        />
                        <input 
                          placeholder="Rating (e.g. 9.0/10)" 
                          value={editWatching.rating || ''} 
                          onChange={e => setEditWatching({...editWatching, rating: e.target.value})}
                          className="text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          placeholder="Episodes/Progress (e.g. S2 Ep4)" 
                          value={editWatching.hours || ''} 
                          onChange={e => setEditWatching({...editWatching, hours: e.target.value})}
                          className="text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                        />
                        <input 
                          placeholder="Image URL (Optional)" 
                          value={editWatching.imageUrl || ''} 
                          onChange={e => setEditWatching({...editWatching, imageUrl: e.target.value})}
                          className="text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                        />
                      </div>
                      <input 
                        placeholder="A short review snippet..." 
                        value={editWatching.note || ''} 
                        onChange={e => setEditWatching({...editWatching, note: e.target.value})}
                        className="w-full text-xs font-mono p-1.5 border-2 border-zinc-800 bg-black text-white focus:outline-none focus:border-[#EF4444]"
                      />
                      <button 
                        type="submit" 
                        disabled={isPinning || !editWatching.title.trim()}
                        className="w-full py-1.5 bg-[#EF4444] hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 border-2 border-black shadow-[2px_2px_0px_#000]"
                      >
                        {isPinning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isPinning ? "Verifying Title & Poster..." : "Update Watching"}
                      </button>
                    </form>
                  )}
                  <p className="text-[10px] text-zinc-500 font-mono text-center select-none">
                    Queries live API to correct title/game name and download official high-res poster artwork.
                  </p>
                </div>

              </div>

              {/* Reset defaults button */}
              <div className="border-t-2 border-zinc-800 mt-4 pt-3 flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-500 font-bold">SYSTEM STABLE // LOCAL PREVIEW</span>
                <button 
                  onClick={handleResetData}
                  className="px-3 py-1 border-2 border-zinc-800 text-red-400 hover:bg-zinc-900 font-mono text-[10px] font-bold rounded cursor-pointer transition-colors shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  Factory Reset Data
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DONE REVIEWS REGULAR SEARCH FORM (PLACED ABOVE NAVIGATION TABS) */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedSearchQuery(reviewsSearchQuery);
            setActiveSection('reviews');
            setSelectedReviewId(null);
          }}
          className="flex flex-col sm:flex-row gap-3 items-center w-full bg-stone-900 border-3 border-stone-950 rounded-3xl p-4 shadow-[6px_6px_0px_0px_#09090b]"
        >
          <div className="relative flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-500 transition-colors duration-300 group-hover:text-[#ef4444] group-focus-within:text-[#ef4444] pointer-events-none z-10" />
              <input 
                placeholder="Search done reviews by title, content, or genre..." 
                value={reviewsSearchQuery}
                onChange={e => setReviewsSearchQuery(e.target.value)}
                className="w-full text-xs font-mono pl-10 pr-4 py-3 bg-white border-2 border-stone-300 rounded-xl text-stone-900 placeholder-stone-500 focus:outline-none focus:ring-0 transition-all duration-150 hover:bg-stone-50 hover:border-stone-400 focus:bg-white focus:border-[#ef4444]"
              />
            </div>

            {/* Filter Button (Three Dots) with Popover Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`p-3 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-center bg-white border-stone-300 hover:border-stone-450 ${isFilterDropdownOpen ? 'text-[#ef4444] border-[#ef4444] bg-red-50' : 'text-stone-700 hover:text-stone-900'} active:translate-x-[1px] active:translate-y-[1px]`}
                title="Filters"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {/* Dropdown Menu */}
              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-3 border-stone-950 rounded-2xl shadow-[6px_6px_0px_0px_#09090b] p-3.5 z-30 flex flex-col gap-2">
                  <span className="font-pressstart text-[7px] text-stone-400 uppercase tracking-wider block border-b border-stone-200 pb-1.5 mb-1 select-none">Filter By:</span>
                  {[
                    { id: 'game', label: 'Games 🎮' },
                    { id: 'movie', label: 'Movies 🎬' },
                    { id: 'show', label: 'TV Shows 📺' }
                  ].map(category => {
                    const isChecked = selectedFilters.includes(category.id as any);
                    return (
                      <label
                        key={category.id}
                        className="flex items-center gap-2.5 px-1 py-1 hover:bg-stone-100 rounded-lg cursor-pointer text-xs font-mono text-stone-700 hover:text-stone-950 select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedFilters(selectedFilters.filter(f => f !== category.id));
                            } else {
                              setSelectedFilters([...selectedFilters, category.id as any]);
                            }
                          }}
                          className="rounded border-stone-300 text-red-600 bg-white focus:ring-0 cursor-pointer accent-red-600 w-3.5 h-3.5"
                        />
                        {category.label}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-3 border-3 text-[10px] font-pressstart uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-[#ef4444] border-stone-950 text-black shadow-[4px_4px_0px_0px_#09090b] hover:border-blue-600 hover:shadow-[4px_4px_0px_0px_#2563eb]"
            >
              🔍 Search
            </button>

            {(appliedSearchQuery || reviewsSearchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setReviewsSearchQuery('');
                  setAppliedSearchQuery('');
                }}
                className="px-4 py-3 border-3 text-[10px] font-pressstart uppercase tracking-wider rounded-xl transition-all cursor-pointer bg-white border-stone-950 text-stone-900 shadow-[4px_4px_0px_0px_#09090b] hover:bg-stone-100"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                handleRandomDoneReview();
                setActiveSection('reviews');
              }}
              className="flex-1 sm:flex-none px-5 py-3 border-3 text-[10px] font-pressstart uppercase tracking-wider rounded-xl shrink-0 transition-all cursor-pointer flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-[#FCF6E5] border-stone-950 text-stone-900 shadow-[4px_4px_0px_0px_#09090b] hover:border-blue-600 hover:shadow-[4px_4px_0px_0px_#2563eb]"
            >
              🎲 Surprise
            </button>
          </div>
        </form>

        {/* 3. CLEAN SECTIONS NAVIGATION TABS (STYLISH 2D COZY RETRO TABS) */}
        <nav className="flex select-none flex-wrap md:flex-nowrap gap-3.5 text-sm mt-4 overflow-x-auto pb-2">
          <button
            onClick={() => { setActiveSection('reviews'); setSelectedReviewId(null); }}
            style={{
              backgroundColor: activeSection === 'reviews' ? customMascot.liquidColor : '#1c1917',
              borderColor: '#09090b',
            }}
            className={`px-4 py-3.5 font-display font-black text-[10px] uppercase tracking-wider border-3 rounded-2xl transition-all cursor-pointer shadow-[4px_4px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 shrink-0 ${
              activeSection === 'reviews' 
                ? 'text-white' 
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            📚 Done Reviews ({blogData.reviews.length})
          </button>
          
          <button
            onClick={() => { setActiveSection('upcoming-games'); setSelectedReviewId(null); }}
            style={{
              backgroundColor: activeSection === 'upcoming-games' ? customMascot.liquidColor : '#1c1917',
              borderColor: '#09090b',
            }}
            className={`px-4 py-3.5 font-display font-black text-[10px] uppercase tracking-wider border-3 rounded-2xl transition-all cursor-pointer shadow-[4px_4px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 shrink-0 ${
              activeSection === 'upcoming-games' 
                ? 'text-white' 
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            🎮 Upcoming Games ({(blogData.upcomingGames || []).length})
          </button>

          <button
            onClick={() => { setActiveSection('upcoming-shows'); setSelectedReviewId(null); }}
            style={{
              backgroundColor: activeSection === 'upcoming-shows' ? customMascot.liquidColor : '#1c1917',
              borderColor: '#09090b',
            }}
            className={`px-4 py-3.5 font-display font-black text-[10px] uppercase tracking-wider border-3 rounded-2xl transition-all cursor-pointer shadow-[4px_4px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 shrink-0 ${
              activeSection === 'upcoming-shows' 
                ? 'text-white' 
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            📺 Upcoming Shows ({(blogData.upcomingShows || []).length})
          </button>

          <button
            onClick={() => { setActiveSection('upcoming-movies'); setSelectedReviewId(null); }}
            style={{
              backgroundColor: activeSection === 'upcoming-movies' ? customMascot.liquidColor : '#1c1917',
              borderColor: '#09090b',
            }}
            className={`px-4 py-3.5 font-display font-black text-[10px] uppercase tracking-wider border-3 rounded-2xl transition-all cursor-pointer shadow-[4px_4px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 shrink-0 ${
              activeSection === 'upcoming-movies' 
                ? 'text-white' 
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            🎬 Upcoming Movies ({(blogData.upcomingMovies || []).length})
          </button>
        </nav>

        {/* 4. MAIN INTERACTIVE CONTENT FEED */}
        <main className="min-h-[400px]">
          
          {/* SECTION A: JOE'S REVIEWS */}
          {activeSection === 'reviews' && (
            <div className="flex flex-col gap-6">
              
              <AnimatePresence mode="wait">
                {!selectedReviewId ? (
                  
                  /* REVIEWS LIST VIEWS (CLEAN PUBLICATION GRID) */
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 gap-6"
                  >
                    {/* Instant review generator search bar (Only visible to admin) */}
                    {showAdmin && (
                      <div className="bg-[#FCF6E5] border-3 border-stone-950 rounded-3xl p-5 flex flex-col gap-4 shadow-[6px_6px_0px_0px_#09090b] hover:shadow-[6px_6px_0px_0px_#facc15] hover:border-yellow-400 text-stone-900 transition-all duration-300">
                        <span className="font-pressstart text-[8px] text-[#ef4444] block select-none uppercase tracking-widest">
                          AI Review Essay Generator (Admin Only)
                        </span>
                        <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
                          <div className="relative w-full flex items-center gap-2">
                            <div className="relative flex-1 group">
                              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-500 transition-colors duration-300 group-hover:text-[#ef4444] group-focus-within:text-[#ef4444] pointer-events-none z-10" />
                              <input 
                                placeholder="Write a game, movie, or show title to write an AI review essay..." 
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleGenerateReview()}
                                className="w-full text-xs font-mono pl-10 pr-4 py-3 bg-white border-2 border-stone-300 rounded-xl text-stone-900 placeholder-stone-500 focus:outline-none focus:ring-0 transition-all duration-150 hover:bg-stone-50 hover:border-stone-400 focus:bg-white focus:border-[#ef4444]"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => handleGenerateReview()}
                            disabled={isGenerating || !userInput.trim()}
                            className="w-full sm:w-auto px-6 py-3 border-3 text-[10px] font-pressstart uppercase tracking-widest rounded-xl shrink-0 transition-all cursor-pointer flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed bg-[#ef4444] border-stone-950 text-black shadow-[4px_4px_0px_0px_#09090b] hover:border-blue-600 hover:shadow-[4px_4px_0px_0px_#2563eb] hover:bg-[#ef4444]"
                          >
                            {isGenerating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-black text-black" />
                            )}
                            <span className="text-black">
                              {isGenerating ? "GENERATING" : "PLAY"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Done Reviews List Container */}

                    {(() => {
                      const filteredReviews = blogData.reviews.filter(rev => {
                        if (selectedFilters.length > 0 && !selectedFilters.includes(rev.category || 'game')) {
                          return false;
                        }
                        if (appliedSearchQuery.trim()) {
                          const q = appliedSearchQuery.toLowerCase();
                          const matchesTitle = rev.title?.toLowerCase().includes(q);
                          const matchesGameTitle = rev.gameTitle?.toLowerCase().includes(q);
                          const matchesSummary = rev.summary?.toLowerCase().includes(q);
                          const matchesPara = rev.paragraphs?.some(p => p.toLowerCase().includes(q));
                          return matchesTitle || matchesGameTitle || matchesSummary || matchesPara;
                        }
                        return true;
                      });

                      if (filteredReviews.length === 0) {
                        return (
                          <div className="bg-stone-950/40 border border-stone-800 rounded-3xl p-12 text-center shadow-sm select-none">
                            <span className="font-mono text-xs text-stone-500 block mb-2 font-bold uppercase">NO MATCHING REVIEWS FOUND</span>
                            <p className="font-sans text-stone-400 italic">"Try typing a different keyword or category, or click clear to show all reviews!"</p>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-5">
                          {filteredReviews.slice(0, reviewsLimit).map((rev, idx) => {
                            const theme = getGameTheme(rev.gameTitle);
                            
                            // Beautiful, bright 2D sticker shadows that surround the red floating card!
                            const stickerColors = [
                              '#facc15', // Neon Yellow
                              '#38bdf8', // Neon Blue
                              '#4ade80', // Neon Green
                              '#f87171', // Neon Red
                              '#c084fc', // Grape Purple
                              '#fb923c', // Electric Orange
                              '#22d3ee', // Cyan Spark
                            ];
                            const shadowColor = stickerColors[idx % stickerColors.length];
                            
                            // Alternate rotations slightly to look completely mixed/scattered all over the background!
                            const rotations = [
                              'rotate-[-1.2deg] hover:rotate-[0.5deg]',
                              'rotate-[1deg] hover:rotate-[-0.5deg]',
                              'rotate-[-0.8deg] hover:rotate-[1deg]',
                              'rotate-[1.2deg] hover:rotate-[-1.2deg]',
                              'rotate-[-0.5deg] hover:rotate-[0.8deg]',
                              'rotate-[0.7deg] hover:rotate-[-0.7deg]',
                            ];
                            const rotationClass = rotations[idx % rotations.length];

                            return (
                              <article 
                                key={rev.id}
                                onClick={() => setSelectedReviewId(rev.id)}
                                className={`group border-3 rounded-2xl p-6 transition-all duration-700 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_#000] bg-[position:0%_0%] hover:bg-[position:100%_100%] ${rotationClass}`}
                                style={{
                                  ...theme.bgStyle,
                                  backgroundSize: '200% 200%',
                                  borderColor: theme.accentColorRaw,
                                  '--accent-color': theme.accentColorRaw,
                                  boxShadow: `6px 6px 0px 0px ${theme.accentColorRaw}`,
                                } as React.CSSProperties}
                              >
                                {/* Dynamic atmospheric overlay */}
                                {theme.ambientOverlay}

                                {/* Poster background for the card */}
                                {rev.imageUrl && (
                                  <div className="absolute inset-0 z-0 select-none pointer-events-none transition-all duration-700 group-hover:scale-105 group-hover:translate-x-1 group-hover:translate-y-1">
                                    <img 
                                      src={rev.imageUrl} 
                                      alt={`${rev.gameTitle} Poster`} 
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover opacity-[0.68] filter saturate-[1.25] contrast-[1.05] transition-all duration-700 group-hover:opacity-[0.78]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/55 to-white/10 pointer-events-none z-0" />
                                  </div>
                                )}

                                <div className="flex flex-col md:flex-row gap-5 items-center md:items-start flex-1 w-full z-10">
                                  {/* Crisp Retro 2D Poster Thumbnail Cover */}
                                  {rev.imageUrl && (
                                    <div 
                                      className="shrink-0 w-20 h-28 md:w-24 md:h-32 border-2 rounded-xl overflow-hidden bg-white select-none relative group-hover:rotate-1 transition-all duration-300"
                                      style={{
                                        borderColor: theme.accentColorRaw,
                                        boxShadow: `3px 3px 0px 0px ${theme.accentColorRaw}`
                                      }}
                                    >
                                      <img 
                                        src={rev.imageUrl} 
                                        alt={rev.gameTitle} 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover saturate-[1.25] contrast-[1.05]"
                                      />
                                    </div>
                                  )}

                                  <div className="flex-1 flex flex-col gap-2 min-w-0 w-full text-left">
                                    <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono select-none">
                                      <span className="uppercase flex items-center gap-1 font-bold" style={{ color: theme.accentColorRaw }}>
                                        <Calendar className="w-3 h-3" style={{ color: theme.accentColorRaw }} />
                                        {rev.date}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-lg font-bold uppercase border-2" style={{ color: theme.accentColorRaw, backgroundColor: `${theme.accentColorRaw}0d`, borderColor: theme.accentColorRaw }}>
                                        {rev.category === 'movie' ? '🎬 MOVIE' : rev.category === 'show' ? '📺 SHOW' : '🎮 GAME'}: {rev.gameTitle}
                                      </span>
                                      <span className="font-bold opacity-75 uppercase tracking-wider" style={{ color: theme.accentColorRaw }}>
                                        {theme.themeName.split(" // ")[0]}
                                      </span>
                                    </div>
                                    <h3 className={`font-black text-xl md:text-2xl transition-colors uppercase leading-tight ${theme.headingFont}`} style={{ color: theme.accentColorRaw }}>
                                      {rev.title}
                                    </h3>
                                    <p className={`text-xs font-medium leading-relaxed max-w-2xl line-clamp-2 italic ${theme.bodyFont}`} style={{ color: theme.accentColorRaw }}>
                                      "{rev.summary}"
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 self-end md:self-auto shrink-0 relative z-10 select-none">
                                  <span 
                                    className="border-2 rounded-xl text-[11px] font-mono font-black px-3 py-1.5 flex items-center gap-1 transition-all"
                                    style={{ 
                                      color: theme.accentColorRaw,
                                      backgroundColor: `${theme.accentColorRaw}0d`,
                                      borderColor: theme.accentColorRaw,
                                      boxShadow: `2px 2px 0px 0px ${theme.accentColorRaw}33`
                                    }}
                                  >
                                    <Award className="w-3.5 h-3.5 animate-bounce" style={{ color: theme.accentColorRaw }} />
                                    {rev.rating}
                                  </span>
                                  {showAdmin && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteReview(rev.id); }}
                                      className="p-1.5 border-2 border-stone-900 text-stone-700 hover:text-red-500 hover:border-red-500 bg-white cursor-pointer rounded-lg shadow-[2px_2px_0px_0px_#1c1917] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                                      title="Delete post"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </article>
                            );
                          })}

                          {filteredReviews.length > 5 && (
                            <div className="flex justify-center gap-4 mt-2">
                              {filteredReviews.length > reviewsLimit && (
                                <button
                                  onClick={() => setReviewsLimit((prev) => prev + 5)}
                                  className="px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-800 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1c1917] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none border-2 border-stone-900"
                                >
                                  Load Older Reviews (+5)
                                </button>
                              )}
                              {reviewsLimit > 5 && (
                                <button
                                  onClick={() => setReviewsLimit(5)}
                                  className="px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-500 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1c1917] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none border-2 border-stone-900"
                                >
                                  Collapse List
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* GAMEPLAY LOG & BACKLOG GRID */}
                    {blogData.backlog && blogData.backlog.length > 0 && (
                      <div className="mt-8 border-t-2 border-stone-800 pt-8">
                        <div className="flex items-center gap-2 mb-4 select-none">
                          <CheckCircle className="w-4 h-4" style={{ color: customMascot.liquidColor }} />
                          <h4 className="font-display font-black text-sm uppercase tracking-wider text-stone-100">Logged Previous Gameplays ({blogData.backlog.length})</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {blogData.backlog.slice(0, backlogLimit).map((game: any, idx: number) => {
                            // Beautiful colorful shadows for backlog items as well!
                            const stickerColors = [
                              '#4ade80', // Neon Green
                              '#fb923c', // Electric Orange
                              '#facc15', // Neon Yellow
                              '#38bdf8', // Neon Blue
                              '#c084fc', // Grape Purple
                            ];
                            const shadowColor = stickerColors[idx % stickerColors.length];
                            
                            // Slight alternating rotation for backlog stickers
                            const rotations = [
                              'rotate-[1deg] hover:rotate-0',
                              'rotate-[-0.8deg] hover:rotate-0',
                              'rotate-[0.5deg] hover:rotate-[1deg]',
                              'rotate-[-1.2deg] hover:rotate-[-0.5deg]',
                            ];
                            const rotationClass = rotations[idx % rotations.length];

                            return (
                              <div 
                                key={game.id}
                                onClick={() => setSelectedReviewId(game.title)}
                                className={`group bg-white border-3 border-stone-950 rounded-xl p-4 transition-all cursor-pointer flex gap-4 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none relative overflow-hidden ${rotationClass}`}
                                style={{
                                  boxShadow: `4px 4px 0px 0px ${shadowColor}`,
                                }}
                              >
                              {game.imageUrl && (
                                <div className="w-12 h-16 shrink-0 bg-stone-100 border-2 border-stone-900 rounded-lg overflow-hidden relative">
                                  <img 
                                    src={game.imageUrl} 
                                    alt={game.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                    referrerPolicy="no-referrer" 
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-mono text-[8px] bg-stone-100 px-1.5 py-0.5 border-2 border-stone-900 text-[#D06F52] font-black uppercase rounded-lg truncate max-w-[120px]">
                                    {game.platform}
                                  </span>
                                  <span className="font-mono text-[9px] text-[#D06F52] font-bold shrink-0">
                                    {game.rating}
                                  </span>
                                </div>
                                <h5 className="font-display font-black text-sm text-stone-900 group-hover:text-[#D06F52] transition-colors truncate">
                                  {game.title}
                                </h5>
                                <p className="font-sans text-[11px] text-stone-500 line-clamp-1 italic mt-1">
                                  "{game.quickReview}"
                                </p>
                              </div>
                              {showAdmin && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteBacklog(game.id); }}
                                  className="absolute right-2 bottom-2 p-1 border-2 border-stone-900 text-stone-700 hover:text-red-500 hover:border-red-500 bg-white cursor-pointer rounded-md z-10 shadow-[1px_1px_0px_0px_#1c1917] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                                >
                                  <Trash className="w-3 h-3" />
                                </button>
                              )}
                              </div>
                            );
                          })}
                        </div>

                        {blogData.backlog.length > 5 && (
                          <div className="flex justify-center gap-4 mt-6">
                            {blogData.backlog.length > backlogLimit && (
                              <button
                                onClick={() => setBacklogLimit((prev) => prev + 5)}
                                className="px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-800 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1c1917] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none border-2 border-stone-900"
                              >
                                Load More Gameplays (+5)
                              </button>
                            )}
                            {backlogLimit > 5 && (
                              <button
                                onClick={() => setBacklogLimit(5)}
                                className="px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-500 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1c1917] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none border-2 border-stone-900"
                              >
                                Collapse List
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* SINGLE REVIEW READER DISPLAY (EXQUISITELY SIMPLE & CLEAN ARTICLE VIEW) */
                  (() => {
                    const finalRev = blogData.reviews.find(r => r.id === selectedReviewId) ||
                                 blogData.reviews.find(r => r.gameTitle.toLowerCase() === selectedReviewId.toLowerCase());
                    
                    if (!finalRev) return null;
                    const theme = getGameTheme(finalRev.gameTitle);

                    return (
                      <motion.article
                        key="detail"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        style={{
                          ...theme.bgStyle,
                        }}
                        className="relative overflow-hidden border-2 border-stone-900 rounded-3xl p-6 md:p-10 flex flex-col gap-6 min-h-[500px] transition-all duration-500 shadow-[6px_6px_0px_0px_#1c1917]"
                      >
                        {/* Dynamic atmospheric overlay */}
                        {theme.ambientOverlay}

                        {/* Game poster background for the review and all of that */}
                        {finalRev.imageUrl && (
                          <div className="absolute inset-0 z-0 select-none pointer-events-none">
                            <img 
                              src={finalRev.imageUrl} 
                              alt={`${finalRev.gameTitle} Poster`} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover opacity-[0.68] filter saturate-[1.25] contrast-[1.05]"
                            />
                            {/* Gradient wash to ensure readability on left side */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/55 to-white/10 pointer-events-none z-0" />
                          </div>
                        )}

                        <div className="relative z-10 flex flex-col gap-6 w-full">
                          <button
                            onClick={() => setSelectedReviewId(null)}
                            style={{
                              color: theme.accentColorRaw,
                              backgroundColor: `${theme.accentColorRaw}0d`,
                              borderColor: theme.accentColorRaw,
                              boxShadow: `2px 2px 0px 0px ${theme.accentColorRaw}33`
                            }}
                            className="self-start flex items-center gap-1.5 font-sans text-[11px] font-bold cursor-pointer border-2 rounded-xl px-4 py-2 transition-all hover:opacity-90 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" style={{ color: theme.accentColorRaw }} /> Back to Reviews
                          </button>

                          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start border-b pb-6" style={{ borderBottomColor: `${theme.accentColorRaw}25` }}>
                            {finalRev.imageUrl && (
                              <div 
                                className="shrink-0 w-28 h-40 md:w-36 md:h-52 border-2 rounded-2xl overflow-hidden bg-white select-none relative rotate-[-1.5deg] hover:rotate-0 transition-all duration-300"
                                style={{
                                  borderColor: theme.accentColorRaw,
                                  boxShadow: `4px 4px 0px 0px ${theme.accentColorRaw}`
                                }}
                              >
                                <img 
                                  src={finalRev.imageUrl} 
                                  alt={finalRev.gameTitle} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover saturate-[1.25] contrast-[1.05]"
                                />
                              </div>
                            )}

                            <div className="flex-1 flex flex-col gap-3 text-center md:text-left">
                              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap select-none text-[10px] font-mono">
                                <span className="uppercase flex items-center gap-1 font-bold" style={{ color: theme.accentColorRaw }}>
                                  <Calendar className="w-3 h-3" style={{ color: theme.accentColorRaw }} />
                                  {finalRev.date}
                                </span>
                                <span 
                                  className="px-2 py-0.5 rounded-lg font-bold uppercase border-2"
                                  style={{ 
                                    color: theme.accentColorRaw,
                                    borderColor: theme.accentColorRaw,
                                    backgroundColor: `${theme.accentColorRaw}0d`
                                  }}
                                >
                                  {finalRev.category === 'movie' ? '🎬 MOVIE' : finalRev.category === 'show' ? '📺 SHOW' : '🎮 GAME'}: {finalRev.gameTitle}
                                </span>
                                <span 
                                  className="px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 uppercase border-2"
                                  style={{
                                    color: theme.accentColorRaw,
                                    borderColor: theme.accentColorRaw,
                                    backgroundColor: `${theme.accentColorRaw}0d`
                                  }}
                                >
                                  <Award className="w-3 h-3" style={{ color: theme.accentColorRaw }} /> Score {finalRev.rating}
                                </span>
                                
                                <span 
                                  className="opacity-75 uppercase tracking-wider font-bold"
                                  style={{ color: theme.accentColorRaw }}
                                >
                                  {theme.themeName}
                                </span>
                              </div>
                              
                              <h2 
                                className={`font-black text-3xl md:text-4xl leading-tight uppercase tracking-tight ${theme.headingFont}`}
                                style={{ color: theme.accentColorRaw }}
                              >
                                {finalRev.title}
                              </h2>
                            </div>
                          </div>

                          {/* Distraction-free Summary panel */}
                          <div 
                            className={`p-4 border-2 rounded-xl text-xs italic leading-relaxed ${theme.bodyFont}`}
                            style={{ 
                              borderLeftWidth: '6px', 
                              borderLeftColor: theme.accentColorRaw,
                              borderColor: theme.accentColorRaw,
                              color: theme.accentColorRaw,
                              backgroundColor: `${theme.accentColorRaw}0d`,
                              boxShadow: `2px 2px 0px 0px ${theme.accentColorRaw}33`
                            }}
                          >
                            <span className="font-mono text-[8px] uppercase font-black block mb-1" style={{ color: theme.accentColorRaw }}>QUICK SYNOPSIS</span>
                            "{finalRev.summary}"
                          </div>

                          {/* Interactive highlights warning */}
                          <div 
                            className="p-3 text-[10px] font-sans leading-relaxed border-2 rounded-xl flex items-center gap-2 select-none"
                            style={{
                              borderColor: theme.accentColorRaw,
                              color: theme.accentColorRaw,
                              backgroundColor: `${theme.accentColorRaw}05`
                            }}
                          >
                            <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" style={{ color: theme.accentColorRaw }} />
                            <span className={`font-medium ${theme.bodyFont}`}>Double-click or drag-highlight any word/phrase in the essay below to trigger the dynamic cozy wiki search!</span>
                          </div>

                          {/* Beautifully centered clean typewriter paragraphs */}
                          <div 
                            className={`flex flex-col gap-4 select-text border-t pt-6 text-[15px] leading-relaxed ${theme.bodyFont}`}
                            style={{ 
                              borderTopColor: `${theme.accentColorRaw}33`,
                              color: theme.accentColorRaw 
                            }}
                          >
                            {finalRev.paragraphs.map((p, index) => (
                              <p key={index} className="text-justify mb-2 leading-relaxed whitespace-pre-line">
                                {p}
                              </p>
                            ))}
                          </div>

                          <div 
                            className="border-t pt-5 flex justify-between items-center font-mono text-[9px] text-stone-400 select-none mt-4 font-bold"
                            style={{ borderTopColor: `${theme.accentColorRaw}15` }}
                          >
                            <span>WRITTEN BY JOE // COZY BLOGGER</span>
                            <span style={{ color: theme.accentColorRaw }}>COZY PRESS v2.5 // {theme.themeName.split(" // ")[0]}</span>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })()
                )}
              </AnimatePresence>

            </div>
          )}

          {/* UPCOMING SECTIONS: GAMES, SHOWS, MOVIES */}
          {['upcoming-games', 'upcoming-shows', 'upcoming-movies'].includes(activeSection) && (
            <section className="bg-stone-900 border-3 border-stone-950 rounded-3xl p-6 flex flex-col gap-6 text-stone-100 shadow-[6px_6px_0px_0px_#09090b]">
              
              <div className="flex items-center gap-3 border-b-2 border-stone-800 pb-4 select-none">
                <div className="p-2 bg-stone-950 border-2 border-stone-800 shrink-0 shadow-[2px_2px_0px_0px_#000] rounded-xl">
                  {activeSection === 'upcoming-games' ? (
                    <span className="text-xl">🎮</span>
                  ) : activeSection === 'upcoming-shows' ? (
                    <span className="text-xl">📺</span>
                  ) : (
                    <span className="text-xl">🎬</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-stone-400 tracking-wider block uppercase font-bold">WATCHLIST & WISHLIST</span>
                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-stone-100">
                    {activeSection === 'upcoming-games' ? "Up and Coming Games" : activeSection === 'upcoming-shows' ? "Up and Coming TV Shows" : "Up and Coming Movies"}
                  </h3>
                </div>
              </div>

              {/* SEARCH CONTAINER */}
              <div className="bg-[#FCF6E5] border-3 border-stone-950 rounded-3xl p-5 flex flex-col gap-4 shadow-[6px_6px_0px_0px_#09090b] hover:shadow-[6px_6px_0px_0px_#facc15] hover:border-yellow-400 text-stone-900 transition-all duration-300">
                <span className="font-pressstart text-[8px] text-[#ef4444] block select-none uppercase tracking-widest">
                  Search & Track Upcoming {activeSection === 'upcoming-games' ? 'Games' : activeSection === 'upcoming-shows' ? 'Shows' : 'Movies'}
                </span>
                
                <form onSubmit={handleSearchUpcoming} className="flex flex-col sm:flex-row gap-3 items-center w-full">
                  <div className="relative w-full flex items-center gap-2">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-500 transition-colors duration-300 group-hover:text-[#ef4444] group-focus-within:text-[#ef4444] pointer-events-none z-10" />
                      <input 
                        placeholder={
                          activeSection === 'upcoming-games' 
                            ? "Search an upcoming game (e.g. GTA VI, Metroid Prime 4)..." 
                            : activeSection === 'upcoming-shows' 
                            ? "Search an upcoming TV show (e.g. Severance Season 2, Stranger Things 5)..." 
                            : "Search an upcoming movie (e.g. Dune Part 3, Batman Part II)..."
                        }
                        value={upcomingQuery}
                        onChange={e => setUpcomingQuery(e.target.value)}
                        className="w-full text-xs font-mono pl-10 pr-4 py-3 bg-white border-2 border-stone-300 rounded-xl text-stone-900 placeholder-stone-500 focus:outline-none focus:ring-0 transition-all duration-150 hover:bg-stone-50 hover:border-stone-400 focus:bg-white focus:border-[#ef4444]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSearchingUpcoming || !upcomingQuery.trim()}
                    className="w-full sm:w-auto px-6 py-3 border-3 text-[10px] font-pressstart uppercase tracking-widest rounded-xl shrink-0 transition-all cursor-pointer flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed bg-[#ef4444] border-stone-950 text-black shadow-[4px_4px_0px_0px_#09090b] hover:border-blue-600 hover:shadow-[4px_4px_0px_0px_#2563eb] hover:bg-[#ef4444]"
                  >
                    {isSearchingUpcoming ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-black text-black" />
                    )}
                    <span className="text-black">
                      {isSearchingUpcoming ? "SEARCHING" : "PLAY"}
                    </span>
                  </button>
                </form>
              </div>

              {/* RETRO LOADER */}
              {isSearchingUpcoming && (
                <div className="flex flex-col items-center justify-center p-8 border-3 border-stone-950 rounded-3xl bg-[#FCF6E5] shadow-[6px_6px_0px_0px_#09090b]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#ef4444] mb-3" />
                  <span className="font-mono text-xs font-bold text-stone-700 uppercase tracking-widest animate-pulse">Sifting Through Timelines...</span>
                </div>
              )}

              {/* FOUND SPOTLIGHT PREVIEW */}
              {upcomingPreview && (
                <div className="bg-white text-stone-900 border-3 border-stone-950 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#09090b] flex flex-col md:flex-row gap-6 relative overflow-hidden">
                  {upcomingPreview.imageUrl && (
                    <div className="w-28 h-40 shrink-0 border-2 border-stone-950 rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_#000] self-center md:self-start">
                      <img 
                        src={upcomingPreview.imageUrl} 
                        alt={upcomingPreview.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover saturate-[1.25] contrast-[1.05]"
                      />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div>
                        <span className="text-[9px] font-mono font-bold uppercase text-[#D06F52] bg-stone-100 px-2 py-0.5 border-2 border-stone-950 rounded-lg">
                          RELEASE: {upcomingPreview.releaseYear}
                        </span>
                        <h4 className="font-display font-black text-lg md:text-xl uppercase mt-1 leading-tight">{upcomingPreview.title}</h4>
                      </div>
                      {activeSection !== 'upcoming-games' && (
                        <div className="bg-red-50 border-2 border-red-200 px-3 py-1 rounded-xl shadow-[2px_2px_0px_0px_#EF4444] text-xs font-mono font-bold text-red-600 flex items-center gap-1 select-none">
                          🍅 {upcomingPreview.rottenTomatoes || '92%'}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-stone-600">
                      <div><strong className="text-stone-900 uppercase">Creator:</strong> {upcomingPreview.developer}</div>
                      <div><strong className="text-stone-900 uppercase">Genre:</strong> {upcomingPreview.genres}</div>
                      <div className="col-span-2"><strong className="text-stone-900 uppercase">Platforms/Cast:</strong> {upcomingPreview.platforms}</div>
                    </div>

                    <p className="text-xs font-sans text-stone-500 leading-relaxed italic border-l-3 border-[#D06F52] pl-3 py-1 bg-stone-50">
                      "{upcomingPreview.synopsis}"
                    </p>

                    {/* HYPE NOTE TEXTAREA */}
                    <div className="mt-2 flex flex-col gap-1">
                      <label className="text-[10px] font-mono font-black uppercase text-stone-500">My Personal Hype Notes (Optional):</label>
                      <textarea
                        placeholder="e.g. S1 was incredibly mind-bending, can't wait for S2! Pre-ordered and cleared my schedule."
                        value={upcomingNote}
                        onChange={e => setUpcomingNote(e.target.value)}
                        rows={2}
                        className="w-full text-xs font-mono p-2.5 border-2 border-stone-950 bg-stone-50 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#ef4444]"
                      />
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={handleAddUpcomingItem}
                        className="px-5 py-2.5 bg-[#ef4444] border-3 border-stone-950 text-black text-[10px] font-pressstart uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-[4px_4px_0px_0px_#09090b] hover:border-blue-600 hover:shadow-[4px_4px_0px_0px_#2563eb] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                      >
                        ADD TO UPCOMING 🚀
                      </button>
                      <button
                        onClick={() => setUpcomingPreview(null)}
                        className="px-5 py-2.5 bg-white border-3 border-stone-950 text-stone-800 text-[10px] font-pressstart uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-[4px_4px_0px_0px_#09090b] hover:bg-stone-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* LIST OF UPCOMING WATCHLIST ITEMS */}
              {(() => {
                const currentList = activeSection === 'upcoming-games' 
                  ? (blogData.upcomingGames || []) 
                  : activeSection === 'upcoming-shows' 
                  ? (blogData.upcomingShows || []) 
                  : (blogData.upcomingMovies || []);

                if (currentList.length === 0) return null;

                return (
                  <div className="mt-4 border-t-2 border-stone-800 pt-6">
                    <span className="font-mono text-xs font-bold text-stone-300 uppercase block mb-4 select-none">
                      My Live Upcoming List ({currentList.length})
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentList.map((item, idx) => {
                        const stickerColors = [
                          '#facc15', // Neon Yellow
                          '#38bdf8', // Neon Blue
                          '#4ade80', // Neon Green
                          '#f87171', // Neon Red
                          '#c084fc', // Grape Purple
                          '#fb923c', // Electric Orange
                        ];
                        const shadowColor = stickerColors[idx % stickerColors.length];

                        const rotations = [
                          'rotate-[-0.8deg] hover:rotate-[0.5deg]',
                          'rotate-[0.7deg] hover:rotate-[-0.5deg]',
                          'rotate-[-1.1deg] hover:rotate-[0.8deg]',
                          'rotate-[1.2deg] hover:rotate-[-1.2deg]',
                        ];
                        const rotationClass = rotations[idx % rotations.length];

                        return (
                          <div
                            key={item.id}
                            className={`bg-white text-stone-900 border-3 border-stone-950 rounded-2xl p-5 transition-all relative flex gap-4 ${rotationClass}`}
                            style={{
                              boxShadow: `4px 4px 0px 0px ${shadowColor}`,
                            }}
                          >
                            {item.imageUrl && (
                              <div className="w-16 h-24 shrink-0 border-2 border-stone-950 rounded-lg overflow-hidden bg-stone-100 shadow-[2px_2px_0px_0px_#000]">
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.title} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover saturate-[1.25] contrast-[1.05]"
                                />
                              </div>
                            )}

                            <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-left">
                              <div className="flex items-center justify-between gap-1 select-none">
                                <span className="font-mono text-[8px] font-bold uppercase text-[#D06F52] bg-stone-100 px-1.5 py-0.5 border-2 border-stone-950 rounded-md">
                                  {item.releaseYear}
                                </span>
                                {activeSection !== 'upcoming-games' && (
                                  <span className="font-mono text-[10px] text-red-600 font-black flex items-center gap-1 bg-red-50 border-2 border-red-100 px-2 py-0.5 rounded-full">
                                    🍅 {item.rottenTomatoes || item.hypeScore || '92%'}
                                  </span>
                                )}
                              </div>

                              <h5 className="font-display font-black text-sm text-stone-900 leading-tight uppercase truncate">
                                {item.title}
                              </h5>

                              <div className="text-[10px] font-mono text-stone-500 leading-tight">
                                <span className="block truncate"><strong>By:</strong> {item.developer}</span>
                                <span className="block truncate"><strong>On:</strong> {item.platforms}</span>
                              </div>

                              <p className="font-sans text-[11px] leading-relaxed text-stone-500 line-clamp-2 italic mb-1.5">
                                "{item.synopsis}"
                              </p>

                              {item.notes && (
                                <div className="border-t border-dashed border-stone-300 pt-1.5 mt-1">
                                  <span className="font-mono text-[8px] text-[#D06F52] font-black block select-none uppercase">📝 MY HYPE NOTE</span>
                                  <p className="font-sans text-[11px] text-stone-800 leading-normal bg-[#FCF6E5] p-2 rounded-lg border border-stone-200 mt-1">
                                    {item.notes}
                                  </p>
                                </div>
                              )}

                              {/* DELETE BUTTON - ADMIN ONLY */}
                              {showAdmin && (
                                <button
                                  onClick={() => handleDeleteUpcomingItem(item.id, activeSection as any)}
                                  className="absolute right-3 top-3 p-1 border-2 border-stone-950 text-stone-600 hover:text-red-500 hover:border-red-500 bg-white cursor-pointer rounded-lg shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                                  title="Remove item"
                                >
                                  <Trash className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            </section>
          )}

        </main>

        {/* 5. FOOTER */}
        <footer className="border-t border-stone-200 pt-6 text-center font-mono text-[10px] text-stone-400 select-none flex flex-col gap-1.5 pb-8 font-bold">
          <div className="flex justify-center items-center gap-2 select-text">
            <span>KOOL-AIDE</span>
            <span>•</span>
            <span>All Rights Reserved</span>
            <span>•</span>
            <span>{new Date().getFullYear()}</span>
            <span>•</span>
            <button 
              onClick={() => setShowAdmin(!showAdmin)}
              className="text-[#D06F52] hover:text-[#b75d42] hover:underline cursor-pointer bg-transparent border-none p-0 font-bold font-mono text-[10px] uppercase ml-1"
            >
              [{showAdmin ? "Close Desk" : "Desk"}]
            </button>
          </div>
          <div className="text-[9px] text-stone-400">Powered by Gemini AI Search Grounding & Antigravity Core</div>
        </footer>

      </div>

      {/* FLOATING TEXT HIGHLIGHT WIKI TOOLTIP */}
      <AnimatePresence>
        {showTooltip && (
          <>
            {/* Desktop Overlay Tooltip */}
            <div
              className="fixed hidden sm:flex pointer-events-none z-50 items-start gap-3 transition-transform duration-[50ms]"
              style={{
                left: mousePos.x,
                top: mousePos.y,
                transform: `translate(16px, -110px)`
              }}
            >
              {uiState === 'GENERATING' && (
                <>
                  <PixelArtLoader />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="overflow-hidden pointer-events-none flex flex-col w-[280px] bg-zinc-950 text-white border-4 border-zinc-800 p-4 shadow-2xl"
                  >
                    <div className="pb-3 shrink-0 flex flex-col gap-2">
                      <div className="h-3 bg-zinc-800 rounded w-full animate-pulse"></div>
                      <div className="h-3 bg-zinc-800 rounded w-4/5 animate-pulse"></div>
                    </div>
                    <div className="w-full h-36 bg-zinc-900 rounded animate-pulse border-2 border-zinc-800 flex items-center justify-center">
                      <span className="font-mono text-[8px] text-[#EF4444] font-bold tracking-wider">GENERATING ILLUST...</span>
                    </div>
                  </motion.div>
                </>
              )}
              {uiState === 'DONE' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="overflow-hidden pointer-events-none flex flex-col w-[300px] bg-zinc-950 text-white border-4 border-zinc-800 p-4 shadow-2xl"
                >
                  <div className="pb-2.5 border-b-2 border-zinc-800 mb-2.5 shrink-0">
                    <span className="font-mono text-[8px] text-[#EF4444] font-bold uppercase tracking-widest block mb-0.5">Gamer Dictionary Wiki</span>
                    <span className="font-display font-black text-xs text-white uppercase tracking-wide block mb-1">"{selectionText}"</span>
                    <p className="text-[11px] font-sans text-zinc-300 leading-normal font-normal">
                      {explanation}
                    </p>
                  </div>
                  {imageUrl && (
                    <div className="w-full aspect-[4/3] shrink-0 bg-black flex items-center justify-center overflow-hidden border-2 border-zinc-800">
                      <img 
                        src={imageUrl} 
                        alt="Context art" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Mobile Bottom Sheet Tooltip */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 flex sm:hidden flex-col bg-zinc-950 text-white border-t-4 border-zinc-800 p-5 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] pointer-events-auto"
              style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
            >
              <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mb-4"></div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[8px] text-[#EF4444] font-bold uppercase tracking-wider">Gamer Dictionary Wiki</span>
                <button 
                  onClick={() => { setUiState('IDLE'); setRects([]); setSelectionText(''); }}
                  className="p-1 text-zinc-400 hover:text-[#EF4444] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uiState === 'GENERATING' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="h-3 bg-zinc-800 rounded animate-pulse w-full"></div>
                    <div className="h-3 bg-zinc-800 rounded animate-pulse w-4/5"></div>
                  </div>
                  <div className="w-full h-36 bg-zinc-900 rounded animate-pulse border-2 border-zinc-800 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-[#EF4444] animate-spin" />
                  </div>
                </div>
              )}
              {uiState === 'DONE' && (
                <div className="flex flex-col gap-3">
                  <span className="font-display font-black text-sm text-white uppercase tracking-wide">"{selectionText}"</span>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                    {explanation}
                  </p>
                  {imageUrl && (
                    <div className="w-full h-40 bg-zinc-900 flex items-center justify-center overflow-hidden border-2 border-zinc-800">
                      <img 
                        src={imageUrl} 
                        alt="Context art" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RETRO CRT VIDEO PLAYER MODAL WINDOW */}
      <AnimatePresence>
        {activeVideoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-8 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-[800px] bg-zinc-950 border-4 border-zinc-800 retro-shadow-lg p-4 relative"
            >
              <div className="absolute top-4 right-4 flex flex-col gap-1 items-end z-30">
                <button
                  onClick={() => setActiveVideoUrl(null)}
                  className="px-3 py-1.5 bg-[#EF4444] text-white font-mono text-[10px] font-bold border-2 border-black hover:bg-red-700 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                >
                  CLOSE_CRT
                </button>
              </div>

              <div className="font-mono text-[9px] text-[#EF4444] mb-2.5 uppercase tracking-widest font-bold">
                CRT_MONITOR_SIMULATOR // RETRO_FEED
              </div>

              <div className="w-full aspect-video bg-black border-2 border-zinc-900 crt-lines relative rounded">
                <iframe
                  title="YouTube video player"
                  src={getYoutubeEmbedUrl(activeVideoUrl)}
                  className="w-full h-full border-0 relative z-10"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="mt-3 flex justify-between items-center font-mono text-[9px] text-zinc-500 font-bold">
                <span>CRT FEED STABLE // CHANNEL 01</span>
                <span>VOLUME 100%</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
