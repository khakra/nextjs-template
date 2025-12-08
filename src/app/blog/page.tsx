import { BlogPosts } from "@/components/posts";

export const metadata = {
  title: `${process.env.NEXT_PUBLIC_PROJECT_NAME} | Blog`,
  description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
};

export default function Page() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
      <h1 className="mb-8 font-semibold text-2xl tracking-tighter">Blog</h1>
      <BlogPosts />
    </div>
  );
}
