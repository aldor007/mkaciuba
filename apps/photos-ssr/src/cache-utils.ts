/**
 * Generates a cache key from request parameters
 * Format: v3:{path}|{page}|{gallery-token-header}|{category-token-cookie}
 */
export const getCacheKey = (req: {
  path: string;
  query: Record<string, any>;
  headers: Record<string, any>;
  cookies: Record<string, any>;
}): string => {
  return `v3:${req.path}|${req.query.page || ''}|${req.headers['x-gallery-token'] || ''}|${req.cookies.category_token || ''}`;
};
