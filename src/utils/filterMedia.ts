import { isDate, isNumberValid, isString } from "./parser.js";
import { Media } from "./types.js";

/**
 * Filters an array of media items based on provided query parameters.
 *
 * Supported filters:
 * - language: Filters by media language (case-insensitive).
 * - mediaType: Filters by media type (case-insensitive).
 * - score: Filters by exact score.
 * - scoreG: Filters by minimum score (greater than or equal).
 * - scoreL: Filters by maximum score (less than or equal).
 * - from, to: Filters by completedDate within a date range (inclusive).
 *
 * @function filteredMedia
 * @param {Media[] | null} prevResults - Array of media items to filter.
 * @param {Object} queryParams - Filter criteria (language, mediaType, score, scoreG, scoreL, from, to).
 * @returns {Media[] | null} Filtered results or null if no filters are applied.
 * @throws {TypeError} If any filter value is invalid.
 */
export function filteredMedia(prevResults: Media[]| null, queryParams: any): Media[] | null {
  if (!hasFilters(queryParams)) {
    return null;
  }
  if (!prevResults) {
    return null;
  }

  let filteredResults = [...prevResults];

  filteredResults = applyLanguageFilter(filteredResults, queryParams.language);
  filteredResults = applyMediaTypeFilter(filteredResults, queryParams.mediaType);
  filteredResults = applyScoreFilter(filteredResults, queryParams.score, queryParams.scoreG, queryParams.scoreL);
  filteredResults = applyDateRangeFilter(filteredResults, queryParams.from, queryParams.to);

  return filteredResults;
}

/**
 * Checks if any filter parameters are present in the query.
 *
 * @param {Record<string, unknown>} queryParams - Query parameters object.
 * @returns {boolean} True if any filter is present, false otherwise.
 */
function hasFilters(queryParams: Record<string, unknown>): boolean {
  return Object.keys(queryParams).length > 0;
}

/**
 * Filters media items by language.
 *
 * @param {Media[]} results - Array of media items.
 * @param {unknown} language - Language filter value.
 * @returns {Media[]} Filtered media items.
 * @throws {TypeError} If language is not a string.
 */
function applyLanguageFilter(results: Media[], language: unknown): Media[] {
  if (!language) return results;

  if (!isString(language)) {
    throw new TypeError('Invalid language parameter');
  }

  const searchLanguage = String(language).toLowerCase();
  return results.filter(media => media.language.toLowerCase() == searchLanguage);
}

/**
 * Filters media items by media type.
 *
 * @param {Media[]} results - Array of media items.
 * @param {unknown} mediaType - Media type filter value.
 * @returns {Media[]} Filtered media items.
 * @throws {TypeError} If mediaType is not a string.
 */
function applyMediaTypeFilter(results: Media[], mediaType: unknown): Media[] {
  if (!mediaType) return results;

  if (!isString(mediaType)) {
    throw new TypeError('Invalid media type parameter');
  }

  const searchType = String(mediaType).toLowerCase();
  return results.filter(media => media.mediaType.toLowerCase() === searchType);
}

/**
 * Filters media items by score, minimum score, and maximum score.
 *
 * @param {Media[]} results - Array of media items.
 * @param {unknown} [score] - Exact score filter value.
 * @param {unknown} [scoreG] - Minimum score filter value.
 * @param {unknown} [scoreL] - Maximum score filter value.
 * @returns {Media[]} Filtered media items.
 * @throws {TypeError} If any score filter value is invalid.
 */
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

/**
 * Filters media items by completedDate within a date range.
 *
 * @param {Media[]} results - Array of media items.
 * @param {unknown} from - Start date (inclusive).
 * @param {unknown} to - End date (inclusive).
 * @returns {Media[]} Filtered media items.
 * @throws {TypeError} If from or to is not a valid date.
 */
function applyDateRangeFilter(results: Media[], from: unknown, to: unknown): Media[] {
  if (!from || !to) return results;

  if (!isDate(from) || !isDate(to)) {
    throw new TypeError('Invalid date range parameters');
  }

  const dateFrom = new Date(String(from)).getTime();
  const dateTo = new Date(String(to)).getTime();

  return results.filter(media => {
    const mediaDate = new Date(media.completedDate).getTime();
    if (mediaDate >= dateFrom && mediaDate <= dateTo){
        return media
    };
    return;
  });
}
