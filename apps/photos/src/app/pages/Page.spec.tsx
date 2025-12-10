import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Page } from './Page';
import gql from 'graphql-tag';

const GET_PAGE = gql`
query  pageBySlug($slug: String!) {
  pageBySlug(
    slug: $slug
  ) {
    title
    keywords
    slug
    content
  }

}`;

// Mock components
jest.mock('../components/Footer', () => ({
  Footer: jest.fn(() => <div data-testid="footer">Footer</div>),
}));

jest.mock('../components/PostNavbar', () => ({
  PostNavbar: jest.fn(() => <div data-testid="post-navbar">PostNavbar</div>),
}));

jest.mock('@mkaciuba/ui-kit', () => ({
  LoadingMore: jest.fn(() => <div data-testid="loading-more">Loading...</div>),
  ErrorPage: jest.fn(({ code, message }) => (
    <div data-testid="error-page">
      Error {code}: {message}
    </div>
  )),
}));

describe('Page', () => {
  function renderPage(slug: string, mocks: MockedResponse[] = []) {
    return render(
      <MemoryRouter initialEntries={[`/page/${slug}`]}>
        <HelmetProvider>
          <MockedProvider mocks={mocks} addTypename={true}>
            <Routes>
              <Route path="/page/:slug" element={<Page />} />
            </Routes>
          </MockedProvider>
        </HelmetProvider>
      </MemoryRouter>
    );
  }

  function createPageQueryMock(options: {
    slug?: string;
    page?: any;
  } = {}): MockedResponse {
    const {
      slug = 'test-page',
      page = {
        title: 'Test Page',
        keywords: 'test, page',
        slug: 'test-page',
        content: '# Test Content\n\nThis is a test page.',
        __typename: 'Page',
      },
    } = options;

    return {
      request: {
        query: GET_PAGE,
        variables: { slug },
      },
      result: {
        data: {
          pageBySlug: page,
          __typename: 'Query',
        },
      },
    };
  }

  describe('GraphQL integration', () => {
    test('should render loading state initially', () => {
      const mocks = [createPageQueryMock()];

      renderPage('test-page', mocks);

      expect(screen.getByTestId('loading-more')).toBeInTheDocument();
    });

    test('should fetch page data successfully', async () => {
      const mocks = [createPageQueryMock()];

      renderPage('test-page', mocks);

      await waitFor(() => {
        expect(screen.getByText(/Test Content/)).toBeInTheDocument();
      });
    });

    test('should render error page on query error', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_PAGE,
          variables: { slug: 'test-page' },
        },
        error: new Error('Network error'),
      };

      renderPage('test-page', [errorMock]);

      await waitFor(() => {
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
        expect(screen.getByText(/Error 500/)).toBeInTheDocument();
      });
    });

    test('should render 404 when page is null', async () => {
      const mocks = [
        createPageQueryMock({
          page: null,
        }),
      ];

      renderPage('test-page', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
        expect(screen.getByText(/Error 404/)).toBeInTheDocument();
        expect(screen.getByText(/Page no found/)).toBeInTheDocument();
      });
    });

    test('should pass slug from route params to query', async () => {
      const mocks = [
        createPageQueryMock({
          slug: 'about-me',
        }),
      ];

      renderPage('about-me', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });
  });

  describe('content rendering', () => {
    test('should render markdown content', async () => {
      const mocks = [
        createPageQueryMock({
          page: {
            title: 'Test',
            keywords: 'test',
            slug: 'test',
            content: '# Heading\n\nParagraph text.',
            __typename: 'Page',
          },
        }),
      ];

      renderPage('test-page', mocks);

      await waitFor(() => {
        expect(screen.getByText(/Heading/)).toBeInTheDocument();
        expect(screen.getByText(/Paragraph text/)).toBeInTheDocument();
      });
    });

    test('should apply correct CSS classes to content container', async () => {
      const mocks = [createPageQueryMock()];

      const { container } = renderPage('test-page', mocks);

      await waitFor(() => {
        const contentDiv = container.querySelector('.max-w-screen-xl');
        expect(contentDiv).toBeInTheDocument();
        expect(contentDiv).toHaveClass('prose', 'post-text');
      });
    });
  });

  describe('component integration', () => {
    test('should render PostNavbar component', async () => {
      const mocks = [createPageQueryMock()];

      renderPage('test-page', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('post-navbar')).toBeInTheDocument();
      });
    });

    test('should render Footer component', async () => {
      const mocks = [createPageQueryMock()];

      renderPage('test-page', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });
  });

  describe('SEO meta tags', () => {
    test('should render title meta tag', async () => {
      const mocks = [
        createPageQueryMock({
          page: {
            title: 'About Me',
            keywords: 'about',
            slug: 'about',
            content: 'Content',
            __typename: 'Page',
          },
        }),
      ];

      renderPage('test-page', mocks);

      await waitFor(() => {
        const titleTag = document.querySelector('title');
        expect(titleTag?.textContent).toBe('About Me | mkaciuba.pl ');
      });
    });

    test('should render keywords meta tag', async () => {
      const mocks = [
        createPageQueryMock({
          page: {
            title: 'Test',
            keywords: 'photography, portfolio, web development',
            slug: 'test',
            content: 'Content',
            __typename: 'Page',
          },
        }),
      ];

      renderPage('test-page', mocks);

      await waitFor(() => {
        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        expect(keywordsMeta?.getAttribute('content')).toBe(
          'photography, portfolio, web development'
        );
      });
    });

    test('should render og:title meta tag', async () => {
      const mocks = [
        createPageQueryMock({
          page: {
            title: 'Contact',
            keywords: 'contact',
            slug: 'contact',
            content: 'Content',
            __typename: 'Page',
          },
        }),
      ];

      renderPage('test-page', mocks);

      await waitFor(() => {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        expect(ogTitle?.getAttribute('content')).toBe('Contact');
      });
    });
  });

  describe('edge cases', () => {
    test('should handle empty content', async () => {
      const mocks = [
        createPageQueryMock({
          page: {
            title: 'Empty Page',
            keywords: 'empty',
            slug: 'empty',
            content: '',
            __typename: 'Page',
          },
        }),
      ];

      renderPage('test-page', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });

    test('should handle special characters in title', async () => {
      const mocks = [
        createPageQueryMock({
          page: {
            title: 'Page & "Special" <Title>',
            keywords: 'test',
            slug: 'test',
            content: 'Content',
            __typename: 'Page',
          },
        }),
      ];

      renderPage('test-page', mocks);

      await waitFor(() => {
        const titleTag = document.querySelector('title');
        expect(titleTag?.textContent).toContain('Page & "Special" <Title>');
      });
    });
  });
});
