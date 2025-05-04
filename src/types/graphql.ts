
// GraphQL API Response Types
// These types match the actual GraphQL API response structure with edges/nodes


export interface User {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  created_at?: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at?: string;
  published: boolean;
  user_id: string;
  profile_id?: string;
  user?: User | {
    edges?: Array<{
      node: User;
    }>;
  };
}

export interface PostEdge {
  node: Post;
}

export interface PostsResponse {
  postsCollection: {
    edges: PostEdge[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

export interface PostResponse {
  postsCollection: {
    edges: PostEdge[];
  };
}

export interface CreatePostResponse {
  insertIntopostsCollection: {
    records: Post[];
  };
}

export interface UpdatePostResponse {
  updatepostsCollection: {
    records: Post[];
  };
}

export interface DeletePostResponse {
  deleteFrompostsCollection: {
    records: {
      id: string;
    }[];
  };
}





/**
 * Disclaimer: I wrote this when I was thinking about using Rest API too
 * I ended up using GraphQL for everything
 *
 * Normalizes user data from GraphQL responses to a consistent format
 * 
 * This helper function solves the problem of inconsistent user data structures:
 * 
 * 1. The GraphQL API returns nested data with edges/nodes for relational queries:
 *    { user: { edges: [{ node: { id: '123', username: 'user' } }] } }
 * 
 * 2. But sometimes we get flattened user objects directly if I am using the rest API:
 *    { user: { id: '123', username: 'user' } }
 * 
 * 3. And other times user data might be missing entirely
 * 
 * This function handles all these cases and returns a consistent User object,
 * which simplifies the rest of the application code by providing a unified
 * interface for accessing user data regardless of the source structure.
 */
export function getUserData(userField?: User | { edges?: Array<{ node: User }> }): User | undefined {
  // Handle case where user data is missing entirely
  if (!userField) return undefined;

  // Handle case where user data is already in the right format
  if ('id' in userField) {
    return userField;
  }

  // Handle case where user data is in the nested GraphQL edges/nodes format
  if ('edges' in userField && userField.edges?.length) {
    return userField.edges[0].node;
  }
  
  return undefined;
}