import React from 'react'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPostBySlug, getAllPosts } from '../../lib/posts'
import { Metadata } from 'next'
import Image from 'next/image'

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: post.coverImage ? 'summary_large_image' : 'summary',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <article className="py-8 mx-auto max-w-3xl px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <time dateTime={post.date} className="text-sm text-gray-600 dark:text-gray-400">
          {formattedDate}
        </time>
      </div>

      {post.coverImage ? (
        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Image
            src={post.coverImage}
            alt={post.alt ?? post.title}
            fill
            className={post.coverImageFit === 'contain' ? 'object-contain p-6' : 'object-cover'}
            sizes="(min-width: 768px) 768px, 100vw"
            priority
          />
        </div>
      ) : null}

      <div className="prose prose-lg max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  )
} 