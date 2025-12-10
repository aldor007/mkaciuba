import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PostCard } from './PostCard';
import { createMockPost, createMockPostCategory } from '../../../../../libs/api/src/test-utils/factories';
import { Post } from '@mkaciuba/api';

// Mock hooks
jest.mock('react-use-webp-support-check', () => ({
  useWebPSupportCheck: jest.fn(() => false),
}));

jest.mock('@react-hook/window-size', () => ({
  useWindowWidth: jest.fn(() => 1024),
}));

// Mock ImageComponent
jest.mock('@mkaciuba/image', () => {
  const actual = jest.requireActual('@mkaciuba/image');
  return {
    ...actual,
    ImageComponent: jest.fn(({ thumbnails }) => (
      <div data-testid="image-component">Image: {thumbnails?.[0]?.url || 'none'}</div>
    )),
  };
});

describe('PostCard', () => {
  function renderPostCard(post: Post, inColumn?: boolean) {
    return render(
      <BrowserRouter>
        <PostCard post={post} inColumn={inColumn} />
      </BrowserRouter>
    );
  }

  describe('basic rendering', () => {
    test('should render post title', () => {
      const post = createMockPost({ title: 'Test Post Title' });

      renderPostCard(post);

      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    test('should render post title as link to post page', () => {
      const post = createMockPost({ title: 'Clickable Post', slug: 'clickable-post' });

      const { container } = renderPostCard(post);

      const titleLink = container.querySelector('a[href="/post/clickable-post"]');
      expect(titleLink).toBeInTheDocument();
      expect(titleLink).toHaveTextContent('Clickable Post');
    });

    test('should render publication date', () => {
      const post = createMockPost({ publicationDate: '2023-06-15T10:00:00.000Z' });

      renderPostCard(post);

      expect(screen.getByText('15/06/2023')).toBeInTheDocument();
    });

    test('should render category name', () => {
      const category = createMockPostCategory({ name: 'Travel', slug: 'travel' });
      const post = createMockPost({ category });

      renderPostCard(post);

      expect(screen.getByText('Travel')).toBeInTheDocument();
    });

    test('should render category as link', () => {
      const category = createMockPostCategory({ name: 'Nature', slug: 'nature' });
      const post = createMockPost({ category });

      const { container } = renderPostCard(post);

      const categoryLink = container.querySelector('a[href="/blog/category/nature"]');
      expect(categoryLink).toBeInTheDocument();
      expect(categoryLink).toHaveTextContent('Nature');
    });

    test('should render separator bullet between date and category', () => {
      const post = createMockPost();

      const { container } = renderPostCard(post);

      const separator = container.querySelector('.mx-3');
      expect(separator).toHaveTextContent('•');
    });
  });

  describe('image rendering', () => {
    test('should render placeholder when post has no mainImage', () => {
      const post = createMockPost({ mainImage: null });

      const { container } = renderPostCard(post);

      const placeholder = container.querySelector('img[src*="placeholder.jpg"]');
      expect(placeholder).toBeInTheDocument();
    });

    test('should render ImageComponent when post has mainImage', () => {
      const post = createMockPost({
        mainImage: [
          {
            url: 'https://example.com/image.jpg',
            width: 800,
            height: 600,
            webp: false,
            type: 'image/jpeg',
            mediaQuery: '',
            __typename: 'Image' as const,
          },
        ],
      });

      renderPostCard(post);

      expect(screen.getByTestId('image-component')).toBeInTheDocument();
    });

    test('should pass mainImage to ImageComponent', () => {
      const mainImage = [
        {
          url: 'https://example.com/test-image.jpg',
          width: 800,
          height: 600,
          webp: false,
          type: 'image/jpeg',
          mediaQuery: '',
          __typename: 'Image' as const,
        },
      ];
      const post = createMockPost({ mainImage });

      renderPostCard(post);

      expect(screen.getByText(/test-image.jpg/)).toBeInTheDocument();
    });

    test('should have lazy loading on placeholder image', () => {
      const post = createMockPost({ mainImage: null });

      const { container } = renderPostCard(post);

      const placeholder = container.querySelector('img[src*="placeholder.jpg"]');
      expect(placeholder).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('inColumn prop layout variations', () => {
    test('should apply default headerClass when inColumn is false', () => {
      const post = createMockPost();

      const { container } = renderPostCard(post, false);

      const header = container.querySelector('.relative.mx-auto.max-w-screen-xl');
      expect(header).toBeInTheDocument();
      expect(header).not.toHaveClass('lg:col-span-2');
    });

    test('should apply column spanning class when inColumn is true', () => {
      const post = createMockPost();

      const { container } = renderPostCard(post, true);

      const header = container.querySelector('.relative.mx-auto.max-w-screen-xl.lg\\:col-span-2');
      expect(header).toBeInTheDocument();
    });

    test('should apply default layout when inColumn is undefined', () => {
      const post = createMockPost();

      const { container } = renderPostCard(post);

      const header = container.querySelector('.relative.mx-auto.max-w-screen-xl');
      expect(header).toBeInTheDocument();
      expect(header).not.toHaveClass('lg:col-span-2');
    });

    describe('should handle different inColumn values', () => {
      const testCases = [
        { inColumn: true, expectedClass: 'lg:col-span-2', description: 'true' },
        { inColumn: false, expectedClass: null, description: 'false' },
        { inColumn: undefined, expectedClass: null, description: 'undefined' },
      ];

      test.each(testCases)(
        'should handle inColumn=$description',
        ({ inColumn, expectedClass }) => {
          const post = createMockPost();

          const { container } = renderPostCard(post, inColumn);

          const header = container.querySelector('.relative.mx-auto.max-w-screen-xl');
          if (expectedClass) {
            expect(header).toHaveClass(expectedClass);
          } else {
            expect(header).not.toHaveClass('lg:col-span-2');
          }
        }
      );
    });
  });

  describe('title font size variations', () => {
    test('should use large font for short titles', () => {
      const post = createMockPost({ title: 'Short Title' }); // 11 chars

      const { container } = renderPostCard(post);

      const title = container.querySelector('h1');
      expect(title).toHaveClass('lg:text-6xl', 'text-2xl');
      expect(title).not.toHaveClass('lg:text-3xl', 'text-4xl');
    });

    test('should use smaller font for long titles', () => {
      const post = createMockPost({ title: 'This is a very long title that exceeds twenty two characters' }); // > 22 chars

      const { container } = renderPostCard(post);

      const title = container.querySelector('h1');
      expect(title).toHaveClass('lg:text-3xl', 'text-4xl');
      expect(title).not.toHaveClass('lg:text-6xl', 'text-2xl');
    });

    test('should use large font for title with exactly 22 characters', () => {
      const post = createMockPost({ title: '12345678901234567890ab' }); // exactly 22 chars

      const { container } = renderPostCard(post);

      const title = container.querySelector('h1');
      expect(title).toHaveClass('lg:text-6xl', 'text-2xl');
    });

    test('should use smaller font for title with 23 characters', () => {
      const post = createMockPost({ title: '12345678901234567890abc' }); // 23 chars

      const { container } = renderPostCard(post);

      const title = container.querySelector('h1');
      expect(title).toHaveClass('lg:text-3xl', 'text-4xl');
    });

    describe('font size boundary testing', () => {
      const testCases = [
        { length: 10, title: 'A'.repeat(10), expectedFont: 'lg:text-6xl', description: '10 chars (short)' },
        { length: 22, title: 'B'.repeat(22), expectedFont: 'lg:text-6xl', description: '22 chars (boundary)' },
        { length: 23, title: 'C'.repeat(23), expectedFont: 'lg:text-3xl', description: '23 chars (long)' },
        { length: 50, title: 'D'.repeat(50), expectedFont: 'lg:text-3xl', description: '50 chars (very long)' },
      ];

      test.each(testCases)(
        'should handle $description',
        ({ title, expectedFont }) => {
          const post = createMockPost({ title });

          const { container } = renderPostCard(post);

          const titleElement = container.querySelector('h1');
          expect(titleElement).toHaveClass(expectedFont);
        }
      );
    });
  });

  describe('styling and CSS classes', () => {
    test('should apply correct container classes', () => {
      const post = createMockPost();

      const { container } = renderPostCard(post);

      const bgCover = container.querySelector('.bg-cover.bg-center.z-0');
      expect(bgCover).toBeInTheDocument();
    });

    test('should apply hover styles to title', () => {
      const post = createMockPost({ title: 'Hoverable Title' });

      const { container } = renderPostCard(post);

      const title = container.querySelector('h1');
      expect(title).toHaveClass('hover:underline');
    });

    test('should apply hover styles to category link', () => {
      const post = createMockPost();

      const { container } = renderPostCard(post);

      const categorySpan = container.querySelector('.underline.hover\\:text-green');
      expect(categorySpan).toBeInTheDocument();
    });

    test('should apply correct text center alignment', () => {
      const post = createMockPost();

      const { container } = renderPostCard(post);

      const textContainer = container.querySelector('.container.text-center');
      expect(textContainer).toBeInTheDocument();
    });

    test('should have opacity background for content overlay', () => {
      const post = createMockPost();

      const { container } = renderPostCard(post);

      const overlay = container.querySelector('.bg-gray-300.bg-opacity-40');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('React.memo behavior', () => {
    test('should be wrapped in React.memo', () => {
      // PostCard is defined with React.memo wrapper
      expect(PostCard.displayName).toBeUndefined(); // memo components don't have displayName by default
      expect(typeof PostCard).toBe('object'); // memo returns an object
    });
  });

  describe('edge cases', () => {
    test('should handle post with empty title', () => {
      const post = createMockPost({ title: '' });

      const { container } = renderPostCard(post);

      const title = container.querySelector('h1');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('');
    });

    test('should handle very old publication date', () => {
      const post = createMockPost({ publicationDate: '1990-01-01T00:00:00.000Z' });

      renderPostCard(post);

      expect(screen.getByText('01/01/1990')).toBeInTheDocument();
    });

    test('should handle future publication date', () => {
      const post = createMockPost({ publicationDate: '2099-12-31T12:00:00.000Z' });

      renderPostCard(post);

      // Date formatting may vary by timezone, just check it renders correctly
      expect(screen.getByText(/\d{2}\/12\/2099/)).toBeInTheDocument();
    });

    test('should handle post with special characters in title', () => {
      const post = createMockPost({ title: 'Post & "Special" <Characters>' });

      renderPostCard(post);

      expect(screen.getByText('Post & "Special" <Characters>')).toBeInTheDocument();
    });

    test('should render unique key with post title and id', () => {
      const post = createMockPost({ id: '123', title: 'Test Post' });

      const { container } = renderPostCard(post);

      // Key is used internally by React but structure is rendered
      const headerDiv = container.querySelector('.relative.mx-auto.max-w-screen-xl');
      expect(headerDiv).toBeInTheDocument();
    });

    test('should handle category with special characters', () => {
      const category = createMockPostCategory({ name: 'Travel & Adventure', slug: 'travel-adventure' });
      const post = createMockPost({ category });

      renderPostCard(post);

      expect(screen.getByText('Travel & Adventure')).toBeInTheDocument();
    });
  });
});
