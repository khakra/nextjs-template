import { BlogPosts } from "@/components/posts";

export const metadata = {
  title: "Blog",
  description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
  alternates: {
    canonical: "/blog",
  },
};

export default function Page() {
  return (
    <div className="mt-16 px-6 lg:px-8">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="font-semibold text-4xl tracking-tight">
          {process.env.NEXT_PUBLIC_PROJECT_NAME} Blog
        </h1>
        <p className="mt-3 text-muted-foreground">
          {process.env.NEXT_PUBLIC_META_DESCRIPTION}
        </p>
      </div>
      <BlogPosts />
    </div>
  );
}
