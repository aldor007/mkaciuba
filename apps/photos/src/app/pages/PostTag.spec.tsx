import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { PostTag } from './PostTag';
import gql from 'graphql-tag';
import { POST_TYPE } from '../components/Posts';

const GET_POST_TAG = gql`
  query ($slug: String!) {
    tagBySlug(
    slug: $slug
  ) {
    id
    name
  }
}
`;

// Mock components
jest.mock('../components/Footer', () => ({
  Footer: jest.fn(() => <div data-testid="footer">Footer</div>),
}));

jest.mock('../Header', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="header">Header</div>),
}));

jest.mock('../components/Posts', () => ({
  Posts: jest.fn(({ id, type }) => (
    <div data-testid="posts">
      Posts: {type}, ID: {id}
    </div>
  )),
  POST_TYPE: {
    ALL: 'ALL',
    CATGORY: 'CATGORY',
    TAG: 'TAG',
  },
}));

jest.mock('@mkaciuba/ui-kit', () => ({
  Loading: jest.fn(() => <div data-testid="loading">Loading...</div>),
  ErrorPage: jest.fn(({ code, message }) => (
    <div data-testid="error-page">
      Error {code}: {message}
    </div>
  )),
}));

describe('PostTag', () => {
  function renderPostTag(slug: string, mocks: MockedResponse[] = []) {
    return render(
      <MemoryRouter initialEntries={[`/blog/tag/${slug}`]}>
        <HelmetProvider>
          <MockedProvider mocks={mocks} addTypename={true}>
            <Routes>
              <Route path="/blog/tag/:slug" element={<PostTag />} />
            </Routes>
          </MockedProvider>
        </HelmetProvider>
      </MemoryRouter>
    );
  }

  function createPostTagQueryMock(options: {
    slug?: string;
    tag?: any;
  } = {}): MockedResponse {
    const {
      slug = 'test-tag',
      tag = {
        id: '1',
        name: 'Test Tag',
        __typename: 'Tag',
      },
    } = options;

    return {
      request: {
        query: GET_POST_TAG,
        variables: { slug },
      },
      result: {
        data: {
          tagBySlug: tag,
          __typename: 'Query',
        },
      },
    };
  }

  describe('GraphQL integration', () => {
    test('should render loading state initially', () => {
      const mocks = [createPostTagQueryMock()];

      renderPostTag('test-tag', mocks);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('should fetch tag data successfully', async () => {
      const mocks = [createPostTagQueryMock()];

      renderPostTag('test-tag', mocks);

      await waitFor(() => {
        expect(screen.getByText(/Posty z tagu: Test Tag/)).toBeInTheDocument();
      });
    });

    test('should render error page on query error', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_POST_TAG,
          variables: { slug: 'test-tag' },
        },
        error: new Error('Network error'),
      };

      renderPostTag('test-tag', [errorMock]);

      await waitFor(() => {
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
        expect(screen.getByText(/Error 500/)).toBeInTheDocument();
      });
    });

    test('should render 404 when tag is null', async () => {
      const mocks = [
        createPostTagQueryMock({
          tag: null,
        }),
      ];

      renderPostTag('test-tag', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
        expect(screen.getByText(/Error 404/)).toBeInTheDocument();
        expect(screen.getByText(/Tag no found/)).toBeInTheDocument();
      });
    });

    test('should pass slug from route params to query', async () => {
      const mocks = [
        createPostTagQueryMock({
          slug: 'custom-tag',
        }),
      ];

      renderPostTag('custom-tag', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });
  });

  describe('component rendering', () => {
    test('should render Header component', async () => {
      const mocks = [createPostTagQueryMock()];

      renderPostTag('test-tag', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });

    test('should render tag title', async () => {
      const mocks = [
        createPostTagQueryMock({
          tag: {
            id: '1',
            name: 'JavaScript',
            __typename: 'Tag',
          },
        }),
      ];

      renderPostTag('test-tag', mocks);

      await waitFor(() => {
        expect(screen.getByText(/Posty z tagu: JavaScript/)).toBeInTheDocument();
      });
    });

    test('should render Posts component with correct type', async () => {
      const mocks = [createPostTagQueryMock()];

      renderPostTag('test-tag', mocks);

      await waitFor(() => {
        expect(screen.getByText(/Posts: TAG/)).toBeInTheDocument();
      });
    });

    test('should pass tag id to Posts component', async () => {
      const mocks = [
        createPostTagQueryMock({
          tag: {
            id: '456',
            name: 'Test',
            __typename: 'Tag',
          },
        }),
      ];

      renderPostTag('test-tag', mocks);

      await waitFor(() => {
        expect(screen.getByText(/ID: 456/)).toBeInTheDocument();
      });
    });

    test('should render Footer component', async () => {
      const mocks = [createPostTagQueryMock()];

      renderPostTag('test-tag', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });

    test('should apply correct CSS classes to title', async () => {
      const mocks = [createPostTagQueryMock()];

      const { container } = renderPostTag('test-tag', mocks);

      await waitFor(() => {
        const title = container.querySelector('h1');
        expect(title).toHaveClass('text-center', 'text-4xl', 'font-serif');
      });
    });
  });

  describe('SEO meta tags', () => {
    test('should render title meta tag', async () => {
      const mocks = [
        createPostTagQueryMock({
          tag: {
            id: '1',
            name: 'React',
            __typename: 'Tag',
          },
        }),
      ];

      renderPostTag('test-tag', mocks);

      await waitFor(() => {
        const titleTag = document.querySelector('title');
        expect(titleTag?.textContent).toBe('Tag - React | mkaciuba.pl');
      });
    });
  });

  describe('edge cases', () => {
    test('should handle tag with special characters', async () => {
      const mocks = [
        createPostTagQueryMock({
          tag: {
            id: '1',
            name: 'C++ & "Coding" <Tag>',
            __typename: 'Tag',
          },
        }),
      ];

      renderPostTag('test-tag', mocks);

      await waitFor(() => {
        expect(screen.getByText(/Posty z tagu: C\+\+ & "Coding" <Tag>/)).toBeInTheDocument();
      });
    });

    test('should handle long tag names', async () => {
      const mocks = [
        createPostTagQueryMock({
          tag: {
            id: '1',
            name: 'This is a very long tag name that should still render correctly',
            __typename: 'Tag',
          },
        }),
      ];

      renderPostTag('test-tag', mocks);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Posty z tagu: This is a very long tag name that should still render correctly/
          )
        ).toBeInTheDocument();
      });
    });
  });
});
