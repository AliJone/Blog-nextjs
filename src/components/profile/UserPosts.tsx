import { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Post } from '@/types/graphql';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface UserPostsProps {
  posts: Post[];
  loading: boolean;
  hasMorePosts: boolean;
  loadMorePosts: () => void;
  loadingMore: boolean;
}

const UserPosts: FC<UserPostsProps> = ({ 
  posts, 
  loading, 
  hasMorePosts, 
  loadMorePosts, 
  loadingMore 
}) => {
  const router = useRouter();
  
  if (loading) {
    return (
      <LoadingSpinner 
        centered 
        text="Loading posts..." 
      />
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-md">
        <h3 className="mb-2 text-lg font-medium">No posts yet</h3>
        <p className="mb-4 text-gray-600">You haven't published any posts yet.</p>
        <button
          onClick={() => router.push('/create-post')}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create Your First Post
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
          >
            <Link href={`/posts/${post.id}`} className="block p-4">
              <h3 className="mb-1 text-lg font-medium text-gray-900 line-clamp-1">
                {post.title}
              </h3>
              <p className="mb-2 text-sm text-gray-500">
                {formatDate(post.created_at)}
                {!post.published && (
                  <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                    Draft
                  </span>
                )}
              </p>
              <p className="text-gray-600 line-clamp-2">
                {post.body.substring(0, 150)}
                {post.body.length > 150 ? '...' : ''}
              </p>
            </Link>
            
            <div className="flex border-t border-gray-100 bg-gray-50">
              <Link 
                href={`/posts/${post.id}`}
                className="flex-1 p-2 text-center text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                View
              </Link>
              <Link 
                href={`/posts/edit/${post.id}`}
                className="flex-1 border-l border-gray-100 p-2 text-center text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {hasMorePosts && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMorePosts}
            disabled={loadingMore}
            className="rounded-md bg-white px-4 py-2 text-blue-600 shadow hover:bg-gray-50 disabled:opacity-50"
          >
            {loadingMore ? <LoadingSpinner size="small" className="mr-2" /> : null}
            {loadingMore ? 'Loading more...' : 'Load More Posts'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserPosts;