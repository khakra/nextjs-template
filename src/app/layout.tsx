import "@/app/global.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { baseUrl } from "./sitemap";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
    template: `%s | ${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
  },
  description: "This is my portfolio.",
  openGraph: {
    title: `${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
    description: "This is my portfolio.",
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
      lang="en"
      className={cx(GeistSans.variable, GeistMono.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased w-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
