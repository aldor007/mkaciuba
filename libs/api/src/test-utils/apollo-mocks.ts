/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ApolloClient,
  InMemoryCache,
  FieldPolicy,
  Reference,
  gql,
} from '@apollo/client';
import { MockedResponse, MockLink } from '@apollo/client/testing';

// Custom pagination policy for start/limit pagination
// Copied from apps/photos/src/app/apollo.ts to avoid circular dependency
type KeyArgs = false | string[];

function startLimitPagination<T = Reference>(
  keyArgs: KeyArgs = false
): FieldPolicy<T[]> {
  return {
    keyArgs,
    merge(existing: any[], incoming: any[], { args }) {
      if (!args || !Object.prototype.hasOwnProperty.call(args, 'start')) {
        return incoming || existing;
      }
      const merged = existing ? existing.slice(0) : [];
      if (args) {
        const { start = 0 } = args;
        for (let i = 0; i < incoming.length; ++i) {
          merged[start + i] = incoming[i];
        }
      } else {
        return [...(existing || []), ...(incoming || [])];
      }
      return merged;
    },
  };
}

/**
 * Creates a mock Apollo Client with the custom startLimitPagination policy
 * for testing components that use Apollo Client.
 *
 * @param mocks - Array of MockedResponse objects to stub GraphQL operations
 * @param addTypename - Whether to add __typename to responses (default: true)
 * @returns Configured ApolloClient instance for testing
 *
 * @example
 * const mocks = [createQueryMock('GetPosts', { posts: [] })];
 * const client = createMockApolloClient(mocks);
 */
export function createMockApolloClient(
  mocks: MockedResponse[] = [],
  addTypename = true
): ApolloClient<any> {
  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Apply custom pagination policy to paginated fields
            medias: startLimitPagination(),
            categories: startLimitPagination(),
            posts: startLimitPagination(),
          },
        },
      },
    }),
    link: new MockLink(mocks, addTypename),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
      },
      query: {
        fetchPolicy: 'no-cache',
      },
    },
  });
}

/**
 * Creates a MockedResponse for a GraphQL query or mutation
 *
 * @param operationName - Name of the GraphQL operation
 * @param data - Response data to return
 * @param variables - Variables expected by the operation
 * @param error - Optional GraphQL error to return
 * @returns MockedResponse object
 *
 * @example
 * // Success response
 * const mock = createQueryMock('GetPost', { post: { id: '1', title: 'Test' } }, { slug: 'test' });
 *
 * // Error response
 * const errorMock = createQueryMock('GetPost', null, { slug: 'test' }, new Error('Not found'));
 */
export function createQueryMock(
  operationName: string,
  data: any,
  variables: Record<string, any> = {},
  error?: Error
): MockedResponse {
  const result: any = error
    ? { errors: [{ message: error.message }] }
    : { data };

  return {
    request: {
      query: gql`query ${operationName} { __typename }`, // Placeholder query
      variables,
      operationName,
    },
    result,
  };
}

/**
 * Creates a MockedResponse for a GraphQL mutation
 *
 * @param operationName - Name of the GraphQL mutation
 * @param data - Response data to return
 * @param variables - Variables expected by the mutation
 * @param error - Optional GraphQL error to return
 * @returns MockedResponse object
 *
 * @example
 * const mock = createMutationMock('ValidateToken', { validateToken: { valid: true } }, { password: 'test123' });
 */
export function createMutationMock(
  operationName: string,
  data: any,
  variables: Record<string, any> = {},
  error?: Error
): MockedResponse {
  const result: any = error
    ? { errors: [{ message: error.message }] }
    : { data };

  return {
    request: {
      query: gql`mutation ${operationName} { __typename }`, // Placeholder mutation
      variables,
      operationName,
    },
    result,
  };
}

/**
 * Waits for all pending Apollo queries to complete
 * Useful in tests when you need to ensure all async operations finish
 *
 * @param client - ApolloClient instance
 * @returns Promise that resolves when all queries complete
 *
 * @example
 * const client = createMockApolloClient(mocks);
 * render(<ApolloProvider client={client}><MyComponent /></ApolloProvider>);
 * await waitForApolloQueries(client);
 * expect(screen.getByText('Loaded')).toBeInTheDocument();
 */
export async function waitForApolloQueries(
  client: ApolloClient<any>
): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Creates a spy function that can be used to track MockedResponse calls
 * Useful for verifying that queries/mutations were called with correct variables
 *
 * @returns Jest spy function
 *
 * @example
 * const spy = createMockSpy();
 * const mock = { ...createQueryMock('GetPost', data), newData: spy };
 * // After test runs, verify:
 * expect(spy).toHaveBeenCalledWith(expect.objectContaining({ variables: { slug: 'test' } }));
 */
export function createMockSpy(): jest.Mock {
  return jest.fn();
}

/**
 * Helper to create a mock for paginated queries with start/limit args
 *
 * @param operationName - Name of the GraphQL operation
 * @param items - Array of items to return
 * @param start - Start offset
 * @param limit - Number of items
 * @param totalCount - Total count of items available
 * @param fieldName - Name of the field in response (default: 'items')
 * @returns MockedResponse object
 *
 * @example
 * const mock = createPaginatedQueryMock('GetPosts', mockPosts, 0, 10, 100, 'posts');
 */
export function createPaginatedQueryMock(
  operationName: string,
  items: any[],
  start: number,
  limit: number,
  totalCount?: number,
  fieldName = 'items'
): MockedResponse {
  const paginatedItems = items.slice(start, start + limit);

  return createQueryMock(
    operationName,
    {
      [fieldName]: paginatedItems,
      [`${fieldName}Count`]: totalCount ?? items.length,
    },
    { start, limit }
  );
}
