import { getCacheKey } from './cache-utils';

describe('SSR Server - Cache Utilities', () => {
  describe('getCacheKey — legacy URLs (no listing params)', () => {
    describe('should generate byte-identical v5 keys', () => {
      const testCases = [
        {
          description: 'basic path without query or tokens',
          req: { path: '/post/test', query: {}, headers: {}, cookies: {} },
          expected: 'v5:/post/test|||',
        },
        {
          description: 'path with page query',
          req: { path: '/posts', query: { page: '2' }, headers: {}, cookies: {} },
          expected: 'v5:/posts|2||',
        },
        {
          description: 'path with gallery token header',
          req: { path: '/gallery/test', query: {}, headers: { 'x-gallery-token': 'token123' }, cookies: {} },
          expected: 'v5:/gallery/test||token123|',
        },
        {
          description: 'path with category token cookie',
          req: { path: '/gallery/cat', query: {}, headers: {}, cookies: { category_token: 'cattoken456' } },
          expected: 'v5:/gallery/cat|||cattoken456',
        },
        {
          description: 'path with all legacy parameters',
          req: {
            path: '/gallery/test',
            query: { page: '3' },
            headers: { 'x-gallery-token': 'header_token' },
            cookies: { category_token: 'cookie_token' },
          },
          expected: 'v5:/gallery/test|3|header_token|cookie_token',
        },
        {
          description: 'undefined page falls back to empty legacy slot',
          req: { path: '/posts', query: { page: undefined }, headers: {}, cookies: {} },
          expected: 'v5:/posts|||',
        },
        {
          description: 'non-numeric page is preserved verbatim (legacy behaviour)',
          req: { path: '/posts', query: { page: 'abc' }, headers: {}, cookies: {} },
          expected: 'v5:/posts|abc||',
        },
        {
          description: 'invalid sort value falls back to the legacy key',
          req: { path: '/blog', query: { sort: 'evil;drop' }, headers: {}, cookies: {} },
          expected: 'v5:/blog|||',
        },
        {
          description: 'sort without direction falls back to the legacy key',
          req: { path: '/blog', query: { sort: 'title' }, headers: {}, cookies: {} },
          expected: 'v5:/blog|||',
        },
        {
          description: 'invalid tag values are dropped, legacy key used',
          req: { path: '/blog', query: { tag: '<script>' }, headers: {}, cookies: {} },
          expected: 'v5:/blog|||',
        },
        {
          description: 'empty query term falls back to the legacy key',
          req: { path: '/search', query: { q: '' }, headers: {}, cookies: {} },
          expected: 'v5:/search|||',
        },
      ];

      test.each(testCases)('should handle $description', ({ req, expected }) => {
        const result = getCacheKey(req as any);
        expect(result).toBe(expected);
      });
    });
  });

  describe('getCacheKey — addon URLs (with listing params)', () => {
    describe('should generate v6 keys including the listing state', () => {
      const testCases = [
        {
          description: 'path with sort query',
          req: { path: '/blog', query: { sort: 'title:asc' }, headers: {}, cookies: {} },
          expected: 'v6:/blog|1|title:asc||||',
        },
        {
          description: 'path with tag filter',
          req: { path: '/blog', query: { tag: 'a,b' }, headers: {}, cookies: {} },
          expected: 'v6:/blog|1||a,b|||',
        },
        {
          description: 'path with repeated tag params',
          req: { path: '/blog', query: { tag: ['a', 'b'] }, headers: {}, cookies: {} },
          expected: 'v6:/blog|1||a,b|||',
        },
        {
          description: 'path with search query',
          req: { path: '/search', query: { q: 'test' }, headers: {}, cookies: {} },
          expected: 'v6:/search|1|||test||',
        },
        {
          description: 'search query with pipe is encoded to avoid key delimiter injection',
          req: { path: '/search', query: { q: 'a|b' }, headers: {}, cookies: {} },
          expected: 'v6:/search|1|||a%7Cb||',
        },
        {
          description: 'page with listing params',
          req: { path: '/blog', query: { page: '2', sort: 'title:asc' }, headers: {}, cookies: {} },
          expected: 'v6:/blog|2|title:asc||||',
        },
        {
          description: 'all parameters together',
          req: {
            path: '/blog',
            query: { page: '2', sort: 'title:asc', tag: 'a,b', q: 'x' },
            headers: { 'x-gallery-token': 'header_token' },
            cookies: { category_token: 'cookie_token' },
          },
          expected: 'v6:/blog|2|title:asc|a,b|x|header_token|cookie_token',
        },
      ];

      test.each(testCases)('should handle $description', ({ req, expected }) => {
        const result = getCacheKey(req as any);
        expect(result).toBe(expected);
      });
    });

    test('should produce different keys for different sort values', () => {
      const base = { path: '/blog', headers: {}, cookies: {} };
      const keyAsc = getCacheKey({ ...base, query: { sort: 'title:asc' } } as any);
      const keyDesc = getCacheKey({ ...base, query: { sort: 'title:desc' } } as any);
      const keyNone = getCacheKey({ ...base, query: {} } as any);

      expect(keyAsc).not.toBe(keyDesc);
      expect(keyAsc).not.toBe(keyNone);
      expect(keyDesc).not.toBe(keyNone);
    });

    test('should produce different keys for different tag filters', () => {
      const base = { path: '/blog', headers: {}, cookies: {} };
      const keyA = getCacheKey({ ...base, query: { tag: 'a' } } as any);
      const keyAB = getCacheKey({ ...base, query: { tag: 'a,b' } } as any);
      const keyNone = getCacheKey({ ...base, query: {} } as any);

      expect(keyA).not.toBe(keyAB);
      expect(keyA).not.toBe(keyNone);
      expect(keyAB).not.toBe(keyNone);
    });

    test('should produce different keys for different search terms', () => {
      const base = { path: '/search', headers: {}, cookies: {} };
      const keyX = getCacheKey({ ...base, query: { q: 'x' } } as any);
      const keyY = getCacheKey({ ...base, query: { q: 'y' } } as any);

      expect(keyX).not.toBe(keyY);
    });
  });
});
