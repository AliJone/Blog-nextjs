import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth-context';
import { useCreatePost } from '@/hooks/useGraphQL';

export default function CreatePost() {
  const router = useRouter();
  const { user } = useAuth();
  const { create, loading } = useCreatePost();
  
  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [published, setPublished] = useState(true);
  
  // UI state
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);

  // Form validation
  const isFormValid = title.trim().length >= 3 && body.trim().length >= 10;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }
    
    if (!isFormValid) {
      setError('Please make sure your title is at least 3 characters and your content is at least 10 characters.');
      return;
    }
    
    try {
      setError('');
      
      // Use GraphQL mutation to create post
      const newPost = await create({
        title,
        body,
        published,
        user_id: user.id,
      });
      
      if (newPost) {
        // Redirect to the new post
        router.push(`/posts/${newPost.id}`);
      } else {
        throw new Error('Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  // If not authenticated, show login prompt
  if (!user) {
    return (
      <Layout title="Create Post">
        <div className="mx-auto max-w-lg px-4 py-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Authentication Required</h1>
          <p className="mb-6 text-gray-600">You need to be logged in to create a post.</p>
          <button
            onClick={() => router.push('/login')}
            className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Create Post">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex justify-between">
          <h1 className="text-2xl font-bold">Create New Post</h1>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`rounded px-4 py-2 ${
                !preview
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`rounded px-4 py-2 ${
                preview
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={!isFormValid}
            >
              Preview
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
        
        {preview ? (
          <div className="preview rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <h1 className="mb-4 text-3xl font-bold">{title}</h1>
            <div className="prose max-w-none whitespace-pre-wrap">
              {body}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setPreview(false)}
                className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Publish Post'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <div className="mb-4">
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full rounded-md border ${
                  title.length > 0 && title.length < 3 ? 'border-red-500' : 'border-gray-300'
                } p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Your post title"
              />
              {title.length > 0 && title.length < 3 && (
                <p className="mt-1 text-sm text-red-500">Title must be at least 3 characters</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="body" className="mb-1 block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className={`w-full rounded-md border ${
                  body.length > 0 && body.length < 10 ? 'border-red-500' : 'border-gray-300'
                } p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Write your post content here... Markdown is supported!"
              ></textarea>
              {body.length > 0 && body.length < 10 && (
                <p className="mt-1 text-sm text-red-500">Content must be at least 10 characters</p>
              )}
            </div>
            
            <div className="mb-6 flex items-center">
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="published" className="ml-2 text-sm text-gray-700">
                Publish immediately
              </label>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}