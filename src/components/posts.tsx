import Link from "next/link";
import { formatDate, getSortedBlogPosts } from "@/app/blog/utils";

export function BlogPosts() {
  const allBlogs = getSortedBlogPosts();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {allBlogs.map((post) => (
        <Link
          className="group block rounded-lg border border-border px-5 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
          href={`/blog/${post.slug}`}
          key={post.slug}
        >
          <p className="font-medium text-neutral-900 tracking-tight dark:text-neutral-100">
            {post.metadata.title}
          </p>
          <p className="mt-2 line-clamp-2 text-muted-foreground text-sm">
            {post.metadata.description}
          </p>
          <p className="mt-3 text-neutral-500 text-sm tabular-nums dark:text-neutral-400">
            {formatDate(post.metadata.publishedAt, false)}
          </p>
        </Link>
      ))}
    </div>
  );
}
