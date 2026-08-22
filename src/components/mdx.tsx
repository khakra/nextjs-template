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

// next/image throws without explicit dimensions, and markdown `![alt](src)`
// supplies none — so default them and let the CSS scale the result.
function RoundedImage({
  alt,
  src,
  width = 1600,
  height = 900,
  ...restProps
}: {
  alt: string;
  src: string;
  width?: number;
  height?: number;
}) {
  return (
    <Image
      alt={alt}
      className="h-auto w-full rounded-lg"
      height={height}
      sizes="(max-width: 1024px) 100vw, 1024px"
      src={src}
      width={width}
      {...restProps}
    />
  );
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
  // Without this, plain markdown images render as a raw unoptimized <img>.
  img: RoundedImage,
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
