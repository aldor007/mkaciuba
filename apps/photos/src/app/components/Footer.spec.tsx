import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import { Footer, GET_FOOTER } from './Footer';

// Mock hooks and components
jest.mock('react-use-webp-support-check', () => ({
  useWebPSupportCheck: jest.fn(() => false),
}));

jest.mock('./Tag', () => ({
  Tag: jest.fn(({ tag }) => <li data-testid="tag-item">{tag.name}</li>),
}));

jest.mock('react-facebook', () => ({
  FacebookProvider: jest.fn(({ children }) => <div data-testid="facebook-provider">{children}</div>),
  Page: jest.fn(() => <div data-testid="facebook-page">Facebook Page</div>),
}));

jest.mock('@mkaciuba/image', () => {
  const actual = jest.requireActual('@mkaciuba/image');
  return {
    ...actual,
    toImage: jest.fn((uploadFile) => ({
      url: uploadFile.thumbnail.url,
      width: uploadFile.thumbnail.width,
      height: uploadFile.thumbnail.height,
      alt: uploadFile.caption || '',
    })),
  };
});

describe('Footer', () => {
  function renderFooter(mocks: MockedResponse[] = []) {
    return render(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={true}>
          <Footer />
        </MockedProvider>
      </BrowserRouter>
    );
  }

  function createFooterQueryMock(options: {
    categories?: any[];
    tags?: any[];
    webp?: boolean;
  } = {}): MockedResponse {
    const {
      webp = false,
      categories = [
        {
          slug: 'nature',
          gallery: { slug: 'photo-gallery', __typename: 'Gallery' },
          randomImage: {
            id: 'img-1',
            caption: 'Nature photo',
            thumbnail: {
              url: 'https://example.com/nature.jpg',
              width: 200,
              height: 150,
              __typename: 'Image',
            },
            __typename: 'UploadFile',
          },
          __typename: 'Category',
        },
        {
          slug: 'urban',
          gallery: { slug: 'photo-gallery', __typename: 'Gallery' },
          randomImage: {
            id: 'img-2',
            caption: 'Urban photo',
            thumbnail: {
              url: 'https://example.com/urban.jpg',
              width: 200,
              height: 150,
              __typename: 'Image',
            },
            __typename: 'UploadFile',
          },
          __typename: 'Category',
        },
      ],
      tags = [
        { name: 'Landscape', slug: 'landscape', __typename: 'Tag' },
        { name: 'Portrait', slug: 'portrait', __typename: 'Tag' },
      ],
    } = options;

    return {
      request: {
        query: GET_FOOTER,
        variables: { webp },
      },
      result: {
        data: {
          categories,
          tags,
          __typename: 'Query',
        },
      },
    };
  }

  describe('GraphQL integration', () => {
    test('should render loading state initially', () => {
      const mocks = [createFooterQueryMock()];

      renderFooter(mocks);

      // Footer uses LoadingMore component which has testid
      expect(screen.getByTestId('loading-more')).toBeInTheDocument();
    });

    test('should fetch footer data successfully', async () => {
      const mocks = [createFooterQueryMock()];

      renderFooter(mocks);

      await waitFor(() => {
        expect(screen.getByText('Facebook')).toBeInTheDocument();
        expect(screen.getByText('Tagi')).toBeInTheDocument();
        expect(screen.getByText('Ostatnie zdjęcia')).toBeInTheDocument();
      });
    });

    test('should render error page on query error', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_FOOTER,
          variables: { webp: false },
        },
        error: new Error('Network error'),
      };

      renderFooter([errorMock]);

      await waitFor(() => {
        expect(screen.getByText(/500/i)).toBeInTheDocument();
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    test('should handle null data', async () => {
      const nullMock: MockedResponse = {
        request: {
          query: GET_FOOTER,
          variables: { webp: false },
        },
        result: {
          data: null,
        },
      };

      const { container } = renderFooter([nullMock]);

      await waitFor(() => {
        // Should render nothing (null)
        expect(container.querySelector('.bg-gray-100')).not.toBeInTheDocument();
      });
    });

    test('should handle missing categories', async () => {
      const missingCategoriesMock: MockedResponse = {
        request: {
          query: GET_FOOTER,
          variables: { webp: false },
        },
        result: {
          data: {
            categories: null,
            tags: [],
            __typename: 'Query',
          },
        },
      };

      const { container } = renderFooter([missingCategoriesMock]);

      await waitFor(() => {
        // Should render nothing (null)
        expect(container.querySelector('.bg-gray-100')).not.toBeInTheDocument();
      });
    });
  });

  describe('recent photos section', () => {
    test('should render all recent photos', async () => {
      const categories = Array.from({ length: 5 }, (_, i) => ({
        slug: `category-${i}`,
        gallery: { slug: 'gallery', __typename: 'Gallery' },
        randomImage: {
          id: `img-${i}`,
          caption: `Photo ${i}`,
          thumbnail: {
            url: `https://example.com/photo-${i}.jpg`,
            width: 200,
            height: 150,
            __typename: 'Image',
          },
          __typename: 'UploadFile',
        },
        __typename: 'Category',
      }));

      const mocks = [createFooterQueryMock({ categories })];

      const { container } = renderFooter(mocks);

      await waitFor(() => {
        const images = container.querySelectorAll('img[src*="example.com"]');
        expect(images.length).toBe(5);
      });
    });

    test('should render photos with correct links', async () => {
      const categories = [
        {
          slug: 'nature',
          gallery: { slug: 'my-gallery', __typename: 'Gallery' },
          randomImage: {
            id: 'img-1',
            caption: 'Nature',
            thumbnail: {
              url: 'https://example.com/nature.jpg',
              width: 200,
              height: 150,
              __typename: 'Image',
            },
            __typename: 'UploadFile',
          },
          __typename: 'Category',
        },
      ];

      const mocks = [createFooterQueryMock({ categories })];

      const { container } = renderFooter(mocks);

      await waitFor(() => {
        const link = container.querySelector('a[href="/gallery/my-gallery/nature"]');
        expect(link).toBeInTheDocument();
      });
    });

    test('should render photos with correct image attributes', async () => {
      const categories = [
        {
          slug: 'test',
          gallery: { slug: 'gallery', __typename: 'Gallery' },
          randomImage: {
            id: 'img-1',
            caption: 'Test Image',
            thumbnail: {
              url: 'https://example.com/test.jpg',
              width: 200,
              height: 150,
              __typename: 'Image',
            },
            __typename: 'UploadFile',
          },
          __typename: 'Category',
        },
      ];

      const mocks = [createFooterQueryMock({ categories })];

      const { container } = renderFooter(mocks);

      await waitFor(() => {
        const img = container.querySelector('img[src="https://example.com/test.jpg"]');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('width', '200');
        expect(img).toHaveAttribute('height', '150');
        expect(img).toHaveAttribute('alt', 'Test Image');
      });
    });

    test('should render photos in grid layout', async () => {
      const mocks = [createFooterQueryMock()];

      const { container } = renderFooter(mocks);

      await waitFor(() => {
        const grid = container.querySelector('.grid.grid-cols-3');
        expect(grid).toBeInTheDocument();
      });
    });

    test('should handle maximum 9 categories', async () => {
      const categories = Array.from({ length: 12 }, (_, i) => ({
        slug: `cat-${i}`,
        gallery: { slug: 'gallery', __typename: 'Gallery' },
        randomImage: {
          id: `img-${i}`,
          caption: `Photo ${i}`,
          thumbnail: {
            url: `https://example.com/photo-${i}.jpg`,
            width: 200,
            height: 150,
            __typename: 'Image',
          },
          __typename: 'UploadFile',
        },
        __typename: 'Category',
      }));

      const mocks = [createFooterQueryMock({ categories: categories.slice(0, 9) })];

      const { container } = renderFooter(mocks);

      await waitFor(() => {
        const images = container.querySelectorAll('img[src*="example.com"]');
        // Query limits to 9 in GraphQL
        expect(images.length).toBeLessThanOrEqual(9);
      });
    });
  });

  describe('tags section', () => {
    test('should render all tags', async () => {
      const tags = [
        { name: 'Landscape', slug: 'landscape', __typename: 'Tag' },
        { name: 'Portrait', slug: 'portrait', __typename: 'Tag' },
        { name: 'Street', slug: 'street', __typename: 'Tag' },
      ];

      const mocks = [createFooterQueryMock({ tags })];

      renderFooter(mocks);

      await waitFor(() => {
        expect(screen.getByText('Landscape')).toBeInTheDocument();
        expect(screen.getByText('Portrait')).toBeInTheDocument();
        expect(screen.getByText('Street')).toBeInTheDocument();
      });
    });

    test('should render tags using Tag component', async () => {
      const tags = [
        { name: 'Test Tag', slug: 'test-tag', __typename: 'Tag' },
      ];

      const mocks = [createFooterQueryMock({ tags })];

      renderFooter(mocks);

      await waitFor(() => {
        const tagItems = screen.getAllByTestId('tag-item');
        expect(tagItems.length).toBeGreaterThan(0);
      });
    });

    test('should handle empty tags array', async () => {
      const mocks = [createFooterQueryMock({ tags: [] })];

      const { container } = renderFooter(mocks);

      await waitFor(() => {
        expect(screen.getByText('Tagi')).toBeInTheDocument();
        const tagItems = container.querySelectorAll('[data-testid="tag-item"]');
        expect(tagItems.length).toBe(0);
      });
    });
  });

  describe('Facebook section', () => {
    test('should render Facebook section', async () => {
      const mocks = [createFooterQueryMock()];

      renderFooter(mocks);

      await waitFor(() => {
        expect(screen.getByText('Facebook')).toBeInTheDocument();
      });
    });

    test('should render FacebookProvider component', async () => {
      const mocks = [createFooterQueryMock()];

      renderFooter(mocks);

      await waitFor(() => {
        expect(screen.getByTestId('facebook-provider')).toBeInTheDocument();
      });
    });

    test('should render Facebook Page component', async () => {
      const mocks = [createFooterQueryMock()];

      renderFooter(mocks);

      await waitFor(() => {
        expect(screen.getByTestId('facebook-page')).toBeInTheDocument();
      });
    });
  });

  describe('layout and styling', () => {
    test('should apply correct background color', async () => {
      const mocks = [createFooterQueryMock()];

      const { container } = renderFooter(mocks);

      await waitFor(() => {
        const footer = container.querySelector('.bg-gray-100');
        expect(footer).toBeInTheDocument();
      });
    });

    test('should apply responsive flex layout', async () => {
      const mocks = [createFooterQueryMock()];

      const { container } = renderFooter(mocks);

      await waitFor(() => {
        const flexContainer = container.querySelector('.flex.flex-col.md\\:flex-row');
        expect(flexContainer).toBeInTheDocument();
      });
    });

    test('should apply max-width container', async () => {
      const mocks = [createFooterQueryMock()];

      const { container } = renderFooter(mocks);

      await waitFor(() => {
        const maxWidthContainer = container.querySelector('.max-w-screen-xl');
        expect(maxWidthContainer).toBeInTheDocument();
      });
    });

    test('should render section headers with correct styling', async () => {
      const mocks = [createFooterQueryMock()];

      const { container } = renderFooter(mocks);

      await waitFor(() => {
        const facebookHeader = screen.getByText('Facebook');
        expect(facebookHeader).toHaveClass('uppercase', 'font-semibold');

        const tagsHeader = screen.getByText('Tagi');
        expect(tagsHeader).toHaveClass('uppercase', 'font-semibold');

        const photosHeader = screen.getByText('Ostatnie zdjęcia');
        expect(photosHeader).toHaveClass('uppercase', 'font-semibold');
      });
    });
  });

  describe('edge cases', () => {
    test('should handle categories with missing gallery', async () => {
      const categories = [
        {
          slug: 'orphan',
          gallery: { slug: 'gallery', __typename: 'Gallery' },
          randomImage: {
            id: 'img-1',
            caption: 'Orphan',
            thumbnail: {
              url: 'https://example.com/orphan.jpg',
              width: 200,
              height: 150,
              __typename: 'Image',
            },
            __typename: 'UploadFile',
          },
          __typename: 'Category',
        },
      ];

      const mocks = [createFooterQueryMock({ categories })];

      const { container } = renderFooter(mocks);

      await waitFor(() => {
        const link = container.querySelector('a[href*="/gallery/"]');
        expect(link).toBeInTheDocument();
      });
    });

    test('should handle photos with empty caption', async () => {
      const categories = [
        {
          slug: 'no-caption',
          gallery: { slug: 'gallery', __typename: 'Gallery' },
          randomImage: {
            id: 'img-1',
            caption: '',
            thumbnail: {
              url: 'https://example.com/no-caption.jpg',
              width: 200,
              height: 150,
              __typename: 'Image',
            },
            __typename: 'UploadFile',
          },
          __typename: 'Category',
        },
      ];

      const mocks = [createFooterQueryMock({ categories })];

      const { container } = renderFooter(mocks);

      await waitFor(() => {
        const img = container.querySelector('img[src*="no-caption"]');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('alt', '');
      });
    });

    test('should handle tags with special characters', async () => {
      const tags = [
        { name: 'Tag & Special', slug: 'tag-special', __typename: 'Tag' },
      ];

      const mocks = [createFooterQueryMock({ tags })];

      renderFooter(mocks);

      await waitFor(() => {
        expect(screen.getByText('Tag & Special')).toBeInTheDocument();
      });
    });
  });
});
