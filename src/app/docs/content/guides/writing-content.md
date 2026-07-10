---
title: 'Writing Content'
description: 'Add blog posts, docs pages, and guides with MDX and frontmatter.'
---

# Writing Content

This template ships with three content surfaces: the blog, docs pages, and guides. This guide covers how to add content to each.

## Blog posts

Add `.mdx` files to `src/app/blog/posts/`. Frontmatter is validated with Zod at build time, so a typo in a field name fails the build instead of silently rendering wrong.

Required fields: `title`, `description`, `publishedAt`. Optional: `updatedAt`, `image` (object with `src` and `alt`), `tags`, `canonical`, `draft`, `noindex`, `author`.

```yaml
---
title: 'My Post'
description: 'One-sentence summary used in cards, meta tags, and RSS.'
publishedAt: '2026-01-15'
tags:
  - engineering
  - tutorial
---
```

Posts with `draft: true` are excluded everywhere. Tags drive the related-posts section at the bottom of each post.

## Docs pages

Add `.md` files to `src/app/docs/content/` with `title` and `description` frontmatter, then register the page in `src/app/docs/config.ts` so it appears in the sidebar and sitemap.

## Guides

Guides are docs pages that live in `src/app/docs/content/guides/` and are registered under the `Guides` section in `src/app/docs/config.ts`. They render at `/docs/guides/<slug>`.

## Rich content

Markdown tables, task lists, and strikethrough work via GitHub Flavored Markdown. Headings get anchor links automatically, and h2/h3 headings feed the table of contents on docs pages. You can also embed videos:

```mdx
<YouTubeEmbed videoId="dQw4w9WgXcQ" title="Demo video" />
```
