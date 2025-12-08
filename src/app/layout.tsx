import type { Metadata } from "next";
import "@/app/global.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider";
import { baseUrl } from "./sitemap";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
    template: `%s | ${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
  },
  description: `${process.env.NEXT_PUBLIC_META_DESCRIPTION}`,
  openGraph: {
    title: `${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
    description: `${process.env.NEXT_PUBLIC_META_DESCRIPTION}`,
    url: baseUrl,
    siteName: `${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
    locale: "en_US",
    type: "website",
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
      <body className="w-full antialiased">
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
