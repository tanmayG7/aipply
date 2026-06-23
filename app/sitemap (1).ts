// app/sitemap.ts
// Next.js 15 App Router — generates https://www.aipply.io/sitemap.xml
//
// DEPLOY: Place at app/sitemap.ts in the aipply/ (frontend) repo.
// VERIFY: https://www.aipply.io/sitemap.xml after next Vercel deploy.
// SUBMIT: https://search.google.com/search-console → Sitemaps
//
// Pages confirmed from live site scrape + HANDOVER.md app structure.
// Add/remove URLs to match your actual app/ routes.

import type { MetadataRoute } from "next";

const BASE = "https://www.aipply.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // ── Marketing / Public pages ───────────────────────────────
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/features`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },

    // ── Auth ───────────────────────────────────────────────────
    // Only include if these are public landing pages in your app/
    {
      url: `${BASE}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE}/signup`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },

    // ── Legal ──────────────────────────────────────────────────
    {
      url: `${BASE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },

    // ── DO NOT include ─────────────────────────────────────────
    // /dashboard/*    → protected, no SEO value
    // /api/*          → API routes, not pages
    // /admin/*        → admin panel, not public
  ];
}
