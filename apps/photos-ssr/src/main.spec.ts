/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCacheKey, detectDeviceClass, deviceClassToViewport } from './cache-utils';

describe('SSR Server - Cache Utilities', () => {
  describe('getCacheKey', () => {
    describe('should generate correct cache keys with device detection', () => {
      const testCases = [
        {
          description: 'basic path without query or tokens (defaults to desktop)',
          req: { path: '/post/test', query: {}, headers: {}, cookies: {} },
          expected: 'v6:desktop:/post/test|||',
        },
        {
          description: 'path with page query (defaults to desktop)',
          req: { path: '/posts', query: { page: '2' }, headers: {}, cookies: {} },
          expected: 'v6:desktop:/posts|2||',
        },
        {
          description: 'path with gallery token header',
          req: { path: '/gallery/test', query: {}, headers: { 'x-gallery-token': 'token123' }, cookies: {} },
          expected: 'v6:desktop:/gallery/test||token123|',
        },
        {
          description: 'path with category token cookie',
          req: { path: '/gallery/cat', query: {}, headers: {}, cookies: { category_token: 'cattoken456' } },
          expected: 'v6:desktop:/gallery/cat|||cattoken456',
        },
        {
          description: 'path with all parameters',
          req: {
            path: '/gallery/test',
            query: { page: '3' },
            headers: { 'x-gallery-token': 'header_token' },
            cookies: { category_token: 'cookie_token' },
          },
          expected: 'v6:desktop:/gallery/test|3|header_token|cookie_token',
        },
        {
          description: 'path with special characters',
          req: { path: '/post/test-title-123', query: {}, headers: {}, cookies: {} },
          expected: 'v6:desktop:/post/test-title-123|||',
        },
        {
          description: 'mobile device via CF-Device-Type header',
          req: { path: '/gallery/test', query: {}, headers: { 'cf-device-type': 'mobile' }, cookies: {} },
          expected: 'v6:mobile:/gallery/test|||',
        },
        {
          description: 'tablet device via CF-Device-Type header',
          req: { path: '/gallery/test', query: {}, headers: { 'cf-device-type': 'tablet' }, cookies: {} },
          expected: 'v6:tablet:/gallery/test|||',
        },
        {
          description: 'mobile device via User-Agent (iPhone)',
          req: { path: '/gallery/test', query: {}, headers: { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' }, cookies: {} },
          expected: 'v6:mobile:/gallery/test|||',
        },
        {
          description: 'tablet device via User-Agent (iPad)',
          req: { path: '/gallery/test', query: {}, headers: { 'user-agent': 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)' }, cookies: {} },
          expected: 'v6:tablet:/gallery/test|||',
        },
      ];

      test.each(testCases)('should handle $description', ({ req, expected }) => {
        const result = getCacheKey(req as any);
        expect(result).toBe(expected);
      });
    });

    test('should handle missing optional fields gracefully', () => {
      const req = {
        path: '/home',
        query: {},
        headers: {},
        cookies: {},
      };
      const result = getCacheKey(req as any);
      expect(result).toBe('v6:desktop:/home|||');
    });

    test('should handle undefined query.page', () => {
      const req = {
        path: '/posts',
        query: { page: undefined },
        headers: {},
        cookies: {},
      };
      const result = getCacheKey(req as any);
      expect(result).toBe('v6:desktop:/posts|||');
    });
  });

  describe('detectDeviceClass', () => {
    describe('should detect device from CF-Device-Type header', () => {
      const testCases = [
        {
          description: 'mobile via CF-Device-Type',
          req: { headers: { 'cf-device-type': 'mobile' } },
          expected: 'mobile',
        },
        {
          description: 'tablet via CF-Device-Type',
          req: { headers: { 'cf-device-type': 'tablet' } },
          expected: 'tablet',
        },
        {
          description: 'desktop via CF-Device-Type',
          req: { headers: { 'cf-device-type': 'desktop' } },
          expected: 'desktop',
        },
        {
          description: 'case insensitive CF-Device-Type',
          req: { headers: { 'cf-device-type': 'MOBILE' } },
          expected: 'mobile',
        },
      ];

      test.each(testCases)('should detect $description', ({ req, expected }) => {
        const result = detectDeviceClass(req as any);
        expect(result).toBe(expected);
      });
    });

    describe('should fallback to User-Agent detection', () => {
      const testCases = [
        {
          description: 'iPhone as mobile',
          req: { headers: { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' } },
          expected: 'mobile',
        },
        {
          description: 'Android phone as mobile',
          req: { headers: { 'user-agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36' } },
          expected: 'mobile',
        },
        {
          description: 'iPad as tablet',
          req: { headers: { 'user-agent': 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)' } },
          expected: 'tablet',
        },
        {
          description: 'Nexus 7 as tablet',
          req: { headers: { 'user-agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 7 Build/MOB30X)' } },
          expected: 'tablet',
        },
        {
          description: 'Chrome desktop as desktop',
          req: { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } },
          expected: 'desktop',
        },
        {
          description: 'missing user-agent as desktop',
          req: { headers: {} },
          expected: 'desktop',
        },
      ];

      test.each(testCases)('should detect $description', ({ req, expected }) => {
        const result = detectDeviceClass(req as any);
        expect(result).toBe(expected);
      });
    });

    test('should prefer CF-Device-Type over User-Agent', () => {
      const req = {
        headers: {
          'cf-device-type': 'tablet',
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        },
      };
      const result = detectDeviceClass(req as any);
      expect(result).toBe('tablet'); // Should use CF header, not UA
    });
  });

  describe('deviceClassToViewport', () => {
    test('should map mobile to 414px viewport', () => {
      expect(deviceClassToViewport('mobile')).toBe(414);
    });

    test('should map tablet to 768px viewport', () => {
      expect(deviceClassToViewport('tablet')).toBe(768);
    });

    test('should map desktop to 1900px viewport', () => {
      expect(deviceClassToViewport('desktop')).toBe(1900);
    });
  });
});

describe('SSR Server - Integration Note', () => {
  test('should note that full SSR integration tests require complex mocking', () => {
    // Full SSR server tests would require:
    // - Mocking React SSR (renderToString, getDataFromTree)
    // - Mocking Apollo Client SSR
    // - Mocking the entire Photos app
    // - Mocking filesystem for manifest
    // - Mocking fetch for Cloudflare API
    //
    // These are better tested through:
    // 1. E2E tests with real server
    // 2. Component-level tests (already done)
    // 3. Cache tests (already done - redis.spec.ts)
    //
    // Critical server logic (cache keys, purge API) should be extracted
    // to separate modules for easier unit testing.
    expect(true).toBe(true);
  });
});
