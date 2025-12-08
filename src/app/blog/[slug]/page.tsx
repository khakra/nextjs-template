import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { formatDate, getBlogPosts } from "@/app/blog/utils";
import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";

export async function generateStaticParams() {
  const posts = getBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const post = getBlogPosts().find((blogPost) => blogPost.slug === params.slug);
  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  const ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
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

export default async function Blog(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const post = getBlogPosts().find((blogPost) => blogPost.slug === params.slug);

  if (!post) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    datePublished: post.metadata.publishedAt,
    dateModified: post.metadata.publishedAt,
    description: post.metadata.summary,
    image: post.metadata.image
      ? `${baseUrl}${post.metadata.image}`
      : `/og?title=${encodeURIComponent(post.metadata.title)}`,
    url: `${baseUrl}/blog/${post.slug}`,
    author: {
      "@type": "Person",
      name: process.env.NEXT_PUBLIC_PROJECT_NAME,
    },
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
      <h1 className="title font-semibold text-4xl tracking-tighter">
        {post.metadata.title}
      </h1>
      <div className="mt-2 mb-8 flex items-center justify-between text-sm">
        <p className="text-sm">{formatDate(post.metadata.publishedAt)}</p>
      </div>
      <article className="prose prose-lg prose-neutral dark:prose-invert">
        <CustomMDX source={post.content} />
      </article>
    </div>
  );
}
