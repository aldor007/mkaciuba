import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickView } from './QuickView';
import { createMockProduct } from '../../../../../../libs/api/src/test-utils/factories';

jest.mock('react-photoswipe-gallery', () => ({
  Gallery: ({ children }: any) => <div data-testid="pswp-gallery">{children}</div>,
  Item: ({ children }: any) => <>{children({ ref: null, open: jest.fn() })}</>,
}));

jest.mock('@mkaciuba/image', () => {
  const actual = jest.requireActual('@mkaciuba/image');
  return {
    ...actual,
    ImageComponent: jest.fn(({ thumbnails, alt, onClick }: any) => (
      <img
        src={thumbnails?.[0]?.url}
        alt={alt}
        onClick={onClick}
        data-testid="quick-view-image"
      />
    )),
    findImageForWidthClosestWithDPR: jest.fn((images: any[]) => images?.[0] || null),
  };
});

describe('QuickView', () => {
  test('should render nothing without a product', () => {
    const { container } = render(<QuickView product={null} onClose={jest.fn()} />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('wood-quick-view')).not.toBeInTheDocument();
  });

  test('should render the product details', () => {
    render(<QuickView product={createMockProduct()} onClose={jest.fn()} />);

    expect(screen.getByTestId('wood-quick-view-name')).toHaveTextContent('Test Product');
    expect(screen.getByTestId('wood-quick-view-price')).toHaveTextContent('299,00 zł');
    expect(screen.getByTestId('wood-quick-view-availability')).toHaveTextContent(
      'Dostępność: W magazynie'
    );
    expect(screen.getByTestId('wood-quick-view-material')).toHaveTextContent('Materiał: Dąb');
    expect(screen.getByTestId('wood-quick-view-dimensions')).toHaveTextContent('Wymiary: 38x27x4');
    expect(screen.getByTestId('wood-quick-view-description')).toBeInTheDocument();
  });

  test('should hide optional fields when missing', () => {
    render(
      <QuickView
        product={createMockProduct({
          price: null,
          dimensions: null,
          description: null,
          availability: null,
          material: null,
        })}
        onClose={jest.fn()}
      />
    );

    expect(screen.queryByTestId('wood-quick-view-price')).not.toBeInTheDocument();
    expect(screen.queryByTestId('wood-quick-view-availability')).not.toBeInTheDocument();
    expect(screen.queryByTestId('wood-quick-view-material')).not.toBeInTheDocument();
    expect(screen.queryByTestId('wood-quick-view-dimensions')).not.toBeInTheDocument();
    expect(screen.queryByTestId('wood-quick-view-description')).not.toBeInTheDocument();
  });

  test('should render one gallery image per product image', () => {
    render(<QuickView product={createMockProduct()} onClose={jest.fn()} />);

    expect(screen.getByTestId('pswp-gallery')).toBeInTheDocument();
    expect(screen.getAllByTestId('quick-view-image')).toHaveLength(2);
  });

  test('should close on Escape', () => {
    const onClose = jest.fn();
    render(<QuickView product={createMockProduct()} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('should close on backdrop click', () => {
    const onClose = jest.fn();
    render(<QuickView product={createMockProduct()} onClose={onClose} />);

    fireEvent.click(screen.getByTestId('wood-quick-view-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('should close on the close button', () => {
    const onClose = jest.fn();
    render(<QuickView product={createMockProduct()} onClose={onClose} />);

    fireEvent.click(screen.getByTestId('wood-quick-view-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
