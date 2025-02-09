import React from 'react'
import { getAllPosts } from './lib/posts'
import Link from 'next/link'
import Image from 'next/image'

const postImages = {
  'getting-started-with-nextjs': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
  'mastering-typescript': 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=60',
  'future-of-data-engineering': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60',
  'my-hyrox-journey': 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&auto=format&fit=crop&q=60',
  'half-marathon-training': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=60',
  'easy-5k-run': 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800&auto=format&fit=crop&q=60',
  'healthy-diet-guide': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60',
  'data-day-texas-2025': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
  'protein-based-diet': '/images/posts/protein-based-diet.png'
}

const POSTS_PER_PAGE = 5

export default function Home() {
  const posts = getAllPosts()
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const currentPage = 1

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="px-6 py-6 sm:py-8 lg:px-8 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Thoughts on Technology
          </h1>
          <p className="mt-2 text-base leading-7 text-indigo-100">
            Exploring software engineering, data science, and modern technology trends
          </p>
        </div>
      </section>

      {/* Featured Posts Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="grid gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group relative isolate flex flex-col gap-8 lg:flex-row transform transition duration-500 hover:scale-[1.02] bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md border border-indigo-100 dark:border-gray-700"
              >
                <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={postImages[post.slug as keyof typeof postImages]}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="(min-width: 1024px) 16rem, (min-width: 640px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-indigo-200 dark:ring-gray-700" />
                </div>
                
                <div>
                  <div className="flex items-center gap-x-4 text-xs">
                    <time dateTime={post.date} className="text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-full">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                  <div className="group relative max-w-xl">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <Link href={`/posts/${post.slug}`}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-5 text-sm leading-6 text-gray-600 dark:text-gray-400">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 flex border-t border-indigo-100 dark:border-gray-700 pt-6">
                    <div className="relative flex items-center gap-x-4">
                      <div className="text-sm leading-6">
                        <p className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                          <Link href={`/posts/${post.slug}`}>
                            <span className="absolute inset-0" />
                            Read more →
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Footer with Pagination */}
      <footer className="border-t border-indigo-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-indigo-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-indigo-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">{Math.min(POSTS_PER_PAGE, posts.length)}</span> of{' '}
                  <span className="font-medium">{posts.length}</span> posts
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-indigo-400 dark:text-indigo-500 ring-1 ring-inset ring-indigo-200 dark:ring-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      disabled={currentPage === i + 1}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === i + 1
                          ? 'z-10 bg-indigo-600 dark:bg-indigo-500 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500'
                          : 'text-indigo-900 dark:text-indigo-300 ring-1 ring-inset ring-indigo-200 dark:ring-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700 focus:outline-offset-0'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-indigo-400 dark:text-indigo-500 ring-1 ring-inset ring-indigo-200 dark:ring-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
} 