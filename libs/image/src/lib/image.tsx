import { UploadFile } from '@mkaciuba/types';
import React, { RefObject, useState, useEffect, useCallback, useRef, useMemo} from 'react';
import { findImageForWidth } from '..';
import { useWebPSupportCheck } from "react-use-webp-support-check";
import { useWindowWidth } from '@react-hook/window-size';

// Cache WebP support synchronously to prevent flicker
let cachedWebPSupport: boolean | null = null;
let hasMounted = false;

function detectWebPSync(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    if (!canvas.getContext) return false;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const dataURL = canvas.toDataURL('image/webp');
      return dataURL.indexOf('data:image/webp') === 0;
    }
  } catch (e) {
    // canvas.getContext might not be implemented in test environments (jsdom)
    return false;
  }
  return false;
}

export function useWebPSupportStable() {
  const asyncWebP = useWebPSupportCheck();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    hasMounted = true;
  }, []);

  // During SSR and initial client render (before mount), always return true
  // This ensures server and client render the same content during hydration
  // Most modern browsers support WebP, so true is a safe default
  if (!mounted && !hasMounted) {
    return true;
  }

  // After mounting, detect WebP support once and cache it
  if (cachedWebPSupport === null && typeof document !== 'undefined') {
    cachedWebPSupport = detectWebPSync();
  }
  return cachedWebPSupport !== null ? cachedWebPSupport : asyncWebP;
}

// Debounced window width hook to prevent excessive re-renders
export function useStableWindowWidth(initialWidth = 1900, debounceMs = 300, threshold = 100) {
  const actualWidth = useWindowWidth({ initialWidth });
  const [stableWidth, setStableWidth] = useState(initialWidth);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const widthDiff = Math.abs(actualWidth - stableWidth);

    // On first render, if the difference is small, use actualWidth immediately without debounce
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (widthDiff < threshold * 2) {
        setStableWidth(actualWidth);
        return;
      }
    }

    if (widthDiff < threshold) return;

    const timeoutId = setTimeout(() => {
      setStableWidth(actualWidth);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [actualWidth, stableWidth, debounceMs, threshold]);

  return stableWidth;
}

export interface Image {
  url: string
  mediaQuery?: string
  webp: boolean
  type?: string
  width?: number
  height?: number
  alt?: string
}



export const findImageForWidthBigger = (images: Image[], width: number, webp: boolean) => {
  const filterPresets = images.filter(p => p.webp === webp);
  if (filterPresets.length === 0) {
    return null;
  }

  let minIndex = 0;
  let minValue = Math.abs(width - filterPresets[0].width);
  const lowerZero = [];
  filterPresets.forEach((p, index) => {
    const tmpValue = width - p.width;
    if (tmpValue < 0) {
      lowerZero.push({
        value: tmpValue,
        index,
      });
    }
    if (tmpValue < minValue) {
      minIndex = index;
      minValue = tmpValue;
    }
  });
  minValue = -1000000;
  lowerZero.forEach(element => {
    if (element.value > minValue) {
      minValue = element.value;
      minIndex = element.index;
    }
  });

  return filterPresets[minIndex];
}


export const toImage = (upload: UploadFile) =>  {
  const image: Image = {
    url: upload.url,
    webp: false,
    type: upload.mime,
    alt: upload.caption,
  }
  if (upload.thumbnail) {
    image.webp = upload.thumbnail.webp;
    image.width = upload.thumbnail.width;
    image.height = upload.thumbnail.height;
    image.url = upload.thumbnail.url;
  }

  if (upload.thumbnails) {
    console.warn('Multi images!')
  }

  return image;
}

export enum DefaultImgSizing {
  DEFAULT = 2,
  BIGGER
}

export interface ImageComponentProps {
  thumbnails: Image[]
  defaultImage?: Image,
  ref?: RefObject<HTMLImageElement>
  onClick?: any
  alt?: string
  className?: string
  defaultImgSizing?: DefaultImgSizing
  initialWidth?: number
}

export const findImageForType = (images: Image[], webp: boolean) => {
  const filterPresets = images.filter(p => p.webp === webp);
  return filterPresets[filterPresets.length - 1];
}

const addDatePrefix = (url) => {
    let prefix = '?';
    if (url.indexOf('?') !== -1) {
      prefix = '&';
    }
    return url + prefix + 'cache=' + Date.now()
}

/**
 * Anti-flicker ImageComponent with comprehensive SSR hydration support
 *
 * Flicker Prevention Strategy:
 * 1. WebP Detection: Cached synchronously to prevent format switching between renders
 * 2. Window Width: Debounced with threshold to prevent excessive image changes on resize
 * 3. Image Preloading: New images are preloaded before display using Image() constructor
 * 4. Loaded Image Cache: Tracks loaded images to display them immediately on subsequent renders
 * 5. SSR Hydration: Locks image selection to initialWidth during hydration to match server HTML
 * 6. Dimension vs Format: Different handling for size changes (with transition) vs format changes (instant)
 * 7. Memoization: Image selection is memoized to prevent unnecessary recalculations
 * 8. Stable Initial State: Uses same image on server, during hydration, and after mount
 */
export const ImageComponent = React.forwardRef(({thumbnails, defaultImage: providedDefaultImage, onClick, alt, className, defaultImgSizing, initialWidth=1900}:ImageComponentProps, ref: RefObject<HTMLImageElement>) => {
  const errorCounterRef = useRef(0);
  const webp = useWebPSupportStable();
  const width = useStableWindowWidth(initialWidth, 300, 100);
  const loadedImagesRef = useRef(new Set<string>());

  // SSR hydration detection to prevent image switching during hydration
  // Check for SSR by looking for window and React hydration markers
  const isSSR = typeof window === 'undefined';
  const isHydratingRef = useRef(!isSSR && (
    (window as any).__APOLLO_STATE__ !== undefined ||
    document.querySelector('[data-reactroot]') !== null ||
    document.querySelector('[data-reactid]') !== null
  ));
  const [hydrationComplete, setHydrationComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mark hydration as complete after component mounts and a small delay
  useEffect(() => {
    setIsMounted(true);
    if (isHydratingRef.current) {
      const timer = setTimeout(() => {
        setHydrationComplete(true);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setHydrationComplete(true);
    }
  }, []);

  // Memoize the default image calculation to prevent flickering on re-renders
  const defaultImage = useMemo(() => {
    // During hydration and before mount, lock to initialWidth to prevent image switching
    // This ensures server-rendered HTML matches initial client render
    const isHydrating = (isHydratingRef.current && !hydrationComplete) || !isMounted;
    const effectiveWidth = isHydrating ? initialWidth : width;

    if (providedDefaultImage) {
      return providedDefaultImage;
    }

    if (!defaultImgSizing || defaultImgSizing === DefaultImgSizing.DEFAULT) {
      return findImageForWidth(thumbnails, effectiveWidth, webp);
    } else {
      return findImageForWidthBigger(thumbnails, effectiveWidth, webp);
    }
  }, [providedDefaultImage, thumbnails, width, webp, defaultImgSizing, hydrationComplete, initialWidth, isMounted]);

  // Track images by key including dimensions to prevent flicker on format changes
  const imageUrl = defaultImage?.url;
  const imageKey = defaultImage ? `${imageUrl}-${defaultImage.width}x${defaultImage.height}` : null;
  const hasLoadedBefore = imageKey && loadedImagesRef.current.has(imageKey);
  const [loading, setLoading] = useState(!hasLoadedBefore);
  const prevImageKeyRef = useRef<string | null>(null);
  // Fix: Always use defaultImage during SSR and initial client render to prevent mismatch
  // We use !isMounted because it's false during both SSR and initial client render
  // This ensures server HTML matches client's first render
  // Server: isMounted is false → shows defaultImage
  // Client (before useEffect): isMounted is false → shows defaultImage (matches server!)
  // Client (after useEffect): isMounted is true → can optimize based on hasLoadedBefore
  const initialDisplayedImage = (!isMounted || hasLoadedBefore) ? defaultImage : null;
  const [displayedImage, setDisplayedImage] = useState(initialDisplayedImage);
  // Track whether this is a dimension change (needs transition) vs format change (no transition)
  const [isDimensionChange, setIsDimensionChange] = useState(false);

  // Preload new images before displaying to prevent flicker
  useEffect(() => {
    if (!defaultImage || !imageKey) return;

    const prevKey = prevImageKeyRef.current;
    prevImageKeyRef.current = imageKey;

    // If already loaded, display immediately
    if (loadedImagesRef.current.has(imageKey)) {
      setDisplayedImage(defaultImage);
      setLoading(false);
      setIsDimensionChange(false);
      return;
    }

    // Check if dimensions unchanged (e.g., switching jpg->webp)
    if (prevKey && defaultImage) {
      const prevMatch = prevKey.match(/-(\d+)x(\d+)$/);
      if (prevMatch) {
        const prevWidth = parseInt(prevMatch[1]);
        const prevHeight = parseInt(prevMatch[2]);
        if (prevWidth === defaultImage.width && prevHeight === defaultImage.height) {
          // Same dimensions - preload and swap immediately without loading state or transition
          setIsDimensionChange(false);
          const img = new Image();
          img.onload = () => {
            loadedImagesRef.current.add(imageKey);
            setDisplayedImage(defaultImage);
          };
          img.src = defaultImage.url;
          return;
        }
      }
    }

    // Different dimensions - show loading and preload with transition
    setIsDimensionChange(true);
    setLoading(true);
    const img = new Image();
    img.onload = () => {
      loadedImagesRef.current.add(imageKey);
      setDisplayedImage(defaultImage);
      setLoading(false);
    };
    img.onerror = () => {
      // On error, still display it and let the img tag's onError handle retries
      setDisplayedImage(defaultImage);
      setLoading(false);
    };
    img.src = defaultImage.url;

    // Fallback timeout in case loading takes too long
    // Use shorter timeout in test environments where image loading doesn't work
    const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    const fallbackDelay = isTestEnv ? 10 : 1500;
    const timeoutId = setTimeout(() => {
      setDisplayedImage(defaultImage);
      setLoading(false);
    }, fallbackDelay);

    return () => clearTimeout(timeoutId);
  }, [imageKey, defaultImage]);

  // Fix memory leak: Use useCallback for imageOnError to prevent recreating on every render
  const imageOnError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setTimeout(() => {
      if (errorCounterRef.current > 4) {
        return;
      }
      const target = e.target as HTMLImageElement;
      target.src = addDatePrefix(target.src);
      errorCounterRef.current += 1;
    }, 250);

    // Note: Individual error timeouts are intentionally not cleaned up
    // as they represent retry attempts
  }, []);

  const handleLoad = useCallback(() => {
    if (imageKey) {
      loadedImagesRef.current.add(imageKey);
    }
    setLoading(false);
  }, [imageKey]);

  // Conditionally apply transition: only for dimension changes, not format changes
  const transitionClass = isDimensionChange ? 'transition-opacity duration-300' : 'transition-none';
  // Add responsive image classes: w-full makes images fill container width, h-auto maintains aspect ratio
  const classes = `w-full h-auto bg-gray-300 ${transitionClass} ${className || ''} ${loading ? 'animate-pulse bg-opacity-15 opacity-0' : 'opacity-100'}`;

  return (
    <picture ref={ref}>
      {thumbnails && thumbnails.map(thumbnail => (
          <source srcSet={thumbnail.url} key={thumbnail.url} media={thumbnail.mediaQuery} type={thumbnail.type}/>
        ))}
      {displayedImage && <img
        onLoad={handleLoad}
        onError={imageOnError}
        onClick={onClick}
        width={displayedImage.width}
        height={displayedImage.height}
        src={displayedImage.url}
        className={classes}
        alt={alt}
        loading="lazy"
      />}
     </picture>
  )
})
