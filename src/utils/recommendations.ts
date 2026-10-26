import { MediaType } from './enums.js';
import { Recommendation } from './types.js';

const VALID_MEDIA_TYPES = new Set<string>(Object.values(MediaType));

/**
 * Parses the raw Gemini response into validated recommendations.
 *
 * @param raw - Raw text returned by the AI provider.
 * @returns The validated recommendations, or null when the payload cannot be parsed.
 */
export function parseRecommendations(raw: string | null): Recommendation[] | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(extractJson(raw));
    if (!Array.isArray(parsed)) return null;

    return parsed
      .map(toRecommendation)
      .filter((item): item is Recommendation => item !== null);
  } catch {
    return null;
  }
}

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : raw).trim();
  const start = candidate.indexOf('[');
  const end = candidate.lastIndexOf(']');

  return start !== -1 && end > start ? candidate.slice(start, end + 1) : candidate;
}

function toRecommendation(value: unknown): Recommendation | null {
  if (!isRecord(value)) return null;

  const name = typeof value['name'] === 'string' ? value['name'].trim() : '';
  const reason = typeof value['reason'] === 'string' ? value['reason'].trim() : '';
  const mediaType = typeof value['mediaType'] === 'string' ? value['mediaType'].trim().toLowerCase() : '';
  const matchPercentage = Number(value['matchPercentage']);

  if (!name || !reason || !VALID_MEDIA_TYPES.has(mediaType)) return null;
  if (!Number.isFinite(matchPercentage) || matchPercentage < 0 || matchPercentage > 100) return null;

  const recommendation: Recommendation = {
    name,
    mediaType,
    reason,
    matchPercentage: Math.round(matchPercentage)
  };

  if (mediaType === 'book') {
    const isbn = normalizeIsbn(value['isbn']);
    if (isbn) recommendation.isbn = isbn;
  }

  return recommendation;
}

function normalizeIsbn(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const isbn = value.replace(/[^0-9Xx]/g, '').toUpperCase();
  return isbn.length === 10 || isbn.length === 13 ? isbn : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
