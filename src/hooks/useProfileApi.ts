import { useState } from 'react';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { GET_PROFILE, UPDATE_PROFILE } from '@/graphql/operations';
import { User, getUserData } from '@/types/graphql';

// Interface for profile response
interface ProfileResponse {
  profilesCollection: {
    edges: {
      node: User;
    }[];
  };
}

// Interface for update profile response
interface UpdateProfileResponse {
  updateprofilesCollection: {
    records: User[];
  };
}

// Hook for fetching a profile by ID
export function useProfile(id: string) {
  const { data, loading, error, refetch } = useQuery<ProfileResponse>(GET_PROFILE, {
    variables: { id },
    skip: !id,
  });
  
  // Extract profile from the response
  let profile = null;
  if (data?.profilesCollection?.edges?.length) {
    profile = data.profilesCollection.edges[0].node;
  }
  
  return {
    profile,
    loading,
    error,
    refetch
  };
}

// Hook for updating a profile
export function useUpdateProfile() {
  const [updateProfile, { loading }] = useMutation<UpdateProfileResponse>(UPDATE_PROFILE);
  const [error, setError] = useState<ApolloError | null>(null);
  
  const update = async ({ 
    id, 
    username, 
    display_name, 
    bio, 
    website, 
    avatar_url 
  }: {
    id: string;
    username?: string;
    display_name?: string;
    bio?: string;
    website?: string;
    avatar_url?: string;
  }) => {
    try {
      const { data } = await updateProfile({
        variables: { 
          id, 
          username, 
          display_name, 
          bio, 
          website, 
          avatar_url 
        },
      });
      
      // Return the updated profile
      if (data?.updateprofilesCollection?.records?.[0]) {
        return data.updateprofilesCollection.records[0];
      }
      return null;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err as ApolloError);
      throw err;
    }
  };
  
  return { update, loading, error };
}