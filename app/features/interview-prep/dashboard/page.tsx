"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { auth, firestore, getUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { UserDetails } from "@/lib/types";
import { UserContextProvider } from "@/app/contexts/UserContext";
import { profileSummary } from "@/lib/interview/profileSummary";
import { Sparkles, Send, MessageSquareText, Flag } from "lucide-react";
import Head from "next/head";

interface CompanyIntel {
  overview: string;
  rating: number | null;
  pros: string[];
  cons: string[];
  redFlags: string[];
  commonInterviewQuestions: string[];
  salaryBands: { role: string; range: string }[];
  verified: boolean;
}

interface PrepPack {
  likelyQuestions: { q: string; whyAsked: string; strongAnswer: string }[];
  talkingPoints: string[];
  questionsToAsk: string[];
  redFlagsToProbe: string[];
  salaryContext: string;
  story: string;
}

interface SavedPrepPack {
  id: string;
  company: string;
  jobTitle?: string;
  createdAt: string;
}

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

  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [building, setBuilding] = useState(false);
  const [buildError, setBuildError] = useState("");
  const [intel, setIntel] = useState<CompanyIntel | null>(null);
  const [pack, setPack] = useState<PrepPack | null>(null);

  const [recentPacks, setRecentPacks] = useState<SavedPrepPack[]>([]);

  useEffect(() => {
    (async () => {
      if (!auth?.currentUser) {
        setLoadingProfile(false);
        return;
      }
      const p = await getUserProfile(auth.currentUser.uid).catch(() => null);
      setProfile(p);
      setJobTitle((prev) => prev || p?.jobTitle || "");
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

  async function buildPrepPack() {
    if (!company.trim()) return setBuildError("Which company?");
    setBuilding(true);
    setBuildError("");
    setIntel(null);
    setPack(null);
    try {
      const res = await authedFetch("/api/interview/prep", {
        company: company.trim(),
        jobTitle: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
        profile: profile ? profileSummary(profile) : "",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to build prep pack");
      setIntel(data.intel || null);
      setPack(data.pack || null);
      if (auth?.currentUser) await loadRecentPacks(auth.currentUser.uid);
    } catch (err) {
      setBuildError((err as Error).message);
    } finally {
      setBuilding(false);
    }
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
              <p className="text-gray-400">Grounded in your resume, the JD, and public company data — reviews, questions, salary bands.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Build my prep pack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Company</Label>
                    <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Razorpay" />
                  </div>
                  <div className="space-y-1">
                    <Label>Role</Label>
                    <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Product Manager" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Job description (optional)</Label>
                  <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={5} placeholder="Paste the JD here…" />
                </div>
                {buildError && <p className="text-sm text-red-400">{buildError}</p>}
                <Button onClick={buildPrepPack} disabled={building}>
                  {building ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Researching {company || "…"}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Build my prep pack
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {intel && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    {company} — company intel
                    <Badge variant={intel.verified ? "default" : "secondary"}>
                      {intel.verified ? "live public data" : "unverified"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-400">{intel.overview}</p>
                  {intel.rating != null && (
                    <div>
                      Rating: <b>{intel.rating}</b>/5
                    </div>
                  )}
                  {(intel.redFlags || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {intel.redFlags.map((f, i) => (
                        <span key={i} className="text-yellow-400 text-sm flex items-center gap-1">
                          <Flag className="w-3 h-3" /> {f}
                        </span>
                      ))}
                    </div>
                  )}
                  {(intel.salaryBands || []).map((s, i) => (
                    <div key={i} className="text-gray-400 text-sm">
                      {s.role}: {s.range}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {pack && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Your 60-second story</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap font-sans text-gray-200">{pack.story}</pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Likely questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(pack.likelyQuestions || []).map((q, i) => (
                      <div key={i}>
                        <p className="font-semibold">{q.q}</p>
                        <p className="text-sm text-gray-400 my-1">{q.whyAsked}</p>
                        <p className="text-sm text-green-400">{q.strongAnswer}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Talking points</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {(pack.talkingPoints || []).map((t, i) => (
                        <Badge key={i} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Ask them</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {(pack.questionsToAsk || []).map((t, i) => (
                        <Badge key={i}>{t}</Badge>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {recentPacks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent prep packs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentPacks.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm border-t border-gray-700 pt-2 first:border-t-0 first:pt-0">
                      <span>
                        {p.company} {p.jobTitle ? `— ${p.jobTitle}` : ""}
                      </span>
                      <span className="text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <MockInterviewCard company={company} jobTitle={jobTitle} jobDescription={jobDescription} profile={profile} />
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
