"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobType, setJobType] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError("Please enter your name, email and password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          country,
          targetRole,
          experienceLevel,
          jobType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Could not create account");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("jobify_country", country);
      sessionStorage.setItem("jobify_role", targetRole);
      sessionStorage.setItem("jobify_experience_level", experienceLevel);
      sessionStorage.setItem("jobify_job_type", jobType);

      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/login");
        return;
      }

      router.push("/upload");
    } catch {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500 blur-3xl opacity-30 animate-pulse" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-500 blur-3xl opacity-30 animate-pulse" />
      <div className="absolute top-1/3 left-1/2 h-72 w-72 rounded-full bg-cyan-400 blur-3xl opacity-10 animate-pulse" />

      {/* FLOATING EMOJIS */}
      <div className="absolute top-16 left-8 text-4xl opacity-10 animate-float">🚀</div>
      <div className="absolute top-24 right-10 text-3xl opacity-10 animate-floatSlow">💼</div>
      <div className="absolute top-52 left-[20%] text-3xl opacity-10 animate-float">📄</div>
      <div className="absolute bottom-40 left-12 text-4xl opacity-10 animate-floatSlow">🎯</div>
      <div className="absolute bottom-28 right-16 text-3xl opacity-10 animate-float">✨</div>
      <div className="absolute top-[45%] right-[20%] text-4xl opacity-10 animate-floatSlow">🤖</div>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {/* LEFT */}
        <div className="text-center lg:text-left">
          <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black text-blue-200 backdrop-blur-xl">
            ⚡ Create your Jobify account
          </div>

          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            Build a CV that looks ready for recruiters.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60 md:text-base lg:mx-0">
            Create your account, tell Jobify your target role, and start generating
            ATS-ready CVs, cover letters, keywords, and PDF downloads.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-2xl">🎯</p>
              <p className="mt-2 text-xs font-bold text-white/70">
                Role matching
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-2xl">📄</p>
              <p className="mt-2 text-xs font-bold text-white/70">
                CV + cover letter
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-2xl">🚀</p>
              <p className="mt-2 text-xs font-bold text-white/70">
                Faster applying
              </p>
            </div>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="mx-auto w-full max-w-2xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white text-slate-900 shadow-2xl animate-cardIn">
            <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            <div className="p-5 sm:p-8">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-black text-white shadow-lg">
                  J
                </div>

                <h2 className="mt-4 text-3xl font-black">
                  Create account
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  These details help Jobify personalise your CV experience.
                </p>
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500 sm:col-span-2"
                  placeholder="Full name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Email address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />

                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Target role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />

                <select
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="">Experience level</option>
                  <option value="Student / Fresher">Student / Fresher</option>
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>

                <select
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option value="">Job type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Graduate role">Graduate role</option>
                  <option value="Remote job">Remote job</option>
                  <option value="Career switch">Career switch</option>
                </select>

                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500 sm:col-span-2"
                  placeholder="Password *"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                onClick={handleSignup}
                disabled={loading}
                className="mt-5 w-full rounded-2xl bg-slate-950 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? "Creating account..." : "Create account & start"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                By creating an account, you agree to use Jobify to generate CVs,
                cover letters, and job application documents.
              </p>

              <p className="mt-5 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-black text-blue-600 hover:text-blue-700"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.98);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-14px);
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-18px) rotate(6deg);
          }
        }

        .animate-cardIn {
          animation: cardIn 0.6s ease-out;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-floatSlow {
          animation: floatSlow 5.5s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}