import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/blog/PostCard';
import { GET_POSTS } from '@/graphql/operations';
import { usePosts } from '@/hooks/useGraphQL';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Types for posts and users
interface User {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

interface Post {
  id: string;
  title: string;
  body: string;
  created_at: string;
  user_id: string;
  user?: User;
}

interface HomeProps {
  initialPosts: Post[];
  hasNextPage: boolean;
  endCursor: string;
}

export default function Home({ initialPosts, hasNextPage, endCursor }: HomeProps) {


  const {
    posts = initialPosts,
    loading,
    hasNextPage: morePostsAvailable = hasNextPage,
    loadMore,
    loadingMore
  } = usePosts(5); // Fetch 5 posts per page

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            NextJS Blog
          </h1>
          <p className="mb-6 text-xl text-gray-600">
            A blog built with Next.js, Supabase, and GraphQL
          </p>
          <Link
            href="/create-post"
            className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Post
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Latest Posts
          </h2>

          {/* This is the most magical part of next js*/}
          {/*- Speed of static generation (immediate initial render)*/}
          {/*- Freshness of client-side fetching (latest data)*/}

          {
            posts.length === 0 ? (
                <div className="mb-8 grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                  {initialPosts.map((post) => (
                      <PostCard key={post.id} post={post}/>
                  ))}
                </div>
            ) : (
                <div className="mb-8 grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                  {posts.map((post) => (
                      <PostCard key={post.id} post={post}/>
                  ))}
              </div>
            )
          }

          {morePostsAvailable && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  try {
                    loadMore();
                  } catch (error) {
                    console.error('Error loading more posts:', error);
                    // Could add state for error feedback if needed
                  }
                }}
                disabled={loading || loadingMore}
                className="rounded-md bg-gray-100 px-6 py-3 text-gray-800 hover:bg-gray-200 disabled:opacity-50"
              >
                {loading || loadingMore ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="small" className="mr-2" />
                    Loading more...
                  </span>
                ) : (
                  'Load More Posts'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


// Setup Apollo Client for static generation (similar to what we do in [id].tsx)
function createStaticApolloClient() {
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

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Create a dedicated Apollo client for static generation
    const apolloClient = createStaticApolloClient();

    const { data } = await apolloClient.query({
      query: GET_POSTS,
      variables: { first: 5 },
    });

    const posts = data.postsCollection.edges.map((edge: any) => {
      const post = edge.node;
      if (post.user?.edges?.length) {
        post.user = post.user.edges[0].node;
      }
      return post;
    });
    
    return {
      props: {
        initialPosts: posts,
        hasNextPage: data.postsCollection.pageInfo.hasNextPage,
        endCursor: data.postsCollection.pageInfo.endCursor,
      },
      // the revalidate used here actually makes is ISR instead of just statically generated on the serverside
      // this should revalidate every minute
      revalidate: 60,
    };
  } catch (err) {
    console.error('Error in getStaticProps:', err);

    return {
      props: {
        initialPosts: [],
        hasNextPage: false,
        endCursor: '',
      },
      revalidate: 60,
    };
  }
};