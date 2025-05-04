import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define the validation schema with Zod
const postSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  body: z.string()
    .min(10, 'Content must be at least 10 characters long')
    .max(50000, 'Content is too long'),
  published: z.boolean().optional().default(true),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
  initialValues?: {
    title: string;
    body: string;
    published: boolean;
  };
  onSubmit: (values: PostFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitError?: string;
  mode: 'create' | 'edit';
}

const PostForm = ({
  initialValues = { title: '', body: '', published: true },
  onSubmit,
  isSubmitting,
  submitError,
  mode,
}: PostFormProps) => {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: initialValues,
  });

  // Get the current values for preview
  const currentValues = watch();

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.back();
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6 flex justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'Create New Post' : 'Edit Post'}
        </h1>
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className={`rounded px-4 py-2 text-sm font-medium ${
              !previewMode
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className={`rounded px-4 py-2 text-sm font-medium ${
              previewMode
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            disabled={!currentValues.title || !currentValues.body}
          >
            Preview
          </button>
        </div>
      </div>

      {previewMode ? (
        <div className="preview-mode">
          <div className="mb-6">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">{currentValues.title}</h2>
          </div>
          <div className="prose max-w-none whitespace-pre-wrap">
            {currentValues.body}
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back to Editing
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Updating...'
                : mode === 'create'
                ? 'Create Post'
                : 'Update Post'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {submitError && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
              <p>{submitError}</p>
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Your post title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="body"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <textarea
              id="body"
              {...register('body')}
              rows={15}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Write your post content here..."
            ></textarea>
            {errors.body && (
              <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
            )}
          </div>

          <div className="mb-6 flex items-center">
            <input
              id="published"
              type="checkbox"
              {...register('published')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="published"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Publish post immediately
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Updating...'
                : mode === 'create'
                ? 'Create Post'
                : 'Update Post'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PostForm;