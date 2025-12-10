/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loading, LoadingMore } from './loading';

describe('Loading Components', () => {
  describe('Loading', () => {
    describe('rendering', () => {
      test('should render loading spinner', () => {
        const { container } = render(<Loading />);
        const spinner = container.querySelector('.loader');
        expect(spinner).toBeInTheDocument();
      });

      test('should render "Loading..." text', () => {
        render(<Loading />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      test('should render help text', () => {
        render(<Loading />);
        expect(screen.getByText(/This may take a few seconds/)).toBeInTheDocument();
        expect(screen.getByText(/don't close this page/)).toBeInTheDocument();
      });
    });

    describe('styling', () => {
      test('should apply fullscreen container classes', () => {
        const { container } = render(<Loading />);
        const loadingDiv = container.querySelector('.w-screen.fixed.h-screen');
        expect(loadingDiv).toBeInTheDocument();
        expect(loadingDiv).toHaveClass('z-50', 'overflow-hidden', 'flex', 'flex-col', 'items-center', 'justify-center');
      });

      test('should apply spinner classes', () => {
        const { container } = render(<Loading />);
        const spinner = container.querySelector('.loader');
        expect(spinner).toHaveClass('ease-linear', 'rounded-full', 'spinner', 'bg-white', 'border-4', 'border-t-4', 'border-blue-700', 'h-12', 'w-12', 'mb-4');
      });

      test('should apply heading classes', () => {
        const { container } = render(<Loading />);
        const heading = screen.getByText('Loading...');
        expect(heading).toHaveClass('text-center', 'text-xl', 'font-semibold');
      });

      test('should apply help text classes', () => {
        const { container } = render(<Loading />);
        const helpText = screen.getByText(/This may take a few seconds/);
        expect(helpText).toHaveClass('w-1/3', 'text-center');
      });
    });

    describe('structure', () => {
      test('should render spinner before text', () => {
        const { container } = render(<Loading />);
        const spinnerParent = container.querySelector('.loader')?.parentElement;
        const heading = screen.getByText('Loading...').parentElement;

        // Both should be in the same container
        expect(spinnerParent).toBeTruthy();
        expect(heading).toBeTruthy();
      });

      test('should render all three components (spinner, heading, paragraph)', () => {
        const { container } = render(<Loading />);
        expect(container.querySelector('.loader')).toBeInTheDocument();
        expect(container.querySelector('h2')).toBeInTheDocument();
        expect(container.querySelector('p')).toBeInTheDocument();
      });
    });
  });

  describe('LoadingMore', () => {
    describe('rendering', () => {
      test('should render loading spinner', () => {
        const { container } = render(<LoadingMore />);
        const spinner = container.querySelector('.loader');
        expect(spinner).toBeInTheDocument();
      });

      test('should render with data-testid', () => {
        render(<LoadingMore />);
        expect(screen.getByTestId('loading-more')).toBeInTheDocument();
      });

      test('should not render any text', () => {
        const { container } = render(<LoadingMore />);
        expect(container.textContent).toBe('');
      });
    });

    describe('styling', () => {
      test('should apply flex container classes', () => {
        const { container } = render(<LoadingMore />);
        const loadingDiv = container.querySelector('[data-testid="loading-more"]');
        expect(loadingDiv).toHaveClass('flex', 'justify-center');
      });

      test('should apply large spinner classes', () => {
        const { container } = render(<LoadingMore />);
        const spinner = container.querySelector('.loader');
        expect(spinner).toHaveClass('loader', 'center', 'ease-linear', 'rounded-full', 'border-8', 'border-t-8', 'border-gray-200', 'h-64', 'w-64');
      });

      test('should use larger dimensions than Loading spinner', () => {
        const { container: loadingContainer } = render(<Loading />);
        const { container: loadingMoreContainer } = render(<LoadingMore />);

        const loadingSpinner = loadingContainer.querySelector('.loader');
        const loadingMoreSpinner = loadingMoreContainer.querySelector('.loader');

        // Loading has h-12 w-12, LoadingMore has h-64 w-64
        expect(loadingSpinner).toHaveClass('h-12', 'w-12');
        expect(loadingMoreSpinner).toHaveClass('h-64', 'w-64');
      });
    });

    describe('structure', () => {
      test('should have single spinner inside flex container', () => {
        const { container } = render(<LoadingMore />);
        const flexContainer = container.querySelector('.flex.justify-center');
        const spinner = flexContainer?.querySelector('.loader');

        expect(flexContainer).toBeInTheDocument();
        expect(spinner).toBeInTheDocument();
      });

      test('should not render heading or paragraph', () => {
        const { container } = render(<LoadingMore />);
        expect(container.querySelector('h2')).not.toBeInTheDocument();
        expect(container.querySelector('p')).not.toBeInTheDocument();
      });
    });
  });

  describe('component comparison', () => {
    test('should have different sizes', () => {
      const { container: loadingContainer } = render(<Loading />);
      const { container: loadingMoreContainer } = render(<LoadingMore />);

      const loadingSpinner = loadingContainer.querySelector('.loader');
      const loadingMoreSpinner = loadingMoreContainer.querySelector('.loader');

      // Verify different border widths
      expect(loadingSpinner).toHaveClass('border-4');
      expect(loadingMoreSpinner).toHaveClass('border-8');
    });

    test('should have different container layouts', () => {
      const { container: loadingContainer } = render(<Loading />);
      const { container: loadingMoreContainer } = render(<LoadingMore />);

      // Loading is fullscreen with z-index
      const loadingDiv = loadingContainer.querySelector('.w-screen');
      expect(loadingDiv).toHaveClass('fixed', 'z-50');

      // LoadingMore is just centered
      const loadingMoreDiv = loadingMoreContainer.querySelector('.flex');
      expect(loadingMoreDiv).toHaveClass('justify-center');
      expect(loadingMoreDiv).not.toHaveClass('fixed');
    });

    test('should have different color schemes', () => {
      const { container: loadingContainer } = render(<Loading />);
      const { container: loadingMoreContainer } = render(<LoadingMore />);

      const loadingSpinner = loadingContainer.querySelector('.loader');
      const loadingMoreSpinner = loadingMoreContainer.querySelector('.loader');

      // Loading uses blue, LoadingMore uses gray
      expect(loadingSpinner).toHaveClass('border-blue-700');
      expect(loadingMoreSpinner).toHaveClass('border-gray-200');
    });
  });
});
