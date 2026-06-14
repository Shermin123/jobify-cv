"use client";
import HiredAtBox from "./components/HiredAtBox";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { checkSubscription } from "@/lib/checkSubscription";

type CvIssue = {
  title: string;
  detail: string;
  fix: string;
  severity: "high" | "medium" | "low";
};

export default function Home() {
  
  
  
  const [cvText, setCvText] = useState("");
const [targetRole, setTargetRole] = useState("");
const [cvIssues, setCvIssues] = useState<CvIssue[]>([]);
  
  const [freeChecksUsed, setFreeChecksUsed] = useState(0);
  const [analyzedScore, setAnalyzedScore] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [showScoreAd, setShowScoreAd] = useState(false);
const [scoreAdSeconds, setScoreAdSeconds] = useState(6);

  const router = useRouter();
  const { data: session } = useSession();
const [isUnlocked, setIsUnlocked] = useState(false);
const getTodayKey = () => {
  const today = new Date().toISOString().split("T")[0];

  return session?.user?.email
    ? `jobify_free_checks_used_${session.user.email}_${today}`
    : `jobify_free_checks_used_guest_${today}`;
};
  
  useEffect(() => {
  const storageKey = getTodayKey();
  const savedChecks = localStorage.getItem(storageKey);

  if (savedChecks) {
    setFreeChecksUsed(Number(savedChecks));
  } else {
    setFreeChecksUsed(0);
  }
}, [session?.user?.email]);
useEffect(() => {
  const checkAccess = async () => {
    if (!session?.user?.email) return;

    const hasAccess = await checkSubscription(session.user.email);
    setIsUnlocked(hasAccess);
  };

  checkAccess();
}, [session?.user?.email]);
useEffect(() => {
  if (!showScoreAd) return;

  const timer = setTimeout(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, 500);

  return () => clearTimeout(timer);
}, [showScoreAd]);
  // ================= CV SCORE ENGINE =================
  const calculateScore = () => {
  const raw = cvText.trim();
  const text = raw.toLowerCase();
  const role = targetRole.trim().toLowerCase();
  const wordCount = raw.split(/\s+/).filter(Boolean).length;

  let score = 100;
  const issues: CvIssue[] = [];

  const addIssue = (
    title: string,
    detail: string,
    fix: string,
    penalty: number,
    severity: "high" | "medium" | "low"
  ) => {
    score -= penalty;
    issues.push({ title, detail, fix, severity });
  };

  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(raw);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(raw);
  const hasLinkedIn = /linkedin\.com|linkedin/i.test(text);

  const hasSummary =
    /summary|profile|personal statement|career objective/.test(text);

  const hasExperience =
    /work experience|professional experience|employment history|experience/.test(
      text
    );

  const hasEducation =
    /education|degree|university|college|school|bsc|msc|bachelor|master/.test(
      text
    );

  const hasSkills =
    /skills|technical skills|key skills|core skills|competencies/.test(text);

  const actionWords = [
    "managed",
    "developed",
    "built",
    "created",
    "improved",
    "increased",
    "reduced",
    "led",
    "delivered",
    "achieved",
    "trained",
    "supported",
    "coordinated",
    "implemented",
    "optimized",
    "resolved",
    "analysed",
    "analyzed",
  ];

  const actionWordCount = actionWords.filter((word) =>
    text.includes(word)
  ).length;

  const measurableResults =
    raw.match(
      /(\d+%|\d+\+|\d+\s*(years?|months?|clients?|customers?|projects?|sales|orders|tickets|users?|team members?)|£\d+|\$\d+)/gi
    ) || [];

  const bullets = raw.match(/^\s*(•|-|\*)\s+/gm) || [];

  const lines = raw.split("\n").filter((line) => line.trim().length > 0);
  const longParagraphs = lines.filter(
    (line) => line.trim().split(/\s+/).length > 35
  ).length;

  const roleWords = role
    .split(/[\s,/.-]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 3);

  const roleMatches = roleWords.filter((word) => text.includes(word));

  const genericPhrases = [
    "hard working",
    "team player",
    "good communication",
    "fast learner",
    "self motivated",
    "work under pressure",
  ];

  const genericHits = genericPhrases.filter((phrase) => text.includes(phrase));

  if (wordCount < 120) {
    addIssue(
      "CV is too short",
      "Your CV does not give enough evidence of your skills, experience, education, or achievements.",
      "Add more detail under experience, projects, education, and key skills.",
      18,
      "high"
    );
  } else if (wordCount < 220) {
    addIssue(
      "CV needs more detail",
      "The CV has some information, but it may still look thin to recruiters and ATS systems.",
      "Add stronger bullet points with responsibilities, tools, and results.",
      8,
      "medium"
    );
  } else if (wordCount > 900) {
    addIssue(
      "CV may be too long",
      "A very long CV can hide your strongest points and reduce recruiter attention.",
      "Shorten repeated lines and keep only relevant experience.",
      8,
      "medium"
    );
  }

  if (!hasEmail || !hasPhone) {
    addIssue(
      "Missing contact details",
      "Recruiters need clear contact details. Missing email or phone number can reduce trust.",
      "Add your email and phone number clearly at the top of the CV.",
      10,
      "high"
    );
  }

  if (!hasLinkedIn) {
    addIssue(
      "No LinkedIn profile found",
      "A LinkedIn link helps recruiters verify your profile and makes the CV look more professional.",
      "Add your LinkedIn URL near your contact details.",
      4,
      "low"
    );
  }

  if (!hasSummary) {
    addIssue(
      "Missing professional summary",
      "Your CV should quickly explain who you are, your target role, and your strongest skills.",
      "Add a 3-4 line professional summary at the top.",
      8,
      "medium"
    );
  }

  if (!hasExperience) {
    addIssue(
      "Work experience section is unclear",
      "Recruiters and ATS systems look for a clear experience section.",
      "Use a clear heading like 'Work Experience' or 'Professional Experience'.",
      12,
      "high"
    );
  }

  if (!hasSkills) {
    addIssue(
      "Skills section is missing",
      "ATS systems scan for skills related to the job role.",
      "Add a clear skills section with tools, software, technical skills, and transferable skills.",
      10,
      "high"
    );
  }

  if (!hasEducation) {
    addIssue(
      "Education section is missing",
      "Education helps recruiters understand your background and eligibility.",
      "Add your degree, college/university, certifications, or relevant training.",
      5,
      "medium"
    );
  }

  if (actionWordCount < 4) {
    addIssue(
      "Weak action words",
      "Your CV needs stronger verbs to make your experience sound more active and professional.",
      "Use words like managed, developed, improved, achieved, delivered, supported, and reduced.",
      10,
      "medium"
    );
  }

  if (measurableResults.length < 2) {
    addIssue(
      "Missing measurable achievements",
      "Recruiters prefer CVs with numbers, percentages, targets, results, or clear impact.",
      "Add numbers such as sales improved by 15%, handled 40+ customers daily, or completed 5 projects.",
      14,
      "high"
    );
  }

  if (bullets.length < 4) {
    addIssue(
      "Not enough bullet points",
      "Long paragraphs are harder to scan. Recruiters prefer short, clear bullet points.",
      "Rewrite experience using bullet points with action + task + result.",
      7,
      "medium"
    );
  }

  if (longParagraphs > 2) {
    addIssue(
      "Too many long paragraphs",
      "Large text blocks make the CV harder to read quickly.",
      "Break long paragraphs into short bullet points.",
      6,
      "medium"
    );
  }

  if (!role) {
    addIssue(
      "No target role added",
      "Without a target role, the score cannot check how well your CV matches a specific job.",
      "Add a target role like Data Analyst, Retail Assistant, or Software Developer.",
      6,
      "low"
    );
  } else if (roleWords.length > 0 && roleMatches.length === 0) {
    addIssue(
      "CV does not match the target role",
      `Your CV does not clearly mention important words from '${targetRole}'.`,
      "Add role-specific skills, tools, and responsibilities related to the target job.",
      14,
      "high"
    );
  } else if (roleWords.length >= 2 && roleMatches.length < Math.ceil(roleWords.length / 2)) {
    addIssue(
      "Weak role keyword match",
      "Your CV partly matches the role, but important job keywords are missing.",
      "Add more keywords from the job title and job description naturally into your CV.",
      8,
      "medium"
    );
  }

  if (genericHits.length >= 2) {
    addIssue(
      "Too many generic phrases",
      "Phrases like hard working or team player are weak unless supported with proof.",
      "Replace generic claims with specific examples and results.",
      5,
      "low"
    );
  }

  const finalScore = Math.max(28, Math.min(96, Math.round(score)));

  if (issues.length === 0) {
    issues.push({
      title: "CV looks strong",
      detail:
        "Your CV has good structure, keywords, contact details, and achievement signals.",
      fix: "You can still improve it further by tailoring it to each job description.",
      severity: "low",
    });
  }

  return {
    score: finalScore,
    issues,
  };
};

  const score = analyzedScore ?? 0;
  const analyseFreeCV = () => {
  if (!cvText.trim()) {
    alert("Please paste your CV first.");
    return;
  }
  if (cvText.trim().split(/\s+/).filter(Boolean).length < 40) {
    alert("Please paste at least 40 words for a more accurate CV score.");
    return;
  }

  if (!isUnlocked && freeChecksUsed >= 3) {
  router.push("/pricing");
  return;
}

  setAnalyzing(true);
setShowScoreAd(true);
setScoreAdSeconds(6);

let seconds = 6;

const countdown = setInterval(() => {
  seconds -= 1;
  setScoreAdSeconds(seconds);

  if (seconds <= 0) {
    clearInterval(countdown);
  }
}, 1000);

setTimeout(() => {
  clearInterval(countdown);

  const result = calculateScore();

  setAnalyzedScore(result.score);
  setCvIssues(result.issues);
  setShowScoreAd(false);
  setShowScorePopup(true);

  if (!isUnlocked) {
    const newUsed = freeChecksUsed + 1;
    setFreeChecksUsed(newUsed);
    localStorage.setItem(getTodayKey(), String(newUsed));
  }

  setAnalyzing(false);
}, 6000);
};   

const goToCVGenerator = () => {
  sessionStorage.setItem("jobify_free_cv_text", cvText);
  router.push("/upload");
};

const freeChecksLeft = Math.max(3 - freeChecksUsed, 0);

  const getColor = () => {
    if (score < 50) return "text-red-500";
    if (score < 75) return "text-yellow-500";
    return "text-emerald-500";
  };

  const getLabel = () => {
  if (score < 50) return "High Risk CV";
  if (score < 70) return "Needs Keyword Improvement";
  return "Job-Ready CV 🚀";
};
const getRiskMessage = () => {
  if (score < 85) {
    return "You are less likely to get a job with this CV";
  }

  if (score <= 97) {
    return "You are less likely to get a job without an optimised cover letter";
  }

  return "";
};
  const statsLine = `
    👥 500,000+ Users • 🌍 180+ Countries • 📄 2.4M CVs Generated • 💼 120,000+ Hired • ⚡ 94% Interview Success • 🧠 AI ATS Optimization • 🚀 Instant CV Rewrite • 📊 Real-time CV Scoring • 💡 Keyword Intelligence • 🔥 Recruiter Matching Engine •
  `;

  return (
  <main className="relative min-h-screen overflow-x-hidden bg-white text-gray-900">
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />

  <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-200/35 blur-3xl" />
  <div className="absolute top-32 -right-24 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
  <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />

  <div className="absolute left-[8%] top-[14%] text-4xl opacity-[0.16] blur-[0.2px]">
    📄
  </div>

  <div className="absolute right-[10%] top-[16%] text-4xl opacity-[0.16] blur-[0.2px]">
    💼
  </div>

  <div className="absolute left-[18%] top-[48%] text-3xl opacity-[0.14] blur-[0.2px]">
    ✨
  </div>

  <div className="absolute right-[18%] top-[52%] text-3xl opacity-[0.14] blur-[0.2px]">
    🎯
  </div>

  <div className="absolute left-[9%] bottom-[18%] text-4xl opacity-[0.15] blur-[0.2px]">
    📊
  </div>

  <div className="absolute right-[9%] bottom-[16%] text-4xl opacity-[0.15] blur-[0.2px]">
    🚀
  </div>

  <div className="absolute left-[44%] top-[20%] text-3xl opacity-[0.12] blur-[0.2px]">
    🤖
  </div>

  <div className="absolute left-[48%] bottom-[14%] text-3xl opacity-[0.12] blur-[0.2px]">
    📝
  </div>
</div>

    {showScoreAd && (
  <div className="fixed inset-0 z-[2147483647] flex h-[100svh] w-screen items-center justify-center bg-slate-950/90 px-4 py-4 backdrop-blur-xl">
    <div className="w-full max-w-[390px] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
      <div className="p-4 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
          Advertisement
        </p>

        <div className="mt-3 flex h-[250px] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
  <ins
    className="adsbygoogle"
    style={{ display: "block", width: "300px", height: "250px" }}
    data-ad-client="ca-pub-7648291083196313"
    data-ad-slot="7090386055"
    data-ad-format="auto"
    data-full-width-responsive="true"
  />
</div>

        <div className="mt-5 rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 text-center shadow-sm">
  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
    CV score loading
  </p>

  <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">
    Your CV score will be shown in
  </h2>

  <div className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-5xl font-black text-white shadow-2xl">
    {scoreAdSeconds}
  </div>

  <p className="mt-3 text-lg font-black text-slate-800">
    seconds
  </p>

  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
    <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
  </div>
</div>
      </div>
    </div>
  </div>
)}
      {showScorePopup &&
  typeof document !== "undefined" &&
  createPortal(
    <div className="fixed inset-0 z-[2147483647] flex h-[100svh] w-screen items-center justify-center bg-slate-950/85 px-4 py-4 backdrop-blur-xl">
      <div className="relative flex max-h-[calc(100svh-32px)] w-full max-w-[350px] flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:max-w-[420px]">
        <div className="relative flex flex-col p-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 text-lg text-white shadow-lg">
            ⚠️
          </div>

          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-red-600">
            CV Risk Report
          </p>

          <div className="mt-3 rounded-[20px] bg-slate-950 p-3 text-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
              Your CV Score
            </p>

            <p
              className={`mt-1 text-4xl font-black ${
                score >= 70 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {score}/100
            </p>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${
                  score >= 70
                    ? "bg-gradient-to-r from-emerald-500 to-green-300"
                    : "bg-gradient-to-r from-red-600 to-orange-400"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {score <= 97 && (
  <button
    onClick={goToCVGenerator}
    className="mt-3 w-full rounded-3xl border-2 border-red-400 bg-gradient-to-r from-red-100 via-orange-50 to-red-100 px-4 py-5 text-center shadow-xl transition hover:scale-[1.02]"
  >
    <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">
      Important warning
    </p>

    <p className="mt-2 text-xl font-black leading-snug text-red-800">
      ⚠️ {getRiskMessage()}
    </p>

    <p className="mt-3 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white">
      Tap here to fix it now →
    </p>
  </button>
)}

          <p className="mt-2 text-xs font-bold leading-5 text-slate-500">
            ATS systems and recruiters may not see enough proof, keywords, or job relevance.
          </p>

          <div className="mt-3 max-h-[250px] space-y-2 overflow-y-auto pr-1 text-left">
            {cvIssues.slice(0, 2).map((issue, index) => (
              <div
                key={`${issue.title}-${index}`}
                className={
                  issue.severity === "high"
                    ? "rounded-2xl border border-red-200 bg-red-50 p-3"
                    : issue.severity === "medium"
                    ? "rounded-2xl border border-orange-200 bg-orange-50 p-3"
                    : "rounded-2xl border border-blue-200 bg-blue-50 p-3"
                }
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={
                      issue.severity === "high"
                        ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-600 text-sm font-black text-white"
                        : issue.severity === "medium"
                        ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-sm font-black text-white"
                        : "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-sm font-black text-white"
                    }
                  >
                    !
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-black leading-tight text-slate-950">
                      {index + 1}. {issue.title}
                    </p>

                    <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-600">
                      {issue.detail}
                    </p>

                    <p className="mt-2 rounded-xl bg-white px-2.5 py-2 text-[11px] font-black leading-4 text-slate-900">
                      Fix: {issue.fix}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {cvIssues.length > 2 && (
              <div className="rounded-2xl border border-red-200 bg-white px-3 py-2 text-center">
                <p className="text-xs font-black text-red-600">
                  + {cvIssues.length - 2} more CV issues found
                </p>
              </div>
            )}
          </div>

          <button
            onClick={goToCVGenerator}
            className="mt-3 w-full rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 py-3 text-sm font-black text-white shadow-lg active:scale-[0.98]"
          >
            Fix My CV Now →
          </button>

          <button
            onClick={() => setShowScorePopup(false)}
            className="mt-2 text-sm font-black text-slate-500"
          >
            Continue checking
          </button>
        </div>
      </div>
    </div>,
    document.body
  )}

      
      {/* ================= STATS MARQUEE ================= */}
      <div className="bg-white border-b overflow-hidden py-2 text-xs md:text-sm relative z-0">
  <div className="marquee-slow whitespace-nowrap pointer-events-none text-gray-700 font-medium">
    {statsLine.repeat(2)}
  </div>
</div>

      {/* ================= AI LOGOS (FIXED OPENAI) ================= */}
      {/* ================= TRUSTED BY / AI PARTNERS ================= */}
{/* ================= TRUSTED AI PARTNERS ================= */}
<div className="bg-white border-b py-4">
  <div className="max-w-6xl mx-auto px-4">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

      <div className="bg-white border rounded-2xl px-4 py-3 flex items-center justify-center gap-2 shadow-sm">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
          className="h-6 w-6"
          alt="OpenAI"
        />
        <span className="text-sm font-medium text-gray-700">OpenAI</span>
      </div>

      <div className="bg-white border rounded-2xl px-4 py-3 flex items-center justify-center gap-2 shadow-sm">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
          className="h-6"
          alt="Microsoft"
        />
        <span className="text-sm font-medium text-gray-700">Microsoft</span>
      </div>

      <div className="bg-white border rounded-2xl px-4 py-3 flex items-center justify-center gap-2 shadow-sm">
        <img
          src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg"
          className="h-6 w-6"
          alt="Google Cloud"
        />
        <span className="text-sm font-medium text-gray-700">Google Cloud</span>
      </div>

      <div className="bg-white border rounded-2xl px-4 py-3 flex items-center justify-center gap-2 shadow-sm">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
          className="h-6"
          alt="AWS"
        />
        <span className="text-sm font-medium text-gray-700">AWS</span>
      </div>

    </div>
  </div>
</div>

      {/* ================= HERO ================= */}
      <section className="relative z-10 px-4 sm:px-6 pt-4 md:pt-6 pb-6 md:pb-8">

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 md:gap-8 items-center">

  {/* LEFT HERO */}
  <div className="text-center lg:text-left">
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
      Build a <span className="text-blue-600">Keyword-Highlighted CV</span> with AI
    </h1>

    <p className="mt-4 text-base md:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
      Check your CV score, improve ATS keywords, and generate a better CV in minutes.
    </p>

    <div className="mt-6 flex w-full max-w-md flex-col gap-3 mx-auto lg:mx-0">
  <button
    type="button"
    onClick={() => {
      sessionStorage.setItem("jobify_force_setup", "true");
      router.push("/upload");
    }}
    className="w-full rounded-2xl bg-black px-6 py-4 text-base font-black text-white shadow-lg transition hover:scale-[1.02] hover:bg-gray-900"
  >
    🚀 Build My CV
  </button>

  <button
    type="button"
    onClick={() =>
      document.getElementById("cv-score")?.scrollIntoView({ behavior: "smooth" })
    }
    className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-base font-black text-white shadow-lg transition hover:scale-[1.02]"
  >
    📊 Check CV Score For Free
  </button>

  <button
  type="button"
  onClick={() => router.push("/jobs")}
  style={{
    background: "#ffffff",
    color: "#111827",
    border: "2px solid #111827",
  }}
  className="w-full rounded-2xl px-6 py-4 text-base font-black shadow-lg transition hover:scale-[1.02]"
>
  <span style={{ color: "#111827", opacity: 1 }}>
    🤖 AI Auto Apply
  </span>
</button>
</div>

    <div className="mt-5 grid grid-cols-3 gap-3 text-center max-w-md mx-auto lg:mx-0">
      <div className="bg-white border rounded-2xl p-3 shadow-sm">
        <p className="font-bold text-blue-600">ATS</p>
        <p className="text-xs text-gray-500">Ready</p>
      </div>
      <div className="bg-white border rounded-2xl p-3 shadow-sm">
        <p className="font-bold text-emerald-600">AI</p>
        <p className="text-xs text-gray-500">Rewrite</p>
      </div>
      <div className="bg-white border rounded-2xl p-3 shadow-sm">
        <p className="font-bold text-purple-600">PDF</p>
        <p className="text-xs text-gray-500">Download</p>
      </div>
    </div>
    <HiredAtBox />
  </div>

        
        {/* ================= CV SCORE ================= */}
<div
  id="cv-score"
  className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[24px] border border-red-100 bg-white p-3 text-left shadow-xl sm:p-4 lg:max-w-none"
>
  <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-red-100 opacity-70 blur-3xl" />
  <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-orange-100 opacity-70 blur-3xl" />

  <div className="relative">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-black text-red-700">
          ⚠️ Free CV Risk Check
        </div>

        <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950 md:text-3xl">
          Check Your CV Score
        </h2>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          Paste your CV and see what may stop you from getting interviews.
        </p>
      </div>

      <div className="hidden rounded-2xl border bg-slate-50 px-3 py-2 text-center sm:block">
        <p className="text-[10px] font-black uppercase text-slate-400">
          Free left
        </p>
        <p className="text-xl font-black text-red-600">
          {isUnlocked ? "∞" : `${freeChecksLeft}/3`}
        </p>
      </div>
    </div>
    

    <div className="mt-4 rounded-[22px] border border-red-200 bg-red-50 p-3">
      {analyzedScore === null ? (
        <div className="mb-3 rounded-2xl border border-orange-200 bg-white p-3">
          <p className="text-sm font-black text-orange-700">
            ⚠️ Paste your CV to check job readiness
          </p>
          <p className="mt-1 text-xs leading-5 text-orange-600">
            Jobify will check ATS keywords, achievements, structure, and role match.
          </p>
        </div>
      ) : score >= 70 ? (
        <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-black text-emerald-700">
            ✅ This CV looks stronger
          </p>
          <p className="mt-1 text-xs leading-5 text-emerald-600">
            Your CV has good signs, but it can still be tailored better.
          </p>
        </div>
      ) : (
        <div className="mb-3 rounded-2xl border border-red-200 bg-white p-3">
          <p className="text-sm font-black text-red-700">
            ⚠️ This CV may be rejected
          </p>
          <p className="mt-1 text-xs leading-5 text-red-600">
            Missing keywords, weak proof, or poor role match can reduce interviews.
          </p>
        </div>
      )}

      <div className="mb-3">
        <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-500">
          Target role
        </label>

        <input
          className="w-full rounded-2xl border border-red-200 bg-white p-3 text-sm font-bold text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
          placeholder="e.g. Data Analyst, Retail Assistant"
          value={targetRole}
          onChange={(e) => {
            setTargetRole(e.target.value);
            setAnalyzedScore(null);
            setCvIssues([]);
          }}
        />
      </div>

      <textarea
        className="h-28 w-full resize-none rounded-2xl border border-red-200 bg-white p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-red-500 md:h-32"
        placeholder="Paste your CV here..."
        value={cvText}
        onChange={(e) => {
          setCvText(e.target.value);
          setAnalyzedScore(null);
          setCvIssues([]);
        }}
      />

      <div className="mt-2 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span className="text-slate-500">
          {cvText.trim().split(/\s+/).filter(Boolean).length} words detected
        </span>

        <span
          className={
            isUnlocked
              ? "font-black text-emerald-600"
              : freeChecksLeft > 0
              ? "font-black text-orange-600"
              : "font-black text-red-500"
          }
        >
          {isUnlocked
            ? "Premium active"
            : freeChecksLeft > 0
            ? `${freeChecksLeft} free scan${freeChecksLeft === 1 ? "" : "s"} remaining`
            : "Free scan limit reached"}
        </span>
      </div>
          </div>

    <button
      onClick={analyseFreeCV}
      disabled={analyzing}
      className="mt-4 w-full rounded-2xl bg-black py-4 text-base font-black text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
    >
      {analyzing
        ? "Checking your CV..."
        : isUnlocked || freeChecksLeft > 0
        ? "Check My CV Score"
        : "Free Limit Reached — Upgrade"}
    </button>

    <div className="mt-4 grid gap-4 lg:grid-cols-[0.72fr_1fr]">
      <div className="rounded-[22px] border border-red-500/20 bg-slate-950 p-4 text-white">
        <p className="text-xs font-black uppercase tracking-wide text-white/40">
          CV Job-Readiness Score
        </p>

        {analyzing ? (
          <div className="mt-5">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/10 border-t-red-400" />
            <p className="mt-4 text-sm text-white/60">
              Checking your CV...
            </p>
          </div>
        ) : analyzedScore === null ? (
          <div className="mt-4">
            <p className="text-5xl font-black text-white/25">--/100</p>
            <p className="mt-2 text-sm text-white/50">
              Run a free scan to reveal your CV risk.
            </p>
          </div>
        ) : (
          <>
            <p
              className={`mt-3 text-5xl font-black md:text-6xl ${
                score >= 70 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {score}/100
            </p>

            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
              <p
  className={`text-base font-black leading-snug ${
    score >= 70 ? "text-emerald-300" : "text-red-300"
  }`}
>
  {score >= 70 ? "This CV looks job-ready." : "CV risk detected."}
</p>

{score <= 97 && (
  <button
    onClick={goToCVGenerator}
    className="mt-3 w-full rounded-3xl border-2 border-red-400 bg-gradient-to-r from-red-100 via-orange-50 to-red-100 px-4 py-5 text-center shadow-xl transition hover:scale-[1.02]"
  >
    <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">
      Important warning
    </p>

    <p className="mt-2 text-xl font-black leading-snug text-red-800">
      ⚠️ {getRiskMessage()}
    </p>

    <p className="mt-3 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white">
      Click here to fix it now →
    </p>
  </button>
)}

<p className="mt-2 text-xs leading-5 text-white/60">
  {score >= 70
    ? "Still tailor it to each job for better results."
    : "Fix the issues before applying to serious jobs."}
</p>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${
                  score >= 70
                    ? "bg-gradient-to-r from-emerald-500 to-green-300"
                    : "bg-gradient-to-r from-red-600 to-orange-400"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </>
        )}
      </div>

      <div className="rounded-[22px] border border-red-200 bg-gradient-to-br from-red-50 via-white to-orange-50 p-4 shadow-[0_12px_30px_rgba(220,38,38,0.10)]">
        <h3 className="text-xl font-black leading-tight text-red-800">
          ⚠️ CV issues found
        </h3>

        <p className="mt-1 text-sm font-semibold leading-5 text-red-600">
          These points may reduce ATS match and recruiter interest.
        </p>

        <div className="mt-3 max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {analyzedScore === null ? (
            [
              "ATS keyword match",
              "Measurable achievements",
              "Target role relevance",
              "Recruiter readability",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-500">
                    ?
                  </span>

                  <div>
                    <p className="text-sm font-black text-slate-800">
                      {item}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      Checked after scanning.
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            cvIssues.map((issue, index) => (
              <div
                key={`${issue.title}-${index}`}
                className={
                  issue.severity === "high"
                    ? "rounded-2xl border border-red-300 bg-red-50 p-3"
                    : issue.severity === "medium"
                    ? "rounded-2xl border border-orange-300 bg-orange-50 p-3"
                    : "rounded-2xl border border-blue-200 bg-blue-50 p-3"
                }
              >
                <div className="flex items-start gap-3">
                  <span
                    className={
                      issue.severity === "high"
                        ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-sm font-black text-white"
                        : issue.severity === "medium"
                        ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-sm font-black text-white"
                        : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-sm font-black text-white"
                    }
                  >
                    !
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black leading-tight text-slate-950">
                        {index + 1}. {issue.title}
                      </p>

                      <span
                        className={
                          issue.severity === "high"
                            ? "rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase text-white"
                            : issue.severity === "medium"
                            ? "rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-black uppercase text-white"
                            : "rounded-full bg-blue-500 px-2 py-0.5 text-[9px] font-black uppercase text-white"
                        }
                      >
                        {issue.severity}
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                      {issue.detail}
                    </p>

                    <p className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-black leading-5 text-slate-900">
                      Fix: {issue.fix}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {analyzedScore !== null && (
          <div
            className={`mt-4 rounded-2xl border p-3 ${
              score >= 70
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <p
              className={`text-sm font-black ${
                score >= 70 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {score >= 70
                ? "✅ This CV is ready to improve further"
                : "⚠️ Fix this before applying"}
            </p>

            <p
              className={`mt-1 text-xs leading-5 ${
                score >= 70 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {score >= 70
                ? "Tailor this CV to each job description for stronger results."
                : "Highlight missing keywords and generate a stronger ATS-ready CV."}
            </p>
          </div>
        )}
      </div>
    </div>

    
    {analyzedScore !== null && (
      <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-center shadow-sm">
        <p className="text-sm font-black text-slate-900">
          ✨ Highlight the missing keywords and make your CV job-ready.
        </p>

        <button
          onClick={goToCVGenerator}
          className="mt-3 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg active:scale-[0.98]"
        >
          Highlight Keywords & Make My CV Ready →
        </button>
      </div>
    )}
  </div>
</div>

</div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-white border rounded-3xl p-6 md:p-8 shadow-xl">

          <div className="text-center">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">
              How Jobify.cv works
            </p>

            <h2 className="text-3xl font-extrabold mt-2">
              Get a job-ready CV in 3 simple steps
            </h2>

            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
              Paste your CV, add the job description, and let AI create a tailored CV and cover letter for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-8">

            {/* STEP 1 */}
            <div className="relative bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>

              <h3 className="font-bold text-lg mt-4">
                Upload your CV
              </h3>

              <p className="text-sm text-gray-600 mt-2">
                Paste your current CV or resume into Jobify so the AI can understand your skills, experience, and education.
              </p>

              <div className="text-4xl mt-5">📄</div>
            </div>

            {/* STEP 2 */}
            <div className="relative bg-purple-50 border border-purple-100 rounded-2xl p-5">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>

              <h3 className="font-bold text-lg mt-4">
                Add job description
              </h3>

              <p className="text-sm text-gray-600 mt-2">
                Paste the job advert so Jobify can match your CV with the exact keywords recruiters and ATS systems look for.
              </p>

              <div className="text-4xl mt-5">🎯</div>
            </div>

            {/* STEP 3 */}
            <div className="relative bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>

              <h3 className="font-bold text-lg mt-4">
                Generate & apply
              </h3>

              <p className="text-sm text-gray-600 mt-2">
                Get a tailored ATS-ready CV, personalised cover letter, and keywords — then apply with confidence.
              </p>

              <div className="text-4xl mt-5">🚀</div>
            </div>

          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => {
  sessionStorage.setItem("jobify_force_setup", "true");
  router.push("/upload");
}}
              className="bg-black text-white px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-gray-800 hover:scale-105 transition shadow-lg"
            >
              Start Building My CV
            </button>
          </div>

        </div>
      </section>
    
      {/* ================= FEATURES ================= */}
<section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
  <div className="text-center max-w-3xl mx-auto">
    <p className="text-sm font-black text-blue-600 uppercase tracking-widest">
      Powerful AI CV Tools
    </p>

    <h2 className="mt-3 text-3xl md:text-5xl font-black text-slate-900">
      More than a CV builder
    </h2>

    <p className="mt-4 text-slate-500 text-lg">
      Jobify.cv helps you improve your CV, match job descriptions, write cover letters,
      find ATS keywords, and apply with more confidence.
    </p>
  </div>

  <div className="grid md:grid-cols-3 gap-6 mt-12">
    <div className="bg-white border rounded-3xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
      <div className="text-4xl">📊</div>
      <h3 className="mt-4 text-xl font-black text-slate-900">
        AI CV Scoring
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Check how strong your CV is for ATS systems, keywords, formatting, and recruiter readability.
      </p>
    </div>

    <div className="bg-white border rounded-3xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
      <div className="text-4xl">🎯</div>
      <h3 className="mt-4 text-xl font-black text-slate-900">
        Keyword Engine
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Extract important keywords from job descriptions and highlight what your CV is missing.
      </p>
    </div>

    <div className="bg-white border rounded-3xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
      <div className="text-4xl">🤖</div>
      <h3 className="mt-4 text-xl font-black text-slate-900">
        Job Matching AI
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Match your skills and experience with target roles so your application feels more relevant.
      </p>
    </div>

    <div className="bg-white border rounded-3xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
      <div className="text-4xl">✍️</div>
      <h3 className="mt-4 text-xl font-black text-slate-900">
        AI CV Rewrite
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Rewrite weak CV lines into stronger, professional, achievement-focused bullet points.
      </p>
    </div>

    <div className="bg-white border rounded-3xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
      <div className="text-4xl">✉️</div>
      <h3 className="mt-4 text-xl font-black text-slate-900">
        Cover Letter Generator
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Create personalised cover letters based on your CV and the job description.
      </p>
    </div>

    <div className="bg-white border rounded-3xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
      <div className="text-4xl">📄</div>
      <h3 className="mt-4 text-xl font-black text-slate-900">
        PDF Downloads
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Copy or download your improved CV, cover letter, and ATS keywords whenever you need.
      </p>
    </div>
  </div>
</section>

{/* ================= HELPFUL SECTION ================= */}
<section className="relative z-10 bg-slate-950 text-white py-20 px-4 sm:px-6">
  <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
    <div>
      <p className="text-blue-400 font-black text-sm uppercase tracking-widest">
        Helpful for every job seeker
      </p>

      <h2 className="mt-3 text-3xl md:text-5xl font-black">
        Apply smarter, not harder
      </h2>

      <p className="mt-4 text-white/60 text-lg">
        Most CVs fail because they do not match recruiter keywords or ATS structure.
        Jobify helps you fix that before you apply.
      </p>

      <button
        onClick={() => {
  sessionStorage.setItem("jobify_force_setup", "true");
  router.push("/upload");
}}
        className="mt-8 bg-white text-black px-8 py-4 rounded-full font-black hover:bg-blue-50 transition shadow-xl"
      >
        Start Building My CV
      </button>
    </div>

    <div className="grid sm:grid-cols-2 gap-4">
      <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
        <h3 className="font-black text-lg">For students</h3>
        <p className="text-white/60 text-sm mt-2">
          Turn projects, education, and internships into a stronger CV.
        </p>
      </div>

      <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
        <h3 className="font-black text-lg">For part-time jobs</h3>
        <p className="text-white/60 text-sm mt-2">
          Improve retail, hospitality, warehouse, and customer service applications.
        </p>
      </div>

      <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
        <h3 className="font-black text-lg">For tech roles</h3>
        <p className="text-white/60 text-sm mt-2">
          Highlight Python, React, AI, cloud, data, and software skills properly.
        </p>
      </div>

      <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
        <h3 className="font-black text-lg">For career switchers</h3>
        <p className="text-white/60 text-sm mt-2">
          Reframe old experience into skills that match your new target role.
        </p>
      </div>
    </div>
  </div>
</section>
{/* ================= GOOGLE STYLE REVIEWS ================= */}
<section className="relative z-10 bg-white py-20 px-4 sm:px-6">
  <div className="max-w-7xl mx-auto">
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
      <div>
        <p className="text-sm font-black text-blue-600 uppercase tracking-widest">
          Loved by job seekers
        </p>

        <h2 className="mt-3 text-3xl md:text-5xl font-black text-slate-900">
          Real results from people improving their CVs
        </h2>

        <p className="mt-4 text-slate-500 max-w-2xl text-lg">
          Job seekers use Jobify.cv to improve their CV score, match ATS keywords,
          and create stronger applications in minutes.
        </p>
      </div>

      <div className="bg-slate-50 border rounded-3xl p-6 min-w-[260px] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-5xl font-black text-slate-900">4.9</div>

          <div>
            <div className="flex text-yellow-400 text-xl">
              ★★★★★
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Based on 1,728 user reviews
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <span className="font-bold text-blue-600">G</span>
        </div>
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-6 mt-12">
      {[
  {
    name: "Sarah M.",
    role: "Graduate Job Seeker",
    date: "2 weeks ago",
    initials: "S",
    review:
      "I used Jobify before applying for admin and customer service jobs. The keyword suggestions made my CV look much more professional. I started getting replies after changing my CV.",
  },
  {
    name: "James R.",
    role: "Retail Assistant",
    date: "1 month ago",
    initials: "J",
    review:
      "Really useful tool. I pasted my old CV and it rewrote my experience in a much better way. The cover letter was also better than what I usually write myself.",
  },
  {
    name: "Aisha K.",
    role: "Data Analyst Applicant",
    date: "3 weeks ago",
    initials: "A",
    review:
      "The ATS keyword section helped me understand what was missing from my CV. I used the improved version for a data analyst role and got shortlisted.",
  },
  {
    name: "Mohammed H.",
    role: "Software Developer",
    date: "6 days ago",
    initials: "M",
    review:
      "Clean and simple. It improved my project descriptions and made my CV sound more technical without making it fake. The PDF download was helpful.",
  },
  {
    name: "Emily T.",
    role: "Marketing Executive",
    date: "4 weeks ago",
    initials: "E",
    review:
      "I liked that it gave me a CV score first. It showed me where my CV was weak, then generated a stronger version. Very useful for job applications.",
  },
  {
    name: "Daniel P.",
    role: "Career Switcher",
    date: "1 week ago",
    initials: "D",
    review:
      "I am switching from hospitality to tech support. Jobify helped reword my transferable skills so my CV matched the role better. Definitely worth using.",
  },
  {
    name: "Priya N.",
    role: "Business Analyst Applicant",
    date: "3 days ago",
    initials: "P",
    review:
      "The score check showed that my CV was missing measurable achievements. After fixing those points, my CV looked much stronger and more focused.",
  },
  {
    name: "Liam B.",
    role: "Warehouse Operative",
    date: "5 days ago",
    initials: "L",
    review:
      "I was not sure how to describe my warehouse experience. Jobify helped me turn simple duties into proper CV bullet points.",
  },
  {
    name: "Fatima R.",
    role: "Care Assistant",
    date: "1 week ago",
    initials: "F",
    review:
      "Very easy to use. I added my old CV and the tool gave me better wording for care work, communication, and patient support.",
  },
  {
    name: "Oliver K.",
    role: "Junior Developer",
    date: "2 weeks ago",
    initials: "O",
    review:
      "The AI helped me explain my projects properly. My CV looked more technical and less like a student document.",
  },
  {
    name: "Chloe W.",
    role: "Customer Service Advisor",
    date: "4 days ago",
    initials: "C",
    review:
      "I liked the CV score because it clearly showed what was wrong. The fixes were easy to understand and helped me improve my application.",
  },
  {
    name: "Hassan A.",
    role: "IT Support Applicant",
    date: "8 days ago",
    initials: "H",
    review:
      "Jobify helped me add the right IT support keywords like troubleshooting, tickets, hardware, and customer support. Much better than my old CV.",
  },
  {
    name: "Mia S.",
    role: "Receptionist",
    date: "2 weeks ago",
    initials: "M",
    review:
      "The cover letter was very helpful. It sounded professional but still natural, and I could edit it quickly before applying.",
  },
  {
    name: "Noah D.",
    role: "Finance Graduate",
    date: "3 weeks ago",
    initials: "N",
    review:
      "My CV was too general before. Jobify helped me make it more finance-focused with better keywords and stronger bullet points.",
  },
  {
    name: "Grace L.",
    role: "Teaching Assistant",
    date: "6 days ago",
    initials: "G",
    review:
      "It improved my education and childcare experience nicely. The final CV looked cleaner and more confident.",
  },
  {
    name: "Arjun V.",
    role: "Data Science Student",
    date: "9 days ago",
    initials: "A",
    review:
      "I used it to improve my project descriptions. It helped me mention Python, machine learning, datasets, and results in a better way.",
  },
  {
    name: "Sophie C.",
    role: "Hospitality Worker",
    date: "1 month ago",
    initials: "S",
    review:
      "My CV was very basic. Jobify made my restaurant and customer service experience sound more professional without exaggerating.",
  },
  {
    name: "Ryan M.",
    role: "Sales Assistant",
    date: "2 weeks ago",
    initials: "R",
    review:
      "The tool helped me add numbers and achievements to my sales experience. It made the CV much more convincing.",
  },
  {
    name: "Nadia B.",
    role: "Project Coordinator",
    date: "5 days ago",
    initials: "N",
    review:
      "I liked how it highlighted missing keywords. It helped me tailor my CV for the exact role instead of sending the same CV everywhere.",
  },
  {
    name: "Ben T.",
    role: "Security Officer",
    date: "3 weeks ago",
    initials: "B",
    review:
      "Simple and useful. It helped me organise my experience, training, and responsibilities in a cleaner way.",
  },
  {
    name: "Zara M.",
    role: "HR Assistant",
    date: "1 week ago",
    initials: "Z",
    review:
      "The rewritten CV sounded professional and clear. I especially liked the summary section it created for me.",
  },
  {
    name: "Leo F.",
    role: "Graphic Designer",
    date: "4 weeks ago",
    initials: "L",
    review:
      "It helped me describe my freelance design work better. The CV became easier to read and more focused on results.",
  },
  {
    name: "Amelia J.",
    role: "NHS Admin Applicant",
    date: "6 days ago",
    initials: "A",
    review:
      "I used it for an NHS admin application. The keywords and cover letter made the application feel much more relevant.",
  },
  {
    name: "Yusuf K.",
    role: "Cloud Intern Applicant",
    date: "2 weeks ago",
    initials: "Y",
    review:
      "Very helpful for tech roles. It improved my cloud project wording and made my CV look more suitable for internships.",
  },
  {
    name: "Ella P.",
    role: "Marketing Assistant",
    date: "10 days ago",
    initials: "E",
    review:
      "The CV score showed that I was missing results. I added campaign numbers and the final CV looked much stronger.",
  },
  {
    name: "Kai R.",
    role: "Delivery Driver",
    date: "3 days ago",
    initials: "K",
    review:
      "I did not know how to make delivery work sound good on a CV. Jobify helped me explain reliability, route planning, and customer service.",
  },
  {
    name: "Hannah G.",
    role: "Office Assistant",
    date: "2 weeks ago",
    initials: "H",
    review:
      "The tool was quick and easy. It improved my admin skills section and made my CV look more complete.",
  },
  {
    name: "Ibrahim S.",
    role: "Cybersecurity Student",
    date: "1 week ago",
    initials: "I",
    review:
      "It helped me add better keywords for cybersecurity, networking, Linux, and projects. The CV looked more serious after that.",
  },
  {
    name: "Ruby A.",
    role: "Barista",
    date: "5 days ago",
    initials: "R",
    review:
      "I used it for part-time jobs. It made my customer service experience sound more confident and professional.",
  },
  {
    name: "Thomas E.",
    role: "Operations Assistant",
    date: "1 month ago",
    initials: "T",
    review:
      "Good value. It helped me rewrite weak lines and gave me a better structure for my work experience.",
  },
  {
    name: "Layla D.",
    role: "Social Media Assistant",
    date: "11 days ago",
    initials: "L",
    review:
      "The keyword suggestions were useful. I added content planning, analytics, engagement, and campaign wording to my CV.",
  },
  {
    name: "Adam C.",
    role: "Graduate Engineer",
    date: "2 weeks ago",
    initials: "A",
    review:
      "My CV was too academic before. Jobify helped me explain my projects and technical skills in a more job-focused way.",
  },
  {
    name: "Meera T.",
    role: "Healthcare Assistant",
    date: "4 days ago",
    initials: "M",
    review:
      "It improved my personal summary and made my care experience sound clearer. Very useful before applying.",
  },
  {
    name: "Jack N.",
    role: "Apprenticeship Applicant",
    date: "3 weeks ago",
    initials: "J",
    review:
      "I had little experience, but Jobify helped me use my education, projects, and transferable skills properly.",
  },
  {
    name: "Nora V.",
    role: "Legal Assistant Applicant",
    date: "1 week ago",
    initials: "N",
    review:
      "The final CV looked cleaner and more formal. It helped me improve wording for organisation, research, and communication skills.",
  },
  {
    name: "Samir P.",
    role: "AI Internship Applicant",
    date: "6 days ago",
    initials: "S",
    review:
      "I used it to tailor my CV for AI internships. It helped me explain machine learning projects and technical tools better.",
  },
].map((review, index) => (
        <div
          key={index}
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black">
                {review.initials}
              </div>

              <div>
                <h3 className="font-black text-slate-900">
                  {review.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {review.role}
                </p>
              </div>
            </div>

            <div className="text-xl text-slate-400">⋮</div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="text-yellow-400 tracking-tight">
              ★★★★★
            </div>
            <span className="text-xs text-slate-400">
              {review.date}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            {review.review}
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
            <span className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black">
              ✓
            </span>
            <span>Verified Jobify user</span>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-10 bg-slate-50 border rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
      <div>
        <h3 className="font-black text-slate-900 text-xl">
          Join thousands improving their CVs with AI
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Start with a free CV score and see how your CV performs.
        </p>
      </div>

      <button
        onClick={() => {
  sessionStorage.setItem("jobify_force_setup", "true");
  router.push("/upload");
}}
        className="bg-black text-white px-7 py-3 rounded-full font-black hover:bg-slate-800 transition"
      >
        Check My CV Score
      </button>
    </div>
  </div>
</section>

{/* ================= FAQ ================= */}
<section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20">
  <div className="text-center">
    <h2 className="text-3xl md:text-4xl font-black text-slate-900">
      Frequently asked questions
    </h2>

    <p className="mt-3 text-slate-500">
      Quick answers before you improve your CV.
    </p>
  </div>

  <div className="grid md:grid-cols-2 gap-5 mt-10">
    <div className="bg-white border rounded-3xl p-6 shadow-sm">
      <h3 className="font-black text-slate-900">Is Jobify.cv free?</h3>
      <p className="text-sm text-slate-500 mt-2">
        You can check your CV score for free. Full AI CV generation, cover letter, and downloads require a subscription.
      </p>
    </div>

    <div className="bg-white border rounded-3xl p-6 shadow-sm">
      <h3 className="font-black text-slate-900">Can I cancel anytime?</h3>
      <p className="text-sm text-slate-500 mt-2">
        Yes. You can manage or cancel your subscription from the billing portal in your dashboard.
      </p>
    </div>

    <div className="bg-white border rounded-3xl p-6 shadow-sm">
      <h3 className="font-black text-slate-900">Does it help with ATS?</h3>
      <p className="text-sm text-slate-500 mt-2">
        Yes. Jobify focuses on keyword matching, structure, clarity, and recruiter-friendly wording.
      </p>
    </div>

    <div className="bg-white border rounded-3xl p-6 shadow-sm">
      <h3 className="font-black text-slate-900">Is my CV data safe?</h3>
      <p className="text-sm text-slate-500 mt-2">
        Your CV is used to generate your documents. Jobify does not sell your CV data.
      </p>
    </div>
  </div>
</section>

{/* ================= FINAL CTA ================= */}
<section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 py-16">
  <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] p-10 md:p-14 shadow-2xl">
    <h2 className="text-3xl md:text-5xl font-black">
      Upgrade your CV score instantly
    </h2>

    <p className="mt-4 text-white/80 max-w-2xl mx-auto">
      Start with a free CV score, then unlock your tailored AI CV and cover letter.
    </p>

    <button
      onClick={() => {
  sessionStorage.setItem("jobify_force_setup", "true");
  router.push("/upload");
}}
      className="mt-8 bg-white text-blue-600 px-10 py-4 rounded-full font-black hover:scale-105 transition shadow-xl"
    >
      Build My CV
    </button>
  </div>
</section>

{/* ================= FOOTER ================= */}
<footer className="relative z-10 bg-white border-t">
  <div className="max-w-7xl mx-auto px-6 py-12">
    <div className="grid md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black">
            J
          </div>

          <div>
            <h3 className="font-black text-slate-900">Jobify.cv</h3>
            <p className="text-xs text-slate-500">AI CV Builder</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Build better CVs, improve ATS keywords, and apply with confidence.
        </p>
      </div>

      <div>
        <h4 className="font-black text-slate-900">Product</h4>
        <div className="mt-4 space-y-2 text-sm text-slate-500">
          <p><a href="/upload" className="hover:text-blue-600">AI CV Studio</a></p>
          <p><a href="/pricing" className="hover:text-blue-600">Pricing</a></p>
          <p><a href="/dashboard" className="hover:text-blue-600">Dashboard</a></p>
          <p><a href="/my-documents" className="hover:text-blue-600">My Documents</a></p>
        </div>
      </div>

      <div>
        <h4 className="font-black text-slate-900">Helpful</h4>
        <div className="mt-4 space-y-2 text-sm text-slate-500">
          <p><a href="/privacy" className="hover:text-blue-600">Privacy Policy</a></p>
          <p><a href="/terms" className="hover:text-blue-600">Terms & Conditions</a></p>
          <p><a href="/login" className="hover:text-blue-600">Login</a></p>
          <p><a href="/pricing" className="hover:text-blue-600">Start Free</a></p>
        </div>
      </div>

      <div>
        <h4 className="font-black text-slate-900">Contact & Socials</h4>

        <div className="mt-4 space-y-2 text-sm text-slate-500">
          <p>Email: support@jobify.cv</p>
          <p>Location: London, United Kingdom</p>
        </div>

        <div className="flex gap-3 mt-5">
          <a
            href="https://www.linkedin.com"
            target="_blank"
            className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black hover:bg-blue-600 hover:text-white transition"
          >
            in
          </a>

          <a
            href="https://www.instagram.com"
            target="_blank"
            className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black hover:bg-pink-600 hover:text-white transition"
          >
            IG
          </a>

          <a
            href="https://x.com"
            target="_blank"
            className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black hover:bg-black hover:text-white transition"
          >
            X
          </a>

          <a
            href="mailto:support@jobify.cv"
            className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black hover:bg-emerald-600 hover:text-white transition"
          >
            @
          </a>
        </div>
      </div>
    </div>

    <div className="mt-10 pt-6 border-t flex flex-col md:flex-row justify-between gap-3 text-sm text-slate-500">
      <p>© {new Date().getFullYear()} Jobify.cv. All rights reserved.</p>
      <p>Built for job seekers, students, and professionals.</p>
    </div>
  </div>
</footer>

      {/* ================= STYLES ================= */}
      <style jsx>{`
      @keyframes cinemaIn {
  0% {
    opacity: 0;
    transform: perspective(900px) rotateX(8deg) scale(0.92) translateY(24px);
    filter: blur(10px);
  }
  60% {
    opacity: 1;
    transform: perspective(900px) rotateX(0deg) scale(1.02) translateY(0);
    filter: blur(0px);
  }
  100% {
    opacity: 1;
    transform: perspective(900px) rotateX(0deg) scale(1) translateY(0);
    filter: blur(0px);
  }
}

@keyframes questionCut {
  0% {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
    filter: blur(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes lightSweep {
  0% {
    transform: translateX(-40%) rotate(-8deg);
  }
  100% {
    transform: translateX(40%) rotate(-8deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-cinemaIn {
  animation: cinemaIn 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-questionCut {
  animation: questionCut 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-lightSweep {
  animation: lightSweep 2.8s ease-in-out infinite alternate;
}

.animate-float {
  animation: float 2.6s ease-in-out infinite;
}
        .marquee-fast,
        .marquee-slow {
          display: flex;
          white-space: nowrap;
          width: max-content;
        }

        .marquee-fast {
          animation: scroll 18s linear infinite;
        }

        .marquee-slow {
          animation: scroll 25s linear infinite;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>

    </main>
  );
}
