import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nilu Isakova's Blog",
  description: "Personal blog of Nilu Isakova about web development, technology, and programming",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}>
        <nav className="bg-indigo-600">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-white hover:text-indigo-100">
              Nilu Isakova
            </Link>
            <div className="flex gap-6 items-center">
              <a 
                href="https://github.com/isakovanilu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-indigo-100 transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://linkedin.com/in/nisakova" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-indigo-100 transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
} 