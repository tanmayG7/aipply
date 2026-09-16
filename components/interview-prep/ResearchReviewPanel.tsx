"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { ResearchBundle, ResearchUnavailableReason } from "@/lib/interview/types";

const COMPANY_REASON_TEXT: Record<ResearchUnavailableReason, string> = {
  "missing-key": "Company research isn't configured yet, this section will be built from the role/resume only.",
  "fetch-failed": "Company research failed to complete, this section will be built from the role/resume only.",
  "no-results": "No live company information was found, this section will be built from the role/resume only.",
  "no-profile-given": "No interviewer was given, so there's nothing to research here.",
  "scrape-blocked": "The interviewer's LinkedIn profile couldn't be reached, Module 6 will stay company-only.",
  "profile-gated": "LinkedIn hid this profile's About section and activity from a logged-out view, Module 6 will stay company-only rather than guess.",
};

function jdStatusLabel(source: ResearchBundle["jd"]["source"]): { text: string; variant: "default" | "secondary" } {
  switch (source) {
    case "provided":
      return { text: "Job description provided", variant: "default" };
    case "inferred-posting":
      return { text: "No JD given, inferred from a live posting", variant: "secondary" };
    case "inferred-interviewer-profile":
      return { text: "No JD given, inferred from the interviewer's profile", variant: "secondary" };
    default:
      return { text: "No JD available", variant: "secondary" };
  }
}

export function ResearchReviewPanel({
  bundle,
  onChange,
  onBack,
  onGenerate,
  generating,
}: {
  bundle: ResearchBundle;
  onChange: (bundle: ResearchBundle) => void;
  onBack: () => void;
  onGenerate: () => void;
  generating: boolean;
}) {
  const jdStatus = jdStatusLabel(bundle.jd.source);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            Company research
            <Badge variant={bundle.company.found ? "default" : "secondary"}>
              {bundle.company.found ? "live research" : "unavailable"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bundle.company.found ? (
            <>
              <div className="space-y-1">
                <Label>Overview</Label>
                <Textarea
                  value={bundle.company.overviewText}
                  onChange={(e) =>
                    onChange({ ...bundle, company: { ...bundle.company, overviewText: e.target.value } })
                  }
                  rows={4}
                />
              </div>
              {bundle.company.strategicSignals.length > 0 && (
                <div className="space-y-1">
                  <Label>Strategic signals</Label>
                  <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                    {bundle.company.strategicSignals.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">
              {COMPANY_REASON_TEXT[bundle.company.unavailableReason || "fetch-failed"]}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            Interviewer research
            <Badge variant={bundle.interviewer.found ? "default" : "secondary"}>
              {bundle.interviewer.found ? "live research" : "not found"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bundle.interviewer.found ? (
            <>
              <p className="text-sm text-gray-300">
                <b>{bundle.interviewer.name}</b>
                {bundle.interviewer.headline ? ` · ${bundle.interviewer.headline}` : ""}
              </p>
              <div className="space-y-1">
                <Label>About</Label>
                <Textarea
                  value={bundle.interviewer.aboutText || ""}
                  onChange={(e) =>
                    onChange({ ...bundle, interviewer: { ...bundle.interviewer, aboutText: e.target.value } })
                  }
                  rows={3}
                />
              </div>
              {(bundle.interviewer.recentActivity || []).length > 0 && (
                <div className="space-y-1">
                  <Label>Recent activity</Label>
                  <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                    {bundle.interviewer.recentActivity!.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">
              {COMPANY_REASON_TEXT[bundle.interviewer.unavailableReason || "no-profile-given"]}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            Job description
            <Badge variant={jdStatus.variant}>{jdStatus.text}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bundle.jd.inferenceNote && <p className="text-sm text-gray-400 italic">{bundle.jd.inferenceNote}</p>}
          <Textarea
            value={bundle.jd.text}
            onChange={(e) => onChange({ ...bundle, jd: { ...bundle.jd, text: e.target.value } })}
            rows={5}
            placeholder="No job description text available."
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={generating}>
          Back
        </Button>
        <Button onClick={onGenerate} disabled={generating}>
          {generating ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate my prep pack
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
