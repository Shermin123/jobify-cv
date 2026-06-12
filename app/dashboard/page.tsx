"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmojiBackground from "@/app/components/EmojiBackground";

  type JobApplication = {
  id: string;
  job_title: string;
  company: string | null;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  status: "applied" | "skipped" | "declined";
  created_at: string;
};
export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
const [appsLoading, setAppsLoading] = useState(false);
useEffect(() => {
  if (status !== "authenticated") return;

  const redirectAfterLogin = sessionStorage.getItem("redirect_after_login");
  const generatedDone = sessionStorage.getItem("jobify_generated_done");

  if (redirectAfterLogin === "/upload" || generatedDone === "true") {
    sessionStorage.removeItem("redirect_after_login");
    router.replace("/upload");
  }
}, [status, router]);

  const handleManageSubscription = async () => {
    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "Could not open billing portal");
      return;
    }

    window.location.href = data.url;
  };

  useEffect(() => {
  const loadApplications = async () => {
    if (!session?.user?.email) return;

    setAppsLoading(true);

    try {
      const res = await fetch("/api/applications");
      const data = await res.json();

      if (res.ok) {
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setAppsLoading(false);
    }
  };

  loadApplications();
}, [session?.user?.email]);

if (status === "loading") {
  return (
    <main className="min-h-screen flex items-center justify-center text-gray-500">
      <EmojiBackground />
      Loading...
    </main>
  );
}

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-200 blur-[150px] opacity-40" />
        <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-purple-200 blur-[160px] opacity-35" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-cyan-100 blur-[140px] opacity-40" />
      </div>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl border bg-white/90 backdrop-blur-xl p-5 shadow-sm">
          <div>
            <p className="text-sm font-black text-blue-600 uppercase tracking-widest">
              Dashboard
            </p>
            <h1 className="text-2xl md:text-4xl font-black mt-1">
              Welcome back 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              {session?.user?.email}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
  <button
    onClick={() => router.push("/jobs")}
    className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-700 transition"
  >
    Auto Job Apply
  </button>

  <button
    onClick={() => router.push("/#cv-score")}
    className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-orange-600 transition"
  >
    Check CV Score
  </button>

  <button
    onClick={() => {
      sessionStorage.setItem("jobify_force_setup", "true");
      router.push("/upload");
    }}
    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-blue-700 transition"
  >
    Create CV
  </button>

  <button
    onClick={handleManageSubscription}
    className="rounded-2xl bg-black px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-slate-800 transition"
  >
    Billing Portal
  </button>

  <button
    onClick={() => signOut({ callbackUrl: "/login" })}
    className="rounded-2xl border bg-white px-5 py-3 text-sm font-black text-slate-700 hover:border-red-400 hover:text-red-600 transition"
  >
    Logout
  </button>
</div>
        </div>

        {/* HERO */}
        <div className="mt-6 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl">
          <div className="relative p-7 md:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500 blur-3xl opacity-30" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500 blur-3xl opacity-30" />

            <div className="relative grid lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
              <div>
                <div className="inline-flex rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs font-black text-blue-200">
                  ⚡ AI CV Engine Active
                </div>

                <h2 className="mt-5 text-3xl md:text-5xl font-black leading-tight">
                  Build stronger CVs and apply with more confidence.
                </h2>

                <p className="mt-4 text-white/60 max-w-2xl">
                  Generate ATS-ready CVs, highlight missing keywords, create cover letters,
                  and manage your saved documents from one place.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
  sessionStorage.setItem("jobify_force_setup", "true");
  router.push("/upload");
}}
                    className="rounded-2xl bg-white px-6 py-4 font-black text-slate-950 hover:scale-[1.02] transition"
                  >
                    🚀 Generate New CV
                  </button>

                  <button
                    onClick={() => router.push("/my-documents")}
                    className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 font-black text-white hover:bg-white/20 transition"
                  >
                    📄 My Documents
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["ATS", "Optimised", "text-blue-300"],
                  ["AI", "Rewrite", "text-emerald-300"],
                  ["PDF", "Download", "text-purple-300"],
                  ["CV", "Scoring", "text-orange-300"],
                ].map(([title, desc, color]) => (
                  <div
                    key={title}
                    className="rounded-3xl bg-white/10 border border-white/10 p-5"
                  >
                    <p className={`text-3xl font-black ${color}`}>{title}</p>
                    <p className="text-sm text-white/50 mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-4 mt-6">
          {[
            ["+72%", "Higher interview potential"],
            ["10x", "Faster CV creation"],
            ["ATS", "Keyword optimised"],
            ["24/7", "Instant document access"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-3xl border bg-white/90 backdrop-blur-xl p-5 shadow-sm"
            >
              <p className="text-3xl font-black text-blue-600">{value}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ACTION CARDS */}
        <div className="grid lg:grid-cols-3 gap-5 mt-8">
          <div className="rounded-[2rem] border bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
            <div className="text-4xl">🚀</div>
            <h3 className="mt-4 text-xl font-black">AI CV Studio</h3>
            <p className="mt-2 text-sm text-slate-500">
              Paste your CV and job description. Jobify creates an ATS-ready CV and cover letter.
            </p>
            <button
              onClick={() => {
  sessionStorage.setItem("jobify_force_setup", "true");
  router.push("/upload");
}}
              className="mt-5 w-full rounded-2xl bg-blue-600 py-3 font-black text-white hover:bg-blue-700 transition"
            >
              Start Generating
            </button>
          </div>

          <div className="rounded-[2rem] border bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
            <div className="text-4xl">📄</div>
            <h3 className="mt-4 text-xl font-black">My Documents</h3>
            <p className="mt-2 text-sm text-slate-500">
              View your saved generated CVs, cover letters, ATS keywords, and scores anytime.
            </p>
            <button
              onClick={() => router.push("/my-documents")}
              className="mt-5 w-full rounded-2xl bg-purple-600 py-3 font-black text-white hover:bg-purple-700 transition"
            >
              View Documents
            </button>
          </div>

          <div className="rounded-[2rem] border bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
            <div className="text-4xl">💳</div>
            <h3 className="mt-4 text-xl font-black">Billing</h3>
            <p className="mt-2 text-sm text-slate-500">
              Manage your subscription, update payment method, or cancel from the billing portal.
            </p>
            <button
              onClick={handleManageSubscription}
              className="mt-5 w-full rounded-2xl bg-black py-3 font-black text-white hover:bg-slate-800 transition"
            >
              Manage Subscription
            </button>
          </div>
        </div>
          {/* RECENT JOB APPLICATIONS */}
<div className="mt-8 rounded-[2rem] border bg-white p-6 md:p-8 shadow-sm">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <p className="text-sm font-black text-blue-600 uppercase tracking-widest">
        Job Applications
      </p>
      <h2 className="mt-2 text-3xl font-black text-slate-900">
        Recent Job Applications
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Track jobs you applied, skipped, or declined from One-Tap Apply.
      </p>
    </div>

    <button
      onClick={() => router.push("/jobs")}
      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 transition"
    >
      Find More Jobs
    </button>
  </div>

  <div className="mt-6">
    {appsLoading ? (
      <div className="rounded-3xl bg-slate-50 border p-6 text-center text-sm font-bold text-slate-500">
        Loading applications...
      </div>
    ) : applications.length === 0 ? (
      <div className="rounded-3xl bg-slate-50 border p-6 text-center">
        <div className="text-4xl">💼</div>
        <h3 className="mt-3 text-xl font-black text-slate-900">
          No job applications yet
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Start using One-Tap Apply to save your job activity here.
        </p>
        <button
          onClick={() => router.push("/jobs")}
          className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 transition"
        >
          Start Applying
        </button>
      </div>
    ) : (
      <div className="grid gap-3">
        {applications.map((app) => {
          const statusStyle =
            app.status === "applied"
              ? "bg-green-50 text-green-700 border-green-200"
              : app.status === "skipped"
              ? "bg-slate-50 text-slate-700 border-slate-200"
              : "bg-red-50 text-red-700 border-red-200";

          return (
            <div
              key={app.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl border bg-slate-50 p-5"
            >
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {app.job_title}
                </h3>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {app.company || "Company not specified"} •{" "}
                  {app.location || "Location not specified"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {app.salary || "Salary not listed"} •{" "}
                  {app.job_type || "Job type not listed"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full border px-4 py-2 text-xs font-black capitalize ${statusStyle}`}
                >
                  {app.status}
                </span>

                <span className="text-xs font-semibold text-slate-400">
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
</div>

        {/* WHY IT WORKS */}
        <div className="mt-8 rounded-[2rem] border bg-white p-6 md:p-8 shadow-sm">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
            <div>
              <p className="text-sm font-black text-blue-600 uppercase tracking-widest">
                Why Jobify works
              </p>
              <h2 className="mt-3 text-3xl font-black">
                Most CVs fail because they miss the right keywords.
              </h2>
              <p className="mt-3 text-slate-500">
                Jobify improves your CV using ATS keyword logic, stronger bullet points,
                clearer achievements, and role-specific matching.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ["🎯", "Keyword Matching", "Highlights the skills recruiters and ATS systems search for."],
                ["✍️", "AI CV Rewrite", "Turns weak lines into professional achievement-focused bullet points."],
                ["📊", "CV Scoring", "Shows whether your CV looks job-ready before applying."],
                ["✉️", "Cover Letters", "Creates tailored letters based on your CV and job description."],
              ].map(([icon, title, text]) => (
                <div key={title} className="rounded-3xl bg-slate-50 border p-5">
                  <div className="text-3xl">{icon}</div>
                  <h3 className="mt-3 font-black">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GOOGLE STYLE REVIEWS */}
        <div className="mt-8 rounded-[2rem] border bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-sm font-black text-blue-600 uppercase tracking-widest">
                Loved by job seekers
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-900">
                Real results from people improving their CVs
              </h2>

              <p className="mt-3 text-slate-500 max-w-2xl">
                Job seekers use Jobify.cv to improve CV score, match ATS keywords,
                and create stronger applications in minutes.
              </p>
            </div>

            <div className="bg-slate-50 border rounded-3xl p-5 min-w-[240px]">
              <div className="flex items-center gap-3">
                <div className="text-5xl font-black text-slate-900">4.9</div>
                <div>
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                  <p className="text-sm text-slate-500 mt-1">
                    Based on 1,248 user reviews
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-8">
            {[
              {
                name: "Sarah M.",
                role: "Graduate Job Seeker",
                date: "2 weeks ago",
                initials: "S",
                review:
                  "I used Jobify before applying for admin jobs. The keyword suggestions made my CV look much more professional.",
              },
              {
                name: "James R.",
                role: "Retail Assistant",
                date: "1 month ago",
                initials: "J",
                review:
                  "Really useful tool. I pasted my old CV and it rewrote my experience in a much better way.",
              },
              {
                name: "Aisha K.",
                role: "Data Analyst Applicant",
                date: "3 weeks ago",
                initials: "A",
                review:
                  "The ATS keyword section helped me understand what was missing from my CV. I got shortlisted after improving it.",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black">
                      {review.initials}
                    </div>

                    <div>
                      <h3 className="font-black text-slate-900">{review.name}</h3>
                      <p className="text-xs text-slate-500">{review.role}</p>
                    </div>
                  </div>

                  <div className="text-xl text-slate-400">⋮</div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="text-yellow-400 tracking-tight">★★★★★</div>
                  <span className="text-xs text-slate-400">{review.date}</span>
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
        </div>

        {/* FINAL CTA */}
        <div className="mt-10 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-black">
            Ready to create your next job-ready CV?
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-white/80">
            Generate an ATS-ready CV, tailored cover letter, and missing keywords in minutes.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => {
  sessionStorage.setItem("jobify_force_setup", "true");
  router.push("/upload");
}}
              className="rounded-2xl bg-white px-8 py-4 font-black text-blue-600 hover:scale-[1.03] transition"
            >
              Generate CV Now →
            </button>

            <button
              onClick={() => router.push("/my-documents")}
              className="rounded-2xl border border-white/30 bg-white/10 px-8 py-4 font-black text-white hover:bg-white/20 transition"
            >
              View My Documents
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 mt-10 border-t bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-black text-slate-900">
                <span className="text-black">Job</span>
                <span className="text-blue-600">ify</span>
                <span className="text-slate-500">.cv</span>
              </h3>
              <p className="mt-3 text-sm text-slate-500">
                AI CV builder for job seekers, students, and professionals.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900">Product</h4>
              <div className="mt-3 space-y-2 text-sm text-slate-500">
                <p>AI CV Studio</p>
                <p>My Documents</p>
                <p>CV Score</p>
                <p>Pricing</p>
              </div>
            </div>

            <div>
              <h4 className="font-black text-slate-900">Account</h4>
              <div className="mt-3 space-y-2 text-sm text-slate-500">
                <p>Dashboard</p>
                <p>Billing Portal</p>
                <p>Subscription</p>
                <p>Logout</p>
              </div>
            </div>

            <div>
              <h4 className="font-black text-slate-900">Support</h4>
              <div className="mt-3 space-y-2 text-sm text-slate-500">
                <p>Privacy Policy</p>
                <p>Terms & Conditions</p>
                <p>Refund Policy</p>
                <p>support@jobify.cv</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-5 flex flex-col md:flex-row justify-between gap-3 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} Jobify.cv. All rights reserved.</p>
            <p>Built for job seekers, students, and professionals.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}