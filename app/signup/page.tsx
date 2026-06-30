"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Could not create account");
        setLoading(false);
        return;
      }

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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white px-4 py-10 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-80" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-100 blur-3xl opacity-80" />
        <div className="absolute top-20 left-10 text-4xl opacity-10">🤖</div>
<div className="absolute top-24 right-16 text-4xl opacity-10">📄</div>
<div className="absolute top-1/3 left-1/4 text-4xl opacity-10">✨</div>
<div className="absolute top-[45%] right-[18%] text-4xl opacity-10">🚀</div>
<div className="absolute bottom-36 left-16 text-4xl opacity-10">🎯</div>
<div className="absolute bottom-28 right-24 text-4xl opacity-10">💼</div>
<div className="absolute bottom-16 left-1/3 text-4xl opacity-10">⚡</div>
<div className="absolute top-[65%] right-[35%] text-4xl opacity-10">🧠</div>
      </div>

      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="text-center lg:text-left">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white font-black shadow-lg">
              J
            </div>
            <div className="text-left leading-tight">
              <p className="text-xl font-black">
                <span>Job</span>
                <span className="text-blue-600">ify</span>
                <span className="text-slate-400">.cv</span>
              </p>
              <p className="text-xs font-semibold text-slate-400">
                AI CV Builder
              </p>
            </div>
          </Link>

          <h1 className="mt-8 text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Create your Jobify account.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500 lg:mx-0">
            Save your CVs, cover letters, ATS keywords, and application documents in one place.
          </p>

          <div className="mt-8">
  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
    Built for the modern AI era
  </p>

  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
    {[
      { name: "OpenAI", domain: "openai.com" },
      { name: "Google Gemini", domain: "gemini.google.com" },
      {
  name: "Claude",
  logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Claude_AI_logo.svg",
},
      { name: "Microsoft Copilot", domain: "copilot.microsoft.com" },
      { name: "Meta AI", domain: "meta.ai" },
      { name: "Perplexity", domain: "perplexity.ai" },
    ].map((company) => (
      <div
        key={company.name}
        className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm"
      >
        <img
  src={
    "logo" in company
      ? company.logo
      : `https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`
  }
  alt={company.name}
  className="h-6 w-6 rounded-md object-contain"
/>
        <span className="text-sm font-bold text-slate-700">
          {company.name}
        </span>
      </div>
    ))}
  </div>

  <p className="mt-4 text-sm text-slate-500">
    Create your account and start using a clean, AI-powered workflow for CV writing and job applications.
  </p>
</div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-[1.5rem] border bg-white p-4 shadow-xl sm:rounded-[2rem] sm:p-8 sm:shadow-2xl animate-cardIn">
            <div className="mb-6 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-blue-600">
                Get started
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Create account
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Sign up in seconds.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full rounded-2xl bg-slate-950 py-4 font-black text-white shadow-lg transition hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              By creating an account, you agree to save your documents and account details.
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
      </section>

      <style jsx>{`
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-cardIn {
          animation: cardIn 0.45s ease-out;
        }
      `}</style>
    </main>
  );
}