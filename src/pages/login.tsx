import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/lib/auth-context';

export default function Login() {
  const { user, isLoading, isSessionExpired, refreshSession } = useAuth();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle query parameters and error states
  useEffect(() => {
    if (!router.isReady) return;

    // Check for error in URL query parameters
    const { error, message } = router.query;
    
    if (error) {
      const errorMessages: Record<string, string> = {
        'authentication-error': 'Authentication failed. Please try again.',
        'session-expired': 'Your session has expired. Please log in again.',
        'unauthorized': 'You need to log in to access this page.',
        'default': 'An error occurred. Please try again.'
      };
      
      setErrorMessage(errorMessages[error as string] || errorMessages.default);
    } else if (message) {
      setErrorMessage(message as string);
    } else if (isSessionExpired) {
      setErrorMessage('Your session has expired. Please log in again.');
    } else {
      setErrorMessage(null);
    }
  }, [router.isReady, router.query, isSessionExpired]);

  // Redirect to homepage if already authenticated
  useEffect(() => {
    if (user && !isLoading && !isSessionExpired) {
      const redirectTo = router.query.redirectTo as string || '/';
      router.push(redirectTo);
    }
  }, [user, isLoading, isSessionExpired, router]);

  // Clear error when user starts to interact with the form
  const handleStartInteraction = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" className="mx-auto mb-4" />
          <h2 className="mb-2 text-xl font-bold">Checking authentication...</h2>
          <p className="text-gray-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Login | NextJS Blog</title>
        <meta name="description" content="Login to your NextJS Blog account" />
      </Head>

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4">
        <header className="py-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              NextJS Blog
            </Link>
          </nav>
        </header>

        <main className="flex grow flex-col items-center justify-center py-10" onClick={handleStartInteraction}>
          {errorMessage && (
            <div className="mb-6 w-full max-w-md rounded-md bg-red-100 p-4 text-red-700">
              <p>{errorMessage}</p>
            </div>
          )}
          
          <AuthForm />
          
          {isSessionExpired && (
            <button 
              onClick={() => refreshSession()}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Try to restore your session
            </button>
          )}
        </main>

        <footer className="py-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} NextJS Blog. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}