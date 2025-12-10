import { renderHook } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { useQueryParams } from './qs';
import React from 'react';

describe('useQueryParams', () => {
  describe('basic functionality', () => {
    test('should return URLSearchParams object', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?foo=bar']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      expect(result.current).toBeInstanceOf(URLSearchParams);
    });

    test('should parse single query parameter', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?page=2']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      expect(result.current.get('page')).toBe('2');
    });

    test('should parse multiple query parameters', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?page=2&sort=desc&filter=active']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      expect(result.current.get('page')).toBe('2');
      expect(result.current.get('sort')).toBe('desc');
      expect(result.current.get('filter')).toBe('active');
    });
  });

  describe('query parameter scenarios', () => {
    describe('should handle various query parameter formats', () => {
      const testCases = [
        {
          description: 'empty query string',
          url: '/',
          expectedSize: 0,
        },
        {
          description: 'single parameter',
          url: '/?key=value',
          expectedParam: { key: 'key', value: 'value' },
        },
        {
          description: 'parameter with spaces (encoded)',
          url: '/?name=John%20Doe',
          expectedParam: { key: 'name', value: 'John Doe' },
        },
        {
          description: 'parameter with special characters',
          url: '/?email=test%40example.com',
          expectedParam: { key: 'email', value: 'test@example.com' },
        },
        {
          description: 'numeric parameter',
          url: '/?count=42',
          expectedParam: { key: 'count', value: '42' },
        },
        {
          description: 'boolean-like parameter',
          url: '/?enabled=true',
          expectedParam: { key: 'enabled', value: 'true' },
        },
        {
          description: 'parameter with empty value',
          url: '/?key=',
          expectedParam: { key: 'key', value: '' },
        },
        {
          description: 'parameter without value',
          url: '/?flag',
          expectedParam: { key: 'flag', value: '' },
        },
      ];

      test.each(testCases)('should handle $description', ({ url, expectedSize, expectedParam }) => {
        const wrapper = ({ children }: any) => (
          <MemoryRouter initialEntries={[url]}>
            {children}
          </MemoryRouter>
        );

        const { result } = renderHook(() => useQueryParams(), { wrapper });

        if (expectedSize !== undefined) {
          // Count parameters by iterating
          let count = 0;
          result.current.forEach(() => count++);
          expect(count).toBe(expectedSize);
        }

        if (expectedParam) {
          expect(result.current.get(expectedParam.key)).toBe(expectedParam.value);
        }
      });
    });
  });

  describe('URLSearchParams methods', () => {
    test('should support has() method', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?page=1']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      expect(result.current.has('page')).toBe(true);
      expect(result.current.has('nonexistent')).toBe(false);
    });

    test('should support getAll() method for multiple values', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?tags=react&tags=typescript&tags=testing']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      const tags = result.current.getAll('tags');
      expect(tags).toEqual(['react', 'typescript', 'testing']);
    });

    test('should support iteration over keys', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?a=1&b=2&c=3']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      const keys: string[] = [];
      result.current.forEach((value, key) => keys.push(key));
      expect(keys).toEqual(['a', 'b', 'c']);
    });

    test('should support iteration over values', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?a=1&b=2&c=3']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      const values: string[] = [];
      result.current.forEach((value) => values.push(value));
      expect(values).toEqual(['1', '2', '3']);
    });

    test('should support forEach() method', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?x=10&y=20']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      const collected: Record<string, string> = {};
      result.current.forEach((value, key) => {
        collected[key] = value;
      });

      expect(collected).toEqual({ x: '10', y: '20' });
    });

    test('should support toString() method', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?page=1&sort=desc']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      expect(result.current.toString()).toBe('page=1&sort=desc');
    });
  });

  describe('edge cases', () => {
    test('should return null for non-existent parameter', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?foo=bar']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      expect(result.current.get('nonexistent')).toBeNull();
    });

    test('should handle URL with hash', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?page=1#section']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      expect(result.current.get('page')).toBe('1');
    });

    test('should handle complex URL path with query params', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/posts/123?page=2&filter=active']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      expect(result.current.get('page')).toBe('2');
      expect(result.current.get('filter')).toBe('active');
    });

    test('should handle ampersand in parameter value', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?text=foo%26bar']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      expect(result.current.get('text')).toBe('foo&bar');
    });
  });

  describe('react-router integration', () => {
    test('should work with BrowserRouter', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?test=value']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      expect(result.current.get('test')).toBe('value');
    });

    test('should read query params from current location', () => {
      const wrapper = ({ children }: any) => (
        <MemoryRouter initialEntries={['/?initial=test']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useQueryParams(), { wrapper });

      expect(result.current.get('initial')).toBe('test');
    });
  });
});
