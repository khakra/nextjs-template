import type { Metadata } from "next";
import { getAllDocSlugs } from "@/app/docs/config";
import { DocsContentPage, generateDocMetadata } from "@/app/docs/doc-page";

interface Props {
  params: Promise<{ slug: string }>;
}

// Unknown slugs 404 statically instead of triggering dynamic rendering
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllDocSlugs().filter((slug) => !slug.includes("/"));
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return generateDocMetadata(slug);
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  return <DocsContentPage slug={slug} />;
}
