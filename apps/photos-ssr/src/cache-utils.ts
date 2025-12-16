/**
 * Detects device class from CloudFlare Worker header or User-Agent fallback
 * Returns 'mobile', 'tablet', or 'desktop'
 */
export const detectDeviceClass = (req: {
  headers: Record<string, any>;
}): 'mobile' | 'tablet' | 'desktop' => {
  // Prefer CloudFlare Worker's device detection (more reliable, set by worker)
  const cfDeviceType = req.headers['cf-device-type']?.toLowerCase();

  if (cfDeviceType === 'mobile') return 'mobile';
  if (cfDeviceType === 'tablet') return 'tablet';
  if (cfDeviceType === 'desktop') return 'desktop';

  // Fallback to User-Agent parsing (for local dev, direct origin access)
  const userAgent = req.headers['user-agent'] || '';
  if (!userAgent) return 'desktop';

  const ua = userAgent.toLowerCase();

  // Check for tablets first (some tablets don't include "mobile" in UA)
  if (/ipad|tablet|kindle|playbook|nexus 7|nexus 10/i.test(ua)) {
    return 'tablet';
  }

  // Mobile phone detection
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
};

/**
 * Maps device class to viewport width for SSR rendering
 */
export const deviceClassToViewport = (deviceClass: 'mobile' | 'tablet' | 'desktop'): number => {
  switch (deviceClass) {
    case 'mobile': return 414;
    case 'tablet': return 768;
    case 'desktop': return 1900;
  }
};

/**
 * Generates a cache key from request parameters
 * Format: v6:{device}:{path}|{page}|{gallery-token-header}|{category-token-cookie}
 *
 * Version History:
 * - v6: Added device class segmentation for SSR viewport optimization with CloudFlare Worker
 * - v5: Added loadable components for SSR code splitting
 * - v4: CSS fixes (photos build before photos-ssr, correct manifest paths)
 * - v3: Previous version
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const getCacheKey = (req: {
  path: string;
  query: Record<string, any>;
  headers: Record<string, any>;
  cookies: Record<string, any>;
}): string => {
  const deviceClass = detectDeviceClass(req);
  return `v6:${deviceClass}:${req.path}|${req.query.page || ''}|${req.headers['x-gallery-token'] || ''}|${req.cookies.category_token || ''}`;
};
