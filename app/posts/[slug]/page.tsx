import React from 'react';
import { getPostBySlug, getAllPosts } from '../../lib/posts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

// Generate static params for all blog posts
export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <article className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Post Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 py-6 sm:py-8">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {post.title}
            </h1>
            <time dateTime={post.date} className="mt-2 inline-block text-sm text-indigo-100 bg-indigo-500/30 px-3 py-1 rounded-full">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <div className="prose prose-lg prose-indigo dark:prose-invert mx-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            className="prose prose-lg mx-auto prose-headings:text-indigo-900 dark:prose-headings:text-indigo-200 prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-strong:text-indigo-900 dark:prose-strong:text-indigo-200 prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-800 dark:hover:prose-a:text-indigo-300 prose-code:text-indigo-800 dark:prose-code:text-indigo-300 prose-pre:bg-indigo-50 dark:prose-pre:bg-gray-800 prose-pre:text-indigo-800 dark:prose-pre:text-indigo-200 prose-blockquote:border-l-indigo-500 dark:prose-blockquote:border-l-indigo-400"
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
} 