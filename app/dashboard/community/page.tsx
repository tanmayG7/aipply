// app/dashboard/community/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/* Re-use arrays from your public page */
const whatsInsideData = [
  { image: '/static/communityPage/jobtips.png', title: 'Insider Job Tips & Hacks' },
  { image: '/static/communityPage/hiringupdates.png', title: 'Exclusive Hiring Updates & Hidden Openings' },
  /* … */
];

const whatsInsideIcons = [
  { image: '/static/communityPage/jobtipsIcons.svg', text: 'Insider Job Tips & Hacks' },
  /* … */
];

export default function CommunityPage() {
  return (
    <section className="flex flex-col gap-8 p-6 md:p-10">
      {/* Page heading */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Community</h1>
        <p className="text-muted-foreground">
          Join our exclusive space for power users, live events and insider hiring intel.
        </p>
      </header>

      {/* Grid 1 – large cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {whatsInsideData.map((card) => (
          <article key={card.title} className="rounded-xl border bg-card shadow">
            <Image
              src={card.image}
              alt={card.title}
              width={400}
              height={240}
              className="h-40 w-full rounded-t-xl object-cover"
              priority
            />
            <div className="p-4 font-medium">{card.title}</div>
          </article>
        ))}
      </div>

      {/* Grid 2 – small icon list */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {whatsInsideIcons.map((item) => (
          <div key={item.text} className="flex items-center gap-3 rounded-lg border p-4">
            <Image src={item.image} alt="" width={32} height={32} />
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6">
        <Button asChild>
          <Link href="/dashboard/community/apply">Request Access</Link>
        </Button>
      </div>
    </section>
  );
}
