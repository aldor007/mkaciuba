import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';

// Mock components
jest.mock('../components/Footer', () => ({
  Footer: jest.fn(() => <div data-testid="footer">Footer</div>),
}));

jest.mock('../Header', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="header">Header</div>),
}));

jest.mock('../components/LoginForm', () => ({
  LoginForm: jest.fn(({ categorySlug, gallerySlug }) => (
    <div data-testid="login-form">
      LoginForm - Gallery: {gallerySlug}, Category: {categorySlug}
    </div>
  )),
}));

describe('Login', () => {
  function renderLogin(search = '') {
    return render(
      <MemoryRouter initialEntries={[{ pathname: '/login', search }]}>
        <Login />
      </MemoryRouter>
    );
  }

  describe('component rendering', () => {
    test('should render Header component', () => {
      renderLogin();

      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    test('should render LoginForm component', () => {
      renderLogin();

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    test('should render Footer component', () => {
      renderLogin();

      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    test('should render components in correct order', () => {
      const { container } = renderLogin();

      const components = Array.from(container.querySelectorAll('[data-testid]'));
      const order = components.map(el => el.getAttribute('data-testid'));

      expect(order).toEqual(['header', 'login-form', 'footer']);
    });
  });

  describe('query string parsing', () => {
    test('should parse gallery and category from query string', () => {
      renderLogin('?gallery=my-gallery&category=my-category');

      expect(screen.getByText(/Gallery: my-gallery, Category: my-category/)).toBeInTheDocument();
    });

    test('should handle empty query string', () => {
      renderLogin('');

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    test('should handle only gallery parameter', () => {
      renderLogin('?gallery=test-gallery');

      expect(screen.getByText(/Gallery: test-gallery/)).toBeInTheDocument();
    });

    test('should handle only category parameter', () => {
      renderLogin('?category=test-category');

      expect(screen.getByText(/Category: test-category/)).toBeInTheDocument();
    });

    test('should decode URL-encoded parameters', () => {
      renderLogin('?gallery=my%20gallery&category=my%20category');

      expect(screen.getByText(/Gallery: my gallery, Category: my category/)).toBeInTheDocument();
    });

    test('should handle special characters in parameters', () => {
      renderLogin('?gallery=test%26gallery&category=test%2Bcategory');

      expect(screen.getByText(/Gallery: test&gallery, Category: test\+category/)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    test('should handle malformed query string', () => {
      renderLogin('?gallery=&category=');

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    test('should handle query string without leading ?', () => {
      // parseQuery expects the query string to include the ?
      renderLogin('gallery=test&category=test2');

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    test('should handle multiple parameters with same name (uses last value)', () => {
      renderLogin('?gallery=first&gallery=second&category=cat');

      // parseQuery will use the last value encountered
      expect(screen.getByText(/Gallery: second/)).toBeInTheDocument();
    });
  });
});
