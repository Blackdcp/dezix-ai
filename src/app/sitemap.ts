import type { MetadataRoute } from "next";

const BASE_URL = "https://dezix-ai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Public marketing pages
  const marketingPages = [
    "",
    "/pricing",
    "/faq",
    "/model-list",
  ];

  // Docs pages
  const docsPages = [
    "/docs/quick-start",
    "/docs/api-reference",
    "/docs/sdk-examples",
  ];

  // Auth pages
  const authPages = [
    "/login",
    "/register",
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Marketing pages (highest priority, both locales)
  for (const page of marketingPages) {
    // zh (default, no prefix)
    entries.push({
      url: `${BASE_URL}${page || "/"}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: page === "" ? 1.0 : 0.8,
      alternates: {
        languages: {
          zh: `${BASE_URL}${page || "/"}`,
          en: `${BASE_URL}/en${page || "/"}`,
        },
      },
    });
  }

  // Docs pages
  for (const page of docsPages) {
    entries.push({
      url: `${BASE_URL}${page}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          zh: `${BASE_URL}${page}`,
          en: `${BASE_URL}/en${page}`,
        },
      },
    });
  }

  // Auth pages (low priority)
  for (const page of authPages) {
    entries.push({
      url: `${BASE_URL}${page}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    });
  }

  return entries;
}
