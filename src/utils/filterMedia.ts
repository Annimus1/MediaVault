import { isDate, isNumberValid, isString } from "./parser";
import { Media } from "./types";

/**
 * Filters media results based on query parameters
 * @param {Media[]} prevResults - Array of media items to filter
 * @param {Object} queryParams - Filter criteria (language, mediaType, score, date range)
 * @returns {Media[] | null} Filtered results or null if no filters applied
 * @throws {TypeError} If any filter value is invalid
 */
export function filteredMedia(prevResults: Media[], queryParams: any): Media[] | null {
  if (!hasFilters(queryParams)) {
    return null;
  }

  let filteredResults = [...prevResults];

  filteredResults = applyLanguageFilter(filteredResults, queryParams.language);
  filteredResults = applyMediaTypeFilter(filteredResults, queryParams.mediaType);
  filteredResults = applyScoreFilter(filteredResults, queryParams.score, queryParams.scoreG, queryParams.scoreL);
  filteredResults = applyDateRangeFilter(filteredResults, queryParams.from, queryParams.to);

  return filteredResults;
}

// Helper functions
function hasFilters(queryParams: Record<string, unknown>): boolean {
  return Object.keys(queryParams).length > 0;
}

// filter functions
function applyLanguageFilter(results: Media[], language: unknown): Media[] {
  if (!language) return results;

  if (!isString(language)) {
    throw new TypeError('Invalid language parameter');
  }

  const searchLanguage = String(language).toLowerCase();
  return results.filter(media => media.language.toLowerCase() == searchLanguage);
}

function applyMediaTypeFilter(results: Media[], mediaType: unknown): Media[] {
  if (!mediaType) return results;

  if (!isString(mediaType)) {
    throw new TypeError('Invalid media type parameter');
  }

  const searchType = String(mediaType).toLowerCase();
  return results.filter(media => media.mediaType.toLowerCase() === searchType);
}

function applyScoreFilter(results: Media[], score?: unknown, scoreG?: unknown, scoreL?: unknown): Media[] {
  let filteredResults = [...results];

  // score equals
  if (score !== undefined) {
    if (!isNumberValid(score)) {
      throw new TypeError('Invalid score parameter');
    }
    const numericScore = Number(score);
    filteredResults = filteredResults.filter(media => media.score === numericScore);
  }

  // score greater than or equal
  if (scoreG !== undefined) {
    if (!isNumberValid(scoreG)) {
      throw new TypeError('Invalid score-g parameter');
    }
    const minScore = Number(scoreG);
    filteredResults = filteredResults.filter(media => (Number(media.score) >= minScore));
  }

  // score less than or equal
  if (scoreL !== undefined) {
    if (!isNumberValid(scoreL)) {
      throw new TypeError('Invalid score-l parameter');
    }
    const maxScore = Number(scoreL);
    filteredResults = filteredResults.filter(media => Number(media.score) <= maxScore);
  }

  return filteredResults;
}

function applyDateRangeFilter(results: Media[], from: unknown, to: unknown): Media[] {
  if (!from || !to) return results;

  if (!isDate(from) || !isDate(to)) {
    throw new TypeError('Invalid date range parameters');
  }

  const dateFrom = new Date(String(from)).getTime();
  const dateTo = new Date(String(to)).getTime();

  return results.filter(media => {
    const mediaDate = new Date(media.completedDate).getTime();
    return mediaDate >= dateFrom && mediaDate <= dateTo;
  });
}