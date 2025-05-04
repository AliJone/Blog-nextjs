import { GetStaticProps, GetStaticPaths } from 'next';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import Layout from '@/components/layout/Layout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDateTime, getAvatarUrl } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { usePost, useDeletePost } from '@/hooks/useGraphQL';
import { GET_POSTS, GET_POST_BY_ID } from '@/graphql/operations';
import { Post, PostsResponse, PostResponse, getUserData } from '@/types/graphql';

// Setup Apollo Client for static generation
function createApolloClient() {
  return new ApolloClient({
    ssrMode: true,
    link: createHttpLink({
      uri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      },
    }),
    cache: new InMemoryCache(),
  });
}

interface PostDetailProps {
  initialPost: Post | null;
}

export default function PostDetail({ initialPost }: PostDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { remove: deletePost, loading: deleteLoading } = useDeletePost();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // If fallback is true and the page is not yet generated,
  // router.isFallback will be true
  if (router.isFallback) {
    return (
      <Layout>
        <LoadingSpinner 
          fullPage 
          text="Loading post..." 
          size="large"
        />
      </Layout>
    );
  }

  const postId = router.query.id as string;

  const { post, loading, error } = usePost(postId);

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      setIsDeleting(true);
      await deletePost(postId);
      router.push('/');
    } catch (err) {
      console.error('Error deleting post:', err);
      setIsDeleting(false);
      alert('Failed to delete post. Please try again.');
    }
  };
  
  // Use the server-rendered data initially, then update with client data
  const currentPost = post || initialPost;

  // If post is not found
  if (!currentPost && !loading) {
    return (
      <Layout title="Post Not Found">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Post Not Found
          </h1>
          <p className="mb-8 text-gray-600">
            The post you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/"
            className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  // Show loading spinner when fetching latest data
  if (loading && !initialPost) {
    return (
      <Layout>
        <LoadingSpinner 
          fullPage 
          text="Loading post..." 
        />
      </Layout>
    );
  }

  // Show error message
  if (error && !initialPost) {
    return (
      <Layout title="Error">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            Error Loading Post
          </h1>
          <p className="mb-8 text-gray-600">
            There was an error loading this post. Please try again later.
          </p>
          <Link
            href="/"
            className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  if (!currentPost) return null;

  // Format the date - fallback to current date if created_at is missing
  const formattedDate = formatDateTime(currentPost.created_at || new Date().toISOString());
  
  // Get user data
  const userData = getUserData(currentPost.user);
  
  // Get author information with fallbacks
  const authorName = userData?.display_name || userData?.username || 'Anonymous';
  const authorAvatar = getAvatarUrl(userData?.avatar_url, authorName);
  
  // Check if the current user is the author
  const isAuthor = user?.id === currentPost.user_id;

  return (
    <Layout title={currentPost.title}>
      <article className="mx-auto max-w-3xl overflow-hidden rounded-lg bg-white p-6 shadow-md">
        <header className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">{currentPost.title}</h1>
          
          <div className="mb-6 flex items-center text-gray-600">
            <div className="mr-3 h-10 w-10 overflow-hidden rounded-full">
              <Image 
                src={authorAvatar} 
                alt={authorName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{authorName}</p>
              <p className="text-sm">{formattedDate}</p>
            </div>
          </div>
          
          {isAuthor && (
            <div className="mb-4 flex space-x-2">
              <Link
                href={`/posts/edit/${currentPost.id}`}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Edit Post
              </Link>
              <button
                onClick={handleDeletePost}
                disabled={isDeleting || deleteLoading}
                className="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          )}
        </header>
        
        <div className="prose max-w-none">
          {/* Render post content as markdown */}
          <ReactMarkdown>{currentPost.body}</ReactMarkdown>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
            </svg>
            Back to all posts
          </Link>
        </div>
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const apolloClient = createApolloClient();

    const { data } = await apolloClient.query<PostsResponse>({
      query: GET_POSTS,
      variables: { first: 10 },
    });

    const posts = data?.postsCollection?.edges?.map(edge => {
      const post = {...edge.node};
      if (post.user) {
        post.user = getUserData(post.user);
      }
      return post;
    }) || [];

    const paths = posts.map(post => ({
      params: { id: post.id },
    }));
    
    return {
      paths,
      // Fallback true means pages will be generated on demand if not pre-rendered
      fallback: true,
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    return {
      paths: [],
      fallback: true,
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const apolloClient = createApolloClient();

    const { data } = await apolloClient.query<PostResponse>({
      query: GET_POST_BY_ID,
      variables: { id: params?.id },
    });

    let post = null;
    if (data?.postsCollection?.edges?.length) {
      post = {...data.postsCollection.edges[0].node};
      // Process user data if needed
      if (post.user) {
        post.user = getUserData(post.user);
      }
    }

    if (!post) {
      return {
        notFound: true,
      };
    }
    
    return {
      props: {
        initialPost: post,
      },
      // Re-generate at most once per minute
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    
    return {
      notFound: true,
    };
  }
};