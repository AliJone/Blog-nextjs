import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  defaultDataIdFromObject,
  NormalizedCacheObject
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { relayStylePagination } from '@apollo/client/utilities';
import { createClient } from './supabase';

// Create a new cache instance
const cache = new InMemoryCache({
  dataIdFromObject(responseObject) {
    if ('nodeId' in responseObject) {
      return `${responseObject.nodeId}`
    }
    return defaultDataIdFromObject(responseObject)
  },
  possibleTypes: { Node: ['Todos'] }, // optional, but useful to specify supertype-subtype relationships
  typePolicies: {
    Query: {
      fields: {
        todosCollection: relayStylePagination(), // example of paginating a collection
        node: {
          read(_, { args, toReference }) {
            const ref = toReference({
              nodeId: args?.nodeId,
            })
            return ref
          },
        },
      },
    },
  },
})

// Create an HTTP link to the GraphQL API
const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
});

// Create a function to get an authenticated Apollo Client
export function getApolloClient(isServerSide = false): ApolloClient<NormalizedCacheObject> {

  // Add auth headers to all requests
  const authLink = setContext(async (_, { headers }) => {
    // Always use the createClient() to ensure proper context
    const supabase = createClient();
    
    // For true static generation (no session possible)
    if (isServerSide && typeof window === 'undefined') {
     return {
        headers: {
          ...headers,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        },
      };
    }
    
    try {
      // Get session (works in client and SSR with cookies)
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return {
          headers: {
            ...headers,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
          },
        };
      }
      
      const token = data?.session?.access_token;
      
      // Return headers for the HTTP link to use
      return {
        headers: {
          ...headers,
          // Add the API key and auth token to the headers
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
          Authorization: token ? `Bearer ${token}` : '',
        },
      };
    } catch (e) {
      console.error('[DEBUG] Unexpected error in auth link:', e);
      // Fallback to using just the anon key
      return {
        headers: {
          ...headers,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        },
      };
    }
  });

  // Create the Apollo Client instance
  return new ApolloClient({
    // Combine auth and HTTP links
    link: authLink.concat(httpLink),
    // Use the configured cache
    cache,
  });
}

// For singleton usage pattern
let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

// Initialize Apollo client with optional initial state
export function initializeApollo(initialState: Record<string, any> | null = null, isServerSide = false): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? getApolloClient(isServerSide);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial
  // state gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = { ...existingCache, ...(initialState as Record<string, any>) };
    
    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }
  
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}
