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

export function getAllPosts(): Post[] {
  // Get all post directories
  const postDirs = fs.readdirSync(postsDirectory);

  const posts = postDirs
    .filter(dir => fs.statSync(path.join(postsDirectory, dir)).isDirectory())
    .map(dir => {
      const fullPath = path.join(postsDirectory, dir, 'index.md');
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug: dir,
        title: data.title,
        date: new Date(data.date).toISOString(),
        excerpt: data.excerpt,
        content,
      };
    })
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

  return posts;
}

export function getPostBySlug(slug: string): Post | undefined {
  try {
    const fullPath = path.join(postsDirectory, slug, 'index.md');
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: new Date(data.date).toISOString(),
      excerpt: data.excerpt,
      content,
    };
  } catch (error) {
    return undefined;
  }
} 