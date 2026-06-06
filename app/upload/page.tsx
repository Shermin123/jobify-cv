"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import { supabase } from "@/lib/supabase";
import { checkSubscription } from "@/lib/checkSubscription";
export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const resultRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [text, setText] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [country, setCountry] = useState("");

  const [cv, setCv] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [atsScore, setAtsScore] = useState(94);

  const [displayCv, setDisplayCv] = useState("");
  const [displayCoverLetter, setDisplayCoverLetter] = useState("");

  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
  const savedCountry = sessionStorage.getItem("jobify_country");
const savedRole = sessionStorage.getItem("jobify_role");
const savedFreeCvText = sessionStorage.getItem("jobify_free_cv_text");

if (savedCountry) setCountry(savedCountry);
if (savedRole) setJobRole(savedRole);
if (savedFreeCvText) setText(savedFreeCvText);

  const checkAccessStatus = async () => {
    if (!session?.user?.email) {
      setIsUnlocked(false);
      return;
    }

    const hasAccess = await checkSubscription(session.user.email);
    setIsUnlocked(hasAccess);
  };

  checkAccessStatus();
}, [session?.user?.email]);

  const clearTypingTimer = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  };

  const typeText = (
    fullCvText: string,
    fullCoverText: string,
    speed = 16,
    onComplete?: () => void
  ) => {
    clearTypingTimer();

    setDisplayCv("");
    setDisplayCoverLetter("");
    setTyping(true);
    setShowUnlock(false);

    let index = 0;
    const maxLength = Math.max(fullCvText.length, fullCoverText.length);

    typingTimerRef.current = setInterval(() => {
      index += 3;

      setDisplayCv(fullCvText.substring(0, index));
      setDisplayCoverLetter(fullCoverText.substring(0, index));

      if (index >= maxLength) {
        clearTypingTimer();
        if (onComplete) onComplete();
      }
    }, speed);
  };

  const typeDocuments = (finalCv: string, finalCoverLetter: string) => {
    const cvPreview = finalCv.substring(0, 900);
    const coverPreview = finalCoverLetter.substring(0, 800);

    typeText(cvPreview, coverPreview, 16, () => {
      setTimeout(() => {
        setTyping(false);
        setShowUnlock(true);
      }, 700);
    });
  };

  const copyText = async (value: string, label: string) => {
    if (!value) {
      alert(`${label} is empty`);
      return;
    }

    await navigator.clipboard.writeText(value);
    alert(`${label} copied!`);
  };
  const downloadPDF = (title: string, content: string, fileName: string) => {
  if (!content) {
    alert(`${title} is empty`);
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 6;

  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(title, margin, y);

  y += 12;

  doc.setFontSize(11);

  const keywordList = keywords
    .filter(Boolean)
    .map((k) => k.trim())
    .filter(Boolean);

  const escapeRegex = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const keywordRegex =
    keywordList.length > 0
      ? new RegExp(`(${keywordList.map(escapeRegex).join("|")})`, "gi")
      : null;

  const paragraphs = content.split("\n");

  paragraphs.forEach((paragraph) => {
    const wrappedLines = doc.splitTextToSize(paragraph || " ", maxWidth);

    wrappedLines.forEach((line: string) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      if (!keywordRegex) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(55, 65, 81);
        doc.text(line, margin, y);
        y += lineHeight;
        return;
      }

      const parts = line.split(keywordRegex);
      let x = margin;

      parts.forEach((part: string) => {
        if (!part) return;

        const isKeyword = keywordList.some(
          (keyword) => keyword.toLowerCase() === part.toLowerCase()
        );

        if (isKeyword) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(37, 99, 235);
        } else {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(55, 65, 81);
        }

        doc.text(part, x, y);
        x += doc.getTextWidth(part);
      });

      y += lineHeight;
    });

    y += 2;
  });

  doc.save(fileName);
};
  const highlightKeywords = (content: string, highlightColor: "blue" | "purple") => {
  if (!content) return null;

  if (!keywords.length) {
    return content;
  }

  const escapedKeywords = keywords
    .filter(Boolean)
    .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (!escapedKeywords.length) {
    return content;
  }

  const regex = new RegExp(`(${escapedKeywords.join("|")})`, "gi");

  return content.split(regex).map((part, index) => {
    const isKeyword = keywords.some(
      (keyword) => keyword.toLowerCase() === part.toLowerCase()
    );

    if (!isKeyword) {
      return <span key={index}>{part}</span>;
    }

    return (
      <strong
        key={index}
        className={
          highlightColor === "blue"
            ? "font-black text-blue-700 bg-blue-100 px-1 rounded"
            : "font-black text-purple-700 bg-purple-100 px-1 rounded"
        }
      >
        {part}
      </strong>
    );
  });
};

  const generateAll = async () => {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const saveGeneratedDocument = async (
  finalCv: string,
  finalCoverLetter: string,
  finalKeywords: string[],
  finalAtsScore: number
) => {
  if (!session?.user?.email) return;

  const { error } = await supabase.from("generated_documents").insert({
    user_email: session.user.email,
    job_role: jobRole,
    country,
    original_cv: text,
    job_description: jobDescription,
    optimized_cv: finalCv,
    cover_letter: finalCoverLetter,
    keywords: finalKeywords,
    ats_score: finalAtsScore,
  });

  if (error) {
    console.error("Supabase save error:", error.message);
  }
};
  if (!text) return alert("Please paste your CV first");

if (wordCount < 80) {
  return alert("Please paste at least 80 words from your CV for better AI results.");
}

    setLoading(true);
    setGenerated(true);
    setTyping(true);
    setShowUnlock(false);

    setCv("");
    setCoverLetter("");
    setKeywords([]);
    setDisplayCv("");
    setDisplayCoverLetter("");

    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    const fakeCvTyping = `Reading your CV...
Finding your strongest achievements...
Improving your professional summary...
Adding ATS keywords...
Rewriting your CV for recruiters...
Preparing your tailored CV preview...`;

    const fakeCoverTyping = `Reading the job description...
Matching your experience to the role...
Writing a personalised opening...
Improving professional tone...
Preparing your cover letter preview...`;

    typeText(fakeCvTyping, fakeCoverTyping, 25);

    try {
      const res = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: text,
          jobRole,
          country,
          jobDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to generate");

      const finalCv =
        data.optimizedCV ||
        data.cv ||
        "Your ATS-optimised CV has been generated successfully.";

      const finalCoverLetter =
        data.coverLetter ||
        "Your personalised cover letter has been generated successfully.";

      const finalKeywords = data.keywords || [];
const finalAtsScore = data.atsScore || 94;

setCv(finalCv);
setCoverLetter(finalCoverLetter);
setKeywords(finalKeywords);
setAtsScore(finalAtsScore);

await saveGeneratedDocument(
  finalCv,
  finalCoverLetter,
  finalKeywords,
  finalAtsScore
);

typeDocuments(finalCv, finalCoverLetter);
    } catch (err: any) {
      alert(err.message);
      setGenerated(false);
      setTyping(false);
      clearTypingTimer();
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockClick = () => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (!isUnlocked) {
      router.push("/pricing");
      return;
    }

    alert("Full access is active.");
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <main className="relative min-h-screen text-gray-900 overflow-x-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-100" />

        <div className="absolute top-[-160px] left-[-160px] w-[520px] h-[520px] bg-blue-200 rounded-full blur-[150px] opacity-35" />
        <div className="absolute bottom-[-180px] right-[-150px] w-[620px] h-[620px] bg-purple-200 rounded-full blur-[180px] opacity-30" />
        <div className="absolute top-[35%] left-[45%] w-[360px] h-[360px] bg-cyan-100 rounded-full blur-[130px] opacity-25" />

        <div className="absolute top-16 left-10 text-3xl opacity-10 animate-pulse">🚀</div>
        <div className="absolute top-28 right-20 text-3xl opacity-10">💼</div>
        <div className="absolute top-52 left-[20%] text-3xl opacity-10">📄</div>
        <div className="absolute top-72 right-[22%] text-3xl opacity-10">🎯</div>
        <div className="absolute bottom-28 left-14 text-3xl opacity-10">🌍</div>
        <div className="absolute bottom-20 right-20 text-3xl opacity-10">⭐</div>
      </div>

      {/* HEADER */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <div className="bg-white/85 backdrop-blur-xl border rounded-3xl p-6 shadow-sm text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            🚀 AI CV Studio
          </h1>

          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Paste your CV and job description. Jobify creates an ATS-friendly CV and cover letter in seconds.
          </p>

          {isUnlocked && (
            <div className="inline-flex mt-4 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-full text-sm font-bold">
              ✅ Subscription active — full access unlocked
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-10 space-y-6">
        {/* RESULTS */}
        {generated && (
          <section ref={resultRef} className="space-y-5">
            {/* PREMIUM STATUS BAR */}
            <div className="rounded-3xl bg-slate-950 text-white p-4 md:p-6 shadow-2xl overflow-hidden relative">
              <div className="absolute right-6 top-5 text-6xl opacity-10">
                {typing ? "✍️" : isUnlocked ? "✅" : "🔒"}
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <p className="text-sm text-blue-300 font-semibold">
                    {typing
                      ? "AI is writing your documents..."
                      : isUnlocked
                      ? "Full access active"
                      : "Preview generated"}
                  </p>

                  <h2 className="text-2xl md:text-3xl font-black mt-1">
                    {typing
                      ? "Creating your tailored CV package"
                      : isUnlocked
                      ? "Your documents are unlocked"
                      : "Your CV package is ready"}
                  </h2>

                  <p className="text-white/60 text-sm mt-2">
                    {typing
                      ? "Matching keywords, improving structure and writing your application."
                      : isUnlocked
                      ? "You can copy and use your full CV and cover letter."
                      : "ATS score and keywords are visible. Subscribe to unlock documents."}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 min-w-full md:min-w-[360px]">
                  <div className="bg-white/10 rounded-2xl p-3 text-center">
                    <p className="text-xs text-white/50">ATS</p>
                    <h3 className="text-2xl font-black text-emerald-300">
                      {atsScore}%
                    </h3>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-3 text-center">
                    <p className="text-xs text-white/50">Docs</p>
                    <h3 className="text-2xl font-black">2</h3>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-3 text-center">
                    <p className="text-xs text-white/50">Words</p>
                    <h3 className="text-2xl font-black text-blue-300">
                      {keywords.length || 8}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* KEYWORDS */}
            <div className="bg-white/90 backdrop-blur-xl border rounded-3xl p-5 shadow-sm">
              <h3 className="font-black text-lg mb-3">
                🎯 ATS Keywords Detected
              </h3>

              <div className="flex flex-wrap gap-2">
                {keywords.length > 0 ? (
                  keywords.map((k, i) => (
                    <span
                  key={i}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-black shadow-md"
            >
            <span>✓</span>
                <strong>{k}</strong>
                </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Keywords will appear here after generation.
                  </p>
                )}
              </div>
            </div>

            {/* DOCUMENT PREVIEW CARDS */}
<div className="grid lg:grid-cols-2 gap-6">
  {/* CV CARD */}
  <div className="group relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white/90 backdrop-blur-xl shadow-2xl transition-all duration-700 hover:-translate-y-2 hover:shadow-blue-200/60">
    <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 bg-[length:200%_100%] animate-gradientMove" />
    <div className="absolute -top-24 -right-24 h-52 w-52 rounded-full bg-blue-200 blur-3xl opacity-40 group-hover:opacity-70 transition" />

    <div className="relative p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition duration-500">
            📄
          </div>

          <div>
            <h3 className="font-black text-lg">Generated CV</h3>
            <p className="text-xs text-gray-500">ATS-ready resume preview</p>
          </div>
        </div>

        <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 text-xs font-black animate-softPulse">
          {typing ? "WRITING" : isUnlocked ? "UNLOCKED" : "LOCKED"}
        </span>
      </div>

      <div className="relative mt-5 rounded-3xl bg-slate-50/90 border border-blue-100 p-4 h-[230px] md:h-[280px] overflow-hidden shadow-inner">
        {typing && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-blue-100/40 to-transparent -translate-x-full animate-shimmer" />
        )}

        <div
          className={`text-xs md:text-sm text-gray-700 whitespace-pre-line leading-5 md:leading-6 transition-all duration-700 ${
            isUnlocked ? "" : "blur-sm select-none"
          }`}
        >
          {highlightKeywords(displayCv, "blue")}
          {typing && (
            <span className="animate-pulse font-black text-blue-600">|</span>
          )}
        </div>

        {!isUnlocked && showUnlock && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-md flex items-center justify-center animate-fadeUp">
            <div className="text-center px-5">
              <div className="text-5xl mb-3 animate-bounce">🔒</div>
              <h4 className="font-black text-lg">Unlock full CV</h4>
              <p className="text-xs text-gray-500 mt-1">
                View, copy and download your full CV.
              </p>
            </div>
          </div>
        )}
      </div>

      {showUnlock && (
        <button
  onClick={() =>
    isUnlocked
      ? downloadPDF("Optimised CV", cv, "jobify-optimised-cv.pdf")
      : handleUnlockClick()
  }
  className="mt-4 w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-2xl font-black hover:scale-[1.02] transition shadow-lg"
>
  {isUnlocked ? "Download CV PDF" : "Subscribe to Unlock CV"}
</button>
      )}
    </div>
  </div>

  {/* COVER LETTER CARD */}
  <div className="group relative overflow-hidden rounded-[2rem] border border-purple-100 bg-white/90 backdrop-blur-xl shadow-2xl transition-all duration-700 hover:-translate-y-2 hover:shadow-purple-200/60">
    <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%] animate-gradientMove" />
    <div className="absolute -top-24 -right-24 h-52 w-52 rounded-full bg-purple-200 blur-3xl opacity-40 group-hover:opacity-70 transition" />

    <div className="relative p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition duration-500">
            ✉️
          </div>

          <div>
            <h3 className="font-black text-lg">Cover Letter</h3>
            <p className="text-xs text-gray-500">Personalised application letter</p>
          </div>
        </div>

        <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 text-xs font-black animate-softPulse">
          {typing ? "WRITING" : isUnlocked ? "UNLOCKED" : "LOCKED"}
        </span>
      </div>

      <div className="relative mt-5 rounded-3xl bg-slate-50/90 border border-purple-100 p-4 h-[230px] md:h-[280px] overflow-hidden shadow-inner">
        {typing && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-purple-100/40 to-transparent -translate-x-full animate-shimmer" />
        )}

        <div
          className={`text-xs md:text-sm text-gray-700 whitespace-pre-line leading-5 md:leading-6 transition-all duration-700 ${
            isUnlocked ? "" : "blur-sm select-none"
          }`}
        >
          {highlightKeywords(displayCoverLetter, "purple")}
          {typing && (
            <span className="animate-pulse font-black text-purple-600">|</span>
          )}
        </div>

        {!isUnlocked && showUnlock && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-md flex items-center justify-center animate-fadeUp">
            <div className="text-center px-5">
              <div className="text-5xl mb-3 animate-bounce">🔒</div>
              <h4 className="font-black text-lg">Unlock cover letter</h4>
              <p className="text-xs text-gray-500 mt-1">
                Copy and send your personalised letter.
              </p>
            </div>
          </div>
        )}
      </div>

      {showUnlock && (
        <button
  onClick={() =>
    isUnlocked
      ? downloadPDF("Cover Letter", coverLetter, "jobify-cover-letter.pdf")
      : handleUnlockClick()
  }
  className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-2xl font-black hover:scale-[1.02] transition shadow-lg"
>
  {isUnlocked ? "Download Cover Letter PDF" : "Subscribe to Unlock Letter"}
</button>
      )}
    </div>
  </div>
</div>

            {/* COPY BUTTONS */}
            {isUnlocked && showUnlock && (
  <div className="grid md:grid-cols-3 gap-3">
    <button
      onClick={() => copyText(cv, "CV")}
      className="bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg"
    >
      Copy CV
    </button>

    <button
      onClick={() => copyText(coverLetter, "Cover letter")}
      className="bg-purple-600 text-white py-3 rounded-2xl font-bold hover:bg-purple-700 shadow-lg"
    >
      Copy Cover Letter
    </button>

    <button
      onClick={() => copyText(keywords.join(", "), "Keywords")}
      className="bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg"
    >
      Copy Keywords
    </button>

  </div>
)}

            {!isUnlocked && showUnlock && (
              <button
                onClick={() => router.push("/pricing")}
                className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-800 shadow-xl"
              >
                Subscribe to Unlock Full Result
              </button>
            )}
          </section>
        )}

        {/* INPUT FORM */}
<div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/90 backdrop-blur-xl shadow-2xl">

  <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500" />

  <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-100 blur-3xl opacity-70" />
  <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-100 blur-3xl opacity-70" />

  <div className="relative p-4 md:p-7 space-y-5 md:space-y-6">

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
          ✨ AI CV Builder
        </div>

        <h2 className="mt-3 text-xl md:text-2xl font-black text-slate-900">
          Create your tailored application
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Paste your CV and job description. Jobify will rewrite your CV and cover letter for the role.
        </p>
      </div>

      <div className="bg-slate-50 border rounded-2xl p-3 min-w-[260px]">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide text-center mb-2">
          Powered by AI workflow
        </p>

        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
              className="h-5"
              alt="OpenAI"
            />
            <span className="text-xs font-semibold text-slate-700">
              OpenAI
            </span>
          </div>

          <div className="flex items-center gap-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
              className="h-5"
              alt="AI"
            />
            <span className="text-xs font-semibold text-slate-700">
              ATS AI
            </span>
          </div>
        </div>
      </div>
    </div>

    <div>
      <label className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-800">
          Target Job Role
        </span>
        <span className="text-xs text-slate-400">
          Optional but recommended
        </span>
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
          🎯
        </span>

        <input
          className="w-full border border-slate-200 bg-slate-50/70 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          placeholder="e.g. Software Engineer, Data Analyst, AI Engineer"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
        />
      </div>
    </div>

    <div className="grid lg:grid-cols-2 gap-5">

      <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-sm font-black text-slate-900">
              📄 Paste Your CV
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Minimum 80 words required for better results.
            </p>
          </div>

          <span className="rounded-full bg-blue-600 text-white px-3 py-1 text-[10px] font-black">
            REQUIRED
          </span>
        </div>

        <textarea
          className="w-full border border-blue-100 bg-white p-3 md:p-4 rounded-2xl h-44 md:h-64 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-inner text-sm leading-6"
          placeholder="Paste your CV here...

Example:
Professional Summary
Work Experience
Skills
Education
Projects"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-3 flex items-center justify-between text-xs">
          <span
            className={
              text.trim().split(/\s+/).filter(Boolean).length < 80
                ? "text-red-500 font-semibold"
                : "text-green-600 font-semibold"
            }
          >
            {text.trim().split(/\s+/).filter(Boolean).length} / 80 words
          </span>

          <span className="text-slate-500">
            Best result: 150+ words
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-sm font-black text-slate-900">
              💼 Paste Job Description
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Add the job advert for stronger keyword matching.
            </p>
          </div>

          <span className="rounded-full bg-purple-600 text-white px-3 py-1 text-[10px] font-black">
            RECOMMENDED
          </span>
        </div>

        <textarea
          className="w-full border border-purple-100 bg-white p-3 md:p-4 rounded-2xl h-44 md:h-64 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none shadow-inner text-sm leading-6"
          placeholder="Paste the job description here...

Example:
Responsibilities
Required skills
Experience needed
Company requirements"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            {jobDescription.trim().split(/\s+/).filter(Boolean).length} words
          </span>
          <span>Improves ATS keyword match</span>
        </div>
      </div>

    </div>

    <button
      onClick={generateAll}
      disabled={
        loading ||
        !text ||
        text.trim().split(/\s+/).filter(Boolean).length < 80
      }
      className="group relative w-full overflow-hidden rounded-2xl bg-black py-4 font-black text-white shadow-xl transition hover:bg-slate-900 disabled:opacity-50"
    >
      <span className="relative z-10">
        {loading ? "Generating documents..." : "🚀 Generate Tailored CV & Cover Letter"}
      </span>

      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition duration-700" />
    </button>

    {text && text.trim().split(/\s+/).filter(Boolean).length < 80 && (
      <p className="text-center text-sm font-semibold text-red-500">
        Please add at least 80 words from your CV to continue.
      </p>
    )}

    {loading && (
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-center">
        <p className="text-sm font-semibold text-blue-700 animate-pulse">
          Analysing CV, extracting keywords, and matching your experience to the job...
        </p>
      </div>
    )}

  </div>
</div>

        {!generated && (
          <div className="bg-white/90 backdrop-blur-xl border rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-black">Your results will appear here</h2>

            <p className="text-sm text-gray-500 mt-2">
              Keywords and ATS score are visible after generation. CV and cover letter unlock after subscription.
            </p>
          </div>
        )}
      </section>
      <style jsx>{`
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes gradientMove {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 200% 50%;
    }
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes softPulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.04);
      opacity: 0.85;
    }
  }

  .animate-shimmer {
    animation: shimmer 1.4s infinite;
  }

  .animate-gradientMove {
    animation: gradientMove 3s linear infinite;
  }

  .animate-fadeUp {
    animation: fadeUp 0.5s ease-out;
  }

  .animate-softPulse {
    animation: softPulse 1.6s ease-in-out infinite;
  }
`}</style>
    </main>
  );
}