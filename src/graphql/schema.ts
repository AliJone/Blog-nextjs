import { gql } from '@apollo/client';

// Define fragments for reuse
export const POST_FRAGMENT = gql`
  fragment PostFields on posts {
    id
    title
    body
    created_at
    updated_at
    published
    user_id
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
    id
    username
    display_name
    avatar_url
    bio
    website
    created_at
    updated_at
  }
`;

// Queries
export const GET_POSTS = gql`
  query GetPosts($limit: Int = 5, $offset: Int = 0) {
    postsCollection(
      where: { published: { _eq: true } }
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
      ...PostFields
    }
    posts_aggregate(where: { published: { _eq: true } }) {
      aggregate {
        count
      }
    }
  }
  ${POST_FRAGMENT}
`;

export const GET_POST_BY_ID = gql`
  query GetPostById($id: uuid!) {
    posts_by_pk(id: $id) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const GET_USER_POSTS = gql`
  query GetUserPosts($userId: uuid!, $limit: Int = 5, $offset: Int = 0) {
    posts(
      where: { user_id: { _eq: $userId } }
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const GET_PROFILE = gql`
  query GetProfile($id: uuid!) {
    profiles_by_pk(id: $id) {
      ...ProfileFields
    }
  }
  ${PROFILE_FRAGMENT}
`;

// Mutations
export const CREATE_POST = gql`
  mutation CreatePost($title: String!, $body: String!, $published: Boolean = true) {
    insert_posts_one(object: {
      title: $title,
      body: $body,
      published: $published
    }) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($id: uuid!, $title: String!, $body: String!, $published: Boolean) {
    update_posts_by_pk(
      pk_columns: { id: $id },
      _set: {
        title: $title,
        body: $body,
        published: $published
      }
    ) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: uuid!) {
    delete_posts_by_pk(id: $id) {
      id
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $id: uuid!,
    $display_name: String,
    $username: String,
    $bio: String,
    $website: String,
    $avatar_url: String
  ) {
    update_profiles_by_pk(
      pk_columns: { id: $id },
      _set: {
        display_name: $display_name,
        username: $username,
        bio: $bio,
        website: $website,
        avatar_url: $avatar_url
      }
    ) {
      ...ProfileFields
    }
  }
  ${PROFILE_FRAGMENT}
`;