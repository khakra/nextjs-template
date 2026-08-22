import Image from "next/image";
import Link from "next/link";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import React from "react";
import remarkGfm from "remark-gfm";
import { highlight } from "sugar-high";
import { slugify } from "@/lib/mdx-utils";

function Table({ data }: { data: { headers: string[]; rows: string[][] } }) {
  const headers = data.headers.map((header) => <th key={header}>{header}</th>);
  const rows = data.rows.map((row, rowIndex) => (
    <tr key={`row-${rowIndex}-${row[0]}`}>
      {row.map((cell, cellIndex) => (
        <td key={`cell-${rowIndex}-${cellIndex}-${cell}`}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function CustomLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { href, ...restProps } = props;

  if (href?.startsWith("/")) {
    return (
      <Link href={href} {...restProps}>
        {props.children}
      </Link>
    );
  }

  if (href?.startsWith("#")) {
    return <a {...props} />;
  }

  return <a rel="noopener noreferrer" target="_blank" {...props} />;
}

// Plain markdown `![alt](src)`. It carries no dimensions, and a template can't
// know which remote hosts to allow-list, so next/image can't be used here:
// declaring stand-in dimensions stretches small images to the column width, and
// an un-allow-listed remote URL builds fine then 400s at runtime. Authors who
// want optimization use the <Image> component below and supply real dimensions.
function MarkdownImage({
  alt,
  src,
  ...restProps
}: {
  alt: string;
  src: string;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: dimensions and remote hosts are unknown for markdown images; see comment above
    // biome-ignore lint/correctness/useImageSize: markdown supplies no dimensions
    <img
      alt={alt}
      className="h-auto max-w-full rounded-lg"
      src={src}
      {...restProps}
    />
  );
}

// For explicit <Image src="..." width={…} height={…} /> in MDX, where the author
// has supplied real dimensions and (for remote hosts) configured remotePatterns.
function RoundedImage(props: { alt: string; src: string }) {
  const { alt, ...restProps } = props;
  return <Image alt={alt} className="rounded-lg" {...restProps} />;
}

function Code({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  const codeHTML = highlight(String(children ?? ""));
  // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for syntax highlighting from trusted MDX content
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
}

function YouTubeEmbed({
  title = "YouTube video",
  videoId,
}: {
  title?: string;
  videoId: string;
}) {
  return (
    <iframe
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="my-8 aspect-video w-full rounded-lg"
      frameBorder="0"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      src={`https://www.youtube.com/embed/${videoId}`}
      title={title}
    />
  );
}

function createHeading(level: number) {
  const Heading = ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const slug = slugify(String(children ?? ""));
    return React.createElement(
      `h${level}`,
      { id: slug, ...props },
      [
        React.createElement("a", {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: "anchor",
        }),
      ],
      children
    );
  };

  Heading.displayName = `Heading${level}`;

  return Heading;
}

const components: MDXRemoteProps["components"] = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  img: MarkdownImage,
  a: CustomLink,
  code: Code,
  Table,
  YouTubeEmbed,
};

export function CustomMDX(props: MDXRemoteProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      }}
    />
  );
}
