import { useState } from 'react';
import { useRouter } from 'next/router';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// OTP Schema for email login
const otpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type OTPFormValues = z.infer<typeof otpSchema>;

const AuthForm = () => {
  const router = useRouter();
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up' | 'otp'>('sign_in');
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
  });

  // Handle OTP email sign-in
  const handleOTPSignIn = async (data: OTPFormValues) => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      alert('Check your email for the login link!');
      reset();
    } catch (error) {
      alert('Error sending the magic link. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <div className="mb-6 flex justify-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {authView === 'sign_in' ? 'Sign In' : 
             authView === 'sign_up' ? 'Sign Up' : 'Magic Link Sign In'}
          </h2>
        </div>

        {/* Tabs for different auth methods */}
        <div className="mb-6 flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setAuthView('sign_in')}
            className={`pb-2 px-4 ${
              authView === 'sign_in'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthView('sign_up')}
            className={`pb-2 px-4 ${
              authView === 'sign_up'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setAuthView('otp')}
            className={`pb-2 px-4 ${
              authView === 'otp'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Supabase Auth UI or OTP Form */}
        {authView === 'otp' ? (
          <form onSubmit={handleSubmit(handleOTPSignIn)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="small" className="mr-2" />
                  Sending...
                </span>
              ) : 'Send Magic Link'}
            </button>
          </form>
        ) : (
          <Auth
            supabaseClient={createClient()}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={['google']}
            redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
            view={authView}
          />
        )}
      </div>
    </div>
  );
};

export default AuthForm;