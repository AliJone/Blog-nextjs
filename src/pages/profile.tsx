import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileForm from '@/components/profile/ProfileForm';
import UserPosts from '@/components/profile/UserPosts';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/lib/auth-context';
import { useProfile, useUpdateProfile } from '@/hooks/useProfileApi';
import { usePosts } from '@/hooks/useGraphQL';

// User Posts Section Component
function UserPostsSection({ userId }: { userId: string }) {
  // Fetch user posts with the usePosts hook
  const { 
    posts, 
    loading, 
    hasNextPage, 
    loadMore, 
    loadingMore 
  } = usePosts(10); // Fetch up to 10 posts at a time
  
  // Filter posts by user ID
  const userPosts = posts.filter(post => post.user_id === userId);
  
  return (
    <UserPosts
      posts={userPosts}
      loading={loading}
      hasMorePosts={hasNextPage}
      loadMorePosts={loadMore}
      loadingMore={loadingMore}
    />
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login?error=unauthorized&redirectTo=/profile');
    }
  }, [user, authLoading, router]);
  
  // Fetch profile data
  const { 
    profile, 
    loading: profileLoading, 
    error: profileError,
    refetch
  } = useProfile(user?.id || '');
  
  // Profile update mutation
  const { 
    update: updateProfile, 
    loading: updateLoading 
  } = useUpdateProfile();
  
  // Handle form submission
  const handleProfileUpdate = async (data: any) => {
    if (!user?.id) return;
    
    await updateProfile({
      id: user.id,
      ...data
    });
    
    // Refresh profile data
    await refetch();
    
    // Exit edit mode
    setIsEditMode(false);
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };
  
  // Show loading state
  if (authLoading || profileLoading) {
    return (
      <Layout title="Profile">
        <LoadingSpinner 
          fullPage 
          text="Loading profile..." 
          size="large"
        />
      </Layout>
    );
  }
  
  // Show error state
  if (profileError) {
    return (
      <Layout title="Profile Error">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            Error Loading Profile
          </h1>
          <p className="mb-8 text-gray-600">
            {profileError.message || 'There was an error loading your profile. Please try again later.'}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }
  
  // Show not authenticated state
  if (!user) {
    return (
      <Layout title="Profile">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Authentication Required</h1>
          <p className="mb-6 text-gray-600">You need to be logged in to view your profile.</p>
          <button
            onClick={() => router.push('/login?redirectTo=/profile')}
            className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </Layout>
    );
  }
  
  // If profile doesn't exist but user is authenticated, show error
  if (!profile) {
    return (
      <Layout title="Profile Not Found">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Profile Not Found</h1>
          <p className="mb-6 text-gray-600">We couldn't find your profile information.</p>
          <button
            onClick={() => refetch()}
            className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={profile.display_name || profile.username || 'My Profile'}>
      <Head>
        <title>{profile.display_name || profile.username || 'My Profile'} | NextJS Blog</title>
        <meta name="description" content="View and edit your user profile" />
      </Head>
      
      <div className="mx-auto max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Profile' : 'My Profile'}
          </h1>
        </div>
        
        <div className="overflow-hidden rounded-lg bg-white p-6 shadow-md">
          {isEditMode ? (
            <div className="space-y-8">
              <button
                onClick={toggleEditMode}
                className="text-blue-600 hover:underline"
              >
                &larr; Back to Profile
              </button>
              
              <ProfileForm
                profile={profile}
                onSubmit={handleProfileUpdate}
                isLoading={updateLoading}
              />
            </div>
          ) : (
            <ProfileInfo
              profile={profile}
              toggleEditMode={toggleEditMode}
            />
          )}
        </div>
        
        {/* Display user posts */}
        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">My Posts</h2>
          <UserPostsSection userId={user.id} />
        </div>
      </div>
    </Layout>
  );
}