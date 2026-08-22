import "@/app/global.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { baseUrl } from "./sitemap";

const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || "";
const metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION || "";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: projectName,
    template: `%s | ${projectName}`,
  },
  description: metaDescription,
  // No `alternates.canonical` here. Unlike openGraph, alternates IS inherited,
  // so a root canonical makes every page without its own declare itself a
  // duplicate of the homepage. Set canonicals per page instead.
  //
  // No `title` or `url` under openGraph either: Next does not deep-merge it, so
  // setting them would make every child page announce the site name and the
  // homepage URL instead of its own.
  openGraph: {
    description: metaDescription,
    siteName: projectName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `/og?title=${encodeURIComponent(projectName)}`,
        width: 1200,
        height: 630,
        alt: projectName,
      },
    ],
  },
  // Same no-deep-merge rule applies: title and description are omitted so each
  // page's own values are used for the card.
  twitter: {
    card: "summary_large_image",
    images: [`/og?title=${encodeURIComponent(projectName)}`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const cx = (...classes: string[]) => classes.filter(Boolean).join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={cx(GeistSans.variable, GeistMono.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <body className="w-full overflow-x-hidden antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
