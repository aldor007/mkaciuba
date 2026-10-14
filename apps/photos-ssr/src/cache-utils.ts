/**
 * Generates a cache key from request parameters
 * Format (no listing params): v5:{path}|{page}|{gallery-token-header}|{category-token-cookie}
 * Format (with sort/tag/q):  v6:{path}|{page}|{sort}|{tags}|{q}|{gallery-token-header}|{category-token-cookie}
 *
 * URLs without listing params keep the legacy v5 format byte-identical so
 * existing pages' cached entries stay valid. URLs with listing params
 * (listing-ux addon) use the v6 format so each filter/sort variant gets
 * its own cache entry and never serves a wrong-variant page.
 *
 * Version History:
 * - v6: listing params (sort/tag/q) — required by the listing-ux addon
 * - v5: Added loadable components for SSR code splitting
 * - v4: CSS fixes (photos build before photos-ssr, correct manifest paths)
 *
 * Note: We use browser-native responsive images (srcset) so all devices
 * receive the same HTML with all image variants. The browser decides which
 * image to load based on viewport, DPR, and network conditions.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseListingParams } from '@mkaciuba/ui-kit';

const LISTING_PARAM_KEYS = ['page', 'sort', 'tag', 'q'];

/**
 * Normalizes an Express query object (string | string[] values per key)
 * into URLSearchParams so the shared parseListingParams validator can be reused.
 */
const queryToSearchParams = (query: Record<string, any>): URLSearchParams => {
  const params = new URLSearchParams();
  if (!query) {
    return params;
  }
  LISTING_PARAM_KEYS.forEach((key) => {
    const value = query[key];
    if (value === undefined || value === null || value === '') {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === 'string' && item !== '') {
          params.append(key, item);
        }
      });
    } else if (typeof value === 'string') {
      params.set(key, value);
    }
  });
  return params;
};

export const getCacheKey = (req: {
  path: string;
  query: Record<string, any>;
  headers: Record<string, any>;
  cookies: Record<string, any>;
}): string => {
  const { page, sort, tags, q } = parseListingParams(queryToSearchParams(req.query));
  const galleryToken = req.headers['x-gallery-token'] || '';
  const categoryToken = req.cookies.category_token || '';

  if (!sort && tags.length === 0 && !q) {
    // No listing params — legacy key, byte-identical to the pre-addon format
    return `v5:${req.path}|${req.query.page || ''}|${galleryToken}|${categoryToken}`;
  }
  return `v6:${req.path}|${page}|${sort || ''}|${tags.join(',')}|${q ? encodeURIComponent(q) : ''}|${galleryToken}|${categoryToken}`;
};
