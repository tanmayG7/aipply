"use client";

import { useState } from "react";

const TONES = ["Professional", "Enthusiastic", "Concise", "Creative", "Formal", "Friendly"];

export default function CoverLetterPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [jd, setJd] = useState("");
  const [tone, setTone] = useState("Professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!jd.trim()) return alert("Please paste a job description.");
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, skills, jd, tone }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed?.delta?.text || "";
            if (delta) {
              text += delta;
              setOutput(text);
            }
          } catch {}
        }
      }
    } catch (err) {
      setOutput("Something went wrong. Please try again.");
      console.error(err);
    }

    setLoading(false);
  }

  async function copyText() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      <div className="text-center px-6 pt-16 pb-10">
        <span className="inline-block bg-purple-900/30 text-purple-300 border border-purple-700/40 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest mb-5">
          ✦ AI-Powered Tool
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Cover Letter{" "}
          <span className="bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text text-transparent">
            Generator
          </span>
        </h1>
        <p className="text-slate-400 text-base max-w-md mx-auto">
          Paste a job description and your details — get a tailored cover letter in seconds.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-7 flex flex-col gap-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Your Details</p>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">Your Name</label>
            <input
              className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-600 transition"
              placeholder="e.g. Tanmay Gupta"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">Your Role / Field</label>
            <input
              className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-600 transition"
              placeholder="e.g. Frontend Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">Key Skills (comma-separated)</label>
            <input
              className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-600 transition"
              placeholder="e.g. React, TypeScript, Node.js"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">Job Description</label>
            <textarea
              className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-600 transition resize-y min-h-[160px]"
              placeholder="Paste the full job description here…"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-medium">Tone</label>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition ${
                    tone === t
                      ? "border-purple-600 text-purple-300 bg-purple-900/20"
                      : "border-[#1e1e2e] text-slate-400 hover:border-purple-700 hover:text-purple-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating…
              </>
            ) : (
              <>⚡ {output ? "Regenerate" : "Generate Cover Letter"}</>
            )}
          </button>
        </div>

        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-7 flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Generated Cover Letter</p>

          <div className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl p-5 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap min-h-[400px] overflow-y-auto">
            {output ? (
              <>
                {output}
                {loading && <span className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 animate-pulse align-text-bottom" />}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3 text-center">
                <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Your cover letter will appear here</span>
              </div>
            )}
          </div>

          {output && !loading && (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-3">
                <span className="text-xs bg-purple-900/20 border border-purple-800/30 rounded-lg px-3 py-2 text-slate-400">
                  <strong className="text-purple-300 text-sm block">{wordCount}</strong>words
                </span>
                <span className="text-xs bg-purple-900/20 border border-purple-800/30 rounded-lg px-3 py-2 text-slate-400">
                  <strong className="text-purple-300 text-sm block">{output.length}</strong>chars
                </span>
              </div>
              <button
                onClick={copyText}
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border transition ${
                  copied
                    ? "border-green-600 text-green-400"
                    : "border-[#1e1e2e] text-slate-400 hover:border-purple-500 hover:text-purple-300"
                }`}
              >
                {copied ? "✓ Copied!" : "Copy Letter"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
