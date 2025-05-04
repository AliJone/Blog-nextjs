import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@/lib/supabase';

// this page handles the Google Auth callback
export default function AuthCallback() {
  const router = useRouter();
  
  useEffect(() => {
    // Handle the OAuth callback by exchanging the code for a session
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient();

        const code = router.query.code as string;

        const redirectTo = (router.query.redirectTo as string) || '/';
        
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            throw error;
          }
          
          console.log('Auth callback successful, redirecting to:', redirectTo);
          
          // Redirect to the intended destination
          router.push(redirectTo);
        } else {
          console.warn('No code in callback URL, redirecting to login page');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.push('/login?error=authentication-error');
      }
    };

    if (router.isReady && router.query.code) {
      handleAuthCallback();
    }
  }, [router.isReady, router.query.code, router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
      <h2 className="text-xl font-semibold text-gray-700">Finishing login...</h2>
      <p className="mt-2 text-gray-500">You'll be redirected momentarily.</p>
    </div>
  );
}