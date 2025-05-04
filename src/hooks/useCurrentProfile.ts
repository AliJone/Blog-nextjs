import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useProfile } from './useProfileApi';
import { getAvatarUrl } from '@/lib/utils';
import { User } from '@/types/graphql';

/**
 * Hook to get the current user's profile
 * This combines Auth user data with profile data from the database
 */
export function useCurrentProfile() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get profile data if user is authenticated
  const { 
    profile: dbProfile, 
    loading: profileLoading,
    error 
  } = useProfile(authUser?.id || '');
  
  // Determine overall loading state
  useEffect(() => {
    if (!authLoading && (!authUser || !profileLoading)) {
      setIsLoading(false);
    }
  }, [authLoading, profileLoading, authUser]);
  
  // Combined profile with both Auth and DB data
  const profile = authUser ? {
    // Auth user data
    id: authUser.id,
    email: authUser.email,
    
    // Database profile data or fallbacks
    username: dbProfile?.username || authUser.email?.split('@')[0] || '',
    display_name: dbProfile?.display_name || authUser.user_metadata?.name || '',
    
    // Store the original avatar URL in the user object
    // Components will use getAvatarUrl when displaying
    avatar_url: dbProfile?.avatar_url || authUser.user_metadata?.avatar_url || null,
    
    // Other profile fields
    bio: dbProfile?.bio || '',
    website: dbProfile?.website || '',
    created_at: dbProfile?.created_at || authUser.created_at,
  } as User : null;
  
  return {
    profile,
    isLoading,
    error
  };
}