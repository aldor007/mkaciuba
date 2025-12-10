/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorPage, getErrorTitle, getErrorSuggestion } from './error';

describe('Error Utilities', () => {
  describe('getErrorTitle', () => {
    describe('should return correct title for HTTP status codes', () => {
      const testCases = [
        { code: 400, expected: 'Bad Request' },
        { code: 401, expected: 'Unauthorized' },
        { code: 403, expected: 'Forbidden' },
        { code: 404, expected: 'Not Found' },
        { code: 500, expected: 'Internal Server Error' },
        { code: 502, expected: 'Bad Gateway' },
        { code: 503, expected: 'Service Unavailable' },
        { code: 999, expected: 'Error', description: 'unsupported code' },
        { code: 0, expected: 'Error', description: 'zero code' },
        { code: -1, expected: 'Error', description: 'negative code' },
      ];

      test.each(testCases)('should return "$expected" for code $code', ({ code, expected }) => {
        expect(getErrorTitle(code)).toBe(expected);
      });
    });
  });

  describe('getErrorSuggestion', () => {
    describe('should return appropriate suggestions for error codes', () => {
      const testCases = [
        {
          code: 500,
          message: 'Unexpected token < in JSON at position 0',
          expected: 'This appears to be a server configuration issue. The server may have returned HTML instead of JSON. Please try again later or contact support if the issue persists.',
          description: '500 with unexpected token message',
        },
        {
          code: 500,
          message: 'Internal error',
          expected: 'Something went wrong on our end. Please try refreshing the page or come back later.',
          description: '500 without unexpected token',
        },
        {
          code: 500,
          message: undefined,
          expected: 'Something went wrong on our end. Please try refreshing the page or come back later.',
          description: '500 with no message',
        },
        {
          code: 404,
          message: undefined,
          expected: "The page you're looking for doesn't exist or may have been moved.",
          description: '404',
        },
        {
          code: 403,
          message: undefined,
          expected: "You don't have permission to access this resource.",
          description: '403',
        },
        {
          code: 401,
          message: undefined,
          expected: 'Please log in to access this content.',
          description: '401',
        },
        {
          code: 400,
          message: undefined,
          expected: null,
          description: '400 (no suggestion)',
        },
        {
          code: 502,
          message: undefined,
          expected: null,
          description: '502 (no suggestion)',
        },
        {
          code: 503,
          message: undefined,
          expected: null,
          description: '503 (no suggestion)',
        },
      ];

      test.each(testCases)('should handle $description', ({ code, message, expected }) => {
        expect(getErrorSuggestion(code, message)).toBe(expected);
      });
    });

    test('should be case-insensitive for unexpected token detection', () => {
      expect(getErrorSuggestion(500, 'UNEXPECTED TOKEN < in JSON')).toContain('server configuration issue');
      expect(getErrorSuggestion(500, 'unexpected token < in JSON')).toContain('server configuration issue');
      expect(getErrorSuggestion(500, 'UnExpEcTeD ToKeN')).toContain('server configuration issue');
    });
  });
});

describe('ErrorPage Component', () => {
  function renderErrorPage(props: any) {
    return render(
      <BrowserRouter>
        <ErrorPage {...props} />
      </BrowserRouter>
    );
  }

  describe('rendering', () => {
    test('should render error code', () => {
      renderErrorPage({ code: 404 });
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    test('should render error title', () => {
      renderErrorPage({ code: 404 });
      expect(screen.getByText('Not Found')).toBeInTheDocument();
    });

    test('should render custom message when provided', () => {
      renderErrorPage({ code: 500, message: 'Custom error message' });
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    test('should not render message section when message not provided', () => {
      const { container } = renderErrorPage({ code: 404 });
      const messageElement = container.querySelector('.bg-gray-100');
      expect(messageElement).not.toBeInTheDocument();
    });

    test('should render suggestion when available', () => {
      renderErrorPage({ code: 404 });
      expect(screen.getByText(/page you're looking for doesn't exist/i)).toBeInTheDocument();
    });

    test('should not render suggestion when not available', () => {
      renderErrorPage({ code: 400 });
      // Check that no suggestion text appears
      const container = document.querySelector('.italic');
      expect(container).not.toBeInTheDocument();
    });

    test('should render technical details when provided', () => {
      renderErrorPage({ code: 500, details: 'Stack trace here' });
      expect(screen.getByText('Technical Details')).toBeInTheDocument();
      expect(screen.getByText('Stack trace here')).toBeInTheDocument();
    });

    test('should not render details section when details not provided', () => {
      renderErrorPage({ code: 500 });
      expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
    });

    test('should render "Go Home" button', () => {
      renderErrorPage({ code: 404 });
      const button = screen.getByText('Go Home');
      expect(button).toBeInTheDocument();
      expect(button.closest('a')).toHaveAttribute('href', '/');
    });
  });

  describe('complete error scenarios', () => {
    describe('should render complete error pages', () => {
      const testCases = [
        {
          code: 404,
          title: 'Not Found',
          suggestion: /page you're looking for doesn't exist/i,
          description: '404 error',
        },
        {
          code: 401,
          title: 'Unauthorized',
          suggestion: /please log in to access this content/i,
          description: '401 error',
        },
        {
          code: 403,
          title: 'Forbidden',
          suggestion: /don't have permission/i,
          description: '403 error',
        },
        {
          code: 500,
          title: 'Internal Server Error',
          suggestion: /something went wrong on our end/i,
          description: '500 error',
        },
      ];

      test.each(testCases)('should render $description correctly', ({ code, title, suggestion }) => {
        renderErrorPage({ code });
        expect(screen.getByText(code.toString())).toBeInTheDocument();
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });
  });

  describe('styling and layout', () => {
    test('should apply correct container classes', () => {
      const { container } = renderErrorPage({ code: 404 });
      const mainDiv = container.querySelector('.w-full.h-screen');
      expect(mainDiv).toBeInTheDocument();
    });

    test('should apply correct heading styles', () => {
      renderErrorPage({ code: 404 });
      const codeHeading = screen.getByText('404');
      expect(codeHeading).toHaveClass('text-6xl', 'font-bold', 'text-gray-800');
    });

    test('should apply correct button styles', () => {
      renderErrorPage({ code: 404 });
      const button = screen.getByText('Go Home');
      expect(button).toHaveClass('bg-green-500', 'hover:bg-green-600');
    });

    test('should render message with background styling', () => {
      const { container } = renderErrorPage({ code: 500, message: 'Test message' });
      const messageElement = screen.getByText('Test message').closest('p');
      expect(messageElement).toHaveClass('bg-gray-100', 'rounded-lg');
    });
  });

  describe('edge cases', () => {
    test('should handle all props provided', () => {
      renderErrorPage({
        code: 500,
        message: 'Error message',
        details: 'Technical details',
      });

      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Technical details')).toBeInTheDocument();
    });

    test('should handle only code prop', () => {
      renderErrorPage({ code: 404 });
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Not Found')).toBeInTheDocument();
    });

    test('should handle long error messages', () => {
      const longMessage = 'A'.repeat(500);
      renderErrorPage({ code: 500, message: longMessage });
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    test('should handle long technical details', () => {
      const longDetails = 'Stack trace line\n'.repeat(50);
      const { container } = renderErrorPage({ code: 500, details: longDetails });
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(longDetails);
    });

    test('should handle special characters in message', () => {
      const specialMessage = '<script>alert("xss")</script>';
      renderErrorPage({ code: 500, message: specialMessage });
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });
});
