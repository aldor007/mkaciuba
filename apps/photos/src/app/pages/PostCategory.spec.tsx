import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { PostCategory } from './PostCategory';
import gql from 'graphql-tag';
import { POST_TYPE } from '../components/Posts';

const GET_POST_CATEGORY = gql`
  query ($slug: String!) {
  postCategoryBySlug(
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

jest.mock('../components/PostNavbar', () => ({
  PostNavbar: jest.fn(() => <div data-testid="post-navbar">PostNavbar</div>),
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
  useSSRSafeQuery: jest.fn((loading: boolean, data: any) => ({
    shouldShowLoading: loading && !data,
    isFirstRender: false,
  })),
}));

describe('PostCategory', () => {
  function renderPostCategory(slug: string, mocks: MockedResponse[] = []) {
    return render(
      <MemoryRouter initialEntries={[`/blog/category/${slug}`]}>
        <HelmetProvider>
          <MockedProvider mocks={mocks} addTypename={true}>
            <Routes>
              <Route path="/blog/category/:slug" element={<PostCategory />} />
            </Routes>
          </MockedProvider>
        </HelmetProvider>
      </MemoryRouter>
    );
  }

  function createPostCategoryQueryMock(options: {
    slug?: string;
    category?: any;
  } = {}): MockedResponse {
    const {
      slug = 'test-category',
      category = {
        id: '1',
        name: 'Test Category',
        __typename: 'PostCategory',
      },
    } = options;

    return {
      request: {
        query: GET_POST_CATEGORY,
        variables: { slug },
      },
      result: {
        data: {
          postCategoryBySlug: category,
          __typename: 'Query',
        },
      },
    };
  }

  describe('GraphQL integration', () => {
    test('should render loading state initially', () => {
      const mocks = [createPostCategoryQueryMock()];

      renderPostCategory('test-category', mocks);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('should fetch category data successfully', async () => {
      const mocks = [createPostCategoryQueryMock()];

      renderPostCategory('test-category', mocks);

      await waitFor(() => {
        expect(screen.getByText(/Posty z kategorii: Test Category/)).toBeInTheDocument();
      });
    });

    test('should render error page on query error', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_POST_CATEGORY,
          variables: { slug: 'test-category' },
        },
        error: new Error('Network error'),
      };

      renderPostCategory('test-category', [errorMock]);

      await waitFor(() => {
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
        expect(screen.getByText(/Error 500/)).toBeInTheDocument();
      });
    });

    test('should render 404 when category is null', async () => {
      const mocks = [
        createPostCategoryQueryMock({
          category: null,
        }),
      ];

      renderPostCategory('test-category', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
        expect(screen.getByText(/Error 404/)).toBeInTheDocument();
        expect(screen.getByText(/Category no found/)).toBeInTheDocument();
      });
    });

    test('should pass slug from route params to query', async () => {
      const mocks = [
        createPostCategoryQueryMock({
          slug: 'custom-category',
        }),
      ];

      renderPostCategory('custom-category', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });
  });

  describe('component rendering', () => {
    test('should render PostNavbar component', async () => {
      const mocks = [createPostCategoryQueryMock()];

      renderPostCategory('test-category', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('post-navbar')).toBeInTheDocument();
      });
    });

    test('should render category title', async () => {
      const mocks = [
        createPostCategoryQueryMock({
          category: {
            id: '1',
            name: 'Nature',
            __typename: 'PostCategory',
          },
        }),
      ];

      renderPostCategory('test-category', mocks);

      await waitFor(() => {
        expect(screen.getByText(/Posty z kategorii: Nature/)).toBeInTheDocument();
      });
    });

    test('should render Posts component with correct type', async () => {
      const mocks = [createPostCategoryQueryMock()];

      renderPostCategory('test-category', mocks);

      await waitFor(() => {
        expect(screen.getByText(/Posts: CATGORY/)).toBeInTheDocument();
      });
    });

    test('should pass category id to Posts component', async () => {
      const mocks = [
        createPostCategoryQueryMock({
          category: {
            id: '123',
            name: 'Test',
            __typename: 'PostCategory',
          },
        }),
      ];

      renderPostCategory('test-category', mocks);

      await waitFor(() => {
        expect(screen.getByText(/ID: 123/)).toBeInTheDocument();
      });
    });

    test('should render Footer component', async () => {
      const mocks = [createPostCategoryQueryMock()];

      renderPostCategory('test-category', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });

    test('should apply correct CSS classes to title', async () => {
      const mocks = [createPostCategoryQueryMock()];

      const { container } = renderPostCategory('test-category', mocks);

      await waitFor(() => {
        const title = container.querySelector('h1');
        expect(title).toHaveClass('text-center', 'text-4xl', 'font-serif');
      });
    });
  });

  describe('SEO meta tags', () => {
    test('should render title meta tag', async () => {
      const mocks = [
        createPostCategoryQueryMock({
          category: {
            id: '1',
            name: 'Technology',
            __typename: 'PostCategory',
          },
        }),
      ];

      renderPostCategory('test-category', mocks);

      await waitFor(() => {
        const titleTag = document.querySelector('title');
        expect(titleTag?.textContent).toBe('Kategoria - Technology | mkaciuba.pl');
      });
    });
  });

  describe('edge cases', () => {
    test('should handle category with special characters', async () => {
      const mocks = [
        createPostCategoryQueryMock({
          category: {
            id: '1',
            name: 'Tech & "Code" <Category>',
            __typename: 'PostCategory',
          },
        }),
      ];

      renderPostCategory('test-category', mocks);

      await waitFor(() => {
        expect(screen.getByText(/Posty z kategorii: Tech & "Code" <Category>/)).toBeInTheDocument();
      });
    });

    test('should handle long category names', async () => {
      const mocks = [
        createPostCategoryQueryMock({
          category: {
            id: '1',
            name: 'This is a very long category name that should still render correctly',
            __typename: 'PostCategory',
          },
        }),
      ];

      renderPostCategory('test-category', mocks);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Posty z kategorii: This is a very long category name that should still render correctly/
          )
        ).toBeInTheDocument();
      });
    });
  });
});
