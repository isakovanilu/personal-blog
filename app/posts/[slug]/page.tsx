import React from 'react'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPostBySlug, getAllPosts } from '../../lib/posts'

// Generate static params for all blog posts
export function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const isHyroxPost = post.slug === 'my-hyrox-journey'

  return (
    <article className="py-8 mx-auto max-w-3xl px-6">
      {isHyroxPost && (
        <div className="mb-8 p-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white text-center">
          <h1 className="text-4xl font-bold tracking-wider">HYROX</h1>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="prose prose-lg max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  )
} 