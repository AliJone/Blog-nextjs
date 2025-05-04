import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from '@/types/graphql';

// Schema for profile validation
const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username cannot exceed 30 characters'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name cannot exceed 50 characters').nullable(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').nullable().optional(),
  website: z.string().url('Please enter a valid URL').nullable().optional(),
  avatar_url: z.string().url('Please enter a valid image URL').nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: User;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  isLoading: boolean;
}

const ProfileForm: FC<ProfileFormProps> = ({ profile, onSubmit, isLoading }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Initialize form with profile data
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isDirty },
    reset
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username || '',
      display_name: profile.display_name || '',
      bio: profile.bio || '',
      website: profile.website || '',
      avatar_url: profile.avatar_url || '',
    }
  });
  
  const handleFormSubmit = async (data: ProfileFormValues) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      await onSubmit(data);
      setSuccessMessage('Profile updated successfully!');
      // Reset form state but keep the values
      reset(data);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error submitting profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username*
        </label>
        <input
          id="username"
          type="text"
          {...register('username')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
          Display Name*
        </label>
        <input
          id="display_name"
          type="text"
          {...register('display_name')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {errors.display_name && (
          <p className="mt-1 text-sm text-red-600">{errors.display_name.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          {...register('bio')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          Website
        </label>
        <input
          id="website"
          type="text"
          {...register('website')}
          placeholder="https://example.com"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {errors.website && (
          <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
          Avatar URL
        </label>
        <input
          id="avatar_url"
          type="text"
          {...register('avatar_url')}
          placeholder="https://example.com/avatar.jpg"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {errors.avatar_url && (
          <p className="mt-1 text-sm text-red-600">{errors.avatar_url.message}</p>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !isDirty}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;