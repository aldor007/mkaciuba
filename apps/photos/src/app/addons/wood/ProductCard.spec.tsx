import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageComponent } from '@mkaciuba/image';
import { createMockProduct } from '../../../../../../libs/api/src/test-utils/factories';
import { ProductCard } from './ProductCard';

jest.mock('@mkaciuba/image', () => {
  const actual = jest.requireActual('@mkaciuba/image');
  return {
    ...actual,
    ImageComponent: jest.fn(({ thumbnails, alt }: any) => (
      <img src={thumbnails?.[0]?.url} alt={alt} data-testid="image-component" />
    )),
  };
});

const mockedImageComponent = ImageComponent as unknown as jest.Mock;

const lastCallThumbnails = () => {
  const calls = mockedImageComponent.mock.calls;
  return calls[calls.length - 1][0].thumbnails;
};

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderCard = (overrides = {}, onQuickView = jest.fn()) =>
    render(<ProductCard product={createMockProduct(overrides)} onQuickView={onQuickView} />);

  test('should render name, price, dimensions and availability', () => {
    renderCard({ name: 'Test Product', price: 299, dimensions: '10x20x5', availability: 'in_stock' });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByTestId('product-price')).toHaveTextContent('299,00 zł');
    expect(screen.getByTestId('product-dimensions')).toHaveTextContent('10x20x5');
    expect(screen.getByTestId('product-availability')).toHaveTextContent('W magazynie');
  });

  test('should hide price and dimensions when missing', () => {
    renderCard({ price: null, dimensions: null });

    expect(screen.queryByTestId('product-price')).not.toBeInTheDocument();
    expect(screen.queryByTestId('product-dimensions')).not.toBeInTheDocument();
  });

  test('should render the placeholder when there are no images', () => {
    renderCard({ images: [] });

    const placeholder = screen.getByAltText('Test Product');
    expect(placeholder).toHaveAttribute(
      'src',
      'https://mort.mkaciuba.com/images/files/placeholder.jpg'
    );
    expect(screen.queryByTestId('product-dots')).not.toBeInTheDocument();
  });

  test('should render the first image by default', () => {
    const product = createMockProduct();
    render(<ProductCard product={product} onQuickView={jest.fn()} />);

    expect(lastCallThumbnails()).toEqual(product.images[0].thumbnails);
  });

  test('should preview the next image on hover and restore on leave', () => {
    const product = createMockProduct();
    render(<ProductCard product={product} onQuickView={jest.fn()} />);

    fireEvent.mouseEnter(screen.getByTestId('product-card-media'));
    expect(lastCallThumbnails()).toEqual(product.images[1].thumbnails);

    fireEvent.mouseLeave(screen.getByTestId('product-card-media'));
    expect(lastCallThumbnails()).toEqual(product.images[0].thumbnails);
  });

  test('should select the base image via dots', () => {
    const product = createMockProduct();
    render(<ProductCard product={product} onQuickView={jest.fn()} />);

    expect(screen.getAllByTestId(/product-dot-/)).toHaveLength(2);
    fireEvent.click(screen.getByTestId('product-dot-1'));
    expect(lastCallThumbnails()).toEqual(product.images[1].thumbnails);
  });

  test('should not render dots for a single image', () => {
    const product = createMockProduct({ images: [createMockProduct().images[0]] });
    render(<ProductCard product={product} onQuickView={jest.fn()} />);

    expect(screen.queryByTestId('product-dots')).not.toBeInTheDocument();
  });

  test('should open the quick view when the media is clicked', () => {
    const onQuickView = jest.fn();
    const product = createMockProduct();
    render(<ProductCard product={product} onQuickView={onQuickView} />);

    fireEvent.click(screen.getByTestId('product-card-media'));
    expect(onQuickView).toHaveBeenCalledWith(product);
  });

  test('should not open the quick view when a dot is clicked', () => {
    const onQuickView = jest.fn();
    render(<ProductCard product={createMockProduct()} onQuickView={onQuickView} />);

    fireEvent.click(screen.getByTestId('product-dot-1'));
    expect(onQuickView).not.toHaveBeenCalled();
  });
});
