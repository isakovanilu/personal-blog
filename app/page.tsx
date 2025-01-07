import React from 'react';
import Link from 'next/link';
import { getAllPosts, formatDate } from './lib/posts';

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen max-w-4xl mx-auto py-8 px-4">
      <div className="mb-12 text-center">
        <p className="text-lg text-gray-700">Thoughts on web development, technology, and programming</p>
      </div>
      <div className="space-y-8">
        {posts.map(post => (
          <article key={post.slug} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-xl transition-all duration-300 hover:border-indigo-200">
            <div className="flex items-center gap-2 mb-3">
              <time className="text-base font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {formatDate(post.date)}
              </time>
            </div>
            <Link href={`/posts/${post.slug}`}>
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 hover:text-indigo-600 transition-colors">{post.title}</h2>
            </Link>
            <p className="text-gray-700 text-lg">{post.excerpt}</p>
            <Link 
              href={`/posts/${post.slug}`}
              className="inline-block mt-4 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
} 