import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import {
  formatDate,
  getBlogPosts,
  getRelatedBlogPosts,
} from "@/app/blog/utils";
import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";

const WHITESPACE_REGEX = /\s+/;

function toAbsoluteImageUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${baseUrl}${url}`;
}

export async function generateStaticParams() {
  const posts = getBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = getBlogPosts().find((p) => p.slug === slug);
  if (!post) {
    return;
  }

  const {
    title,
    publishedAt: publishedTime,
    description,
    image,
  } = post.metadata;
  const ogImage = image
    ? toAbsoluteImageUrl(image.src)
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    keywords: post.metadata.tags,
    alternates: {
      canonical: post.metadata.canonical || `/blog/${post.slug}`,
    },
    robots: post.metadata.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      modifiedTime: post.metadata.updatedAt || publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
          alt: image?.alt || title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Blog({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPosts().find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const postImage = post.metadata.image
    ? toAbsoluteImageUrl(post.metadata.image.src)
    : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`;
  const siteName = process.env.NEXT_PUBLIC_PROJECT_NAME || "Acme";
  const relatedPosts = getRelatedBlogPosts(post.slug);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${baseUrl}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.metadata.title,
            item: postUrl,
          },
        ],
      },
      {
        "@type": "BlogPosting",
        headline: post.metadata.title,
        datePublished: post.metadata.publishedAt,
        dateModified: post.metadata.updatedAt || post.metadata.publishedAt,
        description: post.metadata.description,
        keywords: post.metadata.tags,
        image: postImage,
        url: postUrl,
        mainEntityOfPage: postUrl,
        articleSection: post.metadata.tags?.[0],
        inLanguage: "en-US",
        wordCount: post.content.split(WHITESPACE_REGEX).length,
        isPartOf: {
          "@type": "Blog",
          name: `${siteName} Blog`,
          url: `${baseUrl}/blog`,
        },
        author: {
          "@type": post.metadata.author ? "Person" : "Organization",
          name: post.metadata.author || siteName,
          url: baseUrl,
        },
        publisher: {
          "@type": "Organization",
          name: siteName,
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/og?title=${encodeURIComponent(siteName)}`,
          },
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
      <Script
        id="blog-structured-data"
        strategy="beforeInteractive"
        type="application/ld+json"
      >
        {JSON.stringify(structuredData)}
      </Script>
      <nav
        aria-label="Breadcrumb"
        className="mb-8 text-muted-foreground text-sm"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-foreground" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-foreground" href="/blog">
              Blog
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {post.metadata.title}
          </li>
        </ol>
      </nav>
      <h1 className="title font-semibold text-4xl tracking-tighter">
        {post.metadata.title}
      </h1>
      <div className="mt-2 mb-8 flex items-center justify-between text-sm">
        <p className="text-sm">{formatDate(post.metadata.publishedAt)}</p>
      </div>
      {post.metadata.image ? (
        <Image
          alt={post.metadata.image.alt || post.metadata.title}
          className="mb-10 max-h-[28rem] w-full max-w-4xl rounded-lg border border-border object-cover"
          height={900}
          sizes="(max-width: 1024px) 100vw, 1024px"
          src={post.metadata.image.src}
          width={1600}
        />
      ) : null}
      <article className="prose prose-lg prose-neutral dark:prose-invert max-w-4xl">
        <CustomMDX source={post.content} />
      </article>
      {relatedPosts.length > 0 ? (
        <section
          aria-labelledby="related-posts"
          className="mt-16 max-w-4xl border-t pt-10"
        >
          <h2
            className="font-semibold text-2xl tracking-tight"
            id="related-posts"
          >
            Related posts
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <Link
                className="rounded-lg border border-border p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
                href={`/blog/${relatedPost.slug}`}
                key={relatedPost.slug}
              >
                <p className="font-medium text-sm leading-6">
                  {relatedPost.metadata.title}
                </p>
                <p className="mt-2 line-clamp-3 text-muted-foreground text-sm">
                  {relatedPost.metadata.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
