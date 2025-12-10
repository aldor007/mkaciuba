import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Categories } from './Categories';

// Import GET_GALLERY - we'll need to export it from Categories.tsx
import gql from 'graphql-tag';

// Mock components
jest.mock('../components/CategoriesList', () => ({
  CategoriesList: jest.fn(({ gallery }) => (
    <div data-testid="categories-list">CategoriesList: {gallery?.name}</div>
  )),
}));

jest.mock('../components/Footer', () => ({
  Footer: jest.fn(() => <div data-testid="footer">Footer</div>),
}));

jest.mock('../Header', () => ({
  __esModule: true,
  default: jest.fn(({ mainMenu }) => (
    <div data-testid="header">
      Header: {mainMenu?.map(m => m.name).join(', ')}
    </div>
  )),
}));

jest.mock('@mkaciuba/ui-kit', () => ({
  Loading: jest.fn(() => <div data-testid="loading">Loading...</div>),
  ErrorPage: jest.fn(({ code, message }) => (
    <div data-testid="error-page">
      Error {code}: {message}
    </div>
  )),
}));

const GET_GALLERY = gql`
query  galleryMenu($gallerySlug: String!) {
  galleryMenu(
    slug: $gallerySlug
  ) {
    gallery {
      id
      name
      slug
      keywords
      description
    }
    categories {
      slug
      name
    }
  }
}`;

describe('Categories', () => {
  function renderCategories(gallerySlug: string, mocks: MockedResponse[] = []) {
    return render(
      <MemoryRouter initialEntries={[`/gallery/${gallerySlug}`]}>
        <MockedProvider mocks={mocks} addTypename={true}>
          <Routes>
            <Route path="/gallery/:gallerySlug" element={<Categories />} />
          </Routes>
        </MockedProvider>
      </MemoryRouter>
    );
  }

  function createGalleryQueryMock(options: {
    gallerySlug?: string;
    gallery?: any;
    categories?: any[];
  } = {}): MockedResponse {
    const {
      gallerySlug = 'test-gallery',
      gallery = {
        id: '1',
        name: 'Test Gallery',
        slug: 'test-gallery',
        keywords: 'test, gallery',
        description: 'Test gallery description',
        __typename: 'Gallery',
      },
      categories = [
        { slug: 'cat-1', name: 'Category 1', __typename: 'Category' },
        { slug: 'cat-2', name: 'Category 2', __typename: 'Category' },
      ],
    } = options;

    return {
      request: {
        query: GET_GALLERY,
        variables: { gallerySlug },
      },
      result: {
        data: {
          galleryMenu: {
            gallery,
            categories,
            __typename: 'GalleryMenu',
          },
          __typename: 'Query',
        },
      },
    };
  }

  describe('GraphQL integration', () => {
    test('should render loading state initially', () => {
      const mocks = [createGalleryQueryMock()];

      renderCategories('test-gallery', mocks);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('should fetch gallery data successfully', async () => {
      const mocks = [createGalleryQueryMock()];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('categories-list')).toBeInTheDocument();
      });
    });

    test('should render error page on query error', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_GALLERY,
          variables: { gallerySlug: 'test-gallery' },
        },
        error: new Error('Network error'),
      };

      renderCategories('test-gallery', [errorMock]);

      await waitFor(() => {
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
        expect(screen.getByText(/Error 500/)).toBeInTheDocument();
      });
    });

    test('should render 404 when gallery is null', async () => {
      const mocks = [
        createGalleryQueryMock({
          gallery: null,
        }),
      ];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
        expect(screen.getByText(/Error 404/)).toBeInTheDocument();
        expect(screen.getByText(/Gallery no found/)).toBeInTheDocument();
      });
    });

    test('should pass gallerySlug from route params to query', async () => {
      const mocks = [
        createGalleryQueryMock({
          gallerySlug: 'custom-gallery',
        }),
      ];

      renderCategories('custom-gallery', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });
  });

  describe('CategoriesList integration', () => {
    test('should render CategoriesList component', async () => {
      const mocks = [createGalleryQueryMock()];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('categories-list')).toBeInTheDocument();
      });
    });

    test('should pass gallery prop to CategoriesList', async () => {
      const mocks = [
        createGalleryQueryMock({
          gallery: {
            id: '1',
            name: 'My Gallery',
            slug: 'my-gallery',
            keywords: 'test',
            description: 'Test',
            __typename: 'Gallery',
          },
        }),
      ];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        expect(screen.getByText(/CategoriesList: My Gallery/)).toBeInTheDocument();
      });
    });
  });

  describe('menu construction', () => {
    test('should render Header with mainMenu', async () => {
      const mocks = [createGalleryQueryMock()];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });

    test('should include gallery name in menu', async () => {
      const mocks = [
        createGalleryQueryMock({
          gallery: {
            id: '1',
            name: 'My Gallery',
            slug: 'my-gallery',
            keywords: 'test',
            description: 'Test',
            __typename: 'Gallery',
          },
        }),
      ];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        const allMatches = screen.getAllByText(/My Gallery/);
        expect(allMatches.length).toBeGreaterThan(0);
      });
    });

    test('should construct menu with categories as children', async () => {
      const mocks = [
        createGalleryQueryMock({
          categories: [
            { slug: 'nature', name: 'Nature', __typename: 'Category' },
            { slug: 'urban', name: 'Urban', __typename: 'Category' },
          ],
        }),
      ];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });

    test('should handle empty categories array', async () => {
      const mocks = [
        createGalleryQueryMock({
          categories: [],
        }),
      ];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });
  });

  describe('component integration', () => {
    test('should render Header component', async () => {
      const mocks = [createGalleryQueryMock()];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });

    test('should render Footer component', async () => {
      const mocks = [createGalleryQueryMock()];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    test('should handle gallery with special characters in name', async () => {
      const mocks = [
        createGalleryQueryMock({
          gallery: {
            id: '1',
            name: 'Gallery & "Special" <Name>',
            slug: 'test-gallery',
            keywords: 'test',
            description: 'Test',
            __typename: 'Gallery',
          },
        }),
      ];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        const allMatches = screen.getAllByText(/Gallery & "Special" <Name>/);
        expect(allMatches.length).toBeGreaterThan(0);
      });
    });

    test('should handle long gallery names', async () => {
      const mocks = [
        createGalleryQueryMock({
          gallery: {
            id: '1',
            name: 'This is a very long gallery name that should still render correctly',
            slug: 'test-gallery',
            keywords: 'test',
            description: 'Test',
            __typename: 'Gallery',
          },
        }),
      ];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        const allMatches = screen.getAllByText(
          /This is a very long gallery name that should still render correctly/
        );
        expect(allMatches.length).toBeGreaterThan(0);
      });
    });

    test('should handle multiple categories', async () => {
      const categories = Array.from({ length: 20 }, (_, i) => ({
        slug: `cat-${i}`,
        name: `Category ${i}`,
        __typename: 'Category' as const,
      }));

      const mocks = [
        createGalleryQueryMock({
          categories,
        }),
      ];

      renderCategories('test-gallery', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });
  });
});
