/**
 * Generates a cache key from request parameters
 * Format: v4:{path}|{page}|{gallery-token-header}|{category-token-cookie}
 *
 * Version History:
 * - v4: CSS fixes (photos build before photos-ssr, correct manifest paths)
 * - v3: Previous version
 */
export const getCacheKey = (req: {
  path: string;
  query: Record<string, any>;
  headers: Record<string, any>;
  cookies: Record<string, any>;
}): string => {
  return `v4:${req.path}|${req.query.page || ''}|${req.headers['x-gallery-token'] || ''}|${req.cookies.category_token || ''}`;
};
