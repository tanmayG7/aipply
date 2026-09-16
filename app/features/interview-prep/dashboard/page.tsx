"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { auth, firestore, getUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { UserDetails } from "@/lib/types";
import { UserContextProvider } from "@/app/contexts/UserContext";
import { profileSummary } from "@/lib/interview/profileSummary";
import { extractResumeText } from "@/lib/interview/resumeExtract";
import { ResearchBundle } from "@/lib/interview/types";
import { ResearchReviewPanel } from "@/components/interview-prep/ResearchReviewPanel";
import { PrepDocumentView } from "@/components/interview-prep/PrepDocumentView";
import { RecentPacksList, SavedPrepPack } from "@/components/interview-prep/RecentPacksList";
import { Sparkles, Send, MessageSquareText, Search } from "lucide-react";
import Head from "next/head";

type Step = "input" | "researching" | "review" | "generating" | "result";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function authedFetch(path: string, body: unknown) {
  const user = auth?.currentUser;
  if (!user) throw new Error("You must be logged in.");
  const token = await user.getIdToken();
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

export default function InterviewPrepDashboard() {
  return (
    <UserContextProvider>
      <InterviewPrepDashboardInner />
    </UserContextProvider>
  );
}

function InterviewPrepDashboardInner() {
  const [profile, setProfile] = useState<UserDetails | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [step, setStep] = useState<Step>("input");
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewerInput, setInterviewerInput] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [extractingResume, setExtractingResume] = useState(false);
  const [extractError, setExtractError] = useState("");

  const [researchBundle, setResearchBundle] = useState<ResearchBundle | null>(null);
  const [stepError, setStepError] = useState("");

  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);

  const [recentPacks, setRecentPacks] = useState<SavedPrepPack[]>([]);

  useEffect(() => {
    (async () => {
      if (!auth?.currentUser) {
        setLoadingProfile(false);
        return;
      }
      const p = await getUserProfile(auth.currentUser.uid).catch(() => null);
      setProfile(p);
      setRoleTitle((prev) => prev || p?.jobTitle || "");
      setLoadingProfile(false);
      await loadRecentPacks(auth.currentUser.uid);
    })();
  }, []);

  async function loadRecentPacks(uid: string) {
    if (!firestore) return;
    try {
      const q = query(collection(firestore, "interviewPrepPacks"), where("userId", "==", uid));
      const snap = await getDocs(q);
      const packs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SavedPrepPack[];
      packs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentPacks(packs.slice(0, 5));
    } catch (err) {
      console.error("Failed to load recent prep packs:", err);
    }
  }

  async function handleResumeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtractError("");
    setExtractingResume(true);
    try {
      const text = await extractResumeText(file);
      setResumeText(text);
    } catch (err) {
      setExtractError((err as Error).message);
    } finally {
      setExtractingResume(false);
      e.target.value = "";
    }
  }

  async function runResearch() {
    if (!company.trim()) return setStepError("Which company?");
    if (!roleTitle.trim()) return setStepError("Which role?");
    if (!resumeText.trim()) return setStepError("Paste or upload your resume first, it's the only source of truth for your real facts.");
    setStepError("");
    setStep("researching");
    try {
      const res = await authedFetch("/api/interview/research", {
        company: company.trim(),
        roleTitle: roleTitle.trim(),
        jobDescriptionText: jobDescription.trim(),
        interviewerInput: interviewerInput.trim() || null,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to research");
      setResearchBundle(data as ResearchBundle);
      setStep("review");
    } catch (err) {
      setStepError((err as Error).message);
      setStep("input");
    }
  }

  async function generate() {
    if (!researchBundle) return;
    setStepError("");
    setStep("generating");
    try {
      const res = await authedFetch("/api/interview/prep", {
        company: company.trim(),
        roleTitle: roleTitle.trim(),
        resumeText,
        interviewerInput: interviewerInput.trim() || null,
        profile: profile ? profileSummary(profile) : "",
        researchBundle,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate prep pack");
      setGeneratedId(data.id || null);
      setGeneratedHtml(data.html || null);
      setStep("result");
      if (auth?.currentUser) await loadRecentPacks(auth.currentUser.uid);
    } catch (err) {
      setStepError((err as Error).message);
      setStep("review");
    }
  }

  function startOver() {
    setStep("input");
    setResearchBundle(null);
    setGeneratedId(null);
    setGeneratedHtml(null);
    setStepError("");
  }

  function viewSavedPack(p: SavedPrepPack) {
    if (!p.html) return;
    setCompany(p.company);
    setRoleTitle(p.jobTitle || "");
    setGeneratedId(p.id);
    setGeneratedHtml(p.html);
    setStep("result");
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-[#020218] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Interview Prep - AiPply</title>
      </Head>
      <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-6 p-6 bg-[#020218] text-white">
            <div>
              <h1 className="text-3xl font-bold">Interview Prep</h1>
              <p className="text-gray-400">
                Grounded in your real resume, live research on the company and interviewer, and a document built to carry into the room.
              </p>
            </div>

            {step === "input" && (
              <Card>
                <CardHeader>
                  <CardTitle>1. Tell us about the interview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Company</Label>
                      <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Razorpay" />
                    </div>
                    <div className="space-y-1">
                      <Label>Role</Label>
                      <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="e.g. Product Manager" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Interviewer name or LinkedIn URL (optional)</Label>
                    <Input
                      value={interviewerInput}
                      onChange={(e) => setInterviewerInput(e.target.value)}
                      placeholder="e.g. Jane Doe or a linkedin.com/in/... URL"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Your resume</Label>
                    <p className="text-sm text-gray-500">
                      Use your real, generic base resume, not a version already tailored for a different job, it&apos;s the only source of
                      truth for your real facts.
                    </p>
                    <Textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      rows={8}
                      placeholder="Paste your resume text here…"
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleResumeFile}
                        disabled={extractingResume}
                        className="text-sm text-gray-400"
                      />
                      {extractingResume && <span className="text-sm text-gray-400">Extracting…</span>}
                    </div>
                    {extractError && <p className="text-sm text-red-400">{extractError}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label>Job description (optional)</Label>
                    <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={5} placeholder="Paste the JD here…" />
                    <p className="text-sm text-gray-500">
                      No JD? We&apos;ll search {company || "the company"}&apos;s own live postings for a similar role, or fall back to the
                      interviewer&apos;s profile if you gave one, either way it&apos;ll be flagged clearly in your doc rather than guessed
                      silently.
                    </p>
                  </div>

                  {stepError && <p className="text-sm text-red-400">{stepError}</p>}

                  <Button onClick={runResearch}>
                    <Search className="w-4 h-4 mr-2" />
                    Research
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === "researching" && (
              <Card>
                <CardContent className="py-10 flex items-center justify-center gap-3 text-gray-400">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Researching {company}…
                </CardContent>
              </Card>
            )}

            {step === "review" && researchBundle && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">2. Check the research before we write anything</h2>
                {stepError && <p className="text-sm text-red-400">{stepError}</p>}
                <ResearchReviewPanel
                  bundle={researchBundle}
                  onChange={setResearchBundle}
                  onBack={() => setStep("input")}
                  onGenerate={generate}
                  generating={false}
                />
              </div>
            )}

            {step === "generating" && (
              <Card>
                <CardContent className="py-10 flex items-center justify-center gap-3 text-gray-400">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Writing your prep pack…
                </CardContent>
              </Card>
            )}

            {step === "result" && generatedHtml && (
              <PrepDocumentView
                html={generatedHtml}
                packId={generatedId}
                company={company}
                roleTitle={roleTitle}
                onStartOver={startOver}
                onCorrected={(result) => {
                  setGeneratedId(result.id);
                  setGeneratedHtml(result.html);
                }}
              />
            )}

            <RecentPacksList packs={recentPacks} onView={viewSavedPack} />

            <MockInterviewCard company={company} jobTitle={roleTitle} jobDescription={jobDescription} profile={profile} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

function MockInterviewCard({
  company,
  jobTitle,
  jobDescription,
  profile,
}: {
  company: string;
  jobTitle: string;
  jobDescription: string;
  profile: UserDetails | null;
}) {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  async function streamReply(history: ChatMessage[]) {
    setBusy(true);
    setError("");
    setMessages([...history, { role: "assistant", content: "" }]);
    try {
      const user = auth?.currentUser;
      if (!user) throw new Error("You must be logged in.");
      const token = await user.getIdToken();
      const res = await fetch("/api/interview/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messages: history,
          company,
          jobTitle,
          jobDescription,
          profile: profile ? profileSummary(profile) : "",
        }),
      });
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed?.choices?.[0]?.delta?.content || "";
            if (delta) {
              text += delta;
              setMessages([...history, { role: "assistant", content: text }]);
            }
          } catch {}
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function start() {
    if (!company.trim()) return setError("Enter a company above first");
    setError("");
    setStarted(true);
    streamReply([{ role: "user", content: "[The interview is starting now. Greet me in one short line and ask your first question.]" }]);
  }

  function send(overrideText?: string) {
    const text = overrideText || input.trim();
    if (!text || busy) return;
    setInput("");
    streamReply([...messages, { role: "user", content: text }]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="w-5 h-5" />
          Mock interview
        </CardTitle>
        <p className="text-sm text-gray-400">A live, text-based interview — one question at a time, with natural follow-ups based on what you say.</p>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
        {!started ? (
          <Button onClick={start} disabled={busy}>
            <Sparkles className="w-4 h-4 mr-2" />
            Start mock interview
          </Button>
        ) : (
          <div className="space-y-3">
            <div ref={msgsRef} className="flex flex-col gap-2 max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg p-3">
              {messages
                .filter((m) => m.role !== "user" || !m.content.startsWith("[The interview is starting"))
                .map((m, i) => (
                  <div
                    key={i}
                    className={`rounded-lg px-3 py-2 text-sm max-w-[85%] ${
                      m.role === "user" ? "self-end bg-purple-700/40" : "self-start bg-gray-800"
                    }`}
                  >
                    {m.content || "…"}
                  </div>
                ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Type your answer…"
                disabled={busy}
              />
              <Button onClick={() => send()} disabled={busy}>
                <Send className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() =>
                  send(
                    "Please end the interview here and give me direct feedback — strengths, weaknesses, 2-3 concrete improvements, and a readiness score out of 10."
                  )
                }
              >
                End &amp; get feedback
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
