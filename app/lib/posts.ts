import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'posts');

export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
};

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getAllPosts(): Post[] {
  // Get directories within the posts folder
  const postDirs = fs.readdirSync(postsDirectory);

  const posts = postDirs.map(dirName => {
    // Read markdown file
    const fullPath = path.join(postsDirectory, dirName, 'index.md');
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const { data, content } = matter(fileContents);

    return {
      slug: dirName,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      content: content
    };
  });

  // Sort posts by date
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | undefined {
  try {
    const fullPath = path.join(postsDirectory, slug, 'index.md');
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      content: content
    };
  } catch {
    return undefined;
  }
} 