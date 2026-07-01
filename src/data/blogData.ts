export interface GameStatus {
  title: string;
  platform: string;
  status: string;
  hours: string;
  rating: string;
  note: string;
  imageUrl?: string;
  reviewParagraphs?: string[];
}

export interface BacklogGame {
  id: string;
  title: string;
  platform: string;
  rating: string;
  status: 'Completed' | 'Playing' | 'Backlog' | 'Abandoned';
  quickReview: string;
}

export interface BlogReview {
  id: string;
  title: string;
  gameTitle: string;
  date: string;
  rating: string;
  summary: string;
  paragraphs: string[];
  imageUrl?: string;
  category?: 'game' | 'movie' | 'show';
}

export interface VideoReview {
  id: string;
  title: string;
  gameTitle: string;
  platform: string;
  duration: string;
  embedUrl: string;
  description: string;
}

export interface UpcomingItem {
  id: string;
  title: string;
  category: 'game' | 'movie' | 'show';
  releaseYear?: string;
  genres?: string;
  platforms?: string; // Consoles for games, Cast for movies/shows
  synopsis?: string;
  imageUrl?: string;
  developer?: string; // Developer for games, Director for movies/shows
  hypeScore?: string; // e.g. "9.8/10"
  rottenTomatoes?: string; // e.g. "97%"
  notes?: string;
}

export interface BlogData {
  currentlyPlaying: GameStatus;
  currentlyWatching: GameStatus;
  backlog: BacklogGame[];
  reviews: BlogReview[];
  videos: VideoReview[];
  upcomingGames: UpcomingItem[];
  upcomingShows: UpcomingItem[];
  upcomingMovies: UpcomingItem[];
}

export const INITIAL_BLOG_DATA: BlogData = {
  currentlyPlaying: {
    title: "Ghost of Tsushima",
    platform: "PlayStation 5 / PC",
    status: "Currently Obsessed",
    hours: "55 hours",
    rating: "4.9/5",
    imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/library_600x900.jpg",
    note: "Exploring the gorgeous island of Tsushima, mastering the dance of wind and steel. The wind mechanic guiding you is incredibly immersive.",
    reviewParagraphs: [
      "Ghost of Tsushima is a beautiful, atmospheric masterpiece that perfectly captures the romanticism of samurai cinema. Jin Sakai's transformation from an honorable samurai to the pragmatically brutal Ghost is written and acted with incredible weight and emotion.",
      "The combat is incredibly fluid, making you feel like a deadly blade master as you parry, dodge, and switch stances to dismantle Mongol encampments. Coupled with a photo mode that is a work of art in itself, every frame of this game is stunning.",
      "A gorgeous, open-world epic that delivers on every front."
    ]
  },
  currentlyWatching: {
    title: "Arcane (Season 2)",
    platform: "Netflix",
    status: "Currently Watching",
    hours: "9 Episodes",
    rating: "5.0/5",
    imageUrl: "https://image.tmdb.org/t/p/w500/or06mS0xyu7vYrBoR86RC76H35v.jpg",
    note: "Absolutely breathtaking animation, complex characters, and a heart-wrenching story that concludes the conflict between Piltover and Zaun with flawless style.",
    reviewParagraphs: [
      "Arcane Season 2 elevates the medium of animation to absolute perfection. Fortiche Production continues to push visual storytelling to heights that feel genuinely revolutionary.",
      "The tragic rift between sisters Vi and Jinx becomes an operatic struggle that affects the entire world, backed by incredible music, pristine voice acting, and some of the best action choreography ever put to screen.",
      "An undisputed masterpiece of video game adaptation and modern science fiction."
    ]
  },
  backlog: [],
  reviews: [
    {
      id: "r2",
      title: "Ted Lasso: A Delightful Masterclass in Warm Optimism and Empathy",
      gameTitle: "Ted Lasso",
      date: "June 20, 2026",
      rating: "4.9/5",
      summary: "A heartfelt, laugh-out-loud comedy that turns a simple sports premise into a powerful study of human kindness and mental health.",
      imageUrl: "https://m.media-amazon.com/images/M/MV5BZmI3YWVhM2UtNDZjMC00YTIzLWI2NGUtZWIxODZkZjVmYTg1XkEyXkFqcGc@._V1_SX300.jpg",
      category: "show",
      paragraphs: [
        "Ted Lasso is exactly the kind of warm, feel-good storytelling the world needs. Jason Sudeikis breathes incredible soul into the titular American coach, whose unwavering belief in people and relentless optimism slowly wins over a cynical English soccer club and its fans.",
        "Beyond the sports comedy, the series is a masterclass in writing emotional intelligence, showcasing healthy friendships, forgiveness, and the courage it takes to confront personal vulnerability. It is hilarious, incredibly touching, and deeply satisfying."
      ]
    },
    {
      id: "r3",
      title: "Final Fantasy VII Remake: A Stunning Reimagination of a Legend",
      gameTitle: "Final Fantasy VII Remake",
      date: "June 15, 2026",
      rating: "4.8/5",
      summary: "A spectacular return to Midgar, masterfully blending tactical real-time combat with deep emotional storytelling.",
      imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1462040/library_600x900.jpg",
      category: "game",
      paragraphs: [
        "Final Fantasy VII Remake does the impossible: it takes one of the most beloved video games of all time and transforms it into a modern, cinematic masterpiece without losing its soul. Midgar is rendered with stunning detail, from the neon-soaked upper plate to the gritty, lived-in slums. The story is expanded in ways that feel both respectful and excitingly unpredictable, breathing new life into Cloud, Tifa, Aerith, and Barret.",
        "The hybrid combat system is a stroke of genius, marrying fast-paced real-time action with the tactical slow-motion of the Active Time Battle (ATB) menu. Switching between party members to exploit elemental weaknesses and execute devastating abilities feels incredibly fluid and satisfying. It is a masterclass in how to modernize a classic."
      ]
    },
    {
      id: "r5",
      title: "Ratchet & Clank: Rift Apart: A Visual and Technical Masterpiece",
      gameTitle: "Ratchet & Clank: Rift Apart",
      date: "June 01, 2026",
      rating: "4.7/5",
      summary: "A joyous, lightning-fast action-platformer that showcases the power of modern SSD technology with seamless rift-hopping.",
      imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1895880/library_600x900.jpg",
      category: "game",
      paragraphs: [
        "Ratchet & Clank: Rift Apart is a dazzling showcase of modern hardware capabilities and pure, unadulterated fun. Insomniac Games has crafted a cinematic adventure that feels like playing a high-budget Pixar movie. The standout feature—seamlessly pulling yourself through dimensional rifts mid-combat—is a technical marvel that keeps the action moving at a breakneck, exhilarating pace with zero loading screens.",
        "The gameplay is as tight and satisfying as ever, featuring an incredibly creative arsenal of weapons like the Pixelizer and the Topiary Sprinkler. Rivet, the new playable Lombax, is a fantastic addition to the cast, bringing warmth and charisma to an already delightful story. It's a gorgeous, heartwarming adventure that shouldn't be missed by any action-platformer fan."
      ]
    }
  ],
  videos: [],
  upcomingGames: [
    {
      id: "up_g1",
      title: "Grand Theft Auto VI",
      category: "game",
      releaseYear: "2025",
      genres: "Action-Adventure, Open World",
      platforms: "PS5, Xbox Series X/S",
      synopsis: "Head back to Leonida, the home of neon-soaked streets and wild highways of Vice City, in Rockstar's next boundary-pushing open-world epic.",
      imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg", // high contrast fallback
      developer: "Rockstar Games",
      hypeScore: "9.9/10"
    },
    {
      id: "up_g2",
      title: "Metroid Prime 4: Beyond",
      category: "game",
      releaseYear: "2025",
      genres: "Sci-Fi, First-Person Adventure",
      platforms: "Nintendo Switch",
      synopsis: "Samus Aran embark on a brand-new space-faring operation. Expect intense visor-scanning exploration, deep lore, and tight plasma-beam shooting.",
      imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1046930/header.jpg",
      developer: "Retro Studios / Nintendo",
      hypeScore: "9.5/10"
    }
  ],
  upcomingShows: [
    {
      id: "up_s1",
      title: "Severance (Season 2)",
      category: "show",
      releaseYear: "2025",
      genres: "Sci-Fi, Psychological Thriller",
      platforms: "Adam Scott, Patricia Arquette, John Turturro",
      synopsis: "The severed employees of Lumon Industries continue their search for the truth of their surgical division after the mind-bending season 1 cliffhanger.",
      imageUrl: "https://image.tmdb.org/t/p/w500/7sYv0MdfwcoK6yKkX2gAn0M9nU3.jpg",
      developer: "Ben Stiller",
      hypeScore: "9.7/10",
      rottenTomatoes: "97%"
    },
    {
      id: "up_s2",
      title: "Stranger Things (Season 5)",
      category: "show",
      releaseYear: "2025",
      genres: "80s Sci-Fi, Horror, Drama",
      platforms: "Millie Bobby Brown, Winona Ryder, David Harbour",
      synopsis: "The epic final season. Eleven, Mike, Dustin, Lucas, Will, and Max face the ultimate inter-dimensional invasion as the Upside Down bleeds fully into Hawkins.",
      imageUrl: "https://image.tmdb.org/t/p/w500/49W6qd6jW6Y66mYvSOfv6Yp8bX1.jpg",
      developer: "The Duffer Brothers",
      hypeScore: "9.6/10",
      rottenTomatoes: "96%"
    }
  ],
  upcomingMovies: [
    {
      id: "up_m2",
      title: "Dune: Messiah",
      category: "movie",
      releaseYear: "2026",
      genres: "Sci-Fi Space Epic",
      platforms: "Timothée Chalamet, Zendaya, Florence Pugh",
      synopsis: "Denis Villeneuve concludes Paul Atreides' destiny. Twelve years into his holy war, Paul grapples with his emperorship and the dark fate of Arrakis.",
      imageUrl: "https://image.tmdb.org/t/p/w500/czemb67gpf6Yg9W0g7gcyS486bA.jpg",
      developer: "Denis Villeneuve",
      hypeScore: "9.7/10",
      rottenTomatoes: "95%"
    }
  ]
};
