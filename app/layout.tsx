import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeProvider } from './providers/ThemeProvider'
import ThemeToggle from './components/ThemeToggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Personal Blog',
  description: 'A blog about software engineering and technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`} suppressHydrationWarning>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            {/* Navigation */}
            <header className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600">
              <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
                <div className="flex w-full items-center justify-between py-2">
                  <div className="flex items-center gap-4">
                    <Link
                      href="/"
                      className="text-base font-semibold leading-6 text-white hover:text-indigo-100 transition-colors"
                    >
                      Nilu Isakova
                    </Link>
                    <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30 hover:ring-white/60 transition-all duration-300 bg-gradient-to-b from-indigo-100/10 to-purple-100/10 shadow-lg hover:shadow-xl transform hover:scale-105">
                      <Image
                        src="/images/profile/avatar.jpg"
                        alt="Nilu Isakova"
                        width={48}
                        height={48}
                        className="object-cover transition-transform duration-300"
                        priority
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-8">
                    <Link
                      href="https://github.com/isakovanilu"
                      className="text-sm font-semibold leading-6 text-white hover:text-indigo-100 transition-colors"
                    >
                      GitHub
                    </Link>
                    <Link
                      href="https://linkedin.com/in/niluisakova"
                      className="text-sm font-semibold leading-6 text-white hover:text-indigo-100 transition-colors"
                    >
                      LinkedIn
                    </Link>
                    <ThemeToggle />
                  </div>
                </div>
              </nav>
            </header>

            {/* Main content */}
            <main className="flex-grow bg-white dark:bg-gray-900">
              {children}
            </main>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600">
              <div className="mx-auto max-w-7xl px-6 py-6 md:flex md:items-center md:justify-between lg:px-8">
                <div className="mt-4 md:mt-0">
                  <p className="text-sm leading-5 text-white">
                    &copy; {new Date().getFullYear()} Personal Blog. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 