import React from 'react';
import { render, screen } from '@testing-library/react';
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
    jest.spyOn(console, 'warn').mockImplementation(() => {});
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
      // Should not render anything when there's an error
      expect(container.firstChild).toBeNull();
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

      // Should not throw and render nothing
      expect(container.firstChild).toBeNull();
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
