import React, { useEffect, useRef } from 'react';
import { Gallery, Item } from 'react-photoswipe-gallery';
import {
  ImageComponent,
  findImageForWidthClosestWithDPR,
  useWebPSupportStable,
} from '@mkaciuba/image';
import { Product } from './types';
import { AVAILABILITY_OPTIONS, MATERIAL_OPTIONS, formatPrice } from './woodFilters';

export interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
}

const findLabel = (
  options: Array<{ value: string; label: string }>,
  value?: string | null
): string | null => options.find((option) => option.value === value)?.label || null;

/**
 * Quick-view modal for a wood product: image gallery (photoswipe, same
 * lightbox as the photo galleries) plus price / dimensions / availability /
 * description. Closes on ESC, backdrop click or the close button.
 */
export const QuickView = ({ product, onClose }: QuickViewProps) => {
  // Hooks must run before the early return — the modal content is conditional, the hooks are not
  const webp = useWebPSupportStable();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [product, onClose]);

  if (!product) {
    return null;
  }

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const price = formatPrice(product.price);
  const availabilityLabel = findLabel(AVAILABILITY_OPTIONS, product.availability);
  const materialLabel = findLabel(MATERIAL_OPTIONS, product.material);
  const images = product.images || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      data-testid="wood-quick-view"
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        data-testid="wood-quick-view-backdrop"
      />
      <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Zamknij"
          data-testid="wood-quick-view-close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all text-lg"
        >
          ×
        </button>
        <div className="grid md:grid-cols-2 gap-6 p-4 md:p-6">
          <div data-testid="wood-quick-view-gallery">
            {/* @ts-expect-error - react-photoswipe-gallery types not fully compatible with React 18 */}
            <Gallery shareButton={false} id={`wood-${product.id}`}>
              {images.map((image) => {
                const lightboxImage = findImageForWidthClosestWithDPR(image.thumbnails, 1900, webp, dpr);
                if (!lightboxImage) {
                  return null;
                }
                return (
                  <Item
                    key={image.id}
                    original={lightboxImage.url}
                    thumbnail={lightboxImage.url}
                    width={lightboxImage.width}
                    height={lightboxImage.height}
                    title={image.caption || image.alternativeText || image.name || product.name}
                  >
                    {({ ref, open }) => (
                      <ImageComponent
                        ref={ref as React.RefObject<HTMLImageElement>}
                        thumbnails={image.thumbnails}
                        alt={image.alternativeText || product.name}
                        onClick={open}
                        className="cursor-pointer"
                      />
                    )}
                  </Item>
                );
              })}
            </Gallery>
          </div>
          <div>
            <h2 className="text-3xl font-serif mb-2" data-testid="wood-quick-view-name">
              {product.name}
            </h2>
            {price && (
              <p className="text-2xl font-bold mb-2" data-testid="wood-quick-view-price">
                {price}
              </p>
            )}
            {availabilityLabel && (
              <p className="mb-1" data-testid="wood-quick-view-availability">
                Dostępność: {availabilityLabel}
              </p>
            )}
            {materialLabel && (
              <p className="mb-1" data-testid="wood-quick-view-material">
                Materiał: {materialLabel}
              </p>
            )}
            {product.dimensions && (
              <p className="mb-4" data-testid="wood-quick-view-dimensions">
                Wymiary: {product.dimensions}
              </p>
            )}
            {product.description && (
              <p
                className="text-gray-700 whitespace-pre-line"
                data-testid="wood-quick-view-description"
              >
                {product.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
