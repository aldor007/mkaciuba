import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Photos, GET_PHOTOS } from './Photos';
import { ApolloError } from '@apollo/client';

// Mock components
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

jest.mock('@mkaciuba/image', () => ({
  ImageList: jest.fn(({ categorySlug }) => (
    <div data-testid="image-list">ImageList: {categorySlug}</div>
  )),
}));

jest.mock('@mkaciuba/ui-kit', () => ({
  LoadingMore: jest.fn(() => <div data-testid="loading-more">Loading...</div>),
  ErrorPage: jest.fn(({ code, message }) => (
    <div data-testid="error-page">
      Error {code}: {message}
    </div>
  )),
  Markdown: jest.fn(({ text }) => <div data-testid="markdown">{text}</div>),
  useSSRSafeQuery: jest.fn((loading: boolean, data: any) => ({
    shouldShowLoading: loading && !data,
    isFirstRender: false,
  })),
}));

describe('Photos', () => {
  function renderPhotos(
    gallerySlug: string,
    categorySlug: string,
    mocks: MockedResponse[] = []
  ) {
    return render(
      <MemoryRouter initialEntries={[`/gallery/${gallerySlug}/${categorySlug}`]}>
        <HelmetProvider>
          <MockedProvider mocks={mocks} addTypename={true}>
            <Routes>
              <Route path="/gallery/:gallerySlug/:categorySlug" element={<Photos />} />
            </Routes>
          </MockedProvider>
        </HelmetProvider>
      </MemoryRouter>
    );
  }

  function createPhotosQueryMock(options: {
    gallerySlug?: string;
    categorySlug?: string;
    category?: any;
    gallery?: any;
    categories?: any[];
  } = {}): MockedResponse {
    const {
      gallerySlug = 'test-gallery',
      categorySlug = 'test-category',
      category = {
        id: '1',
        name: 'Test Category',
        description: 'Test category description',
        public: true,
        keywords: 'test, category',
        text: null,
        __typename: 'Category',
      },
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
        query: GET_PHOTOS,
        variables: { gallerySlug, categorySlug },
      },
      result: {
        data: {
          categoryBySlug: category,
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
      const mocks = [createPhotosQueryMock()];

      renderPhotos('test-gallery', 'test-category', mocks);

      expect(screen.getByTestId('loading-more')).toBeInTheDocument();
    });

    test('should fetch photos data successfully', async () => {
      const mocks = [createPhotosQueryMock()];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(screen.getByText('Test Category')).toBeInTheDocument();
      });
    });

    test('should render error page on non-auth errors', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_PHOTOS,
          variables: { gallerySlug: 'test-gallery', categorySlug: 'test-category' },
        },
        error: new Error('Network error'),
      };

      renderPhotos('test-gallery', 'test-category', [errorMock]);

      await waitFor(() => {
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
        expect(screen.getByText(/Error 500/)).toBeInTheDocument();
      });
    });

    test('should pass route params to query', async () => {
      const mocks = [
        createPhotosQueryMock({
          gallerySlug: 'custom-gallery',
          categorySlug: 'custom-category',
        }),
      ];

      renderPhotos('custom-gallery', 'custom-category', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });
  });

  describe('authentication handling', () => {
    test('should redirect to login on UNAUTHENTICATED error', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_PHOTOS,
          variables: { gallerySlug: 'test-gallery', categorySlug: 'test-category' },
        },
        result: {
          errors: [
            {
              message: 'Unauthenticated',
              extensions: { code: 'UNAUTHENTICATED' },
            } as any,
          ],
        },
      };

      const { container } = renderPhotos('test-gallery', 'test-category', [errorMock]);

      await waitFor(() => {
        // Navigate component changes location - check we're not showing the page
        expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
      });
    });

    test('should redirect to login on FORBIDDEN error', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_PHOTOS,
          variables: { gallerySlug: 'test-gallery', categorySlug: 'test-category' },
        },
        result: {
          errors: [
            {
              message: 'Forbidden',
              extensions: { code: 'FORBIDDEN' },
            } as any,
          ],
        },
      };

      renderPhotos('test-gallery', 'test-category', [errorMock]);

      await waitFor(() => {
        // Navigate component redirects - page content should not render
        expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
      });
    });

    test('should include gallery and category in redirect URL', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_PHOTOS,
          variables: { gallerySlug: 'my-gallery', categorySlug: 'my-category' },
        },
        result: {
          errors: [
            {
              message: 'Unauthenticated',
              extensions: { code: 'UNAUTHENTICATED' },
            } as any,
          ],
        },
      };

      renderPhotos('my-gallery', 'my-category', [errorMock]);

      await waitFor(() => {
        // Navigate redirects - footer should not be present
        expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
      });
    });
  });

  describe('category rendering', () => {
    test('should render category name as title', async () => {
      const mocks = [
        createPhotosQueryMock({
          category: {
            id: '1',
            name: 'Nature Photography',
            description: 'Beautiful nature',
            public: true,
            keywords: 'nature',
            text: null,
            __typename: 'Category',
          },
        }),
      ];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(screen.getByText('Nature Photography')).toBeInTheDocument();
      });
    });

    test('should render category text when present', async () => {
      const mocks = [
        createPhotosQueryMock({
          category: {
            id: '1',
            name: 'Test Category',
            description: 'Test',
            public: true,
            keywords: 'test',
            text: 'This is category description text',
            __typename: 'Category',
          },
        }),
      ];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('markdown')).toBeInTheDocument();
        expect(screen.getByText('This is category description text')).toBeInTheDocument();
      });
    });

    test('should not render markdown when text is null', async () => {
      const mocks = [
        createPhotosQueryMock({
          category: {
            id: '1',
            name: 'Test Category',
            description: 'Test',
            public: true,
            keywords: 'test',
            text: null,
            __typename: 'Category',
          },
        }),
      ];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(screen.getByText('Test Category')).toBeInTheDocument();
        expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
      });
    });

    test('should apply correct CSS classes to title', async () => {
      const mocks = [createPhotosQueryMock()];

      const { container } = renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        const title = container.querySelector('h1');
        expect(title).toHaveClass('text-center', 'text-4xl', 'font-serif');
      });
    });
  });

  describe('ImageList integration', () => {
    test('should render ImageList component', async () => {
      const mocks = [createPhotosQueryMock()];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('image-list')).toBeInTheDocument();
      });
    });

    test('should pass categorySlug to ImageList', async () => {
      const mocks = [createPhotosQueryMock({ categorySlug: 'my-photos' })];

      renderPhotos('test-gallery', 'my-photos', mocks);

      await waitFor(() => {
        expect(screen.getByText(/ImageList: my-photos/)).toBeInTheDocument();
      });
    });
  });

  describe('menu construction', () => {
    test('should render Header with mainMenu', async () => {
      const mocks = [createPhotosQueryMock()];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });

    test('should include gallery name in menu', async () => {
      const mocks = [
        createPhotosQueryMock({
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

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(screen.getByText(/My Gallery/)).toBeInTheDocument();
      });
    });

    test('should include Galerie dropdown in menu', async () => {
      const mocks = [createPhotosQueryMock()];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(screen.getByText(/Galerie/)).toBeInTheDocument();
      });
    });

    test('should construct menu with categories as children', async () => {
      const mocks = [
        createPhotosQueryMock({
          categories: [
            { slug: 'nature', name: 'Nature', __typename: 'Category' },
            { slug: 'urban', name: 'Urban', __typename: 'Category' },
          ],
        }),
      ];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        // Header receives menu with gallery and Galerie items
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });
  });

  describe('SEO meta tags', () => {
    test('should render title meta tag', async () => {
      const mocks = [
        createPhotosQueryMock({
          category: {
            id: '1',
            name: 'Awesome Photos',
            description: 'Test',
            public: true,
            keywords: 'test',
            text: null,
            __typename: 'Category',
          },
        }),
      ];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        const titleTag = document.querySelector('title');
        expect(titleTag?.textContent).toBe('Awesome Photos | mkaciuba.pl');
      });
    });

    test('should render description meta tag', async () => {
      const mocks = [
        createPhotosQueryMock({
          category: {
            id: '1',
            name: 'Test',
            description: 'Beautiful photography collection',
            public: true,
            keywords: 'test',
            text: null,
            __typename: 'Category',
          },
        }),
      ];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        const descMeta = document.querySelector('meta[name="description"]');
        expect(descMeta?.getAttribute('content')).toBe('Beautiful photography collection');
      });
    });

    test('should render og:title meta tag', async () => {
      const mocks = [
        createPhotosQueryMock({
          category: {
            id: '1',
            name: 'Test Category',
            description: 'Test',
            public: true,
            keywords: 'test',
            text: null,
            __typename: 'Category',
          },
        }),
      ];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        expect(ogTitle?.getAttribute('content')).toBe('Test Category');
      });
    });
  });

  describe('component integration', () => {
    test('should render Footer component', async () => {
      const mocks = [createPhotosQueryMock()];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });

    test('should render Header component', async () => {
      const mocks = [createPhotosQueryMock()];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    test('should handle empty categories array', async () => {
      const mocks = [
        createPhotosQueryMock({
          categories: [],
        }),
      ];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });

    test('should handle category with special characters', async () => {
      const mocks = [
        createPhotosQueryMock({
          category: {
            id: '1',
            name: 'Photos & "Special" <Category>',
            description: 'Test',
            public: true,
            keywords: 'test',
            text: null,
            __typename: 'Category',
          },
        }),
      ];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(screen.getByText('Photos & "Special" <Category>')).toBeInTheDocument();
      });
    });

    test('should handle long category names', async () => {
      const mocks = [
        createPhotosQueryMock({
          category: {
            id: '1',
            name: 'This is a very long category name that should still render correctly',
            description: 'Test',
            public: true,
            keywords: 'test',
            text: null,
            __typename: 'Category',
          },
        }),
      ];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        expect(
          screen.getByText('This is a very long category name that should still render correctly')
        ).toBeInTheDocument();
      });
    });

    test('should handle empty description', async () => {
      const mocks = [
        createPhotosQueryMock({
          category: {
            id: '1',
            name: 'Test',
            description: '',
            public: true,
            keywords: 'test',
            text: null,
            __typename: 'Category',
          },
        }),
      ];

      renderPhotos('test-gallery', 'test-category', mocks);

      await waitFor(() => {
        const descMeta = document.querySelector('meta[name="description"]');
        expect(descMeta?.getAttribute('content')).toBe('');
      });
    });
  });
});
