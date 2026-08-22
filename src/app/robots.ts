import { baseUrl } from "@/app/sitemap";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
