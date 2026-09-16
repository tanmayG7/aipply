"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadPrepHtml } from "@/lib/interview/downloadHtml";

export interface SavedPrepPack {
  id: string;
  company: string;
  jobTitle?: string;
  createdAt: string;
  html?: string;
  parentPackId?: string | null;
}

export function RecentPacksList({ packs, onView }: { packs: SavedPrepPack[]; onView: (pack: SavedPrepPack) => void }) {
  if (packs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent prep packs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {packs.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 text-sm border-t border-gray-700 pt-2 first:border-t-0 first:pt-0"
          >
            <span>
              {p.company} {p.jobTitle ? `— ${p.jobTitle}` : ""}
              {p.parentPackId && <span className="text-gray-500"> (corrected)</span>}
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-gray-500">{new Date(p.createdAt).toLocaleDateString("en-US")}</span>
              {p.html && (
                <>
                  <button className="text-purple-400 hover:underline" onClick={() => onView(p)}>
                    View
                  </button>
                  <button
                    className="text-purple-400 hover:underline"
                    onClick={() => downloadPrepHtml(p.html!, p.company, p.jobTitle || "")}
                  >
                    Download
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
