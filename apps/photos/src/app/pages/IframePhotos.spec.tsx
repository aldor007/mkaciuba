import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { IframePhotos } from './IframePhotos';

// Mock ImageList component
jest.mock('@mkaciuba/image', () => ({
  ImageList: jest.fn(({ categorySlug }) => (
    <div data-testid="image-list">ImageList: {categorySlug}</div>
  )),
}));

describe('IframePhotos', () => {
  function renderIframePhotos(categorySlug: string) {
    return render(
      <MemoryRouter initialEntries={[`/iframe/${categorySlug}`]}>
        <Routes>
          <Route path="/iframe/:categorySlug" element={<IframePhotos />} />
        </Routes>
      </MemoryRouter>
    );
  }

  describe('component rendering', () => {
    test('should render ImageList component', () => {
      renderIframePhotos('test-category');

      expect(screen.getByTestId('image-list')).toBeInTheDocument();
    });

    test('should pass categorySlug to ImageList', () => {
      renderIframePhotos('nature');

      expect(screen.getByText(/ImageList: nature/)).toBeInTheDocument();
    });

    test('should handle different category slugs', () => {
      renderIframePhotos('urban-photography');

      expect(screen.getByText(/ImageList: urban-photography/)).toBeInTheDocument();
    });

    test('should handle category slug with special characters', () => {
      renderIframePhotos('test-category-2023');

      expect(screen.getByText(/ImageList: test-category-2023/)).toBeInTheDocument();
    });
  });

  describe('route params', () => {
    test('should extract categorySlug from route params', () => {
      renderIframePhotos('my-photos');

      expect(screen.getByText(/ImageList: my-photos/)).toBeInTheDocument();
    });
  });
});
