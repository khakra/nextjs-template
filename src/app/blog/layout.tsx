import Header from "@/components/header";
import { SimpleFooter } from "@/components/simple-footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <SimpleFooter />
    </div>
  );
}
