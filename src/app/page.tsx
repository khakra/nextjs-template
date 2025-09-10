import { BlogPosts } from "@/components/posts";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import Header from "@/components/header";

export default function Page() {
  return (
    <main className="max-w-7xl mx-auto">
      <Header />
      <section className="my-8">
        <h1 className="text-2xl font-semibold tracking-tighter">
          My Portfolio
        </h1>
        <p className="">
          {`I'm a Vim enthusiast and tab advocate, finding unmatched efficiency in
        Vim's keystroke commands and tabs' flexibility for personal viewing
        preferences. This extends to my support for static typing, where its
        early error detection ensures cleaner code, and my preference for dark
        mode, which eases long coding sessions by reducing eye strain.`}
        </p>
        <div className="mt-8">
          <BlogPosts />
        </div>
      </section>
      <Footer />
    </main>
  );
}
