import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'posts');

function normalizeCoverImage(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const raw = value.trim();
  if (!raw) return undefined;

  // Allow fully-qualified URLs as-is.
  if (/^https?:\/\//i.test(raw)) return raw;

  // Common mistake: putting "public/..." in frontmatter. Public is the web root.
  const withoutPublic = raw.replace(/^public\//i, '');

  // Ensure leading slash for local assets (e.g. "images/posts/x.jpg" -> "/images/posts/x.jpg")
  if (withoutPublic.startsWith('/')) return withoutPublic;
  return `/${withoutPublic}`;
}

export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage?: string;
  alt?: string;
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
        coverImage: normalizeCoverImage(data.coverImage),
        alt: typeof data.alt === 'string' ? data.alt : undefined,
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
      coverImage: normalizeCoverImage(data.coverImage),
      alt: typeof data.alt === 'string' ? data.alt : undefined,
      content,
    };
  } catch (error) {
    return undefined;
  }
} 