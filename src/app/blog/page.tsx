import { BlogPosts } from "@/app/components/posts";

export const metadata = {
  title: process.env.NEXT_PUBLIC_PROJECT_NAME + " | Blog",
  description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Blog</h1>
      <BlogPosts />
    </section>
  );
}
