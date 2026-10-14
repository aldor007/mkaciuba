import { useMemo } from 'react';
import { useLocation } from 'react-router';

export const useQueryParams = () => {
    return new URLSearchParams(useLocation().search);
}

/**
 * Listing state shared by sort/filter UI, SSR cache keys and the search page.
 * All values are validated so untrusted URL input never reaches GraphQL or the cache key.
 */
export interface ListingParams {
  page: number;
  sort: string | null;
  tags: string[];
  q: string | null;
}

/** Matches Strapi sort values like "title:asc" or "publicationDate:desc". */
const SORT_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*:(asc|desc)$/;
/** Matches tag slugs like "landscape" or "black-and-white". */
const TAG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-_]{0,63}$/;

const MAX_TAGS = 12;
const MAX_QUERY_LENGTH = 100;

const toSearchParams = (search: string | URLSearchParams): URLSearchParams =>
  typeof search === 'string' ? new URLSearchParams(search) : search;

export const parseListingParams = (
  search: string | URLSearchParams,
  allowedSorts?: readonly string[]
): ListingParams => {
  const params = toSearchParams(search);

  let page = 1;
  const rawPage = params.get('page');
  if (rawPage && /^\d+$/.test(rawPage)) {
    const parsed = parseInt(rawPage, 10);
    if (parsed > 0) {
      page = parsed;
    }
  }

  let sort: string | null = null;
  const rawSort = params.get('sort');
  if (rawSort && SORT_PATTERN.test(rawSort)) {
    if (!allowedSorts || allowedSorts.indexOf(rawSort) !== -1) {
      sort = rawSort;
    }
  }

  const tags: string[] = [];
  params.getAll('tag').forEach((value) => {
    value.split(',').forEach((tag) => {
      const trimmed = tag.trim();
      if (
        trimmed.length > 0 &&
        TAG_PATTERN.test(trimmed) &&
        tags.indexOf(trimmed) === -1 &&
        tags.length < MAX_TAGS
      ) {
        tags.push(trimmed);
      }
    });
  });

  let q: string | null = null;
  const rawQuery = params.get('q');
  if (rawQuery) {
    const trimmed = rawQuery.trim().slice(0, MAX_QUERY_LENGTH);
    if (trimmed.length > 0) {
      q = trimmed;
    }
  }

  return { page, sort, tags, q };
};

export const serializeListingParams = (params: Partial<ListingParams>): string => {
  // page/sort/tags are charset-validated so they are assembled directly —
  // URLSearchParams would percent-encode ":" and "," (e.g. title%3Aasc),
  // producing non-canonical URLs that no longer round-trip with parseListingParams.
  const parts: string[] = [];
  if (params.page && params.page > 1 && Number.isInteger(params.page)) {
    parts.push(`page=${params.page}`);
  }
  if (params.sort && SORT_PATTERN.test(params.sort)) {
    parts.push(`sort=${params.sort}`);
  }
  if (params.tags && params.tags.length > 0) {
    const tags = params.tags.filter((tag) => TAG_PATTERN.test(tag)).slice(0, MAX_TAGS);
    if (tags.length > 0) {
      parts.push(`tag=${tags.join(',')}`);
    }
  }
  if (params.q) {
    parts.push(`q=${encodeURIComponent(params.q)}`);
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
};

/**
 * Reads validated listing params from the current URL.
 * Pass a stable `allowedSorts` constant (module-level) to whitelist sort values.
 */
export const useListingParams = (allowedSorts?: readonly string[]): ListingParams => {
  const location = useLocation();
  return useMemo(
    () => parseListingParams(location.search, allowedSorts),
    [location.search, allowedSorts]
  );
};
