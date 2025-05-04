import { useState } from 'react';
import { 
  useQuery, 
  useMutation,
  ApolloError 
} from '@apollo/client';
import { 
  GET_POSTS, 
  GET_POST_BY_ID, 
  CREATE_POST, 
  UPDATE_POST, 
  DELETE_POST
} from '@/graphql/operations';
import {
  Post,
  PostsResponse,
  PostResponse,
  CreatePostResponse,
  UpdatePostResponse,
  DeletePostResponse,
  getUserData
} from '@/types/graphql';

// Hook for fetching posts with pagination
export function usePosts(limit = 5) {
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Use Apollo's useQuery hook to fetch posts
  const { data, loading, error, fetchMore } = useQuery<PostsResponse>(GET_POSTS, {
    variables: { first: limit },
    notifyOnNetworkStatusChange: true,
  });
  
  // Extract posts from the edges
  const posts = data?.postsCollection?.edges?.map(edge => {
    const post = {...edge.node};
    // Handle user data directly
    if (post.user) {
      post.user = getUserData(post.user);
    }
    return post;
  }) || [];
  
  const hasNextPage = data?.postsCollection.pageInfo.hasNextPage || false;
  const endCursor = data?.postsCollection.pageInfo.endCursor;
  
  // Function to load more posts
  const loadMore = async () => {
    if (loadingMore || !hasNextPage || !endCursor) return;
    
    try {
      setLoadingMore(true);
      await fetchMore({
        variables: {
          first: limit,
          after: endCursor,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;
          
          return {
            postsCollection: {
              __typename: 'postsConnection',
              edges: [
                ...prevResult.postsCollection.edges,
                ...fetchMoreResult.postsCollection.edges
              ],
              pageInfo: fetchMoreResult.postsCollection.pageInfo
            }
          };
        }
      });
    } catch (err) {
      console.error('Error loading more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };
  
  return {
    posts,
    loading,
    error,
    hasNextPage,
    loadMore,
    loadingMore,
  };
}

// Hook for fetching a single post by ID
export function usePost(id: string) {
  const { data, loading, error } = useQuery<PostResponse>(GET_POST_BY_ID, {
    variables: { id },
    skip: !id,
  });
  
  // Extract post data
  let post = null;
  if (data?.postsCollection?.edges?.length) {
    post = {...data.postsCollection.edges[0].node};
    // Handle user data directly
    if (post.user) {
      post.user = getUserData(post.user);
    }
  }
  
  return {
    post,
    loading,
    error,
  };
}

// Hook for creating a new post
export function useCreatePost() {
  const [createPost, { loading }] = useMutation<CreatePostResponse>(CREATE_POST);
  const [error, setError] = useState<ApolloError | null>(null);
  
  const create = async ({ title, body, published = true, user_id }: {
    title: string;
    body: string;
    published?: boolean;
    user_id: string;
  }) => {
    try {
     const { data } = await createPost({
        variables: { title, body, published, user_id },
        update: (cache, { data }) => {
          // Optionally update cache for immediate UI update
          cache.modify({
            fields: {
              postsCollection: (existingPosts = {}) => {
                // Don't try complex cache updates for now
                return existingPosts;
              }
            }
          });
        }
      });

      
      // Return the created post
      if (data?.insertIntopostsCollection?.records?.[0]) {
        const newPost = {...data.insertIntopostsCollection.records[0]};
        if (newPost.user) {
          newPost.user = getUserData(newPost.user);
        }
        return newPost;
      }
      return null;
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err as ApolloError);
      throw err;
    }
  };
  
  return { create, loading, error };
}

// Hook for updating a post
export function useUpdatePost() {
  const [updatePost, { loading }] = useMutation<UpdatePostResponse>(UPDATE_POST);
  const [error, setError] = useState<ApolloError | null>(null);
  
  const update = async ({ id, title, body, published }: {
    id: string;
    title: string;
    body: string;
    published?: boolean;
  }) => {
    try {
      const { data } = await updatePost({
        variables: { id, title, body, published },
      });
      
      // Return the updated post
      if (data?.updatepostsCollection?.records?.[0]) {
        const updatedPost = {...data.updatepostsCollection.records[0]};
        if (updatedPost.user) {
          updatedPost.user = getUserData(updatedPost.user);
        }
        return updatedPost;
      }
      return null;
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err as ApolloError);
      throw err;
    }
  };
  
  return { update, loading, error };
}

// Hook for deleting a post
export function useDeletePost() {
  const [deletePost, { loading }] = useMutation<DeletePostResponse>(DELETE_POST);
  const [error, setError] = useState<ApolloError | null>(null);
  
  const remove = async (id: string) => {
    try {
      const { data } = await deletePost({
        variables: { id },
        update: (cache, { data }) => {
          if (data?.deleteFrompostsCollection?.records?.[0]) {
            const deletedId = data.deleteFrompostsCollection.records[0].id;
            // Very basic cache update - we'd normally do more here
            cache.evict({ id: `Post:${deletedId}` });
            cache.gc();
          }
        }
      });
      
      // Return the ID of the deleted post
      if (data?.deleteFrompostsCollection?.records?.[0]) {
        return { id: data.deleteFrompostsCollection.records[0].id };
      }
      return null;
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err as ApolloError);
      throw err;
    }
  };
  
  return { remove, loading, error };
}