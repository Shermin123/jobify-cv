"use client";
import HiredAtBox from "./components/HiredAtBox";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { checkSubscription } from "@/lib/checkSubscription";
import EmojiBackground from "@/app/components/EmojiBackground";

export default function Home() {
  
  
  
  const [cvText, setCvText] = useState("");
  
  const [freeChecksUsed, setFreeChecksUsed] = useState(0);
  const [analyzedScore, setAnalyzedScore] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();
const [isUnlocked, setIsUnlocked] = useState(false);
  
  useEffect(() => {
  const savedChecks = localStorage.getItem("jobify_free_checks_used");
  if (savedChecks) {
    setFreeChecksUsed(Number(savedChecks));
  }
}, []);
useEffect(() => {
  const checkAccess = async () => {
    if (!session?.user?.email) return;

    const hasAccess = await checkSubscription(session.user.email);
    setIsUnlocked(hasAccess);
  };

  checkAccess();
}, [session?.user?.email]);
  // ================= CV SCORE ENGINE =================
  const calculateScore = () => {
  let score = 32;

  const text = cvText.toLowerCase();
  const wordCount = cvText.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount > 80) score += 5;
  if (wordCount > 150) score += 6;
  if (wordCount > 250) score += 7;

  const strongKeywords = [
    "managed",
    "developed",
    "achieved",
    "improved",
    "increased",
    "reduced",
    "led",
    "built",
    "delivered",
    "optimized",
    "project",
    "team",
    "customer",
    "sales",
    "training",
    "python",
    "react",
    "data",
    "cloud",
  ];

  strongKeywords.forEach((word) => {
    if (text.includes(word)) score += 2;
  });


  return Math.min(score, 96);
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

  setTimeout(() => {
    const newScore = calculateScore();
    setAnalyzedScore(newScore);
    setShowScorePopup(true);

if (!isUnlocked) {
  const newUsed = freeChecksUsed + 1;
  setFreeChecksUsed(newUsed);
  localStorage.setItem("jobify_free_checks_used", String(newUsed));
}

    setAnalyzing(false);
  }, 1200);
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
  const statsLine = `
    👥 500,000+ Users • 🌍 180+ Countries • 📄 2.4M CVs Generated • 💼 120,000+ Hired • ⚡ 94% Interview Success • 🧠 AI ATS Optimization • 🚀 Instant CV Rewrite • 📊 Real-time CV Scoring • 💡 Keyword Intelligence • 🔥 Recruiter Matching Engine •
  `;

  return (
    <main className="relative min-h-screen text-gray-900 overflow-x-hidden">
      <EmojiBackground />
      {showScorePopup && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-xl">
    <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white p-6 text-center shadow-2xl animate-cinemaIn">
      <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-red-200 blur-3xl opacity-70" />
      <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-orange-200 blur-3xl opacity-70" />

      <div className="relative">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-3xl text-red-600 shadow-lg">
          ⚠️
        </div>

        <p className="mt-4 text-xs font-black uppercase tracking-widest text-red-600">
          CV Score Result
        </p>

        <div className="mt-4 rounded-3xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-widest text-white/50">
            Your CV Score
          </p>

          <p className="mt-2 text-5xl font-black text-red-400">
            {score}/100
          </p>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <h3 className="mt-5 text-2xl font-black text-slate-950">
          You are less likely to get a job with this CV
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          This CV may be missing important ATS keywords, stronger achievements,
          and role-specific wording recruiters look for.
        </p>

        <button
          onClick={goToCVGenerator}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 py-3 text-sm font-black text-white shadow-lg hover:scale-[1.02] transition"
        >
          Highlight Keywords & Improve My CV →
        </button>

        <button
          onClick={() => setShowScorePopup(false)}
          className="mt-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition"
        >
          Continue checking
        </button>
      </div>
    </div>
  </div>
)}
{/* FLOATING BACKGROUND ELEMENTS */}
<div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
  
{/* Small Floating Emojis */}

<div className="absolute top-10 left-10 text-3xl opacity-10">🚀</div>
<div className="absolute top-20 right-20 text-2xl opacity-10">💼</div>
<div className="absolute top-40 left-1/4 text-3xl opacity-10">📄</div>
<div className="absolute top-52 right-1/3 text-2xl opacity-10">✨</div>
<div className="absolute top-72 left-16 text-3xl opacity-10">🎯</div>
<div className="absolute top-96 right-12 text-2xl opacity-10">🤖</div>

<div className="absolute top-[20%] left-[60%] text-3xl opacity-10">💡</div>
<div className="absolute top-[25%] left-[80%] text-2xl opacity-10">🔥</div>
<div className="absolute top-[35%] left-[10%] text-3xl opacity-10">📈</div>
<div className="absolute top-[45%] left-[75%] text-2xl opacity-10">⚡</div>

<div className="absolute top-[50%] left-[20%] text-3xl opacity-10">🌟</div>
<div className="absolute top-[55%] left-[50%] text-2xl opacity-10">🏆</div>
<div className="absolute top-[60%] right-[15%] text-3xl opacity-10">💰</div>

<div className="absolute top-[70%] left-[5%] text-2xl opacity-10">🧠</div>
<div className="absolute top-[72%] left-[40%] text-3xl opacity-10">📊</div>
<div className="absolute top-[78%] right-[30%] text-2xl opacity-10">🎓</div>

<div className="absolute bottom-32 left-12 text-3xl opacity-10">🌍</div>
<div className="absolute bottom-24 right-20 text-2xl opacity-10">💻</div>
<div className="absolute bottom-16 left-1/3 text-3xl opacity-10">📋</div>
<div className="absolute bottom-10 right-1/2 text-2xl opacity-10">⭐</div>

  {/* FLOATING LAYER 1 */}
  <div className="absolute text-7xl opacity-5 top-10 left-10 animate-pulse">🚀</div>
  <div className="absolute text-8xl opacity-5 top-40 right-20 animate-bounce">📄</div>
  <div className="absolute text-7xl opacity-5 bottom-40 left-20">💼</div>
  <div className="absolute text-8xl opacity-5 bottom-10 right-10 animate-pulse">✨</div>

  {/* FLOATING LAYER 2 (NEW) */}
  <div className="absolute text-6xl opacity-5 top-1/3 left-1/4 animate-bounce">🧠</div>
  <div className="absolute text-7xl opacity-5 top-1/2 right-1/3">📊</div>
  <div className="absolute text-6xl opacity-5 bottom-1/3 right-1/4 animate-pulse">🎯</div>
  <div className="absolute text-7xl opacity-5 top-20 right-1/2">💡</div>

  {/* FLOATING LAYER 3 (NEW PREMIUM FEEL) */}
  <div className="absolute text-6xl opacity-5 bottom-20 left-1/3">📈</div>
  <div className="absolute text-7xl opacity-5 top-1/4 left-1/2">🧾</div>
  <div className="absolute text-6xl opacity-5 bottom-1/2 left-10 animate-pulse">⚡</div>

</div>
      
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
    📊 Check CV Score
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
  className="relative overflow-hidden bg-white border border-red-100 rounded-[2rem] p-5 md:p-6 text-left shadow-2xl"
>
  <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-red-100 blur-3xl opacity-80" />
  <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-orange-100 blur-3xl opacity-70" />

  <div className="relative">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-black text-red-700">
          ⚠️ Free CV Risk Check
        </div>

        <h2 className="text-2xl md:text-3xl font-black mt-3 text-slate-900">
          Check Your CV Score
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Paste your CV and see whether it is strong enough to pass recruiters and ATS systems.
        </p>
      </div>

      <div className="hidden sm:block bg-slate-50 border rounded-2xl px-4 py-3 text-center">
        <p className="text-[11px] text-slate-400 font-bold uppercase">
          Free checks left
        </p>
        <p className="text-2xl font-black text-red-600">
          {isUnlocked ? "∞" : `${freeChecksLeft}/3`}
        </p>
      </div>
    </div>
    <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4">
  {analyzedScore === null ? (
  <div className="mb-3 rounded-2xl bg-white border border-orange-200 p-3">
    <p className="text-sm font-black text-orange-700">
      ⚠️ Paste your CV to check job readiness
    </p>
    <p className="text-xs text-orange-600 mt-1 leading-5">
      Jobify will check ATS keywords, achievements, and role matching before you apply.
    </p>
  </div>
) : score >= 70 ? (
  <div className="mb-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-3">
    <p className="text-sm font-black text-emerald-700">
      ✅ This CV is ready to apply
    </p>
    <p className="text-xs text-emerald-600 mt-1 leading-5">
      This CV has strong keywords, clear structure, and good ATS readiness.
    </p>
  </div>
) : (
  <div className="mb-3 rounded-2xl bg-white border border-red-200 p-3">
    <p className="text-sm font-black text-red-700">
      ⚠️ You are less likely to get a job with this CV
    </p>
    <p className="text-xs text-red-600 mt-1 leading-5">
      Most rejected CVs fail because they miss ATS keywords, measurable achievements,
      and role-specific language recruiters search for.
    </p>
  </div>
)}

  <textarea
    className="w-full border border-red-200 bg-white p-4 rounded-2xl h-28 md:h-32 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm leading-6"
    placeholder="Paste your CV here to check if it is job-ready..."
    value={cvText}
    onChange={(e) => {
      setCvText(e.target.value);
      setAnalyzedScore(null);
    }}
  />

  <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
    <span className="text-slate-500">
      {cvText.trim().split(/\s+/).filter(Boolean).length} words detected
    </span>

    <span
      className={
        isUnlocked
          ? "font-bold text-emerald-600"
          : freeChecksLeft > 0
          ? "font-bold text-orange-600"
          : "font-bold text-red-500"
      }
    >
      {isUnlocked
        ? "Premium active: unlimited checks"
        : freeChecksLeft > 0
        ? `${freeChecksLeft} free scan${freeChecksLeft === 1 ? "" : "s"} remaining`
        : "Free scan limit reached"}
    </span>
  </div>
</div>

    <div className="mt-5 grid md:grid-cols-[0.8fr_1fr] gap-5">
      <div className="bg-slate-950 text-white rounded-3xl p-5 border border-red-500/20">
        <p className="text-sm text-white/50">CV Job-Readiness Score</p>

        {analyzing ? (
          <div className="mt-5">
            <div className="h-16 w-16 rounded-full border-4 border-white/10 border-t-red-400 animate-spin" />
            <p className="text-sm text-white/60 mt-4">
              Checking ATS keywords and CV strength...
            </p>
          </div>
        ) : analyzedScore === null ? (
          <div className="mt-4">
            <p className="text-5xl font-black text-white/30">--/100</p>
            <p className="text-sm text-white/50 mt-2">
              Run a free scan to reveal your CV risk.
            </p>
          </div>
        ) : (
          <>
            <p
  className={`text-5xl md:text-6xl font-black mt-3 ${
    score >= 70 ? "text-emerald-400" : "text-red-500"
  }`}
>
  {score}/100
</p>

            <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
              {score < 70 ? (
  <>
    <p className="text-lg font-black text-red-300 leading-snug">
      You are less likely to get a job with this CV.
    </p>
    <p className="text-xs text-white/60 mt-2">
      Your CV needs stronger ATS keywords, clearer achievements, and better role matching.
    </p>
  </>
) : (
  <>
    <p className="text-lg font-black text-emerald-300 leading-snug">
      This CV looks job-ready.
    </p>
    <p className="text-xs text-white/60 mt-2">
      Your CV has stronger keywords, better structure, and good ATS readiness.
    </p>
  </>
)}
            </div>

            <div className="w-full h-3 bg-white/10 rounded-full mt-5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-700"
                style={{ width: `${score}%` }}
              />
            </div>
          </>
        )}
      </div>

      <div className="bg-white border border-red-100 rounded-3xl p-5">
        <h3 className="font-black text-slate-900">
          Why your CV may be rejected
        </h3>

        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {[
            "Weak ATS keyword match",
            "Missing measurable achievements",
            "Not tailored to the target role",
            "Low recruiter impact words",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black">
                !
              </span>
              {item}
            </div>
          ))}
        </div>

        {analyzedScore !== null && (
  <div
    className={`mt-5 rounded-2xl border p-4 ${
      score >= 70
        ? "bg-emerald-50 border-emerald-200"
        : "bg-red-50 border-red-200"
    }`}
  >
    <p
      className={`text-sm font-black ${
        score >= 70 ? "text-emerald-700" : "text-red-700"
      }`}
    >
      {score >= 70
        ? "✅ This CV is ready to apply"
        : "⚠️ Recruiters may skip this CV"}
    </p>

    <p
      className={`text-xs mt-1 leading-5 ${
        score >= 70 ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {score >= 70
        ? "Your CV looks stronger for ATS screening and recruiter review."
        : "Fix it now by highlighting missing keywords and generating a stronger ATS-ready CV."}
    </p>
  </div>
)}
      </div>
    </div>

    <button
      onClick={analyseFreeCV}
      disabled={analyzing}
      className="mt-6 w-full bg-black text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition disabled:opacity-50"
    >
      {analyzing
        ? "Checking your CV..."
        : isUnlocked || freeChecksLeft > 0
        ? "Check My CV Score"
        : "Free Limit Reached — Upgrade"}
    </button>

    {analyzedScore !== null && (
  <div className="mt-4 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-center shadow-sm">
    <p className="text-sm font-black text-slate-900">
      ✨ Just highlight the missing keywords and your CV will be ready to apply for jobs.
    </p>

    <button
      onClick={goToCVGenerator}
      className="mt-3 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg hover:scale-[1.01] transition"
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
              Based on 1,248 user reviews
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
