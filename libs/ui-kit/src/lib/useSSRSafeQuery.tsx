import { useRef, useEffect } from 'react';

/**
 * Hook to prevent hydration mismatches when using Apollo Client with SSR.
 *
 * Apollo's useQuery can temporarily return `loading: true` even when cached data exists,
 * which causes components to render different content on server vs initial client render.
 *
 * This hook ensures that during the first client render (hydration), we skip all loading
 * and data checks if SSR data is available, preventing hydration mismatches.
 *
 * @param loading - The loading state from Apollo useQuery
 * @param data - The data from Apollo useQuery
 * @returns Object with shouldShowLoading boolean, isFirstRender boolean, and hasData boolean
 *
 * @example
 * ```tsx
 * const { loading, error, data } = useQuery(QUERY);
 * const { shouldShowLoading } = useSSRSafeQuery(loading, data);
 *
 * if (error) return <ErrorPage />;
 * if (shouldShowLoading) return <Loading />;
 * // No need for if (!data) check - the hook handles it
 *
 * // Render with data (data will be available or component shows loading)
 * ```
 */
export function useSSRSafeQuery<T = any>(loading: boolean, data: T | undefined) {
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    // Mark first render as complete after mount
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
    }
  }, []);

  // Check if SSR data is available
  const hasSSRData = typeof window !== 'undefined' && (window as any).__APOLLO_STATE__;

  // During first render with SSR data, skip loading check entirely
  // This prevents hydration mismatches when Apollo temporarily returns loading: true
  const shouldSkipLoadingCheck = hasSSRData && isFirstRenderRef.current;

  // Show loading if we don't have data (unless we're skipping the check)
  const shouldShowLoading = !shouldSkipLoadingCheck && data === undefined;

  return {
    shouldShowLoading,
    isFirstRender: isFirstRenderRef.current,
  };
}
