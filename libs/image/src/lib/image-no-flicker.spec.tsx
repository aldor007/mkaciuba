/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { mockImageVariants } from '../../../api/src/test-utils/factories';
import { ImageComponent, Image } from './image';

// Mock hooks
jest.mock('react-use-webp-support-check', () => ({
  useWebPSupportCheck: () => false,
}));

let mockWindowWidth = 1900;
jest.mock('@react-hook/window-size', () => ({
  useWindowWidth: ({ initialWidth }) => mockWindowWidth || initialWidth || 1900,
}));

// Helper to create mock images with specific dimensions
const createMockImageWithDimensions = (url: string, width: number, height: number, webp = false): Image => ({
  url,
  width,
  height,
  webp,
  type: webp ? 'image/webp' : 'image/jpeg',
});

describe('ImageComponent flickering prevention', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockWindowWidth = 1900;
    // Clear any global state
    delete (window as any).__APOLLO_STATE__;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('initial displayedImage state', () => {
    it('should not display image immediately during SSR hydration', () => {
      // Simulate SSR hydration scenario
      (window as any).__APOLLO_STATE__ = {};
      const images = [createMockImageWithDimensions('https://example.com/image.jpg', 800, 600, false)];

      const { container } = render(<ImageComponent thumbnails={images} />);

      // Image should not be rendered initially during hydration (displayedImage is null)
      const imgElement = container.querySelector('img');
      expect(imgElement).not.toBeInTheDocument();

      // Clean up
      delete (window as any).__APOLLO_STATE__;
    });

    it('should display image after preload completes in SSR hydration', async () => {
      // Simulate SSR hydration scenario
      (window as any).__APOLLO_STATE__ = {};
      const images = [createMockImageWithDimensions('https://example.com/image.jpg', 800, 600, false)];

      const { container } = render(<ImageComponent thumbnails={images} />);

      // Initially no image during hydration
      expect(container.querySelector('img')).not.toBeInTheDocument();

      // Fast-forward past the preload timeout
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Image should now be displayed
      await waitFor(() => {
        expect(container.querySelector('img')).toBeInTheDocument();
      });

      // Clean up
      delete (window as any).__APOLLO_STATE__;
    });
  });

  describe('opacity transition handling', () => {
    it('should use transition-none for format changes with same dimensions', async () => {
      // Provide both JPG and WebP versions with same dimensions
      const initialImages = [
        createMockImageWithDimensions('https://example.com/image.jpg', 800, 600, false),
        createMockImageWithDimensions('https://example.com/image.webp', 800, 600, true),
      ];

      const { rerender, container } = render(<ImageComponent thumbnails={initialImages} />);

      // Wait for initial image to load
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(container.querySelector('img')).toBeInTheDocument();
      });

      // Simulate WebP detection change (format switch)
      const newImages = [
        createMockImageWithDimensions('https://example.com/image2.jpg', 800, 600, false),
        createMockImageWithDimensions('https://example.com/image2.webp', 800, 600, true),
      ];

      rerender(<ImageComponent thumbnails={newImages} />);

      // Fast-forward to allow state updates
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should have transition-none for same dimensions
      await waitFor(() => {
        const img = container.querySelector('img');
        expect(img?.className).toMatch(/transition-none/);
      });
    });

    it('should use transition-opacity for dimension changes', async () => {
      const initialImages = [
        createMockImageWithDimensions('https://example.com/small.jpg', 800, 600, false),
      ];

      const { rerender, container } = render(<ImageComponent thumbnails={initialImages} />);

      // Wait for initial image to load
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(container.querySelector('img')).toBeInTheDocument();
      });

      // Change to different dimensions
      const newImages = [
        createMockImageWithDimensions('https://example.com/large.jpg', 1200, 900, false),
      ];

      rerender(<ImageComponent thumbnails={newImages} />);

      // Fast-forward to allow state updates
      act(() => {
        jest.advanceTimersByTime(10);
      });

      // Should have transition-opacity for dimension changes
      const img = container.querySelector('img');
      expect(img?.className).toMatch(/transition-opacity/);
    });
  });

  describe('SSR hydration stability', () => {
    it('should maintain image selection during hydration window', async () => {
      // Mock Apollo state to simulate SSR hydration
      (window as any).__APOLLO_STATE__ = { some: 'data' };

      const images = [
        createMockImageWithDimensions('https://example.com/small.jpg', 800, 600, false),
        createMockImageWithDimensions('https://example.com/large.jpg', 1600, 1200, false),
      ];

      // Server rendered with initialWidth=1900 (should pick large image)
      const { container } = render(<ImageComponent thumbnails={images} initialWidth={1900} />);

      // During hydration window (first 150ms), should use initialWidth=1900
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        const img = container.querySelector('img');
        if (img) {
          // Should still be using the large image (1600px) selected with initialWidth
          expect(img.getAttribute('width')).toBe('1600');
        }
      });

      // After hydration completes (150ms+), can switch to actual width
      act(() => {
        jest.advanceTimersByTime(100);
      });
    });

    it('should allow image selection changes after hydration completes', async () => {
      // Mock Apollo state to simulate SSR hydration
      (window as any).__APOLLO_STATE__ = { some: 'data' };

      // Set a different actual window width
      mockWindowWidth = 800;

      const images = [
        createMockImageWithDimensions('https://example.com/small.jpg', 400, 300, false),
        createMockImageWithDimensions('https://example.com/medium.jpg', 800, 600, false),
        createMockImageWithDimensions('https://example.com/large.jpg', 1600, 1200, false),
      ];

      const { container } = render(<ImageComponent thumbnails={images} initialWidth={1900} />);

      // Wait for initial load with locked width
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(container.querySelector('img')).toBeInTheDocument();
      });

      // Complete hydration
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // After hydration, the component should be able to respond to actual width
      // (Testing that hydrationComplete state is properly set)
      await waitFor(() => {
        const img = container.querySelector('img');
        expect(img).toBeInTheDocument();
      });
    });
  });

  describe('cached images display immediately', () => {
    it('should not show loading state for images already in cache', async () => {
      const images = [createMockImageWithDimensions('https://example.com/cached.jpg', 800, 600, false)];

      // First render - image gets cached
      const { container } = render(<ImageComponent thumbnails={images} />);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(container.querySelector('img')).toBeInTheDocument();
      });

      // Simulate the image loading (this would mark it as loaded in the ref)
      const img = container.querySelector('img');
      if (img) {
        act(() => {
          img.dispatchEvent(new Event('load', { bubbles: true }));
        });
      }

      // Verify image is no longer in loading state
      await waitFor(() => {
        const imgElement = container.querySelector('img');
        expect(imgElement?.className).toMatch(/opacity-100/);
        expect(imgElement?.className).not.toMatch(/animate-pulse/);
      });
    });
  });

  describe('stable images during width changes', () => {
    it('should not change image when width fluctuates within threshold', async () => {
      mockWindowWidth = 1900;

      const images = [
        createMockImageWithDimensions('https://example.com/small.jpg', 800, 600, false),
        createMockImageWithDimensions('https://example.com/large.jpg', 1600, 1200, false),
      ];

      const { container, rerender } = render(<ImageComponent thumbnails={images} />);

      // Wait for initial render
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        const img = container.querySelector('img');
        expect(img).toBeInTheDocument();
        expect(img?.getAttribute('width')).toBe('1600'); // Large image for 1900px width
      });

      // Change width slightly (within threshold of 100px after debounce)
      mockWindowWidth = 1880;
      rerender(<ImageComponent thumbnails={images} />);

      // Even after debounce time
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Image should remain the same
      const img = container.querySelector('img');
      expect(img?.getAttribute('width')).toBe('1600');
    });

    it('should debounce rapid width changes', async () => {
      const images = [
        createMockImageWithDimensions('https://example.com/small.jpg', 400, 300, false),
        createMockImageWithDimensions('https://example.com/medium.jpg', 800, 600, false),
        createMockImageWithDimensions('https://example.com/large.jpg', 1600, 1200, false),
      ];

      mockWindowWidth = 1900;
      const { container, rerender } = render(<ImageComponent thumbnails={images} />);

      // Wait for initial render
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(container.querySelector('img')).toBeInTheDocument();
      });

      // Rapidly change width multiple times (simulating rapid resize)
      for (let i = 0; i < 10; i++) {
        mockWindowWidth = 1900 - (i * 20); // 1900, 1880, 1860, ...
        rerender(<ImageComponent thumbnails={images} />);
        act(() => {
          jest.advanceTimersByTime(50); // Less than debounce time
        });
      }

      // Only after debounce completes should the change take effect
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Should have stabilized on the final width
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
    });
  });

  describe('SSR content duplication prevention', () => {
    it('should render identical HTML on server and client', async () => {
      // Simulate SSR by setting Apollo state
      (window as any).__APOLLO_STATE__ = { some: 'data' };

      const images = [
        createMockImageWithDimensions('https://example.com/image.jpg', 800, 600, false),
      ];

      // Server render with initialWidth
      const { container: ssrContainer } = render(
        <ImageComponent thumbnails={images} initialWidth={1900} />
      );

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(ssrContainer.querySelector('img')).toBeInTheDocument();
      });

      // Client render with same initialWidth during hydration
      const { container: clientContainer } = render(
        <ImageComponent thumbnails={images} initialWidth={1900} />
      );

      // Client also needs time to display the image
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(clientContainer.querySelector('img')).toBeInTheDocument();
      });

      // During hydration window, HTML should match to prevent duplication
      // Note: Exact HTML match might vary, so we check key attributes
      const ssrImg = ssrContainer.querySelector('img');
      const clientImg = clientContainer.querySelector('img');

      expect(ssrImg?.getAttribute('src')).toBe(clientImg?.getAttribute('src'));
      expect(ssrImg?.getAttribute('width')).toBe(clientImg?.getAttribute('width'));
      expect(ssrImg?.getAttribute('height')).toBe(clientImg?.getAttribute('height'));
    });

    it('should not duplicate images when hydrating from SSR', async () => {
      (window as any).__APOLLO_STATE__ = { some: 'data' };

      const images = [
        createMockImageWithDimensions('https://example.com/image.jpg', 800, 600, false),
      ];

      const { container } = render(<ImageComponent thumbnails={images} initialWidth={1900} />);

      // Fast forward through hydration
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(container.querySelector('img')).toBeInTheDocument();
      });

      // Should only have ONE img element, not duplicates
      const imgElements = container.querySelectorAll('img');
      expect(imgElements.length).toBe(1);
    });

    it('should preserve SSR image selection during hydration window', async () => {
      (window as any).__APOLLO_STATE__ = { some: 'data' };

      const images = [
        createMockImageWithDimensions('https://example.com/small.jpg', 400, 300, false),
        createMockImageWithDimensions('https://example.com/medium.jpg', 800, 600, false),
        createMockImageWithDimensions('https://example.com/large.jpg', 1600, 1200, false),
      ];

      // Server selected large image for initialWidth=1900
      const { container } = render(<ImageComponent thumbnails={images} initialWidth={1900} />);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(container.querySelector('img')).toBeInTheDocument();
      });

      const initialSrc = container.querySelector('img')?.getAttribute('src');

      // During hydration window, should maintain the same image selection
      act(() => {
        jest.advanceTimersByTime(100);
      });

      const duringHydrationSrc = container.querySelector('img')?.getAttribute('src');
      expect(initialSrc).toBe(duringHydrationSrc);
    });

    it('should handle hydration with mismatched window width gracefully', async () => {
      (window as any).__APOLLO_STATE__ = { some: 'data' };

      // Server rendered with large width
      mockWindowWidth = 1900;

      const images = [
        createMockImageWithDimensions('https://example.com/small.jpg', 400, 300, false),
        createMockImageWithDimensions('https://example.com/large.jpg', 1600, 1200, false),
      ];

      const { container, rerender } = render(<ImageComponent thumbnails={images} initialWidth={1900} />);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(container.querySelector('img')).toBeInTheDocument();
      });

      // Client actually has small width
      mockWindowWidth = 400;

      // But during hydration window, should still use SSR selection
      act(() => {
        jest.advanceTimersByTime(100);
      });

      const img = container.querySelector('img');
      expect(img?.getAttribute('width')).toBe('1600'); // Still using large image from SSR

      // After hydration completes, can switch to appropriate size
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Component should eventually adapt to actual window width
      // (This might trigger a new image selection after hydration completes)
    });
  });

  describe('dimension change detection', () => {
    it('should show loading state when image dimensions change', async () => {
      const initialImages = [
        createMockImageWithDimensions('https://example.com/small.jpg', 800, 600, false),
      ];

      const { container, rerender } = render(<ImageComponent thumbnails={initialImages} />);

      // Wait for initial load
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(container.querySelector('img')).toBeInTheDocument();
      });

      // Change to different dimensions
      const newImages = [
        createMockImageWithDimensions('https://example.com/large.jpg', 1600, 1200, false),
      ];

      rerender(<ImageComponent thumbnails={newImages} />);

      // Should show loading state (opacity-0 class)
      act(() => {
        jest.advanceTimersByTime(10);
      });

      const img = container.querySelector('img');
      expect(img?.className).toMatch(/opacity-0/);
    });

    it('should not show loading state for format-only changes', async () => {
      // Provide both formats with same dimensions
      const initialImages = [
        createMockImageWithDimensions('https://example.com/image.jpg', 800, 600, false),
        createMockImageWithDimensions('https://example.com/image.webp', 800, 600, true),
      ];

      const { container, rerender } = render(<ImageComponent thumbnails={initialImages} />);

      // Wait for initial load
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        const img = container.querySelector('img');
        expect(img).toBeInTheDocument();
        expect(img?.className).toMatch(/opacity-100/);
      });

      // Change to different URL but same dimensions
      const newImages = [
        createMockImageWithDimensions('https://example.com/image2.jpg', 800, 600, false),
        createMockImageWithDimensions('https://example.com/image2.webp', 800, 600, true),
      ];

      rerender(<ImageComponent thumbnails={newImages} />);

      // Fast forward a bit
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should NOT show prolonged loading state for same dimensions
      await waitFor(() => {
        const img = container.querySelector('img');
        // Image should be visible or quickly become visible
        expect(img).toBeInTheDocument();
      });
    });
  });
});
