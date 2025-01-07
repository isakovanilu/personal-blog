import React from 'react';
import { getPostBySlug, getAllPosts, formatDate } from '../../lib/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto py-8 px-4">
      <Link 
        href="/"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-8 font-medium transition-colors"
      >
        ← Back to all posts
      </Link>
      <article className="bg-white rounded-lg p-8 shadow-sm">
        <h1 className="text-4xl font-bold mb-4 text-indigo-900">{post.title}</h1>
        <time className="inline-block text-base font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-8">
          {formatDate(post.date)}
        </time>
        <div className="mt-8 prose prose-xl max-w-none 
          prose-h1:text-3xl prose-h1:text-gray-900 
          prose-h2:text-2xl prose-h2:text-gray-800 
          prose-h3:text-xl prose-h3:text-gray-800 
          prose-p:text-gray-800 prose-p:text-lg prose-p:leading-relaxed
          prose-li:text-gray-800 prose-li:text-lg
          prose-strong:text-gray-900 prose-strong:font-bold
          prose-a:text-indigo-600 prose-a:font-medium
          prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg
          prose-blockquote:text-gray-700 prose-blockquote:border-indigo-300">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
} 