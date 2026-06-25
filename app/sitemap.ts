// app/sitemap.ts
// Replace the existing sitemap.ts with this file.
// Next.js serves this at: https://www.aipply.io/sitemap.xml
//
// Routes confirmed from app/ directory (June 2026).
// Excluded: /dashboard, /api, /test-*, /user-id-test (not public pages)

import type { MetadataRoute } from "next";

const BASE = "https://www.aipply.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // ── Homepage ───────────────────────────────────────────────
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },

    // ── Core marketing ─────────────────────────────────────────
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
      priority: 0.9,
    },
    {
      url: `${BASE}/about-us`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/contact-us`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },

    // ── Product / feature pages ─────────────────────────────────
    {
      url: `${BASE}/cover-letter`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/cv-services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/resume-analysis`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/resources`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE}/free-me`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/offer`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
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
    {
      url: `${BASE}/refund`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },

    // ── NOT included (intentionally excluded) ──────────────────
    // /dashboard       → auth-protected, no SEO value
    // /api/*           → API routes, not pages
    // /test-subscription → internal test page
    // /test-webhook    → internal test page
    // /user-id-test    → internal test page
    // /contexts        → Next.js context providers, not a page
  ];
}
