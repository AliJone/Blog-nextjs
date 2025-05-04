import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { ApolloProvider } from '@apollo/client';
import { initializeApollo } from '@/lib/apollo-client';
import { useRouter } from 'next/router';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Wrap the app with AuthProvider first, then attach Apollo with the current session
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ApolloWrapper pageProps={pageProps}>
        <Component {...pageProps} />
      </ApolloWrapper>
    </AuthProvider>
  );
}

// Apollo wrapper that gets a fresh client when auth state changes
function ApolloWrapper({ children, pageProps }: { children: React.ReactNode, pageProps: any }) {
  const { session, isLoading } = useAuth();
  // Important: Initialize with isServerSide=false for client-side rendering
  const [client, setClient] = useState(initializeApollo(pageProps.initialApolloState, false));
  const router = useRouter();
  
  // When session changes, create a new Apollo Client to use the new auth token
  useEffect(() => {
    if (!isLoading) {
      // Initialize a new client with the latest session - explicitly client-side
      const newClient = initializeApollo(pageProps.initialApolloState, false);
      setClient(newClient);

      // this is to just refresh the apollo client
    }
  }, [session, isLoading, pageProps.initialApolloState]);
  
  // Re-initialize Apollo client when route changes for fresh auth
  useEffect(() => {
    const handleRouteChange = () => {
      // Only refresh if not loading to avoid unnecessary refreshes
      if (!isLoading) {
        // Again, explicitly client-side
        const newClient = initializeApollo(pageProps.initialApolloState, false);
        setClient(newClient);
      }
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, isLoading, pageProps.initialApolloState]);

  // Show loading spinner while loading to avoid Apollo calls with wrong auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner 
          size="large" 
          text="Loading application..." 
        />
      </div>
    );
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export default MyApp;