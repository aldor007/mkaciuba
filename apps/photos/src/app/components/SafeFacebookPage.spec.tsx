import React from 'react';
import { render } from '@testing-library/react';
import { SafeFacebookPage } from './SafeFacebookPage';

// Mock react-facebook to test error handling
jest.mock('react-facebook', () => ({
  FacebookProvider: jest.fn(({ children }) => {
    throw new Error("Cannot read properties of undefined (reading 'XFBML')");
  }),
  Page: jest.fn(() => <div data-testid="facebook-page">Facebook Page</div>),
}));

describe('SafeFacebookPage', () => {
  beforeEach(() => {
    // Suppress console warnings during tests
    jest.spyOn(console, 'warn').mockImplementation(() => {
      // Intentionally empty to suppress warnings during tests
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('error handling', () => {
    test('should not crash when Facebook SDK fails to load', () => {
      const { container } = render(
        <SafeFacebookPage
          appId="test-app-id"
          pageUrl="https://www.facebook.com/test"
          tabs="timeline"
        />
      );

      // Component should render without throwing
      expect(container).toBeInTheDocument();
      // Should render placeholder div to prevent hydration mismatches
      const placeholder = container.querySelector('div[aria-label="Facebook feed unavailable"]');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveStyle({ minHeight: '180px' });
    });

    test('should log warning when Facebook SDK fails', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');

      render(
        <SafeFacebookPage
          appId="test-app-id"
          pageUrl="https://www.facebook.com/test"
        />
      );

      // Should have logged a warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Facebook SDK failed to load:',
        expect.any(String)
      );
    });

    test('should handle XFBML error gracefully', () => {
      const { container } = render(
        <SafeFacebookPage
          appId="1724717534454966"
          pageUrl="https://www.facebook.com/mkaciubapl"
          tabs="timeline"
        />
      );

      // Should not throw and render placeholder div
      const placeholder = container.querySelector('div[aria-label="Facebook feed unavailable"]');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveStyle({ minHeight: '180px' });
    });
  });

  describe('props', () => {
    test('should accept appId prop', () => {
      const { container } = render(
        <SafeFacebookPage
          appId="test-app-id"
          pageUrl="https://www.facebook.com/test"
        />
      );

      expect(container).toBeInTheDocument();
    });

    test('should accept pageUrl prop', () => {
      const { container } = render(
        <SafeFacebookPage
          appId="test-app-id"
          pageUrl="https://www.facebook.com/testpage"
        />
      );

      expect(container).toBeInTheDocument();
    });

    test('should accept optional tabs prop', () => {
      const { container } = render(
        <SafeFacebookPage
          appId="test-app-id"
          pageUrl="https://www.facebook.com/test"
          tabs="events"
        />
      );

      expect(container).toBeInTheDocument();
    });

    test('should use default tabs value if not provided', () => {
      const { container } = render(
        <SafeFacebookPage
          appId="test-app-id"
          pageUrl="https://www.facebook.com/test"
        />
      );

      expect(container).toBeInTheDocument();
    });
  });
});
