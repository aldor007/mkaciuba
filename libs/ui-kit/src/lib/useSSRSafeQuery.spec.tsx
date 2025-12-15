import { renderHook } from '@testing-library/react';
import { useSSRSafeQuery } from './useSSRSafeQuery';

describe('useSSRSafeQuery', () => {
  beforeEach(() => {
    // Clean up window.__APOLLO_STATE__ before each test
    delete (window as any).__APOLLO_STATE__;
  });

  describe('when NO SSR data exists', () => {
    it('should show loading when loading is true and no data', () => {
      const { result } = renderHook(() => useSSRSafeQuery(true, undefined));

      expect(result.current.shouldShowLoading).toBe(true);
      expect(result.current.isFirstRender).toBe(true);
    });

    it('should NOT show loading when data exists (even if loading is true)', () => {
      const mockData = { test: 'data' };
      const { result } = renderHook(() => useSSRSafeQuery(true, mockData));

      // If we have data, never show loading (we can display the data while refetching)
      expect(result.current.shouldShowLoading).toBe(false);
      expect(result.current.isFirstRender).toBe(true);
    });

    it('should NOT show loading when loading is false', () => {
      const mockData = { test: 'data' };
      const { result } = renderHook(() => useSSRSafeQuery(false, mockData));

      expect(result.current.shouldShowLoading).toBe(false);
      expect(result.current.isFirstRender).toBe(true);
    });
  });

  describe('when SSR data EXISTS', () => {
    beforeEach(() => {
      // Set up SSR data
      (window as any).__APOLLO_STATE__ = { ROOT_QUERY: {} };
    });

    it('should show loading on first render when data is undefined (prevents crashes)', () => {
      const { result } = renderHook(() => useSSRSafeQuery(true, undefined));

      // CRITICAL: If data is undefined, we MUST show loading to prevent
      // components from crashing when trying to access undefined data
      // This fixes: "Cannot read properties of undefined" errors
      expect(result.current.shouldShowLoading).toBe(true);
      expect(result.current.isFirstRender).toBe(true);
    });

    it('should NOT show loading on first render with data', () => {
      const mockData = { test: 'data' };
      const { result } = renderHook(() => useSSRSafeQuery(true, mockData));

      expect(result.current.shouldShowLoading).toBe(false);
      expect(result.current.isFirstRender).toBe(true);
    });

    it('should show loading when data is undefined on any render', () => {
      const { result, rerender } = renderHook(
        ({ loading, data }) => useSSRSafeQuery(loading, data),
        { initialProps: { loading: true, data: undefined } }
      );

      // First render - should show loading because data is undefined
      expect(result.current.shouldShowLoading).toBe(true);
      expect(result.current.isFirstRender).toBe(true);

      // Re-render after mount (simulates second render)
      rerender({ loading: true, data: undefined });

      // Second render - still show loading because data is still undefined
      expect(result.current.shouldShowLoading).toBe(true);
      expect(result.current.isFirstRender).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should NOT show loading for null data (null is valid data)', () => {
      const { result } = renderHook(() => useSSRSafeQuery(true, null));

      // Null is valid data (not undefined), so should NOT show loading
      // Component must handle null appropriately
      expect(result.current.shouldShowLoading).toBe(false);
    });

    it('should NOT show loading for empty object (empty object is valid data)', () => {
      const { result } = renderHook(() => useSSRSafeQuery(true, {}));

      // Empty object is still data (not undefined)
      expect(result.current.shouldShowLoading).toBe(false);
    });

    it('should NOT show loading for falsy but defined values', () => {
      // Zero is valid data
      const { result: result0 } = renderHook(() => useSSRSafeQuery(true, 0));
      expect(result0.current.shouldShowLoading).toBe(false);

      // Empty string is valid data
      const { result: resultEmpty } = renderHook(() => useSSRSafeQuery(true, ''));
      expect(resultEmpty.current.shouldShowLoading).toBe(false);

      // False is valid data
      const { result: resultFalse } = renderHook(() => useSSRSafeQuery(true, false));
      expect(resultFalse.current.shouldShowLoading).toBe(false);
    });
  });

  describe('render progression', () => {
    it('should transition from first render to subsequent renders correctly', () => {
      (window as any).__APOLLO_STATE__ = { ROOT_QUERY: {} };

      const { result, rerender } = renderHook(
        ({ loading, data }) => useSSRSafeQuery(loading, data),
        { initialProps: { loading: true, data: { test: 'initial' } } }
      );

      // First render - skip loading check
      expect(result.current.shouldShowLoading).toBe(false);
      expect(result.current.isFirstRender).toBe(true);

      // Re-render with loading true and no data
      rerender({ loading: true, data: undefined });
      expect(result.current.shouldShowLoading).toBe(true);
      expect(result.current.isFirstRender).toBe(false);

      // Re-render with data loaded
      rerender({ loading: false, data: { test: 'loaded' } });
      expect(result.current.shouldShowLoading).toBe(false);
      expect(result.current.isFirstRender).toBe(false);
    });
  });
});
