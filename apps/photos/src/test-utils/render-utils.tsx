/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { HelmetProvider } from 'react-helmet-async';
import { MockedResponse } from '@apollo/client/testing';
import { createMockApolloClient } from '@mkaciuba/api/test-utils/apollo-mocks';

/**
 * Options for rendering components with providers
 */
export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Apollo mocked responses for GraphQL operations
   */
  apolloMocks?: MockedResponse[];

  /**
   * Initial route for MemoryRouter (e.g., '/post/test-slug')
   */
  initialRoute?: string;

  /**
   * Additional MemoryRouter props
   */
  routerProps?: Omit<MemoryRouterProps, 'initialEntries'>;
}

/**
 * Custom render function that wraps components with all necessary providers:
 * - MemoryRouter for routing
 * - ApolloProvider with mocked GraphQL responses
 * - HelmetProvider for managing head tags
 *
 * @param ui - React component to render
 * @param options - Render options including Apollo mocks and initial route
 * @returns Testing Library render result
 *
 * @example
 * const { getByText } = renderWithProviders(
 *   <MyComponent />,
 *   {
 *     apolloMocks: [createQueryMock('GetPost', { post: mockPost })],
 *     initialRoute: '/post/test-slug'
 *   }
 * );
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult {
  const {
    apolloMocks = [],
    initialRoute = '/',
    routerProps = {},
    ...renderOptions
  } = options;

  const client = createMockApolloClient(apolloMocks);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialRoute]} {...routerProps}>
      <ApolloProvider client={client}>
        <HelmetProvider>{children}</HelmetProvider>
      </ApolloProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock for window.IntersectionObserver (required for infinite scroll tests)
 *
 * @example
 * beforeEach(() => {
 *   mockIntersectionObserver();
 * });
 */
export function mockIntersectionObserver(): void {
  global.IntersectionObserver = class IntersectionObserver {
    constructor(
      public callback: IntersectionObserverCallback,
      public options?: IntersectionObserverInit
    ) {}

    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
    takeRecords = jest.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
  } as any;
}

/**
 * Mock for window.matchMedia (required for responsive tests)
 *
 * @param width - Window width to simulate
 *
 * @example
 * mockWindowWidth(375); // Mobile viewport
 * mockWindowWidth(1920); // Desktop viewport
 */
export function mockWindowWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
}

/**
 * Mock for window.scrollTo (commonly used in components for scroll management)
 *
 * @example
 * beforeEach(() => {
 *   mockWindowScrollTo();
 * });
 */
export function mockWindowScrollTo(): void {
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
  });
}

/**
 * Mock for sessionStorage (required for useToken hook tests)
 *
 * @example
 * beforeEach(() => {
 *   mockSessionStorage();
 * });
 *
 * afterEach(() => {
 *   sessionStorage.clear();
 * });
 */
export function mockSessionStorage(): void {
  const storage: Record<string, string> = {};

  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: jest.fn((key: string) => storage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete storage[key];
      }),
      clear: jest.fn(() => {
        Object.keys(storage).forEach((key) => delete storage[key]);
      }),
      get length() {
        return Object.keys(storage).length;
      },
      key: jest.fn((index: number) => {
        const keys = Object.keys(storage);
        return keys[index] || null;
      }),
    },
    writable: true,
  });
}

/**
 * Mock for fetch API (required for Apollo Client in tests)
 *
 * @example
 * beforeEach(() => {
 *   mockFetch();
 * });
 */
export function mockFetch(): void {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => '',
      blob: async () => new Blob(),
    } as Response)
  );
}

/**
 * Setup common mocks for component tests
 * Includes: IntersectionObserver, scrollTo, sessionStorage, fetch
 *
 * @example
 * beforeEach(() => {
 *   setupCommonMocks();
 * });
 */
export function setupCommonMocks(): void {
  mockIntersectionObserver();
  mockWindowScrollTo();
  mockSessionStorage();
  mockFetch();
}

/**
 * Wait for a specified amount of time (useful for async operations)
 *
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the specified time
 *
 * @example
 * await wait(100); // Wait 100ms for debounced operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to create table test cases for viewport testing
 */
export const viewportTestCases = [
  { name: 'mobile', width: 375, height: 667, description: 'iPhone SE' },
  { name: 'tablet', width: 768, height: 1024, description: 'iPad' },
  { name: 'desktop', width: 1920, height: 1080, description: 'Full HD' },
];
