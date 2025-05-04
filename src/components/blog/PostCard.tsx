import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { formatDate, getAvatarUrl } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useDeletePost } from '@/hooks/useGraphQL';
import { Post, getUserData } from '@/types/graphql';

interface PostCardProps {
  post: Post;
}

const PostCard: FC<PostCardProps> = ({ post }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { remove: deletePost } = useDeletePost();
  const [isDeleting, setIsDeleting] = useState(false);

  // Create excerpt from the post body (first 200 characters)
  const excerpt = post.body.length > 200 
    ? `${post.body.substring(0, 200)}...` 
    : post.body;

  // Format the date for display
  const formattedDate = formatDate(post.created_at);

  // Get user data
  const userData = getUserData(post.user);
  
  // Get author information
  const authorName = userData?.display_name || userData?.username || 'Anonymous';
  const authorAvatar = getAvatarUrl(userData?.avatar_url, authorName);
  
  // Check if the current user is the author
  const isAuthor = user?.id === post.user_id;
  
  // Handle post deletion
  const handleDeletePost = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      setIsDeleting(true);
      await deletePost(post.id);
      // We don't need to navigate since the post will be removed from the list
      window.location.reload(); // Refresh the page to show updated list
    } catch (err) {
      console.error('Error deleting post:', err);
      setIsDeleting(false);
      alert('Failed to delete post. Please try again.');
    }
  };
  
  // Handle edit navigation
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/posts/edit/${post.id}`);
  };

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all hover:shadow-lg">
      <div className="p-6">
        <Link href={`/posts/${post.id}`} className="block">
          <h2 className="mb-2 text-xl font-bold text-gray-900">{post.title}</h2>
          
          <div className="mb-4 flex items-center text-gray-500">
            <div className="mr-2 h-6 w-6 overflow-hidden rounded-full">
              <Image 
                src={authorAvatar} 
                alt={authorName}
                width={24}
                height={24}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="mr-2 text-sm">{authorName}</span>
            <span className="text-sm">{formattedDate}</span>
          </div>
          
          <div className="mb-4 text-gray-600">
            <p>{excerpt}</p>
          </div>
        </Link>
        
        <div className="flex items-center justify-between">
          {isAuthor && (
            <div className="flex space-x-2">
              <button
                onClick={handleEditClick}
                className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                Edit
              </button>
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
          
          <Link href={`/posts/${post.id}`} className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
            Read more
            <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;