"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/firebaseConfig/firebaseConfig";
import { PrepModules } from "@/lib/interview/types";
import { downloadPrepHtml } from "@/lib/interview/downloadHtml";
import { Download, RotateCcw } from "lucide-react";

async function correctedFetch(body: unknown) {
  const user = auth?.currentUser;
  if (!user) throw new Error("You must be logged in.");
  const token = await user.getIdToken();
  return fetch("/api/interview/prep", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

export function PrepDocumentView({
  html,
  packId,
  company,
  roleTitle,
  onCorrected,
  onStartOver,
}: {
  html: string;
  packId: string | null;
  company: string;
  roleTitle: string;
  onCorrected: (result: { id: string | null; html: string; modules: PrepModules }) => void;
  onStartOver: () => void;
}) {
  const [correctionText, setCorrectionText] = useState("");
  const [showCorrection, setShowCorrection] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [correctionError, setCorrectionError] = useState("");

  async function submitCorrection() {
    if (!correctionText.trim()) return;
    if (!packId) {
      setCorrectionError("This pack wasn't saved, so there's nothing to correct against. Start a new one instead.");
      return;
    }
    setCorrecting(true);
    setCorrectionError("");
    try {
      const res = await correctedFetch({ packId, correctionText: correctionText.trim() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply correction");
      onCorrected(data);
      setCorrectionText("");
      setShowCorrection(false);
    } catch (err) {
      setCorrectionError((err as Error).message);
    } finally {
      setCorrecting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your prep pack is ready</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <iframe
          sandbox=""
          srcDoc={html}
          className="w-full h-[80vh] border border-gray-700 rounded-lg bg-white"
          title="Interview prep document"
        />

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => downloadPrepHtml(html, company, roleTitle)}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={() => setShowCorrection((v) => !v)}>
            Something&apos;s off, fix it
          </Button>
          <Button variant="outline" onClick={onStartOver}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Start a new prep pack
          </Button>
        </div>

        {showCorrection && (
          <div className="space-y-2 border-t border-gray-700 pt-3">
            <p className="text-sm text-gray-400">
              Tell us what&apos;s wrong, we&apos;ll re-derive the whole document from it rather than patch a single line, since a
              correction like &quot;the role is actually product marketing, not GTM&quot; usually changes more than one section.
            </p>
            <Textarea
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              rows={3}
              placeholder="e.g. DotPe counts as BFSI experience, the role is actually product marketing not GTM…"
            />
            {correctionError && <p className="text-sm text-red-400">{correctionError}</p>}
            <Button onClick={submitCorrection} disabled={correcting || !correctionText.trim()}>
              {correcting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Re-deriving...
                </>
              ) : (
                "Apply correction and regenerate"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
