import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function fetchFromRawg(query: string, apiKey: string) {
  try {
    const searchUrl = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=1`;
    console.log('Fetching RAWG search:', searchUrl);
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      console.warn('RAWG search failed status:', searchRes.status);
      return null;
    }
    const searchData = await searchRes.json() as any;
    if (!searchData.results || searchData.results.length === 0) {
      console.warn('RAWG search returned no results.');
      return null;
    }

    const firstGame = searchData.results[0];
    const detailUrl = `https://api.rawg.io/api/games/${firstGame.id}?key=${apiKey}`;
    console.log('Fetching RAWG details:', detailUrl);
    const detailRes = await fetch(detailUrl);
    
    // Use detail response if available, else fallback to search response
    const game = detailRes.ok ? await detailRes.json() as any : firstGame;
    
    // Clean description of HTML tags
    const descText = game.description_raw || game.description || '';
    const cleanDescription = descText
      .replace(/<[^>]*>/g, '') // remove HTML tags
      .split('\n')[0] // get first paragraph
      .substring(0, 250) + '...';

    return {
      title: game.name || firstGame.name,
      releaseYear: (game.released || firstGame.released || '').split('-')[0] || 'N/A',
      developer: game.developers?.[0]?.name || 'N/A',
      platforms: game.platforms?.map((p: any) => p.platform.name).slice(0, 3).join(', ') || firstGame.platforms?.map((p: any) => p.platform.name).slice(0, 3).join(', ') || 'N/A',
      genres: game.genres?.map((g: any) => g.name).slice(0, 3).join(', ') || firstGame.genres?.map((g: any) => g.name).slice(0, 3).join(', ') || 'N/A',
      synopsis: cleanDescription.trim() !== '...' ? cleanDescription : `A retro masterpiece game: ${game.name || firstGame.name}.`,
      imageUrl: game.background_image || firstGame.background_image || null,
    };
  } catch (error) {
    console.error('Error fetching from RAWG:', error);
    return null;
  }
}

async function fetchFromOmdb(query: string, apiKey: string) {
  try {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${apiKey}`;
    console.log('Fetching OMDB data:', url.replace(apiKey, 'REDACTED'));
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('OMDB fetch failed status:', res.status);
      return null;
    }
    const data = await res.json() as any;
    if (data.Response === 'False') {
      console.warn('OMDB returned False response:', data.Error);
      return null;
    }
    return {
      title: data.Title,
      releaseYear: (data.Year || '').split('–')[0] || 'N/A',
      developer: data.Director || 'N/A',
      platforms: data.Actors || 'N/A',
      genres: data.Genre || 'N/A',
      synopsis: data.Plot || 'N/A',
      imageUrl: data.Poster !== 'N/A' ? data.Poster : null,
      rating: data.imdbRating ? `${data.imdbRating}/10` : 'N/A',
      type: data.Type === 'series' ? 'show' : data.Type === 'movie' ? 'movie' : 'movie',
    };
  } catch (error) {
    console.error('Error fetching from OMDB:', error);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // In-memory cache for game searches to ensure lightning-fast subsequent load times and smooth API behavior
  const gameSearchCache = new Map<string, any>();

  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      console.log('Generating image and explanation for prompt:', prompt);
      const [imageResponse, textResponse] = await Promise.all([
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              {
                text: prompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "1K"
            }
          }
        }),
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: {
            parts: [
              {
                text: `Provide a short, 2 to 3 line definition or brief explanation of "${prompt}". Return only the text without any markup.`,
              },
            ],
          },
        })
      ]);

      let imageUrl = null;
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          // It's usually safe to assume it will be an image types depending on response, image/png or jpeg
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
          break; // Stop at first image
        }
      }

      if (imageUrl) {
        res.json({ imageUrl, explanation: textResponse.text });
      } else {
        res.status(500).json({ error: 'No image found in response' });
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate image' });
    }
  });

  app.post('/api/generate-content', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      console.log('Generating content for:', query);
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: {
          parts: [
            {
              text: `Write a detailed article about "${query}". Return the response as a JSON object with two fields: "title" (a suitable title) and "paragraphs" (an array of strings, where each string is a paragraph of the article, at least 5 paragraphs). Do not include any markdown formatting outside the JSON object.`,
            },
          ],
        },
        config: {
            responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (text) {
        try {
          const parsed = JSON.parse(text);
          res.json(parsed);
        } catch (e) {
             res.status(500).json({ error: 'Failed to parse JSON response' });
        }
      } else {
        res.status(500).json({ error: 'No text content found' });
      }
    } catch (error: any) {
      console.error('Content generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate content' });
    }
  });

  app.post('/api/blog/search-game', async (req, res) => {
    try {
      const { query, category } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const cacheKey = `${query.trim().toLowerCase()}_${category || 'any'}`;
      if (gameSearchCache.has(cacheKey)) {
        console.log('Cache hit for search:', cacheKey);
        return res.json(gameSearchCache.get(cacheKey));
      }

      console.log('Searching and generating review for:', query, 'category:', category);

      let rawgData = null;
      let omdbData = null;

      const omdbApiKey = process.env.OMDB_API_KEY || process.env.OMDB_KEY || process.env.OMDB || process.env.omdb || 'c3648de3';

      const requestedCategory = category ? category.toLowerCase() : null;

      if (requestedCategory === 'movie' || requestedCategory === 'show') {
        if (omdbApiKey) {
          console.log('OMDB is configured, fetching live movie data from OMDB...');
          omdbData = await fetchFromOmdb(query, omdbApiKey);
        }
      } else if (requestedCategory === 'game') {
        if (process.env.API_GAME_BRAIN) {
          console.log('API_GAME_BRAIN is configured, fetching live game data from RAWG...');
          rawgData = await fetchFromRawg(query, process.env.API_GAME_BRAIN);
        }
      } else {
        if (omdbApiKey) {
          console.log('Auto-fetch: fetching live movie data from OMDB...');
          omdbData = await fetchFromOmdb(query, omdbApiKey);
        }
        if (process.env.API_GAME_BRAIN) {
          console.log('Auto-fetch: fetching live game data from RAWG...');
          rawgData = await fetchFromRawg(query, process.env.API_GAME_BRAIN);
        }
      }

      let parsedData = null;
      let imageUrl = null;

      if (rawgData || omdbData) {
        console.log('Successfully retrieved database data. rawgData:', !!rawgData, 'omdbData:', !!omdbData);
        
        // Let Gemini combine them or pick the correct one
        const textResponse = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Here is the search query: "${query}"

Official live data found in database search:
Game Database (RAWG): ${rawgData ? JSON.stringify(rawgData) : 'None'}
Movie/Show Database (OMDB): ${omdbData ? JSON.stringify(omdbData) : 'None'}

Please determine which of these is the most suitable, canonical, or highly relevant match for the user's query "${query}" (e.g. if the query is a classic movie/show or game).
Once you decide, please generate a matching retro fanzine-style review in JSON format with these EXACT fields:
{
  "title": "the canonical title of the selected item",
  "category": "movie" or "show" or "game",
  "releaseYear": "year of release (e.g. 2010)",
  "developer": "developer company name (for games) or director name (for movies/shows)",
  "platforms": "list of major platforms/consoles (for games) or main actors/cast (for movies/shows)",
  "genres": "list of major genres",
  "synopsis": "a short 2-3 sentence summary of the plot or story",
  "reviewTitle": "a witty personal review headline written by a passionate retro zine-blogger named Joe",
  "rating": "Joe's personal score out of 5 (e.g. 4.8/5, 4.5/5, 3.8/5)",
  "reviewSummary": "a 1-sentence punchy summary of Joe's thoughts",
  "reviewParagraphs": [
    "Paragraph 1: Enthusiastic, casual introduction by Joe describing when he played/watched it, the overall vibe, and why it caught his attention.",
    "Paragraph 2: Joe's breakdown of the experience - what makes the mechanics, directing, plot, or atmosphere addictive or unique, mentioning specific features.",
    "Paragraph 3: Joe's final verdict - who this is for, minor gripes, and why it deserves his rating."
  ]
}`,
          config: {
            systemInstruction: "You are a professional but highly casual, enthusiastic retro fanzine blogger named Joe who runs a self-hosted review zine called 'Noodle Knows'. You review classic games, cool cult movies, and iconic animated/TV shows. You speak with warm, authentic gamer slang, using words like 'masterclass', 'pure juice', 'one more run', 'backlog', 'iconic', and 'absolute gold'. You write short, punchy paragraphs. Always output valid JSON matching the requested structure. Use double quotes around property names and strings.",
            responseMimeType: "application/json",
          }
        });

        const text = textResponse.text;
        if (!text) {
          throw new Error('No text generated from Gemini based on database search data');
        }

        let reviewJSON;
        try {
          reviewJSON = JSON.parse(text);
        } catch (err) {
          console.error('Failed to parse Gemini JSON output. Raw text was:', text);
          let cleaned = text.trim();
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.substring(7, cleaned.length - 3);
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.substring(3, cleaned.length - 3);
          }
          reviewJSON = JSON.parse(cleaned.trim());
        }

        const selectedCategory = reviewJSON.category || 'game';
        if (selectedCategory === 'movie' || selectedCategory === 'show') {
          imageUrl = omdbData?.imageUrl || rawgData?.imageUrl || null;
        } else {
          imageUrl = rawgData?.imageUrl || omdbData?.imageUrl || null;
        }

        parsedData = {
          title: reviewJSON.title || (selectedCategory === 'game' ? rawgData?.title : omdbData?.title) || query,
          releaseYear: reviewJSON.releaseYear || (selectedCategory === 'game' ? rawgData?.releaseYear : omdbData?.releaseYear) || 'N/A',
          developer: reviewJSON.developer || (selectedCategory === 'game' ? rawgData?.developer : omdbData?.developer) || 'N/A',
          platforms: reviewJSON.platforms || (selectedCategory === 'game' ? rawgData?.platforms : omdbData?.platforms) || 'N/A',
          genres: reviewJSON.genres || (selectedCategory === 'game' ? rawgData?.genres : omdbData?.genres) || 'N/A',
          synopsis: reviewJSON.synopsis || (selectedCategory === 'game' ? rawgData?.synopsis : omdbData?.synopsis) || 'N/A',
          category: selectedCategory,
          ...reviewJSON
        };
      } else {
        console.log('No API key or search database fetch failed. Falling back to Gemini search grounding...');
        // Fallback to original search grounded Gemini implementation
        const textResponse = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Search the web for the game, movie, or show "${query}" and retrieve official factual information.
Return the response as a JSON object with the following fields:
{
  "title": "official title of the item",
  "category": "movie" or "show" or "game",
  "releaseYear": "year of release, e.g. 2024",
  "developer": "developer company name (for games) or director name (for movies/shows)",
  "platforms": "list of major platforms (for games) or main actors/cast (for movies/shows)",
  "genres": "list of major genres, e.g. Action RPG, Metroidvania, Sci-Fi",
  "synopsis": "a 2-3 sentence official summary of the plot, gameplay, or story",
  "reviewTitle": "a witty personal review headline written by a passionate retro zine-blogger named Joe",
  "rating": "Joe's personal score out of 5, e.g. 4.8/5 or 4.5/5",
  "reviewSummary": "a 1-sentence punchy summary of Joe's thoughts",
  "reviewParagraphs": [
    "Paragraph 1: Enthusiastic, casual introduction by Joe describing when he played/watched it, the overall vibe, and why it caught his attention.",
    "Paragraph 2: Joe's breakdown of the experience - what makes the mechanics, directing, plot, or atmosphere addictive or unique, mentioning specific features.",
    "Paragraph 3: Joe's final verdict - who this is for, minor gripes, and why it deserves his rating."
  ],
  "imagePrompt": "a detailed 1-sentence prompt for an image generator to create a stunning retro 16-bit pixel-art cover or action cinematic scene representing this game, movie, or show"
}`,
          config: {
            systemInstruction: "You are a professional but highly casual, enthusiastic retro fanzine blogger named Joe who runs a self-hosted review zine called 'Noodle Knows'. You review classic games, cool cult movies, and iconic animated/TV shows. You speak with warm, authentic gamer slang, using words like 'masterclass', 'pure juice', 'one more run', 'backlog', and 'absolute gold'. You write short, punchy paragraphs with real insights. Always output valid JSON matching the requested structure. Use double quotes around property names and strings.",
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }],
          }
        });

        const text = textResponse.text;
        if (!text) {
          throw new Error('No text generated from Gemini');
        }

        try {
          parsedData = JSON.parse(text);
        } catch (err) {
          console.error('Failed to parse Gemini JSON output. Raw text was:', text);
          let cleaned = text.trim();
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.substring(7, cleaned.length - 3);
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.substring(3, cleaned.length - 3);
          }
          parsedData = JSON.parse(cleaned.trim());
        }

        // Generate a gorgeous cover image using the generated imagePrompt
        try {
          const imgPromptText = parsedData.imagePrompt || `Box art cover for the game, movie or show ${parsedData.title || query}`;
          console.log('Generating image with prompt:', imgPromptText);
          const imageResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [
                {
                  text: `${imgPromptText}, vintage 16-bit video game pixel art style, game box art illustration, high contrast, clean retro gaming fanzine aesthetic`,
                },
              ],
            },
            config: {
              imageConfig: {
                aspectRatio: "4:3",
                imageSize: "1K"
              }
            }
          });

          for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData) {
              imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch (imgError) {
          console.warn('Image generation failed, proceeding with text-only data. Error:', imgError);
        }
      }

      const responsePayload = {
        ...parsedData,
        imageUrl
      };
      gameSearchCache.set(cacheKey, responsePayload);

      res.json(responsePayload);

    } catch (error: any) {
      console.error('Game search/generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to search game' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
