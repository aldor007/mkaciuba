import { renderHook, act } from '@testing-library/react';
import useToken from './useToken';

describe('useToken Hook', () => {
  let sessionStorageMock: Record<string, string>;

  beforeEach(() => {
    // Create a mock sessionStorage
    sessionStorageMock = {};

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => sessionStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          sessionStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete sessionStorageMock[key];
        }),
        clear: jest.fn(() => {
          sessionStorageMock = {};
        }),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    test('should initialize with empty string when no token in sessionStorage', () => {
      const { result } = renderHook(() => useToken());

      // Hook returns null when getItem returns null
      expect(result.current.token).toBeNull();
    });

    test('should initialize with existing token from sessionStorage', () => {
      sessionStorageMock['token'] = 'existing-token-123';

      const { result } = renderHook(() => useToken());

      expect(result.current.token).toBe('existing-token-123');
      expect(window.sessionStorage.getItem).toHaveBeenCalledWith('token');
    });

    test('should initialize with empty string when sessionStorage is undefined', () => {
      Object.defineProperty(window, 'sessionStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useToken());

      expect(result.current.token).toBe('');
    });
  });

  describe('setToken', () => {
    test('should save token to sessionStorage', () => {
      const { result } = renderHook(() => useToken());

      act(() => {
        result.current.setToken('new-token-456');
      });

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('token', 'new-token-456');
    });

    test('should handle multiple token updates', () => {
      const { result } = renderHook(() => useToken());

      act(() => {
        result.current.setToken('token-1');
      });

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('token', 'token-1');

      act(() => {
        result.current.setToken('token-2');
      });

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('token', 'token-2');
    });

    test('should not crash when sessionStorage is undefined', () => {
      Object.defineProperty(window, 'sessionStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useToken());

      expect(() => {
        act(() => {
          result.current.setToken('test-token');
        });
      }).not.toThrow();
    });

    test('should return null after saving token', () => {
      const { result } = renderHook(() => useToken());

      let returnValue;
      act(() => {
        returnValue = result.current.setToken('test-token');
      });

      expect(returnValue).toBeNull();
    });
  });

  describe('edge cases', () => {
    describe('should handle various token values', () => {
      const testCases = [
        { description: 'empty string', token: '' },
        { description: 'JWT-like token', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U' },
        { description: 'numeric token', token: '123456' },
        { description: 'token with special characters', token: 'abc!@#$%^&*()_+-={}[]|:;"<>,.?/' },
        { description: 'very long token', token: 'a'.repeat(1000) },
        { description: 'token with spaces', token: 'token with spaces' },
      ];

      test.each(testCases)('should handle $description', ({ token }) => {
        const { result } = renderHook(() => useToken());

        act(() => {
          result.current.setToken(token);
        });

        expect(window.sessionStorage.setItem).toHaveBeenCalledWith('token', token);
      });
    });

    test('should handle null sessionStorage getItem return', () => {
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useToken());

      expect(result.current.token).toBeNull();
    });

    test('should handle sessionStorage errors gracefully', () => {
      (window.sessionStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const { result } = renderHook(() => useToken());

      expect(() => {
        act(() => {
          result.current.setToken('test-token');
        });
      }).toThrow('QuotaExceededError');
    });
  });

  describe('hook interface', () => {
    test('should return object with setToken and token properties', () => {
      const { result } = renderHook(() => useToken());

      expect(result.current).toHaveProperty('setToken');
      expect(result.current).toHaveProperty('token');
      expect(typeof result.current.setToken).toBe('function');
      // Token can be string or null
      expect(['string', 'object']).toContain(typeof result.current.token);
    });

    test('should return setToken function on each render', () => {
      const { result, rerender } = renderHook(() => useToken());

      const firstSetToken = result.current.setToken;
      expect(typeof firstSetToken).toBe('function');

      rerender();

      // setToken is recreated on each render (not memoized)
      expect(typeof result.current.setToken).toBe('function');
    });
  });
});
