import { BlogPosts } from "@/components/posts";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Pricing from "@/components/pricing";
import CTA from "@/components/cta";
import Feature from "@/components/feature";
import Stats from "@/components/stats";
import Hero from "@/components/hero";

export default function Page() {
  return (
    <main className="max-w-7xl mx-auto">
      <Header />
      <Hero />
      <Feature />
      <Stats />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
