import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OldPost } from './OldPosts';
import gql from 'graphql-tag';

const GET_POST = gql`
  query ($permalink: String!) {
    postByPermalink(permalink: $permalink) {
     slug
  }
}
`;

// Mock components
jest.mock('@mkaciuba/ui-kit', () => ({
  Loading: jest.fn(() => <div data-testid="loading">Loading...</div>),
  ErrorPage: jest.fn(({ code, message }) => (
    <div data-testid="error-page">
      Error {code}: {message}
    </div>
  )),
}));

describe('OldPost', () => {
  function renderOldPost(
    year: string,
    month: string,
    slug: string,
    mocks: MockedResponse[] = []
  ) {
    return render(
      <MemoryRouter initialEntries={[`/blog/${year}/${month}/${slug}`]}>
        <MockedProvider mocks={mocks} addTypename={true}>
          <Routes>
            <Route path="/blog/:year/:month/:slug" element={<OldPost />} />
            <Route path="/post/:slug" element={<div data-testid="post-page">Post Page</div>} />
          </Routes>
        </MockedProvider>
      </MemoryRouter>
    );
  }

  function createOldPostQueryMock(options: {
    permalink?: string;
    slug?: string;
  } = {}): MockedResponse {
    const {
      permalink = '/blog/2023/01/test-post',
      slug = 'test-post',
    } = options;

    return {
      request: {
        query: GET_POST,
        variables: { permalink },
      },
      result: {
        data: {
          postByPermalink: {
            slug,
            __typename: 'Post',
          },
          __typename: 'Query',
        },
      },
    };
  }

  describe('GraphQL integration', () => {
    test('should render loading state initially', () => {
      const mocks = [createOldPostQueryMock()];

      renderOldPost('2023', '01', 'test-post', mocks);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('should fetch post by permalink successfully', async () => {
      const mocks = [createOldPostQueryMock()];

      renderOldPost('2023', '01', 'test-post', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('post-page')).toBeInTheDocument();
      });
    });

    test('should render error page on query error', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_POST,
          variables: { permalink: '/blog/2023/01/test-post' },
        },
        error: new Error('Network error'),
      };

      renderOldPost('2023', '01', 'test-post', [errorMock]);

      await waitFor(() => {
        expect(screen.getByTestId('error-page')).toBeInTheDocument();
        expect(screen.getByText(/Error 500/)).toBeInTheDocument();
      });
    });

    test('should construct correct permalink from route params', async () => {
      const mocks = [
        createOldPostQueryMock({
          permalink: '/blog/2022/12/holiday-post',
          slug: 'holiday-post',
        }),
      ];

      renderOldPost('2022', '12', 'holiday-post', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('post-page')).toBeInTheDocument();
      });
    });
  });

  describe('redirect behavior', () => {
    test('should redirect to new post path with slug', async () => {
      const mocks = [
        createOldPostQueryMock({
          permalink: '/blog/2023/01/my-article',
          slug: 'my-article',
        }),
      ];

      renderOldPost('2023', '01', 'my-article', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('post-page')).toBeInTheDocument();
      });
    });

    test('should handle different year/month combinations', async () => {
      const mocks = [
        createOldPostQueryMock({
          permalink: '/blog/2020/06/summer-post',
          slug: 'summer-post',
        }),
      ];

      renderOldPost('2020', '06', 'summer-post', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('post-page')).toBeInTheDocument();
      });
    });

    test('should handle slug with dashes', async () => {
      const mocks = [
        createOldPostQueryMock({
          permalink: '/blog/2023/01/my-long-post-title',
          slug: 'my-long-post-title',
        }),
      ];

      renderOldPost('2023', '01', 'my-long-post-title', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('post-page')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    test('should handle single digit month with leading zero', async () => {
      const mocks = [
        createOldPostQueryMock({
          permalink: '/blog/2023/03/march-post',
          slug: 'march-post',
        }),
      ];

      renderOldPost('2023', '03', 'march-post', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('post-page')).toBeInTheDocument();
      });
    });

    test('should handle two digit month', async () => {
      const mocks = [
        createOldPostQueryMock({
          permalink: '/blog/2023/11/november-post',
          slug: 'november-post',
        }),
      ];

      renderOldPost('2023', '11', 'november-post', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('post-page')).toBeInTheDocument();
      });
    });

    test('should handle year in different formats', async () => {
      const mocks = [
        createOldPostQueryMock({
          permalink: '/blog/2019/01/old-post',
          slug: 'old-post',
        }),
      ];

      renderOldPost('2019', '01', 'old-post', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('post-page')).toBeInTheDocument();
      });
    });
  });
});
