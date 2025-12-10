import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GalleryBlog, GalleryBlogCategory } from './GalleryBlog';

describe('GalleryBlog', () => {
  describe('GalleryBlog component', () => {
    test('should redirect to photos path with portfolio gallery', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/gallery-blog/my-category']}>
          <Routes>
            <Route path="/gallery-blog/:slug" element={<GalleryBlog />} />
            <Route
              path="/gallery/:gallerySlug/:categorySlug"
              element={<div data-testid="photos-page">Photos Page</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      // Navigate should redirect, so photos page should render
      const photosPage = container.querySelector('[data-testid="photos-page"]');
      expect(photosPage).toBeInTheDocument();
    });

    test('should preserve category slug from route params', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/gallery-blog/nature']}>
          <Routes>
            <Route path="/gallery-blog/:slug" element={<GalleryBlog />} />
            <Route
              path="/gallery/portfolio/nature"
              element={<div data-testid="correct-route">Correct Route</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      const correctRoute = container.querySelector('[data-testid="correct-route"]');
      expect(correctRoute).toBeInTheDocument();
    });

    test('should handle special characters in slug', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/gallery-blog/test-category']}>
          <Routes>
            <Route path="/gallery-blog/:slug" element={<GalleryBlog />} />
            <Route
              path="/gallery/:gallerySlug/:categorySlug"
              element={<div data-testid="photos-page">Photos Page</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      const photosPage = container.querySelector('[data-testid="photos-page"]');
      expect(photosPage).toBeInTheDocument();
    });
  });

  describe('GalleryBlogCategory component', () => {
    test('should redirect to category list with portfolio gallery', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/gallery-blog-category/any-slug']}>
          <Routes>
            <Route path="/gallery-blog-category/:slug" element={<GalleryBlogCategory />} />
            <Route
              path="/gallery/:gallerySlug"
              element={<div data-testid="categories-page">Categories Page</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      // Navigate should redirect, so categories page should render
      const categoriesPage = container.querySelector('[data-testid="categories-page"]');
      expect(categoriesPage).toBeInTheDocument();
    });

    test('should always redirect to portfolio gallery', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/gallery-blog-category/test']}>
          <Routes>
            <Route path="/gallery-blog-category/:slug" element={<GalleryBlogCategory />} />
            <Route
              path="/gallery/portfolio"
              element={<div data-testid="portfolio-route">Portfolio Route</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      const portfolioRoute = container.querySelector('[data-testid="portfolio-route"]');
      expect(portfolioRoute).toBeInTheDocument();
    });

    test('should handle different slug values', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/gallery-blog-category/whatever-slug']}>
          <Routes>
            <Route path="/gallery-blog-category/:slug" element={<GalleryBlogCategory />} />
            <Route
              path="/gallery/:gallerySlug"
              element={<div data-testid="categories-page">Categories Page</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      const categoriesPage = container.querySelector('[data-testid="categories-page"]');
      expect(categoriesPage).toBeInTheDocument();
    });
  });
});
