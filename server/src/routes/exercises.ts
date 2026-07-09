import { Router } from 'express';

export const exercisesRouter = Router();

interface WgerSuggestion {
  value?: string;
  data?: { id?: number; name?: string };
}

const cache = new Map<string, { expires: number; results: { id: number | null; name: string }[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

exercisesRouter.get('/search', async (req, res) => {
  const term = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (term.length < 2) {
    return res.json([]);
  }

  const cached = cache.get(term.toLowerCase());
  if (cached && cached.expires > Date.now()) {
    return res.json(cached.results);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const url = `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(term)}&language=portuguese&format=json`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.json([]);
    }

    const data = (await response.json()) as { suggestions?: WgerSuggestion[] };
    const results = (data.suggestions ?? [])
      .map((s) => ({
        id: s.data?.id ?? null,
        name: stripHtml(s.data?.name ?? s.value ?? ''),
      }))
      .filter((s) => s.name);

    cache.set(term.toLowerCase(), { expires: Date.now() + CACHE_TTL_MS, results });
    res.json(results);
  } catch {
    res.json([]);
  }
});

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}
