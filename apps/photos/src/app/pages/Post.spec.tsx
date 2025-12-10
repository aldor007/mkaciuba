import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Post, GET_POST } from './Post';
import { Enum_Post_Content_Position, Enum_Post_Content_Type } from '@mkaciuba/api';

// Mock components
jest.mock('../components/Footer', () => ({
  Footer: jest.fn(() => <div data-testid="footer">Footer</div>),
}));

jest.mock('../components/PostNavbar', () => ({
  PostNavbar: jest.fn(() => <div data-testid="post-navbar">PostNavbar</div>),
}));

jest.mock('../components/PostCard', () => ({
  PostCard: jest.fn(({ post }) => (
    <div data-testid="post-card">{post.title}</div>
  )),
}));

jest.mock('../components/Tag', () => ({
  Tag: jest.fn(({ tag }) => <span data-testid="tag">{tag.name}</span>),
}));

jest.mock('@mkaciuba/image', () => {
  const actual = jest.requireActual('@mkaciuba/image');
  return {
    ...actual,
    ImageComponent: jest.fn(({ thumbnails }) => (
      <div data-testid="image-component">
        {thumbnails?.[0]?.url || 'default'}
      </div>
    )),
    ImageList: jest.fn(({ categorySlug }) => (
      <div data-testid="image-list">ImageList: {categorySlug}</div>
    )),
  };
});

describe('Post', () => {
  const defaultPost = {
    id: '1',
    title: 'Test Post Title',
    publicationDate: '2023-06-15T10:00:00.000Z',
    slug: 'test-post',
    mainImage: [
      {
        url: 'https://example.com/main.jpg',
        mediaQuery: '',
        webp: false,
        type: 'image/jpeg',
        width: 1200,
        height: 800,
        __typename: 'Image' as const,
      },
    ],
    coverImage: null,
    gallery: { slug: 'test-gallery', __typename: 'Gallery' as const },
    category: {
      name: 'Test Category',
      slug: 'test-category',
      __typename: 'PostCategory' as const,
    },
    description: 'Test description',
    seoDescription: 'Test SEO description',
    text: 'Test text content',
    content_position: Enum_Post_Content_Position.Bottom,
    content_type: Enum_Post_Content_Type.Html,
    tags: [
      { name: 'Tag1', slug: 'tag1', __typename: 'Tag' as const },
      { name: 'Tag2', slug: 'tag2', __typename: 'Tag' as const },
    ],
    __typename: 'Post' as const,
  };

  function renderPost(
    slug: string,
    mocks: MockedResponse[] = []
  ) {
    return render(
      <MemoryRouter initialEntries={[`/post/${slug}`]}>
        <HelmetProvider>
          <MockedProvider mocks={mocks} addTypename={true}>
            <Routes>
              <Route path="/post/:slug" element={<Post />} />
            </Routes>
          </MockedProvider>
        </HelmetProvider>
      </MemoryRouter>
    );
  }

  function createPostQueryMock(options: {
    slug?: string;
    post?: any;
    prevNextPost?: any[];
    relatedPosts?: any[];
  } = {}): MockedResponse {
    const {
      slug = 'test-post',
      post = defaultPost,
      prevNextPost = [],
      relatedPosts = [],
    } = options;

    return {
      request: {
        query: GET_POST,
        variables: { postSlug: slug },
      },
      result: {
        data: {
          postBySlug: post,
          prevNextPost,
          relatedPosts,
          __typename: 'Query',
        },
      },
    };
  }

  describe('GraphQL integration', () => {
    test('should render loading state initially', () => {
      const mocks = [createPostQueryMock()];

      renderPost('test-post', mocks);

      expect(screen.getByTestId('loading-more')).toBeInTheDocument();
    });

    test('should fetch post data successfully', async () => {
      const mocks = [createPostQueryMock()];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByText('Test Post Title')).toBeInTheDocument();
      });
    });

    test('should render error page on query error', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_POST,
          variables: { postSlug: 'test-post' },
        },
        error: new Error('Network error'),
      };

      renderPost('test-post', [errorMock]);

      await waitFor(() => {
        expect(screen.getByText(/500/i)).toBeInTheDocument();
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    test('should render 404 when post not found', async () => {
      const notFoundMock: MockedResponse = {
        request: {
          query: GET_POST,
          variables: { postSlug: 'missing-post' },
        },
        result: {
          data: {
            postBySlug: null,
            prevNextPost: [],
            relatedPosts: [],
            __typename: 'Query',
          },
        },
      };

      renderPost('missing-post', [notFoundMock]);

      await waitFor(() => {
        expect(screen.getByText(/404/i)).toBeInTheDocument();
        expect(screen.getByText(/Post not found/i)).toBeInTheDocument();
      });
    });

    test('should pass slug from route params to query', async () => {
      const mocks = [createPostQueryMock({ slug: 'custom-slug' })];

      renderPost('custom-slug', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });
  });

  describe('basic rendering', () => {
    test('should render post title', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            title: 'My Awesome Post',
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByText('My Awesome Post')).toBeInTheDocument();
      });
    });

    test('should render publication date', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            publicationDate: '2023-12-25T00:00:00.000Z',
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByText('25/12/2023')).toBeInTheDocument();
      });
    });

    test('should render category name and link', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            category: {
              name: 'Travel',
              slug: 'travel',
              __typename: 'PostCategory',
            },
          },
        }),
      ];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByText('Travel')).toBeInTheDocument();
        const categoryLink = container.querySelector('a[href="/blog/category/travel"]');
        expect(categoryLink).toBeInTheDocument();
      });
    });

    test('should render description', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            description: 'This is a test description',
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByText('This is a test description')).toBeInTheDocument();
      });
    });

    test('should render text content', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            text: 'This is the main text',
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByText('This is the main text')).toBeInTheDocument();
      });
    });
  });

  describe('content position variations', () => {
    const testCases = [
      {
        position: Enum_Post_Content_Position.Top,
        description: 'text before gallery when Top',
      },
      {
        position: Enum_Post_Content_Position.Bottom,
        description: 'text after gallery when Bottom',
      },
    ];

    test.each(testCases)(
      'should render $description',
      async ({ position }) => {
        const mocks = [
          createPostQueryMock({
            post: {
              ...defaultPost,
              content_position: position,
              text: 'Main content text',
            },
          }),
        ];

        renderPost('test-post', mocks);

        await waitFor(() => {
          expect(screen.getByText('Main content text')).toBeInTheDocument();
        });
      }
    );
  });

  describe('content type variations', () => {
    test('should render HTML content when content_type is Html', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            content_type: Enum_Post_Content_Type.Html,
            text: '<strong>Bold HTML</strong>',
          },
        }),
      ];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        const strong = container.querySelector('strong');
        expect(strong).toHaveTextContent('Bold HTML');
      });
    });

    test('should render Markdown content when content_type is Markdown', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            content_type: Enum_Post_Content_Type.Markdown,
            text: '# Markdown Heading',
          },
        }),
      ];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        // Markdown component should be rendered
        const markdown = container.querySelector('.m-4');
        expect(markdown).toBeInTheDocument();
      });
    });
  });

  describe('gallery integration', () => {
    test('should render ImageList when gallery exists', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            gallery: { slug: 'my-gallery', __typename: 'Gallery' },
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('image-list')).toBeInTheDocument();
        expect(screen.getByText(/ImageList: my-gallery/)).toBeInTheDocument();
      });
    });

    test('should not render ImageList when gallery is null', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            gallery: null,
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.queryByTestId('image-list')).not.toBeInTheDocument();
      });
    });
  });

  describe('cover image rendering', () => {
    test('should render cover image when present', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            coverImage: [
              {
                url: 'https://example.com/cover.jpg',
                mediaQuery: '',
                webp: false,
                type: 'image/jpeg',
                width: 1800,
                height: 1200,
                __typename: 'Image',
              },
            ],
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        const imageComponents = screen.getAllByTestId('image-component');
        // Should have cover image
        expect(imageComponents.length).toBeGreaterThan(0);
      });
    });

    test('should apply gradient CSS when cover image exists', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            coverImage: [
              {
                url: 'https://example.com/cover.jpg',
                mediaQuery: '',
                webp: false,
                type: 'image/jpeg',
                width: 1800,
                height: 1200,
                __typename: 'Image',
              },
            ],
          },
        }),
      ];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        const gradientElement = container.querySelector('.bg-gradient-to-b');
        expect(gradientElement).toBeInTheDocument();
      });
    });

    test('should not apply gradient CSS when no cover image', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            coverImage: null,
          },
        }),
      ];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        const gradientElement = container.querySelector('.bg-gradient-to-b');
        expect(gradientElement).not.toBeInTheDocument();
      });
    });
  });

  describe('prev/next navigation', () => {
    test('should render prev post arrow when prevPost exists', async () => {
      const prevPost = {
        id: '2',
        title: 'Previous Post',
        slug: 'prev-post',
        image: {
          id: 'img-1',
          matchingThumbnails: [
            {
              url: 'https://example.com/prev.jpg',
              mediaQuery: '',
              webp: false,
              type: 'image/jpeg',
              width: 300,
              height: 200,
              __typename: 'Image',
            },
          ],
          __typename: 'UploadFile',
        },
        category: { name: 'Cat', slug: 'cat', __typename: 'PostCategory' },
        __typename: 'Post',
      };

      const mocks = [
        createPostQueryMock({
          prevNextPost: [prevPost, null],
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByText('Starsze')).toBeInTheDocument();
      });
    });

    test('should render next post arrow when nextPost exists', async () => {
      const nextPost = {
        id: '3',
        title: 'Next Post',
        slug: 'next-post',
        image: {
          id: 'img-2',
          matchingThumbnails: [
            {
              url: 'https://example.com/next.jpg',
              mediaQuery: '',
              webp: false,
              type: 'image/jpeg',
              width: 300,
              height: 200,
              __typename: 'Image',
            },
          ],
          __typename: 'UploadFile',
        },
        category: { name: 'Cat', slug: 'cat', __typename: 'PostCategory' },
        __typename: 'Post',
      };

      const mocks = [
        createPostQueryMock({
          prevNextPost: [null, nextPost],
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByText('Nowsze')).toBeInTheDocument();
      });
    });

    test('should truncate long post titles in navigation', async () => {
      const nextPost = {
        id: '3',
        title: 'This is a very long post title that should be truncated',
        slug: 'long-post',
        image: {
          id: 'img-2',
          matchingThumbnails: [
            {
              url: 'https://example.com/next.jpg',
              mediaQuery: '',
              webp: false,
              type: 'image/jpeg',
              width: 300,
              height: 200,
              __typename: 'Image',
            },
          ],
          __typename: 'UploadFile',
        },
        category: { name: 'Cat', slug: 'cat', __typename: 'PostCategory' },
        __typename: 'Post',
      };

      renderPost('test-post', [createPostQueryMock({ prevNextPost: [null, nextPost] })]);

      await waitFor(() => {
        // Title should be truncated to 13 chars + '...'
        expect(screen.getByText(/This is a ver.../)).toBeInTheDocument();
      });
    });
  });

  describe('tags rendering', () => {
    test('should render all tags', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            tags: [
              { name: 'Nature', slug: 'nature', __typename: 'Tag' },
              { name: 'Travel', slug: 'travel', __typename: 'Tag' },
              { name: 'Photography', slug: 'photography', __typename: 'Tag' },
            ],
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByText('Nature')).toBeInTheDocument();
        expect(screen.getByText('Travel')).toBeInTheDocument();
        expect(screen.getByText('Photography')).toBeInTheDocument();
      });
    });

    test('should handle empty tags array', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            tags: [],
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        const tags = screen.queryAllByTestId('tag');
        expect(tags.length).toBe(0);
      });
    });
  });

  describe('related posts', () => {
    test('should render related posts section', async () => {
      const relatedPosts = [
        {
          id: '10',
          title: 'Related Post 1',
          slug: 'related-1',
          publicationDate: '2023-06-01T00:00:00.000Z',
          mainImage: [
            {
              url: 'https://example.com/related1.jpg',
              mediaQuery: '',
              webp: false,
              type: 'image/jpeg',
              width: 800,
              height: 600,
              __typename: 'Image',
            },
          ],
          category: { name: 'Cat', slug: 'cat', __typename: 'PostCategory' },
          __typename: 'Post',
        },
        {
          id: '11',
          title: 'Related Post 2',
          slug: 'related-2',
          publicationDate: '2023-06-02T00:00:00.000Z',
          mainImage: [
            {
              url: 'https://example.com/related2.jpg',
              mediaQuery: '',
              webp: false,
              type: 'image/jpeg',
              width: 800,
              height: 600,
              __typename: 'Image',
            },
          ],
          category: { name: 'Cat', slug: 'cat', __typename: 'PostCategory' },
          __typename: 'Post',
        },
      ];

      const mocks = [createPostQueryMock({ relatedPosts })];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByText('Powiązane posty')).toBeInTheDocument();
        expect(screen.getByText('Related Post 1')).toBeInTheDocument();
        expect(screen.getByText('Related Post 2')).toBeInTheDocument();
      });
    });

    test('should render PostCard for each related post', async () => {
      const relatedPosts = [
        {
          id: '10',
          title: 'Related 1',
          slug: 'related-1',
          publicationDate: '2023-06-01T00:00:00.000Z',
          mainImage: [],
          category: { name: 'Cat', slug: 'cat', __typename: 'PostCategory' },
          __typename: 'Post',
        },
      ];

      const mocks = [createPostQueryMock({ relatedPosts })];

      renderPost('test-post', mocks);

      await waitFor(() => {
        const postCards = screen.getAllByTestId('post-card');
        expect(postCards.length).toBe(1);
      });
    });
  });

  describe('SEO meta tags', () => {
    test('should render title meta tag', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            title: 'SEO Test Title',
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        const titleTag = document.querySelector('title');
        expect(titleTag?.textContent).toBe('SEO Test Title | mkaciuba.pl');
      });
    });

    test('should render description meta tags', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            seoDescription: 'This is the SEO description',
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        const descMeta = document.querySelector('meta[name="description"]');
        expect(descMeta?.getAttribute('content')).toBe(
          'This is the SEO description'
        );
      });
    });

    test('should render og:image meta tag', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            mainImage: [
              {
                url: 'https://example.com/seo-image.jpg',
                mediaQuery: '',
                webp: false,
                type: 'image/jpeg',
                width: 1200,
                height: 800,
                __typename: 'Image',
              },
            ],
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        const ogImageMeta = document.querySelector('meta[property="og:image"]');
        expect(ogImageMeta?.getAttribute('content')).toContain('example.com');
      });
    });

    test('should render twitter:card meta tag', async () => {
      const mocks = [createPostQueryMock()];

      renderPost('test-post', mocks);

      await waitFor(() => {
        const twitterCard = document.querySelector(
          'meta[name="twitter:card"]'
        );
        expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
      });
    });

    test.skip('should render og:url meta tag with post slug', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            slug: 'my-custom-post',
          },
        }),
      ];

      renderPost('my-custom-post', mocks);

      await waitFor(() => {
        // Wait for page to fully render
        expect(screen.getByTestId('footer')).toBeInTheDocument();

        const ogUrl = document.querySelector('meta[property="og:url"]');
        expect(ogUrl).toBeInTheDocument();
        expect(ogUrl?.getAttribute('content')).toContain('/post/');
        expect(ogUrl?.getAttribute('content')).toContain('my-custom-post');
      });
    });
  });

  describe('CSS class generation and styling', () => {
    test('should generate max-width container classes', async () => {
      const mocks = [createPostQueryMock()];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        const maxWidthContainers = container.querySelectorAll('.max-w-screen-xl');
        expect(maxWidthContainers.length).toBeGreaterThan(0);
      });
    });

    test('should generate grid layout classes for related posts', async () => {
      const relatedPosts = [
        {
          id: '10',
          title: 'Related',
          slug: 'related-1',
          publicationDate: '2023-06-01T00:00:00.000Z',
          mainImage: [],
          category: { name: 'Cat', slug: 'cat', __typename: 'PostCategory' as const },
          __typename: 'Post' as const,
        },
      ];

      const mocks = [createPostQueryMock({ relatedPosts })];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        const gridContainer = container.querySelector('.grid.xl\\:grid-cols-2');
        expect(gridContainer).toBeInTheDocument();
      });
    });

    test('should generate text-center alignment class', async () => {
      const mocks = [createPostQueryMock()];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        const centered = container.querySelector('.text-center');
        expect(centered).toBeInTheDocument();
      });
    });

    test('should generate gradient background when cover image exists', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            coverImage: [
              {
                url: 'https://example.com/cover.jpg',
                mediaQuery: '',
                webp: false,
                type: 'image/jpeg',
                width: 1800,
                height: 1200,
                __typename: 'Image' as const,
              },
            ],
          },
        }),
      ];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        const gradient = container.querySelector('.bg-gradient-to-b');
        expect(gradient).toBeInTheDocument();
      });
    });

    test('should generate rounded corners class', async () => {
      const mocks = [createPostQueryMock()];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        const rounded = container.querySelector('.rounded-md');
        expect(rounded).toBeInTheDocument();
      });
    });

    test('should generate font sizing classes', async () => {
      const mocks = [createPostQueryMock()];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        const title = container.querySelector('.text-4xl');
        expect(title).toBeInTheDocument();
      });
    });

    test('should generate shadow classes', async () => {
      const nextPost = {
        id: '3',
        title: 'Next Post',
        slug: 'next-post',
        image: {
          id: 'img-2',
          matchingThumbnails: [
            {
              url: 'https://example.com/next.jpg',
              mediaQuery: '',
              webp: false,
              type: 'image/jpeg',
              width: 300,
              height: 200,
              __typename: 'Image' as const,
            },
          ],
          __typename: 'UploadFile' as const,
        },
        category: { name: 'Cat', slug: 'cat', __typename: 'PostCategory' as const },
        __typename: 'Post' as const,
      };

      const mocks = [createPostQueryMock({ prevNextPost: [null, nextPost] })];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        const shadow = container.querySelector('.shadow-xl');
        expect(shadow).toBeInTheDocument();
      });
    });

    test('should generate margin and padding classes', async () => {
      const mocks = [createPostQueryMock()];

      const { container } = renderPost('test-post', mocks);

      await waitFor(() => {
        const marginElement = container.querySelector('.m-8');
        expect(marginElement).toBeInTheDocument();
      });
    });
  });

  describe('component integration', () => {
    test('should render PostNavbar component', async () => {
      const mocks = [createPostQueryMock()];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('post-navbar')).toBeInTheDocument();
      });
    });

    test('should render Footer component', async () => {
      const mocks = [createPostQueryMock()];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    test('should handle post with no tags', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            tags: [],
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByText('Test Post Title')).toBeInTheDocument();
      });
    });

    test('should handle post with no related posts', async () => {
      const mocks = [createPostQueryMock({ relatedPosts: [] })];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(screen.getByText('Powiązane posty')).toBeInTheDocument();
        const postCards = screen.queryAllByTestId('post-card');
        expect(postCards.length).toBe(0);
      });
    });

    test('should handle special characters in post title', async () => {
      const mocks = [
        createPostQueryMock({
          post: {
            ...defaultPost,
            title: 'Post & "Special" <Characters>',
          },
        }),
      ];

      renderPost('test-post', mocks);

      await waitFor(() => {
        expect(
          screen.getByText('Post & "Special" <Characters>')
        ).toBeInTheDocument();
      });
    });
  });
});
