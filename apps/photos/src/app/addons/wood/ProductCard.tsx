import React, { useState } from 'react';
import { DefaultImgSizing, ImageComponent } from '@mkaciuba/image';
import { Product } from './types';
import { AVAILABILITY_OPTIONS, formatPrice } from './woodFilters';
import '../../../assets/category.css';

export interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

const AVAILABILITY_BADGE_CLASSES: Record<string, string> = {
  in_stock: 'bg-green-600',
  made_to_order: 'bg-amber-600',
  unavailable: 'bg-gray-500',
};

const findAvailabilityLabel = (availability?: string | null): string | null =>
  AVAILABILITY_OPTIONS.find((option) => option.value === availability)?.label || null;

/**
 * Product card for the /wood listing, styled like the site's existing cards
 * (image + .category-heading overlay bar). Multi-image support: hovering
 * previews the next image, dots select the base image directly.
 */
export const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const images = product.images || [];
  const displayIndex =
    images.length > 1 && hovered ? (imageIndex + 1) % images.length : imageIndex;
  const price = formatPrice(product.price);
  const availabilityLabel = findAvailabilityLabel(product.availability);

  return (
    <div data-testid={`product-card-${product.id}`}>
      <div
        className="relative overflow-hidden cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onQuickView(product)}
        data-testid="product-card-media"
      >
        {images.length === 0 ? (
          <img src="https://mort.mkaciuba.com/images/files/placeholder.jpg" alt={product.name} loading="lazy" />
        ) : (
          <ImageComponent
            thumbnails={images[displayIndex].thumbnails}
            alt={images[displayIndex].alternativeText || product.name}
            initialWidth={600}
            defaultImgSizing={DefaultImgSizing.BIGGER}
          />
        )}
        {availabilityLabel && (
          <span
            className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full text-white ${
              (product.availability && AVAILABILITY_BADGE_CLASSES[product.availability]) || 'bg-gray-500'
            }`}
            data-testid="product-availability"
          >
            {availabilityLabel}
          </span>
        )}
        {images.length > 1 && (
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2"
            data-testid="product-dots"
          >
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                aria-label={`Zdjęcie ${index + 1}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setImageIndex(index);
                }}
                className={
                  index === imageIndex
                    ? 'w-3 h-3 rounded-full bg-white'
                    : 'w-3 h-3 rounded-full bg-white bg-opacity-50 hover:bg-white'
                }
                data-testid={`product-dot-${index}`}
                data-active={index === imageIndex}
              />
            ))}
          </div>
        )}
      </div>
      <div className="category-heading">
        <h2 className="text-lg font-serif truncate">{product.name}</h2>
        {price && (
          <p className="text-sm" data-testid="product-price">
            {price}
          </p>
        )}
        {product.dimensions && (
          <p className="text-xs opacity-75" data-testid="product-dimensions">
            {product.dimensions}
          </p>
        )}
      </div>
    </div>
  );
};
