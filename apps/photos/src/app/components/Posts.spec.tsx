import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Posts, POST_TYPE, GET_POSTS, GET_POSTS_FROM_CAT, GET_POSTS_FROM_TAG } from './Posts';
import { createMockPost } from '../../../../../libs/api/src/test-utils/factories';
import { Post } from '@mkaciuba/api';

// Mock useInfiniteScroll hook
jest.mock('react-infinite-scroll-hook', () => ({
  __esModule: true,
  default: jest.fn(() => [{ current: null }]),
}));

// Mock window width hook
jest.mock('@react-hook/window-size', () => ({
  useWindowWidth: jest.fn(() => 1024),
}));

// Mock findImageForWidth
jest.mock('@mkaciuba/image', () => {
  const actual = jest.requireActual('@mkaciuba/image');
  return {
    ...actual,
    findImageForWidth: jest.fn((images) => images?.[0] || null),
  };
});

// Mock PostCard component
jest.mock('./PostCard', () => ({
  PostCard: jest.fn(({ post, inColumn }) => (
    <div data-testid={`post-card-${post.id}`} data-in-column={inColumn}>
      {post.title}
    </div>
  )),
}));

describe('Posts', () => {
  function renderPosts(
    props: { type: POST_TYPE; id?: string } = { type: POST_TYPE.ALL },
    mocks: MockedResponse[] = [],
    initialRoute = '/'
  ) {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <MockedProvider mocks={mocks} addTypename={true}>
          <Posts {...props} />
        </MockedProvider>
      </MemoryRouter>
    );
  }

  function createPostsQueryMock(options: {
    type?: POST_TYPE;
    id?: string;
    start?: number;
    limit?: number;
    posts?: any[];
    postsCount?: number;
  } = {}): MockedResponse {
    const {
      type = POST_TYPE.ALL,
      id,
      start = 0,
      limit = 9,
      posts = [
        createMockPost({ id: '1', title: 'Post 1', slug: 'post-1' }),
        createMockPost({ id: '2', title: 'Post 2', slug: 'post-2' }),
        createMockPost({ id: '3', title: 'Post 3', slug: 'post-3' }),
      ],
      postsCount = 3,
    } = options;

    let query = GET_POSTS;
    const variables: any = { start, limit };

    if (type === POST_TYPE.CATGORY) {
      query = GET_POSTS_FROM_CAT;
      variables.id = id;
    } else if (type === POST_TYPE.TAG) {
      query = GET_POSTS_FROM_TAG;
      variables.id = id;
    }

    return {
      request: {
        query,
        variables,
      },
      result: {
        data: {
          posts,
          postsCount,
          __typename: 'Query',
        },
      },
    };
  }

  describe('query selection', () => {
    test('should use GET_POSTS for POST_TYPE.ALL', async () => {
      const mocks = [createPostsQueryMock({ type: POST_TYPE.ALL })];

      renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
      });
    });

    test('should use GET_POSTS_FROM_CAT for POST_TYPE.CATGORY', async () => {
      const mocks = [
        createPostsQueryMock({ type: POST_TYPE.CATGORY, id: 'category-123' }),
      ];

      renderPosts({ type: POST_TYPE.CATGORY, id: 'category-123' }, mocks);

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
      });
    });

    test('should use GET_POSTS_FROM_TAG for POST_TYPE.TAG', async () => {
      const mocks = [createPostsQueryMock({ type: POST_TYPE.TAG, id: 'tag-456' })];

      renderPosts({ type: POST_TYPE.TAG, id: 'tag-456' }, mocks);

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
      });
    });

    describe('should pass correct variables', () => {
      const testCases = [
        {
          description: 'all posts without id',
          type: POST_TYPE.ALL,
          id: undefined,
          expectedVariables: { start: 0, limit: 9 },
        },
        {
          description: 'category posts with id',
          type: POST_TYPE.CATGORY,
          id: 'cat-1',
          expectedVariables: { start: 0, limit: 9, id: 'cat-1' },
        },
        {
          description: 'tag posts with id',
          type: POST_TYPE.TAG,
          id: 'tag-1',
          expectedVariables: { start: 0, limit: 9, id: 'tag-1' },
        },
      ];

      test.each(testCases)(
        'should query $description',
        async ({ type, id, expectedVariables }) => {
          const mocks = [createPostsQueryMock({ type, id, ...expectedVariables })];

          renderPosts({ type, id }, mocks);

          await waitFor(() => {
            expect(screen.getByText('Post 1')).toBeInTheDocument();
          });
        }
      );
    });
  });

  describe('pagination', () => {
    test('should start from page 1 by default', async () => {
      const mocks = [createPostsQueryMock({ start: 0, limit: 9 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks, '/');

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
      });
    });

    test('should read page from query params', async () => {
      const mocks = [createPostsQueryMock({ start: 9, limit: 9 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks, '/?page=2');

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
      });
    });

    test('should calculate start from page number', async () => {
      const mocks = [createPostsQueryMock({ start: 18, limit: 9 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks, '/?page=3');

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
      });
    });

    describe('hasNextPage calculations', () => {
      const testCases = [
        {
          description: 'has more pages',
          postsLength: 9,
          postsCount: 30,
          expected: true,
        },
        {
          description: 'at end of results',
          postsLength: 9,
          postsCount: 9,
          expected: false,
        },
        {
          description: 'partial last page',
          postsLength: 5,
          postsCount: 14,
          expected: false,
        },
        {
          description: 'less than limit',
          postsLength: 3,
          postsCount: 3,
          expected: false,
        },
      ];

      test.each(testCases)(
        'should determine $description correctly',
        async ({ postsLength, postsCount, expected }) => {
          const posts = Array.from({ length: postsLength }, (_, i) =>
            createMockPost({ id: `${i + 1}`, title: `Post ${i + 1}`, slug: `post-${i + 1}` })
          );

          const mocks = [createPostsQueryMock({ posts, postsCount })];

          renderPosts({ type: POST_TYPE.ALL }, mocks);

          await waitFor(() => {
            expect(screen.getByText('Post 1')).toBeInTheDocument();
          });

          const loadMoreButton = screen.queryByText(/Załaduj więcej/i);
          if (expected) {
            expect(loadMoreButton).toBeInTheDocument();
          } else {
            expect(loadMoreButton).not.toBeInTheDocument();
          }
        }
      );
    });

    test('should show load more button when hasNextPage is true', async () => {
      const posts = Array.from({ length: 9 }, (_, i) =>
        createMockPost({ id: `${i + 1}`, title: `Post ${i + 1}`, slug: `post-${i + 1}` })
      );

      const mocks = [createPostsQueryMock({ posts, postsCount: 20 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        expect(screen.getByText(/Załaduj więcej/i)).toBeInTheDocument();
      });
    });

    test('should not show load more button when hasNextPage is false', async () => {
      const posts = [createMockPost({ id: '1', title: 'Post 1', slug: 'post-1' })];

      const mocks = [createPostsQueryMock({ posts, postsCount: 1 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Załaduj więcej/i)).not.toBeInTheDocument();
    });
  });

  describe('post rendering', () => {
    test('should render all posts', async () => {
      const posts = [
        createMockPost({ id: '1', title: 'First Post', slug: 'first' }),
        createMockPost({ id: '2', title: 'Second Post', slug: 'second' }),
        createMockPost({ id: '3', title: 'Third Post', slug: 'third' }),
      ];

      const mocks = [createPostsQueryMock({ posts, postsCount: 3 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
        expect(screen.getByText('Second Post')).toBeInTheDocument();
        expect(screen.getByText('Third Post')).toBeInTheDocument();
      });
    });

    test('should render PostCard component for each post', async () => {
      const posts = [
        createMockPost({ id: '1', title: 'Post 1', slug: 'post-1' }),
        createMockPost({ id: '2', title: 'Post 2', slug: 'post-2' }),
      ];

      const mocks = [createPostsQueryMock({ posts, postsCount: 2 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('post-card-2')).toBeInTheDocument();
      });
    });

    describe('inColumn prop calculations', () => {
      const testCases = [
        { index: 0, expected: true, description: 'index 0 (1st post)' },
        { index: 1, expected: false, description: 'index 1 (2nd post)' },
        { index: 2, expected: false, description: 'index 2 (3rd post)' },
        { index: 3, expected: true, description: 'index 3 (4th post)' },
        { index: 4, expected: false, description: 'index 4 (5th post)' },
        { index: 5, expected: false, description: 'index 5 (6th post)' },
      ];

      test.each(testCases)(
        'should set inColumn=$expected for $description',
        async ({ index, expected }) => {
          const posts = Array.from({ length: 6 }, (_, i) =>
            createMockPost({ id: `${i + 1}`, title: `Post ${i + 1}`, slug: `post-${i + 1}` })
          );

          const mocks = [createPostsQueryMock({ posts, postsCount: 6 })];

          renderPosts({ type: POST_TYPE.ALL }, mocks);

          await waitFor(() => {
            const postCard = screen.getByTestId(`post-card-${index + 1}`);
            expect(postCard).toHaveAttribute('data-in-column', expected.toString());
          });
        }
      );
    });

    test('should render posts in grid layout', async () => {
      const posts = [createMockPost({ id: '1', title: 'Post 1', slug: 'post-1' })];

      const mocks = [createPostsQueryMock({ posts, postsCount: 1 })];

      const { container } = renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        const grid = container.querySelector('.max-w-screen-xl.mx-auto.grid');
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass('xl:grid-cols-2', 'gap-4');
      });
    });

    test('should wrap each post in a div with key', async () => {
      const posts = [
        createMockPost({ id: '123', title: 'Post 1', slug: 'post-1' }),
        createMockPost({ id: '456', title: 'Post 2', slug: 'post-2' }),
      ];

      const mocks = [createPostsQueryMock({ posts, postsCount: 2 })];

      const { container } = renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        // PostCards should be wrapped in divs (React keys not visible in DOM but structure is)
        expect(screen.getByTestId('post-card-123')).toBeInTheDocument();
        expect(screen.getByTestId('post-card-456')).toBeInTheDocument();
      });
    });
  });

  describe('loading states', () => {
    test('should show LoadingMore on initial load', () => {
      const mocks = [createPostsQueryMock()];

      renderPosts({ type: POST_TYPE.ALL }, mocks);

      // Component shows LoadingMore initially (data-testid="loading-more" from previous change)
      expect(screen.getByTestId('loading-more')).toBeInTheDocument();
    });

    test('should hide loading after data loads', async () => {
      const mocks = [createPostsQueryMock()];

      renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-more')).not.toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    test('should render error page on query error', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_POSTS,
          variables: {
            start: 0,
            limit: 9,
          },
        },
        error: new Error('Network error'),
      };

      renderPosts({ type: POST_TYPE.ALL }, [errorMock]);

      await waitFor(() => {
        expect(screen.getByText(/500/i)).toBeInTheDocument();
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    test('should display error message in ErrorPage', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_POSTS,
          variables: {
            start: 0,
            limit: 9,
          },
        },
        error: new Error('Custom error message'),
      };

      renderPosts({ type: POST_TYPE.ALL }, [errorMock]);

      await waitFor(() => {
        expect(screen.getByText(/Custom error message/i)).toBeInTheDocument();
      });
    });
  });

  describe('load more button', () => {
    test('should have correct styling classes', async () => {
      const posts = Array.from({ length: 9 }, (_, i) =>
        createMockPost({ id: `${i + 1}`, title: `Post ${i + 1}`, slug: `post-${i + 1}` })
      );

      const mocks = [createPostsQueryMock({ posts, postsCount: 20 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        const button = screen.getByText(/Załaduj więcej/i);
        expect(button).toHaveClass(
          'w-full',
          'mx-auto',
          'text-center',
          'border-4',
          'font-medium',
          'px-5',
          'py-3',
          'rounded-xl'
        );
      });
    });

    test('should be wrapped in centered container', async () => {
      const posts = Array.from({ length: 9 }, (_, i) =>
        createMockPost({ id: `${i + 1}`, title: `Post ${i + 1}`, slug: `post-${i + 1}` })
      );

      const mocks = [createPostsQueryMock({ posts, postsCount: 20 })];

      const { container } = renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        const wrapper = container.querySelector('.max-w-screen-xl.w-full.m-4.mx-auto.text-center');
        expect(wrapper).toBeInTheDocument();
      });
    });

    test('should display Polish text "Załaduj więcej"', async () => {
      const posts = Array.from({ length: 9 }, (_, i) =>
        createMockPost({ id: `${i + 1}`, title: `Post ${i + 1}`, slug: `post-${i + 1}` })
      );

      const mocks = [createPostsQueryMock({ posts, postsCount: 20 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        expect(screen.getByText('Załaduj więcej')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    test('should handle empty posts array', async () => {
      const mocks = [createPostsQueryMock({ posts: [], postsCount: 0 })];

      const { container } = renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        const grid = container.querySelector('.max-w-screen-xl.mx-auto.grid');
        expect(grid).toBeInTheDocument();
      });

      // No posts rendered
      expect(screen.queryByTestId(/post-card/)).not.toBeInTheDocument();
    });

    test('should handle single post', async () => {
      const posts = [createMockPost({ id: '1', title: 'Only Post', slug: 'only' })];

      const mocks = [createPostsQueryMock({ posts, postsCount: 1 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        expect(screen.getByText('Only Post')).toBeInTheDocument();
      });

      // No load more button
      expect(screen.queryByText(/Załaduj więcej/i)).not.toBeInTheDocument();
    });

    test('should handle exactly 9 posts (one page)', async () => {
      const posts = Array.from({ length: 9 }, (_, i) =>
        createMockPost({ id: `${i + 1}`, title: `Post ${i + 1}`, slug: `post-${i + 1}` })
      );

      const mocks = [createPostsQueryMock({ posts, postsCount: 9 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
        expect(screen.getByText('Post 9')).toBeInTheDocument();
      });

      // No load more button (all posts loaded)
      expect(screen.queryByText(/Załaduj więcej/i)).not.toBeInTheDocument();
    });

    test('should handle posts with long titles', async () => {
      const longTitle = 'A'.repeat(200);
      const posts = [createMockPost({ id: '1', title: longTitle, slug: 'long' })];

      const mocks = [createPostsQueryMock({ posts, postsCount: 1 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks);

      await waitFor(() => {
        expect(screen.getByText(longTitle)).toBeInTheDocument();
      });
    });

    test('should handle page parameter as string', async () => {
      // Component parses page from query string
      const mocks = [createPostsQueryMock({ start: 27, limit: 9 })];

      renderPosts({ type: POST_TYPE.ALL }, mocks, '/?page=4');

      await waitFor(() => {
        expect(screen.getByText('Post 1')).toBeInTheDocument();
      });
    });
  });
});
