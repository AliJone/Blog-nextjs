import { FC } from 'react';
import Image from 'next/image';
import { User } from '@/types/graphql';
import { formatDateTime, getAvatarUrl } from '@/lib/utils';

interface ProfileInfoProps {
  profile: User;
  toggleEditMode: () => void;
}

const ProfileInfo: FC<ProfileInfoProps> = ({ profile, toggleEditMode }) => {
  // Use utility function for consistent avatar handling
  const displayName = profile?.display_name || profile?.username || 'User';
  const avatarUrl = getAvatarUrl(profile?.avatar_url, displayName);
  
  // Format date
  const formattedDate = formatDateTime(profile?.created_at || new Date().toISOString());
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6 md:flex-row">
        <div className="h-32 w-32 overflow-hidden rounded-full">
          <Image
            src={avatarUrl}
            alt={profile?.display_name || 'User Profile'}
            width={128}
            height={128}
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="flex-1 space-y-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.display_name || profile?.username || 'Anonymous User'}
          </h1>
          <p className="text-gray-500">@{profile?.username}</p>
          <p className="text-sm text-gray-500">Member since {formattedDate}</p>
          
          <button
            onClick={toggleEditMode}
            className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit Profile
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {profile?.bio && (
          <div>
            <h2 className="text-lg font-medium text-gray-900">Bio</h2>
            <p className="whitespace-pre-wrap text-gray-700">{profile.bio}</p>
          </div>
        )}
        
        {profile?.website && (
          <div>
            <h2 className="text-lg font-medium text-gray-900">Website</h2>
            <a 
              href={profile.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {profile.website}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;