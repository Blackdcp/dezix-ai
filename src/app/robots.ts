import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard", "/api-keys", "/usage", "/models", "/playground", "/chat", "/billing", "/settings", "/referral"],
      },
    ],
    sitemap: "https://dezix-ai.vercel.app/sitemap.xml",
  };
}
