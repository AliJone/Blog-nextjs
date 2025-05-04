// pages/posts/edit/[id].tsx (or .js)
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import PostForm from '@/components/blog/PostForm'; // Your form component
import LoadingSpinner from '@/components/common/LoadingSpinner'; // Your loading component
// Corrected import path based on PostDetail
import { usePost, useUpdatePost } from '@/hooks/useGraphQL';
import { useAuth } from '@/lib/auth-context';

// Types matching PostDetail (assuming usePost returns this shape)
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
    created_at: string; // Or Date? Check usePost return type
    user_id: string;
    published: boolean;
    user?: User; // Include if usePost returns user details
}

interface FormValues {
    title: string;
    body: string;
    published: boolean;
}

// Updated assumption for usePost hook's return structure based on PostDetail
interface UsePostResult {
    post: Post | null | undefined; // Expecting post data directly
    loading: boolean;
    error?: Error | any; // Or specific ApolloError type
}

export default function EditPost() {
    const router = useRouter();
    const { user, isLoading: isLoadingAuth } = useAuth();

    // 1. Get ID only when router is ready
    const id = router.isReady ? (router.query.id as string) : undefined;

    // 2. Fetch Post Data using the hook, expecting { post, loading, error }
    // Hook still needs to handle id === undefined initially.
    // If hook supports options: usePost(id, { enabled: !!id })
    const { post, loading: isLoadingPost, error: postFetchError }: UsePostResult = usePost(id as string);

    // Hook for the update mutation
    const { update, loading: isUpdating } = useUpdatePost();
    // State for submission errors
    const [submitError, setSubmitError] = useState<string | undefined>();

    // 3. Calculate combined loading state
    const isLoading = !router.isReady || isLoadingAuth || isLoadingPost;

    const handleSubmit = async (values: FormValues) => {
        if (!id) {
            setSubmitError('Error: Post ID is not available.');
            return;
        }
        if (!user) {
            setSubmitError('Error: User not authenticated.');
            return;
        }

        try {
            setSubmitError(undefined);
            const result = await update({
                id: id,
                title: values.title,
                body: values.body,
                published: values.published,
            });

            if (result) { // Adjust based on what update returns
                router.push(`/posts/${id}`); // Redirect to view page
            } else {
                throw new Error('Update operation did not return expected result.');
            }
        } catch (err: any) {
            const message = err.message || 'An unexpected error occurred.';
            setSubmitError(`Failed to update post: ${message}`);
            console.error('Error updating post:', err);
        }
    };

    // --- Render Logic ---

    // 1. Render Loading State FIRST
    if (isLoading) {
        return (
            <Layout title="Loading Editor...">
                <div className="flex h-full min-h-[300px] items-center justify-center">
                    <LoadingSpinner size="large" />
                </div>
            </Layout>
        );
    }

    // --- Post-Loading Checks (Router ready, Auth checked, Post fetch attempted) ---

    // 2. Handle Post Fetch Error or Not Found (using 'post' directly now)
    // 'post' is the variable destructured from usePost()
    if (postFetchError || !post) {
        if (postFetchError) {
            console.error(`Error fetching post ${id}:`, postFetchError);
        }
        if (!post && !postFetchError) {
            console.warn(`Post data not found after loading for ID: ${id}`);
        }
        return (
            <Layout title="Post Not Found">
                <div className="flex h-full min-h-[300px] items-center justify-center">
                    <div className="text-center">
                        <h1 className="mb-4 text-2xl font-bold">Post Not Found</h1>
                        <p className="mb-4">The post (ID: {id || 'N/A'}) you are trying to edit could not be loaded or does not exist.</p>
                        {postFetchError && <p className="mb-4 text-sm text-red-600">Error: {(postFetchError as Error).message || 'Failed to load'}</p>}
                        <button
                            onClick={() => router.push('/')}
                            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // 3. Check Authorization (user must be loaded, post must be loaded)
    // Using the 'post' variable directly from the hook's result
    const isAuthorized = user && post && user.id === post.user_id;

    if (!isAuthorized) {
        console.warn(`Unauthorized attempt by user ${user?.id || 'anonymous'} to edit post ${post.id} owned by ${post.user_id}`);
        return (
            <Layout title="Unauthorized">
                <div className="flex h-full min-h-[300px] items-center justify-center">
                    <div className="text-center">
                        <h1 className="mb-4 text-2xl font-bold">Unauthorized Access</h1>
                        <p className="mb-4">You do not have permission to edit this post.</p>
                        <button
                            onClick={() => router.push(`/posts/${id}`)} // Link to view the post instead
                            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            View Post
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // 4. Render the Form Component if all checks pass
    // Initial values now come directly from the 'post' object
    return (
        <Layout title={`Edit: ${post.title}`}>
            <div className="py-6">
                <h1 className="mb-4 text-center text-2xl font-bold">Edit Post</h1>
                <PostForm
                    key={post.id}
                    initialValues={{
                        title: post.title,
                        body: post.body,
                        published: post.published,
                    }}
                    onSubmit={handleSubmit}
                    isSubmitting={isUpdating}
                    submitError={submitError}
                    mode="edit"
                />
            </div>
        </Layout>
    );
}