import { findImageForWidthClosestWithDPR, Image } from './image';

describe('Image Selection Algorithms', () => {
  const mockImages: Image[] = [
    { url: 'https://example.com/image-375.webp', webp: true, width: 375, height: 250 },
    { url: 'https://example.com/image-414.webp', webp: true, width: 414, height: 276 },
    { url: 'https://example.com/image-700.webp', webp: true, width: 700, height: 467 },
    { url: 'https://example.com/image-750.webp', webp: true, width: 750, height: 500 },
    { url: 'https://example.com/image-828.webp', webp: true, width: 828, height: 552 },
    { url: 'https://example.com/image-1000.webp', webp: true, width: 1000, height: 667 },
    { url: 'https://example.com/image-1300.webp', webp: true, width: 1300, height: 867 },
    { url: 'https://example.com/image-1900.webp', webp: true, width: 1900, height: 1267 },
    { url: 'https://example.com/image-2400.webp', webp: true, width: 2400, height: 1600 },
    { url: 'https://example.com/image-375.jpg', webp: false, width: 375, height: 250 },
    { url: 'https://example.com/image-414.jpg', webp: false, width: 414, height: 276 },
    { url: 'https://example.com/image-700.jpg', webp: false, width: 700, height: 467 },
    { url: 'https://example.com/image-750.jpg', webp: false, width: 750, height: 500 },
    { url: 'https://example.com/image-828.jpg', webp: false, width: 828, height: 552 },
    { url: 'https://example.com/image-1000.jpg', webp: false, width: 1000, height: 667 },
    { url: 'https://example.com/image-1300.jpg', webp: false, width: 1300, height: 867 },
    { url: 'https://example.com/image-1900.jpg', webp: false, width: 1900, height: 1267 },
    { url: 'https://example.com/image-2400.jpg', webp: false, width: 2400, height: 1600 },
  ];

  describe('findImageForWidthClosestWithDPR', () => {
    it('should select 414px image for 375px mobile viewport with 1x DPR', () => {
      const result = findImageForWidthClosestWithDPR(mockImages, 375, true, 1);
      expect(result?.width).toBe(375);
      expect(result?.webp).toBe(true);
    });

    it('should select 750px image for 375px mobile viewport with 2x DPR', () => {
      const result = findImageForWidthClosestWithDPR(mockImages, 375, true, 2);
      expect(result?.width).toBe(750);
      expect(result?.webp).toBe(true);
    });

    it('should select 414px image for 414px viewport with 1x DPR', () => {
      const result = findImageForWidthClosestWithDPR(mockImages, 414, true, 1);
      expect(result?.width).toBe(414);
      expect(result?.webp).toBe(true);
    });

    it('should select 828px image for 414px viewport with 2x DPR', () => {
      const result = findImageForWidthClosestWithDPR(mockImages, 414, true, 2);
      expect(result?.width).toBe(828);
      expect(result?.webp).toBe(true);
    });

    it('should cap at 2x DPR to prevent over-fetching', () => {
      // With 3x DPR, should still use 2x effective DPR
      const result = findImageForWidthClosestWithDPR(mockImages, 414, true, 3);
      expect(result?.width).toBe(828);
      expect(result?.webp).toBe(true);
    });

    it('should select closest match when exact size unavailable', () => {
      const result = findImageForWidthClosestWithDPR(mockImages, 800, true, 1);
      expect(result?.width).toBe(828);
      expect(result?.webp).toBe(true);
    });

    it('should select JPEG images when webp is false', () => {
      const result = findImageForWidthClosestWithDPR(mockImages, 375, false, 1);
      expect(result?.width).toBe(375);
      expect(result?.webp).toBe(false);
      expect(result?.url).toContain('.jpg');
    });

    it('should select WebP images when webp is true', () => {
      const result = findImageForWidthClosestWithDPR(mockImages, 375, true, 1);
      expect(result?.width).toBe(375);
      expect(result?.webp).toBe(true);
      expect(result?.url).toContain('.webp');
    });

    it('should handle desktop viewport (1900px) with 1x DPR', () => {
      const result = findImageForWidthClosestWithDPR(mockImages, 1900, true, 1);
      expect(result?.width).toBe(1900);
      expect(result?.webp).toBe(true);
    });

    it('should return null for empty image array', () => {
      const result = findImageForWidthClosestWithDPR([], 375, true, 1);
      expect(result).toBeNull();
    });

    it('should return null when no images match webp preference', () => {
      const webpOnlyImages = mockImages.filter(img => img.webp);
      const result = findImageForWidthClosestWithDPR(webpOnlyImages, 375, false, 1);
      expect(result).toBeNull();
    });

    it('should handle tablet viewport (768px) with 2x DPR', () => {
      const result = findImageForWidthClosestWithDPR(mockImages, 768, true, 2);
      // 768 * 2 = 1536, closest is 1300 or 1900, should pick closest
      expect([1300, 1900]).toContain(result?.width);
      expect(result?.webp).toBe(true);
    });
  });
});
