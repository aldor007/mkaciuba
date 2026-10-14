import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { HelmetProvider } from 'react-helmet-async';
import { WoodPage } from './WoodPage';
import { GET_WOOD_PRODUCTS } from './queries';
import { DEFAULT_WOOD_SORT } from './woodFilters';
import {
  createMockProduct,
  createMockProducts,
} from '../../../../../../libs/api/src/test-utils/factories';

jest.mock('../../components/PostNavbar', () => ({
  PostNavbar: () => <nav data-testid="post-navbar" />,
}));

jest.mock('../../components/Footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

jest.mock('@mkaciuba/image', () => {
  const actual = jest.requireActual('@mkaciuba/image');
  return {
    ...actual,
    ImageComponent: jest.fn(({ thumbnails, alt }: any) => (
      <img src={thumbnails?.[0]?.url} alt={alt} data-testid="image-component" />
    )),
    findImageForWidthClosestWithDPR: jest.fn((images: any[]) => images?.[0] || null),
  };
});

jest.mock('react-photoswipe-gallery', () => ({
  Gallery: ({ children }: any) => <div data-testid="pswp-gallery">{children}</div>,
  Item: ({ children }: any) => <>{children({ ref: null, open: jest.fn() })}</>,
}));

const PAGE_SIZE = 12;

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>;
};

function createWoodQueryMock(
  options: {
    start?: number;
    sort?: string;
    where?: Record<string, string>;
    products?: any[];
    count?: number;
  } = {}
): MockedResponse {
  const {
    start = 0,
    sort = DEFAULT_WOOD_SORT,
    where = {},
    products = [
      createMockProduct({ id: 'product-1', name: 'First Product' }),
      createMockProduct({ id: 'product-2', name: 'Second Product' }),
    ],
    count,
  } = options;

  return {
    request: {
      query: GET_WOOD_PRODUCTS,
      variables: { start, limit: PAGE_SIZE, sort, where },
    },
    result: {
      data: {
        products,
        productsCount: count === undefined ? products.length : count,
      },
    },
  };
}

function renderWoodPage(mocks: MockedResponse[], initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <HelmetProvider>
        <MockedProvider mocks={mocks} addTypename={true}>
          <WoodPage />
        </MockedProvider>
      </HelmetProvider>
      <LocationProbe />
    </MemoryRouter>
  );
}

describe('WoodPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('rendering', () => {
    test('should render products with default query variables', async () => {
      renderWoodPage([createWoodQueryMock()]);

      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
        expect(screen.getByText('Second Product')).toBeInTheDocument();
      });
    });

    test('should render the page chrome (navbar, heading, footer)', async () => {
      renderWoodPage([createWoodQueryMock()]);

      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });
      expect(screen.getByTestId('post-navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('Woodworking')).toBeInTheDocument();
    });

    test('should show the result count', async () => {
      renderWoodPage([createWoodQueryMock()]);

      await waitFor(() => {
        expect(screen.getByText('Pozycje: 2')).toBeInTheDocument();
      });
    });

    test('should show the empty state for no products', async () => {
      renderWoodPage([createWoodQueryMock({ products: [], count: 0 })]);

      await waitFor(() => {
        expect(screen.getByTestId('wood-empty')).toHaveTextContent(
          'Brak produktów spełniających kryteria'
        );
      });
    });
  });

  describe('listing state from the URL', () => {
    test('should pass the sort from the URL', async () => {
      renderWoodPage([createWoodQueryMock({ sort: 'name:asc' })], '/?sort=name:asc');

      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });
    });

    test('should pass the material facet from the URL', async () => {
      renderWoodPage([createWoodQueryMock({ where: { material: 'oak' } })], '/?tag=oak');

      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });
    });

    test('should combine material and availability facets with AND', async () => {
      renderWoodPage(
        [
          createWoodQueryMock({
            where: { material: 'oak', availability: 'in_stock' },
          }),
        ],
        '/?tag=oak,in_stock'
      );

      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });
    });

    test('should seed start from the page param', async () => {
      renderWoodPage([createWoodQueryMock({ start: PAGE_SIZE })], '/?page=2');

      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });
    });

    test('should fall back to the default sort for invalid values', async () => {
      renderWoodPage([createWoodQueryMock()], '/?sort=bogus:x');

      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });
    });
  });

  describe('filter interactions', () => {
    test('should replace the material facet within its group', async () => {
      const mocks = [
        createWoodQueryMock({ where: { material: 'oak' } }),
        createWoodQueryMock({ where: { material: 'ash' } }),
      ];
      renderWoodPage(mocks, '/?tag=oak');

      await waitFor(() => {
        expect(screen.getByTestId('wood-pill-oak')).toHaveAttribute('data-active', 'true');
      });

      fireEvent.click(screen.getByTestId('wood-pill-ash'));

      await waitFor(() => {
        expect(screen.getByTestId('location-probe')).toHaveTextContent('/?tag=ash');
      });
      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });
    });

    test('should deselect a facet when its pill is clicked again', async () => {
      const mocks = [
        createWoodQueryMock({ where: { material: 'oak' } }),
        createWoodQueryMock(),
      ];
      renderWoodPage(mocks, '/?tag=oak');

      await waitFor(() => {
        expect(screen.getByTestId('wood-pill-oak')).toHaveAttribute('data-active', 'true');
      });

      fireEvent.click(screen.getByTestId('wood-pill-oak'));

      await waitFor(() => {
        expect(screen.getByTestId('location-probe')).toHaveTextContent('/');
      });
      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });
    });

    test('should clear all filters', async () => {
      const mocks = [
        createWoodQueryMock({ sort: 'name:asc', where: { material: 'oak' } }),
        createWoodQueryMock(),
      ];
      renderWoodPage(mocks, '/?tag=oak&sort=name:asc');

      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('wood-clear-all'));

      await waitFor(() => {
        expect(screen.getByTestId('location-probe')).toHaveTextContent('/');
      });
      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });
    });

    test('should change the sort via the select', async () => {
      const mocks = [createWoodQueryMock(), createWoodQueryMock({ sort: 'name:asc' })];
      renderWoodPage(mocks);

      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('wood-sort-select'), { target: { value: 'name:asc' } });

      await waitFor(() => {
        expect(screen.getByTestId('location-probe')).toHaveTextContent('/?sort=name:asc');
      });
      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });
    });
  });

  describe('load more', () => {
    test('should append the next page on button click', async () => {
      const mocks = [
        createWoodQueryMock({ products: createMockProducts(PAGE_SIZE), count: 20 }),
        createWoodQueryMock({
          start: PAGE_SIZE,
          products: createMockProducts(8, (index) => ({
            id: `more-product-${index + 1}`,
            name: `More Product ${index + 1}`,
          })),
          count: 20,
        }),
      ];
      renderWoodPage(mocks);

      await waitFor(() => {
        expect(screen.getByTestId('wood-load-more')).toBeInTheDocument();
      });
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('wood-load-more'));

      await waitFor(() => {
        expect(screen.getByText('More Product 1')).toBeInTheDocument();
        expect(screen.getByText('More Product 8')).toBeInTheDocument();
      });
      // All 20 loaded — the button disappears
      await waitFor(() => {
        expect(screen.queryByTestId('wood-load-more')).not.toBeInTheDocument();
      });
    });
  });

  describe('quick view', () => {
    test('should open the quick view for a product and close it', async () => {
      renderWoodPage([
        createWoodQueryMock({
          products: [createMockProduct({ id: 'product-1', name: 'First Product' })],
        }),
      ]);

      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('wood-quick-view')).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId('product-card-media'));

      await waitFor(() => {
        expect(screen.getByTestId('wood-quick-view')).toBeInTheDocument();
      });
      expect(screen.getByTestId('wood-quick-view-name')).toHaveTextContent('First Product');

      fireEvent.click(screen.getByTestId('wood-quick-view-close'));

      await waitFor(() => {
        expect(screen.queryByTestId('wood-quick-view')).not.toBeInTheDocument();
      });
    });
  });

  describe('grid density', () => {
    test('should apply the selected column density', async () => {
      const { container } = renderWoodPage([createWoodQueryMock()]);

      await waitFor(() => {
        expect(screen.getByText('First Product')).toBeInTheDocument();
      });

      const gridItem = () => container.querySelector('[data-testid="wood-grid"] > div');
      expect(gridItem()).toHaveClass('md:w-1/2');

      fireEvent.click(screen.getByTestId('grid-cols-3'));

      await waitFor(() => {
        expect(gridItem()).toHaveClass('md:w-1/3');
      });
    });
  });
});
