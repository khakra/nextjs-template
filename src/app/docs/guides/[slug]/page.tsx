import type { Metadata } from "next";
import { getAllDocSlugs } from "@/app/docs/config";
import { DocsContentPage, generateDocMetadata } from "@/app/docs/doc-page";

interface Props {
  params: Promise<{ slug: string }>;
}

const guidePrefix = "guides/";

export async function generateStaticParams() {
  return getAllDocSlugs()
    .filter((slug) => slug.startsWith(guidePrefix))
    .map((slug) => ({ slug: slug.slice(guidePrefix.length) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return generateDocMetadata(`${guidePrefix}${slug}`);
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  return <DocsContentPage slug={`${guidePrefix}${slug}`} />;
}
