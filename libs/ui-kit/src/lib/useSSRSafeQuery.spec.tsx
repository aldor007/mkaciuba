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

    it('should NOT show loading when loading is true but data exists', () => {
      const mockData = { test: 'data' };
      const { result } = renderHook(() => useSSRSafeQuery(true, mockData));

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

    it('should NOT show loading on first render even when loading is true and no data', () => {
      const { result } = renderHook(() => useSSRSafeQuery(true, undefined));

      // During first render with SSR data, should skip loading check
      expect(result.current.shouldShowLoading).toBe(false);
      expect(result.current.isFirstRender).toBe(true);
    });

    it('should NOT show loading on first render with data', () => {
      const mockData = { test: 'data' };
      const { result } = renderHook(() => useSSRSafeQuery(true, mockData));

      expect(result.current.shouldShowLoading).toBe(false);
      expect(result.current.isFirstRender).toBe(true);
    });

    it('should show loading on second render when loading is true and no data', () => {
      const { result, rerender } = renderHook(
        ({ loading, data }) => useSSRSafeQuery(loading, data),
        { initialProps: { loading: true, data: undefined } }
      );

      // First render - should not show loading
      expect(result.current.shouldShowLoading).toBe(false);
      expect(result.current.isFirstRender).toBe(true);

      // Re-render after mount (simulates second render)
      rerender({ loading: true, data: undefined });

      // After first render, should show loading if loading is true and no data
      expect(result.current.shouldShowLoading).toBe(true);
      expect(result.current.isFirstRender).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle null data', () => {
      const { result } = renderHook(() => useSSRSafeQuery(true, null));

      // Null is valid data (not undefined), so should NOT show loading
      expect(result.current.shouldShowLoading).toBe(false);
    });

    it('should handle empty object as data', () => {
      const { result } = renderHook(() => useSSRSafeQuery(true, {}));

      expect(result.current.shouldShowLoading).toBe(false);
    });

    it('should handle zero as data', () => {
      const { result } = renderHook(() => useSSRSafeQuery(true, 0));

      expect(result.current.shouldShowLoading).toBe(false);
    });

    it('should handle empty string as data', () => {
      const { result } = renderHook(() => useSSRSafeQuery(true, ''));

      // Empty string is valid data (not undefined), so should NOT show loading
      expect(result.current.shouldShowLoading).toBe(false);
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
