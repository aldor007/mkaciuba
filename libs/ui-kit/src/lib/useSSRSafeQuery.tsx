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

  // CRITICAL: Always show loading when data is undefined
  // This prevents "Cannot read properties of undefined" crashes
  //
  // If data exists (even if it's null, {}, 0, '', false), we can render it.
  // If data is undefined, we MUST show loading to prevent crashes.
  //
  // Note: This prioritizes safety over SSR optimization. Previously, the hook
  // would skip showing loading during SSR first render even if data was undefined,
  // which caused crashes when the data never hydrated.
  const shouldShowLoading = data === undefined;

  return {
    shouldShowLoading,
    isFirstRender: isFirstRenderRef.current,
  };
}
