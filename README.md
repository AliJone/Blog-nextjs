# Next.js Blog with Supabase and GraphQL

A blog application built for a coding assignment using Next.js, Supabase, and GraphQL. This project demonstrates how these technologies work together to create a modern web application with authentication, data fetching, and server-side rendering.

## Features

- **Authentication**:
  - Email and password login (Makerkit integration)
  - Google OAuth via Supabase
  - Email OTP (passwordless) login - makes testing super easy!

- **Blog Functionality**:
  - View paginated list of blog posts (5 per page)
  - Read individual blog posts
  - Create new posts (authenticated users only)
  - GraphQL data fetching with Apollo Client

- **Technical Highlights**:
  - TypeScript for type safety
  - Incremental Static Regeneration for performance
  - Form validation with Zod
  - Responsive design with Tailwind CSS
  - Profile management with avatar support
  - Route protection with Next.js middleware

## How It Works

Here's a high-level overview of how this application is structured:

### Authentication

I've implemented authentication using Supabase Auth with multiple sign-in methods:

```tsx
// Auth is managed through the AuthContext provider
const { user, signOut } = useAuth();

// Protected routes are secured in middleware.ts
const protectedRoutes = ['/create-post', '/posts/edit'];
```

The auth system automatically refreshes tokens before they expire and persists sessions across page reloads. I've also added a profile dropdown in the header for a better user experience.

### Blog Post Management

Posts are fetched and managed using GraphQL with Apollo Client:

```tsx
// Custom hooks make data fetching easy
const { posts, loading, hasNextPage, loadMore } = usePosts();

// Creating posts with GraphQL mutations
const { create } = useCreatePost();
await create({ title, body, user_id: user.id });
```

I used cursor-based pagination to fetch blog posts 5 at a time, with a "Load More" button to get additional content.

### Performance Optimization

For performance, I implemented Incremental Static Regeneration (ISR):

```tsx
// In getStaticProps
return {
  props: {
    initialPosts: posts,
  },
  // Revalidate every minute
  revalidate: 60,
};
```

This provides lightning-fast initial page loads while still keeping content fresh.


## Setup Instructions

### Prerequisites

- Node.js 14+ and npm/yarn
- A Supabase account (free tier works fine!)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nextjs-blog.git
   cd nextjs-blog
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then add your Supabase credentials to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Linking to Supabase

1. Create a new project on [Supabase](https://supabase.com/)

2. Get your project URL and anon key from Settings > API in your Supabase dashboard

3. Run the SQL from `supabase/migrations/01_blog_schema.sql` in the Supabase SQL editor to set up the database schema

4. Configure Auth Providers in Supabase:
   - Enable Email/Password, Email OTP, and Google OAuth
   - For Google OAuth, create credentials in Google Cloud Console and add them to Supabase

### Running Locally

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see the application.

## Bonus Features Implemented

### 1. Incremental Static Regeneration (ISR)

I implemented ISR for the homepage and post detail pages:

```typescript
// In pages/index.tsx and pages/posts/[id].tsx
export const getStaticProps: GetStaticProps = async () => {
  // Fetch initial data...
  return {
    props: { initialData },
    revalidate: 60 // Regenerate page every 60 seconds
  };
};
```

This provides fast initial page loads while keeping content fresh.

### 2. Form Validation with Zod

I added comprehensive form validation using Zod schemas:

```typescript
const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  body: z.string().min(10, 'Content must be at least 10 characters'),
});
```

This ensures data quality and provides helpful error messages to users.

### 3. Email OTP (Passwordless) Login

I implemented passwordless login using Supabase's magic link feature. Users can sign in just by entering their email and clicking a link - no password needed!

### 4. Optimistic UI Updates

When creating or updating posts, the UI updates immediately while the server request completes in the background:

```typescript
// In useCreatePost hook
cache.modify({
  fields: {
    postsCollection: (existingPosts) => {
      // Update cache with new post for immediate UI feedback
    }
  }
});
```

### 5. Profile Dropdown

I added a profile dropdown in the header with user info and logout functionality:

```tsx
<ProfileDropdown />
```

The dropdown shows the user's avatar (with a clever fallback), display name, and email, plus links to profile and create post pages.

## Project Structure

```
nextjs-blog/
├── src/
│   ├── components/      # React components
│   │   ├── auth/        # Authentication components
│   │   ├── blog/        # Blog post components
│   │   ├── common/      # Shared UI components
│   │   └── layout/      # Layout components
│   │
│   ├── graphql/         # GraphQL queries and mutations
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and config
│   ├── pages/           # Next.js pages
│   ├── styles/          # Global styles
│   └── types/           # TypeScript type definitions
│
├── supabase/
│   └── migrations/      # Database schema
│
└── public/              # Static assets
```

---

This project satisfies all the requirements from the take-home assignment, including the bonus points. I had fun building it and learned a lot about working with Next.js, Supabase, and GraphQL together!