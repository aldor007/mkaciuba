import { renderHook } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import {
  parseListingParams,
  serializeListingParams,
  useListingParams,
  useQueryParams,
} from './qs';
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

describe('parseListingParams', () => {
  describe('should parse and validate listing params', () => {
    const testCases = [
      {
        description: 'empty search string',
        search: '',
        expected: { page: 1, sort: null, tags: [] as string[], q: null },
      },
      {
        description: 'valid sort',
        search: '?sort=title:asc',
        expected: { page: 1, sort: 'title:asc', tags: [] as string[], q: null },
      },
      {
        description: 'sort missing direction is dropped',
        search: '?sort=title',
        expected: { page: 1, sort: null, tags: [] as string[], q: null },
      },
      {
        description: 'sort with injection attempt is dropped',
        search: '?sort=title:asc;drop',
        expected: { page: 1, sort: null, tags: [] as string[], q: null },
      },
      {
        description: 'sort not in allowedSorts is dropped',
        search: '?sort=name:asc',
        allowedSorts: ['title:asc'],
        expected: { page: 1, sort: null, tags: [] as string[], q: null },
      },
      {
        description: 'sort in allowedSorts is kept',
        search: '?sort=name:asc',
        allowedSorts: ['name:asc', 'name:desc'],
        expected: { page: 1, sort: 'name:asc', tags: [] as string[], q: null },
      },
      {
        description: 'valid page',
        search: '?page=3',
        expected: { page: 3, sort: null, tags: [] as string[], q: null },
      },
      {
        description: 'non-numeric page falls back to 1',
        search: '?page=abc',
        expected: { page: 1, sort: null, tags: [] as string[], q: null },
      },
      {
        description: 'zero page falls back to 1',
        search: '?page=0',
        expected: { page: 1, sort: null, tags: [] as string[], q: null },
      },
      {
        description: 'comma separated tags',
        search: '?tag=a,b',
        expected: { page: 1, sort: null, tags: ['a', 'b'], q: null },
      },
      {
        description: 'repeated tag params',
        search: '?tag=a&tag=b',
        expected: { page: 1, sort: null, tags: ['a', 'b'], q: null },
      },
      {
        description: 'duplicate tags are deduplicated',
        search: '?tag=a,b,a',
        expected: { page: 1, sort: null, tags: ['a', 'b'], q: null },
      },
      {
        description: 'tags with invalid characters are dropped',
        search: '?tag=<script>,valid',
        expected: { page: 1, sort: null, tags: ['valid'], q: null },
      },
      {
        description: 'query term is parsed',
        search: '?q=test',
        expected: { page: 1, sort: null, tags: [] as string[], q: 'test' },
      },
      {
        description: 'query term is trimmed',
        search: '?q=%20%20test%20%20',
        expected: { page: 1, sort: null, tags: [] as string[], q: 'test' },
      },
      {
        description: 'empty query term is dropped',
        search: '?q=',
        expected: { page: 1, sort: null, tags: [] as string[], q: null },
      },
      {
        description: 'combined params',
        search: '?sort=publicationDate:desc&tag=a,b&page=2&q=x',
        expected: { page: 2, sort: 'publicationDate:desc', tags: ['a', 'b'], q: 'x' },
      },
    ];

    test.each(testCases)('should handle $description', ({ search, allowedSorts, expected }) => {
      const result = allowedSorts
        ? parseListingParams(search, allowedSorts)
        : parseListingParams(search);
      expect(result).toEqual(expected);
    });
  });

  test('should cap tags at 12 entries', () => {
    const tags = Array.from({ length: 15 }, (_, i) => `tag${i}`);
    const result = parseListingParams(`?tag=${tags.join(',')}`);
    expect(result.tags).toHaveLength(12);
    expect(result.tags[0]).toBe('tag0');
    expect(result.tags[11]).toBe('tag11');
  });

  test('should cap query term length at 100 characters', () => {
    const longQuery = 'a'.repeat(150);
    const result = parseListingParams(`?q=${longQuery}`);
    expect(result.q).toHaveLength(100);
  });
});

describe('serializeListingParams', () => {
  test('should return empty string for default params', () => {
    expect(serializeListingParams({})).toBe('');
    expect(serializeListingParams({ page: 1, sort: null, tags: [], q: null })).toBe('');
  });

  test('should omit page 1', () => {
    expect(serializeListingParams({ page: 1, sort: 'title:asc' })).toBe('?sort=title:asc');
  });

  test('should serialize all params', () => {
    expect(
      serializeListingParams({ page: 2, sort: 'title:asc', tags: ['a', 'b'], q: 'test' })
    ).toBe('?page=2&sort=title:asc&tag=a,b&q=test');
  });

  test('should round-trip through parseListingParams', () => {
    const search = '?page=2&sort=title:asc&tag=a,b&q=test';
    const parsed = parseListingParams(search);
    expect(serializeListingParams(parsed)).toBe(search);
  });
});

describe('useListingParams', () => {
  test('should read validated params from current location', () => {
    const wrapper = ({ children }: any) => (
      <MemoryRouter initialEntries={['/?sort=title:asc&tag=a,b&page=2']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(() => useListingParams(), { wrapper });

    expect(result.current).toEqual({ page: 2, sort: 'title:asc', tags: ['a', 'b'], q: null });
  });

  test('should drop invalid values from the URL', () => {
    const wrapper = ({ children }: any) => (
      <MemoryRouter initialEntries={['/?sort=invalid&tag=<bad>&page=abc&q=']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(() => useListingParams(), { wrapper });

    expect(result.current).toEqual({ page: 1, sort: null, tags: [], q: null });
  });
});
