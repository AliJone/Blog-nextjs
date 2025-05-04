import { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import ProfileDropdown from './ProfileDropdown';

type LayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export default function Layout({ children, title, description }: LayoutProps) {
  const { user, isLoading } = useAuth();
  
  const pageTitle = title ? `${title} | NextJS Blog` : 'NextJS Blog';
  const pageDescription = description || 'A blog built with Next.js, Supabase, and GraphQL';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen flex-col">
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                  NextJS Blog
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                {isLoading ? (
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                ) : user ? (
                  <ProfileDropdown />
                ) : (
                  <Link
                    href="/login"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="grow py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        <footer className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500">
              © {new Date().getFullYear()} NextJS Blog. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}