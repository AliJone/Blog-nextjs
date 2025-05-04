import { gql } from '@apollo/client';

// Common fragments for reusing field selections
export const POST_FRAGMENT = gql`
  fragment PostFields on posts {
    nodeId
    id
    title
    body
    created_at
    published
    user_id
    profile_id
    user: profiles { 
      id
      username
      display_name
      avatar_url
    }
  }
`;

export const PROFILE_FRAGMENT = gql`
  fragment ProfileFields on profiles {
    nodeId
    id
    username
    display_name
    avatar_url
    bio
    website
    created_at
  }
`;

export const GET_POSTS = gql`
  query GetPosts($first: Int = 5, $after: Cursor) {
    postsCollection(
      filter: { published: { eq: true } }
      # Use a valid Supabase OrderDirection enum value
      orderBy: [{ created_at: DescNullsLast }] 
      first: $first
      after: $after
    ) {
      edges {
        node {
          ...PostFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${POST_FRAGMENT}
`;

// Query to get a post by ID
export const GET_POST_BY_ID = gql`
  query GetPostById($id: UUID!) {
    postsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          ...PostFields
        }
      }
    }
  }
  ${POST_FRAGMENT}
`;

// Query to get posts by a specific user
export const GET_USER_POSTS = gql`
  query GetUserPosts($userId: UUID!, $first: Int = 5, $after: Cursor) {
    postsCollection(
      filter: { user_id: { eq: $userId } }
      orderBy: [{ created_at: DESC }]
      first: $first
      after: $after
    ) {
      edges {
        node {
          ...PostFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${POST_FRAGMENT}
`;

// Query to get a user's profile
export const GET_PROFILE = gql`
  query GetProfile($id: UUID!) {
    profilesCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          ...ProfileFields
        }
      }
    }
  }
  ${PROFILE_FRAGMENT}
`;

// Mutation to create a post
export const CREATE_POST = gql`
  mutation CreatePost($title: String!, $body: String!, $published: Boolean = true, $user_id: UUID!) {
    insertIntopostsCollection(
      objects: [{ title: $title, body: $body, published: $published, user_id: $user_id }]
    ) {
      records {
        ...PostFields
      }
    }
  }
  ${POST_FRAGMENT}
`;

// Mutation to update a post
export const UPDATE_POST = gql`
  mutation UpdatePost($id: UUID!, $title: String!, $body: String!, $published: Boolean) {
    updatepostsCollection(
      set: { title: $title, body: $body, published: $published }
      filter: { id: { eq: $id } }
    ) {
      records {
        ...PostFields
      }
    }
  }
  ${POST_FRAGMENT}
`;

// Mutation to delete a post
export const DELETE_POST = gql`
  mutation DeletePost($id: UUID!) {
    deleteFrompostsCollection(filter: { id: { eq: $id } }) {
      records {
        id
      }
    }
  }
`;

// Mutation to update a profile
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $id: UUID!,
    $display_name: String,
    $username: String,
    $bio: String,
    $website: String,
    $avatar_url: String
  ) {
    updateprofilesCollection(
      set: {
        display_name: $display_name,
        username: $username,
        bio: $bio,
        website: $website,
        avatar_url: $avatar_url
      }
      filter: { id: { eq: $id } }
    ) {
      records {
        ...ProfileFields
      }
    }
  }
  ${PROFILE_FRAGMENT}
`;