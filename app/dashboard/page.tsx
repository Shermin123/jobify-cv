"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* TOP BAR */}
      <div className="bg-black text-white px-6 py-3 flex justify-between items-center">
        <h1 className="font-bold">Jobify.cv</h1>

        <div className="flex items-center gap-3">
          <span className="text-xs opacity-80">{session?.user?.email}</span>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm bg-white text-black px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* HERO BANNER */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-10 text-center">
        <h2 className="text-3xl font-bold">
          You’re 3x more likely to get interviews now
        </h2>

        <p className="mt-2 text-white/80">
          Jobify.cv optimises your CV using real recruiter keyword systems
        </p>

        <div className="mt-4 flex justify-center gap-4 text-sm">
          <span>✔ ATS Optimised</span>
          <span>✔ Keyword Engine</span>
          <span>✔ AI Rewrite</span>
          <span>✔ Job Matching</span>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-5xl mx-auto mt-10 px-6">

        <h2 className="text-2xl font-bold">
          Welcome back 👋 {session?.user?.email}
        </h2>

        <p className="text-gray-600 mt-2">
          Your AI CV engine is ready. Create, improve, and tailor CVs in seconds.
        </p>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-3xl font-bold text-blue-600">+72%</h3>
            <p className="text-sm text-gray-500 mt-1">Higher Interview Rate</p>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-3xl font-bold text-blue-600">10x</h3>
            <p className="text-sm text-gray-500 mt-1">Faster CV Creation</p>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-3xl font-bold text-blue-600">98%</h3>
            <p className="text-sm text-gray-500 mt-1">ATS Pass Rate</p>
          </div>

        </div>

        {/* ACTION CARDS */}
        <div className="grid md:grid-cols-2 gap-6 mt-10">

          <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold text-lg">🚀 Generate CV</h3>
            <p className="text-sm text-gray-500 mt-2">
              Turn your experience into a recruiter-ready CV instantly using AI keyword optimisation.
            </p>

            <button
              onClick={() => router.push("/upload")}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Start Generating
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold text-lg">📈 CV Performance</h3>
            <p className="text-sm text-gray-500 mt-2">
              See how your CV performs against ATS systems and job descriptions.
            </p>
          </div>

        </div>

        {/* TRUST / PERSUASION SECTION */}
        <div className="mt-12 bg-white border rounded-xl p-6 shadow-sm">

          <h3 className="font-bold text-lg">
            Why Jobify.cv works
          </h3>

          <p className="text-gray-600 mt-2">
            Most CVs fail not because of skills — but because they don’t match recruiter keyword systems.
            Jobify.cv fixes this by rewriting your CV using real ATS logic used by hiring systems.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6 text-sm text-gray-600">

            <div>✔ Keyword optimisation like recruiters use</div>
            <div>✔ AI rewriting for impact</div>
            <div>✔ ATS formatting structure</div>

          </div>

        </div>
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

        {/* TESTIMONIALS */}
        <div className="mt-10">

          <h3 className="text-xl font-bold">What users say</h3>

          <div className="grid md:grid-cols-3 gap-6 mt-4">

            <div className="bg-white p-5 border rounded-xl">
              “I went from 0 interviews to 5 in 2 weeks.”
              <p className="text-xs text-gray-500 mt-2">— Sarah, UK</p>
            </div>

            <div className="bg-white p-5 border rounded-xl">
              “This actually fixed my CV. I didn’t change anything else.”
              <p className="text-xs text-gray-500 mt-2">— James, London</p>
            </div>

            <div className="bg-white p-5 border rounded-xl">
              “Worth every penny. It just works.”
              <p className="text-xs text-gray-500 mt-2">— Ahmed, Dubai</p>
            </div>

          </div>

        </div>

        {/* FINAL CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-10 rounded-xl">

          <h2 className="text-2xl font-bold">
            Upgrade your CV → Upgrade your career
          </h2>

          <p className="mt-2 text-white/80">
            Start generating CVs that actually get interviews
          </p>

          <button
            onClick={() => router.push("/upload")}
            className="mt-5 bg-white text-blue-600 px-6 py-2 rounded font-semibold"
          >
            Generate CV Now
          </button>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} Jobify.cv — AI CV Optimisation Platform
      </footer>

    </main>
  );
}