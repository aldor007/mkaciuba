import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Home } from './Home';
import { POST_TYPE } from '../components/Posts';

// Mock components
jest.mock('../components/Footer', () => ({
  Footer: jest.fn(() => <div data-testid="footer">Footer</div>),
}));

jest.mock('../components/PostNavbar', () => ({
  PostNavbar: jest.fn(() => <div data-testid="post-navbar">PostNavbar</div>),
}));

jest.mock('../components/Posts', () => ({
  Posts: jest.fn(({ type }) => <div data-testid="posts">Posts: {type}</div>),
  POST_TYPE: {
    ALL: 'ALL',
    CATGORY: 'CATGORY',
    TAG: 'TAG',
  },
}));

describe('Home', () => {
  function renderHome() {
    return render(
      <MemoryRouter>
        <HelmetProvider>
          <Home />
        </HelmetProvider>
      </MemoryRouter>
    );
  }

  describe('component rendering', () => {
    test('should render PostNavbar component', () => {
      renderHome();

      expect(screen.getByTestId('post-navbar')).toBeInTheDocument();
    });

    test('should render Posts component', () => {
      renderHome();

      expect(screen.getByTestId('posts')).toBeInTheDocument();
    });

    test('should render Footer component', () => {
      renderHome();

      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    test('should pass POST_TYPE.ALL to Posts component', () => {
      renderHome();

      expect(screen.getByText(/Posts: ALL/)).toBeInTheDocument();
    });
  });

  describe('SEO meta tags', () => {
    test('should render title meta tag', async () => {
      renderHome();

      await waitFor(() => {
        const titleTag = document.querySelector('title');
        expect(titleTag?.textContent).toBe('Marcin Kaciuba | mkaciuba.pl');
      });
    });

    test('should render description meta tag', async () => {
      renderHome();

      await waitFor(() => {
        const descMeta = document.querySelector('meta[name="description"]');
        expect(descMeta?.getAttribute('content')).toBe('Marcin Kaciuba blog');
      });
    });
  });

  describe('layout', () => {
    test('should render components in correct order', () => {
      const { container } = renderHome();

      const components = Array.from(container.querySelectorAll('[data-testid]'));
      const order = components.map(el => el.getAttribute('data-testid'));

      expect(order).toEqual(['post-navbar', 'posts', 'footer']);
    });
  });
});
