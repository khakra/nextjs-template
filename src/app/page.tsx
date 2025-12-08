import CTA from "@/components/cta";
import Feature from "@/components/feature";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Hero from "@/components/hero";
import Pricing from "@/components/pricing";
import Stats from "@/components/stats";

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl">
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
